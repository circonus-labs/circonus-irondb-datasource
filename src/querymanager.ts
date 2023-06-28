import _ from 'lodash';
import Log from './logger';
import Parser from './parser';
import { SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import { CirconusQuery, SegmentType, Segment } from './types';
import { DURATION_REGEXP, DURATION_UNITS_DEFAULT, parseDurationMS, encodeTag, decodeTag } from './common';

const log = Log('Circonus QueryManager');

export default class QueryManager {
  datasource: DataSource;
  query: CirconusQuery;  
  segments: Segment[] = [];
  gSegments: Segment[] = [];
  error = '';

  constructor(datasource: DataSource, query: CirconusQuery) {
    this.datasource = datasource;
    this.query = query;
    if ('basic' === query.queryType) {
      this.parseStandardQuery();
    }
    else if ('graphite' === query.queryType) {
      this.parseGraphiteQuery();
    }
  }

  /**
   * This parses a standard query into segments.
   */
  parseStandardQuery() {
    // reset
    this.segments.splice(0, this.segments.length);
    this.error = '';

    log(() => `parseStandardQuery() query = ${JSON.stringify(this.query)}`);

    const query = (this.query.query || '').slice(4, -1) || '__name:*'; // remove the `and(` & `)` wrappers
    const tags = query.split(',');
    let nameIndex = tags.findIndex((tag) => /^__name:/.test(tag));
    if (~nameIndex) {
      const metricName = tags[nameIndex].replace(/^__name:/, '');
      tags.splice(nameIndex, 1);
      this.segments.push({ type: SegmentType.MetricName, value: decodeTag(metricName) });
    }

    let tagFilter = tags.join(',');
    let newSegments = this.parseTagFilter(tagFilter);
    this.segments = this.segments.concat(newSegments);
  }

  /**
   * This parses a graphite-style query into segments, with tag filter segments.
   */
  parseGraphiteQuery() {
    // reset
    this.gSegments.splice(0, this.segments.length);
    this.error = '';

    log(() => `parseGraphiteQuery() query = ${JSON.stringify(this.query)}`);

    // parse the query into segments
    let query = this.query.query || '';
    const parser = new Parser(query);
    const astNode = parser.getAst();
    if (astNode === null) {
      this.gSegments.push({ type: SegmentType.MetricName, value:'select metric' });
      this.gSegments.push({ type: SegmentType.TagPlus });
      return;
    }
    else if (astNode.type === 'error') {
      this.error = `${astNode.message} at position: ${astNode.pos}`;
      return;
    }
    // graphite functions are not supported, only metric expressions
    if (astNode.type === 'metric') {
        this.gSegments = astNode.segments;
    }
    this.gSegments.forEach((segment) => {
      if (!(segment.type in SegmentType)) {
        segment.type = SegmentType.MetricName;
      }
    });
    // add the tag filter if applicable
    const tagFilter = this.query.tagFilter || '';
    if (tagFilter) {
      let newSegments = this.parseTagFilter(tagFilter);
      this.gSegments = this.gSegments.concat(newSegments);
    }
  }

  /**
   * This takes a tag/search filter like `and(foo:bar)` or just a list of tags 
   * like `foo:bar,baz:quux` and converts it to a segments array.
   */
  parseTagFilter(tagFilter = '') {
    const tags = tagFilter.split(',');
    let newSegments: Segment[] = [];
    let first = true;

    // it's ok if the `and(` & `)` wrappers are present, they're handled below
    for (let tag of tags) {
      if (!tag) {
        continue;
      }
      if (first) {
        first = false;
      } 
      else {
        newSegments.push({ type: SegmentType.TagSep });
      }
      let tagPcs = tag.split(':');
      let tagCat = tagPcs.shift() as string;
      let tagVal = tagPcs.join(':');
      // strip off any operator wrappers
      if (tagCat.startsWith('and(') || tagCat.startsWith('not(')) {
        newSegments.push({ type: SegmentType.TagOp, value: tagCat.slice(0, 4) });
        tagCat = tagCat.slice(4);
      } 
      else if (tagCat.startsWith('or(')) {
        newSegments.push({ type: SegmentType.TagOp, value: tagCat.slice(0, 3) });
        tagCat = tagCat.slice(3);
      }
      newSegments.push({ type: SegmentType.TagCat, value: decodeTag(tagCat) });
      newSegments.push({ type: SegmentType.TagPair });
      let end = 0;
      while (tagVal.endsWith(')')) {
        tagVal = tagVal.slice(0, -1);
        end++;
      }
      newSegments.push({ type: SegmentType.TagVal, value: decodeTag(tagVal) });
      for (let i = 0; i < end; i++) {
        newSegments.push({ type: SegmentType.TagPlus });
        newSegments.push({ type: SegmentType.TagEnd });
      }
    }
    // if there were no tags, go ahead and add a plus segment
    if (tags.length === 0) {
      newSegments.push({ type: SegmentType.TagPlus });
    }

    return newSegments;
  }

  /**
   * This converts the standard segments array (or another arbitrary string) 
   * to the graphite segments array.
   */
  convertStandardToGraphite(metricName = '') {
    let nameSegments: Segment[] = [];
    let filterSegments: Segment[] = [];
    const hasTwoSegments = 2 === this.segments.length;
    const hasMetricSegment = this.segments.some((s) => s?.type === SegmentType.MetricName);
    const hasPlusSegment = this.segments.some((s) => s?.type === SegmentType.TagPlus);

    // process a passed metricName
    if (metricName) {
      nameSegments = metricName.split('|ST')[0].split('.')
        .map((piece: string) => ({ type: SegmentType.MetricName, value: piece }));
    }
    // if the source segments are only [*][+] then convert to [select metric][+]
    else if (hasTwoSegments && hasMetricSegment && hasPlusSegment) {
      this.addSelectMetricSegment();
      this.addPlusSegment();
    }
    // process segments into name & filter segments
    else {
      this.segments.forEach((segment) => {
        if (segment.type === SegmentType.MetricName) {
          nameSegments = (segment.value || '').split('|ST')[0].split('.')
            .map((piece: string) => ({ type: SegmentType.MetricName, value: piece }));
        }
        else {
          const clonedSegment = _.assign({}, segment);
          filterSegments.push(clonedSegment);
        }
      });
    }
    this.gSegments = nameSegments.concat(filterSegments);

    // if the standard query was '*', we want a blank graphite query
    if (1 === this.gSegments.length && '*' === this.gSegments[0].value) {
      this.gSegments.splice(0, 1);
    }
  }

  /**
   * This converts the graphite segments array to the standard segments array.
   */
  convertGraphiteToStandard() {
    let namePieces: string[] = [];
    let filterSegments: Segment[] = [];
    let uuid = '';

    // split segments into name & filter segments
    this.gSegments.forEach((segment: Segment, idx: number) => {
      if (segment.type === SegmentType.MetricName) {
        // pull any check UUID off of the beginning of a metric name
        if (/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(segment.value || '') && 0 === idx) {
          uuid = segment.value as string;
        }
        // we don't want "select metric" at the end of a partial metric name
        else {
          namePieces.push('select metric' === segment.value ? '*' : segment.value as string);
        }
      }
      // clone other non-metric segments
      else {
        let clonedSegment = _.assign({}, segment);
        filterSegments.push(clonedSegment);
      }
    });

    // combine everything into the segments array
    const nameSegments: Segment[] = [
      { type: SegmentType.MetricName, value: namePieces.join('.') }
    ];
    this.segments = nameSegments.concat(filterSegments);

    // if we have a check UUID then we need to add it as a tag filter
    if (uuid) {
      let firstOpIsAnd = false;
      let hasTagFilter = this.segments.some((segment) => {
        const isOp = segment.type === SegmentType.TagOp;
        if (isOp) {
          firstOpIsAnd = /^and/.test(segment.value as string);
        }
        return isOp;
      });
      // if there's a tag filter and the outer operator is `and()`, 
      // then insert the UUID at the end of that operator
      if (hasTagFilter && firstOpIsAnd) {
        const lastSegment = this.segments[this.segments.length - 1];
        const nextLastSegment = this.segments[this.segments.length - 2];
        let spliceIndex = -1;
        if (lastSegment.type === SegmentType.TagEnd) {
          if (nextLastSegment.type === SegmentType.TagPlus) {
            spliceIndex = this.segments.length - 2;
          }
          else {
            spliceIndex = this.segments.length - 1;
          }
        }
        if (~spliceIndex) {
          this.segments.splice(
            spliceIndex,
            0,
            { type: SegmentType.TagSep },
            { type: SegmentType.TagCat, value: '__check_uuid' },
            { type: SegmentType.TagPair },
            { type: SegmentType.TagVal, value: uuid }
          );
        }
      }
      // if there's a tag filter but the outer operator is not `and()`, 
      // then wrap the filter in an `and()` operator.
      else if (hasTagFilter && !firstOpIsAnd) {
        const firstOpIndex = this.segments.findIndex((segment) => segment.type === SegmentType.TagOp);
        if (~firstOpIndex) {
          this.segments.splice(firstOpIndex, 0, { type: SegmentType.TagOp, value: 'and(' });
        }
        this.segments.push(
          { type: SegmentType.TagSep },
          { type: SegmentType.TagCat, value: '__check_uuid' },
          { type: SegmentType.TagPair },
          { type: SegmentType.TagVal, value: uuid },
          { type: SegmentType.TagPlus },
          { type: SegmentType.TagEnd }
        );
      }
      // if there's no tag filter so far, then add an `and()` operator
      else if (!hasTagFilter) {
        this.segments.push(
          { type: SegmentType.TagOp, value: 'and(' },
          { type: SegmentType.TagCat, value: '__check_uuid' },
          { type: SegmentType.TagPair },
          { type: SegmentType.TagVal, value: uuid },
          { type: SegmentType.TagPlus },
          { type: SegmentType.TagEnd }
        );
      }
    }
  }

  /**
   * This returns the entire graphite metric segment path (not including 
   * any tag filter).
   */
  getGraphiteSegmentPath() {
    let idx = this.gSegments.findIndex((el) => (el.type != null && el.type !== SegmentType.MetricName));
    if (!~idx) {
      idx = this.gSegments.length;
    }
    return this.getGraphiteSegmentPathUpTo(idx);
  }

  /**
   * This returns the graphite metric segment path up to the specified index 
   * (but never including any tag filter).
   */
  getGraphiteSegmentPathUpTo(index: number) {
    const tagFilterIdx = this.gSegments.findIndex((el) => (el.type != null && el.type !== SegmentType.MetricName));
    let arr = this.gSegments.slice(0, Math.min(index, tagFilterIdx));
    if (!arr.length) {
      arr.push({ type: SegmentType.MetricName, value: '' });
    }

    return arr.reduce((str, segment) => `${str}${(segment.value || '')}.`, '');
  }

  /**
   * This updates a segment's value.
   */
  updateSegmentValue(segment: Segment, index: number) {
    const isGraphite = 'graphite' === this.query.queryType;
    const segmentsArray = this[isGraphite ? 'gSegments' : 'segments'];
    (segmentsArray[index] || {}).value = segment.value;
  }

  /**
   * This adds a "select metric" segment before any tag filter segments.
   */
  addSelectMetricSegment() {
    const isGraphite = 'graphite' === this.query.queryType;
    const segmentsArray = this[isGraphite ? 'gSegments' : 'segments'];
    const hasSelectAlready = segmentsArray.some((el) => {
      return el.value === 'select metric';
    });
    let idx = segmentsArray.findIndex((el) => {
      return el.type != null && el.type !== SegmentType.MetricName;
    });
    // if there isn't a non-metric segment, add it at the end
    if (!~idx) {
      idx = segmentsArray.length;
    }
    // if we don't already have a select segment, add one
    if (!hasSelectAlready) {
      segmentsArray.splice(idx, 0, {
        type: SegmentType.MetricName,
        value: 'select metric',
      });
    }
  }

  /**
   * This adds a "plus" segment at the end.
   */
  addPlusSegment() {
    const isGraphite = 'graphite' === this.query.queryType;
    const segmentsArray = this[isGraphite ? 'gSegments' : 'segments'];
    const hasPlusAlready = segmentsArray.some((el) => {
      return el.type === SegmentType.TagPlus;
    });
    // if we don't already have a plus segment, add one
    if (!hasPlusAlready) {
      segmentsArray.push({
        type: SegmentType.TagPlus,
      });
    }
  }

  /**
   * This takes an index and removes that segment and all following segments.
   */
  removeSegments(index?: number) {
    if (null == index) {
      return;
    }
    let isGraphite = 'graphite' === this.query.queryType;
    const segmentsArray = this[isGraphite ? 'gSegments' : 'segments'];
    this[isGraphite ? 'gSegments' : 'segments'] = segmentsArray.splice(0, index);
  }

  /**
   * This empties out the segments array.
   */
  emptySegments() {
    const isGraphite = 'graphite' === this.query.queryType;
    this[isGraphite ? 'gSegments' : 'segments'] = [];
  }

  /**
   * This removes an entire operator (e.g. "and(...)" including sub-operators) 
   * from a query.
   */
  removeOperator(startIndex: number) {
    const isGraphite = 'graphite' === this.query.queryType;
    const segmentsArray = this[isGraphite ? 'gSegments' : 'segments'];
    let readIndex = startIndex + 1;
    let endsNeeded = 1;
    const lastIndex = segmentsArray.length;
    // We need to remove ourself (as well as every other segment) until our 
    // TagEnd. For every TagOp we hit, we need to wait until we hit one more 
    // TagEnd, to remove any sub-ops.
    while (endsNeeded > 0 && readIndex < lastIndex) {
      const type = segmentsArray[readIndex].type;
      if (type === SegmentType.TagOp) {
        endsNeeded++;
      }
      else if (type === SegmentType.TagEnd) {
        endsNeeded--;
        if (endsNeeded === 0) {
          break; // don't increment readIndex
        }
      }
      readIndex++;
    }
    let deleteStart = startIndex;
    let countDelete = readIndex - startIndex + 1;
    // If I have a comma in front of me that needs killing, remove it
    const precedingSegment = segmentsArray[startIndex - 1] || {};
    if (precedingSegment.type === SegmentType.TagSep) {
      deleteStart--;
      countDelete++;
    }
    segmentsArray.splice(deleteStart, countDelete);
    // If these match, we removed the outermost operator, so we need a new plus segment
    if (lastIndex === readIndex + 1) {
      segmentsArray.push({ type: SegmentType.TagPlus });
    }
  }

  /**
   * This adds an operator (and() | not() | or()) and a first filter tag 
   * to a query.
   */
  addOperator(startIndex: number, value: string) {
    if (value !== 'and(' && value !== 'not(' && value !== 'or(') {
      return;
    }
    const isGraphite = 'graphite' === this.query.queryType;
    const segmentsArray = this[isGraphite ? 'gSegments' : 'segments'];
    const firstNonMetricIndex = segmentsArray.findIndex((segment) => {
      return segment.type != null && segment.type !== SegmentType.MetricName;
    });
    const isNotTheFirstOperator = firstNonMetricIndex < startIndex;
    // remove any plus segment
    if ((segmentsArray[startIndex] || {}).type === SegmentType.TagPlus) {
      segmentsArray.splice(startIndex, 1);
    }
    // if this isn't the first operator, add a separator (comma)
    if (isNotTheFirstOperator) {
      segmentsArray.splice(startIndex, 0, { type: SegmentType.TagSep });
      startIndex++;
    }
    // add the segments
    segmentsArray.splice(
      startIndex,
      0,
      { type: SegmentType.TagOp, value: value },
      { type: SegmentType.TagCat, value: 'select tag' }, // fake: true
      { type: SegmentType.TagPair },
      { type: SegmentType.TagVal, value: '*' },
      { type: SegmentType.TagPlus },
      { type: SegmentType.TagEnd }
    );
    // if this isn't the first operator, add another plus segment
    if (isNotTheFirstOperator) {
      segmentsArray.splice(startIndex + 6, 0, {
        type: SegmentType.TagPlus,
      });
    }
  }

  /**
   * This adds a tag (and category) to a query.
   */
  addTag(startIndex: number, value: string) {
    let isGraphite = 'graphite' === this.query.queryType;
    const segmentsArray = this[isGraphite ? 'gSegments' : 'segments'];
    // if this is at least the fourth segment, then we have at least one tag 
    // before us, and we need a separator (comma)
    if (startIndex >= 3) {
      segmentsArray.splice(startIndex, 0, { type: SegmentType.TagSep });
      startIndex++;
    }
    // add the tag itself
    segmentsArray.splice(
      startIndex,
      0,
      { type: SegmentType.TagCat, value: value },
      { type: SegmentType.TagPair },
      { type: SegmentType.TagVal, value: '*' }
    );
    // if index is 1 (the first segment after the metric name), it's the 
    // first addition and we're a tagCat so that means we need to add in 
    // the implicit "and(" at the beginning and ")" at the end
    if (startIndex === 1) {
      segmentsArray.splice(startIndex, 0, {
        type: SegmentType.TagOp,
        value: 'and(',
      });
      segmentsArray.push({ type: SegmentType.TagEnd });
    }
  }

  /**
   * This gets the standard query including metric name and tag filter
   */
  getStandardQuery(): string {
    let query = '';
    let addComma = false;

    for (const segment of this.segments) {
      const type = segment.type;
      const isPlus = type === SegmentType.TagPlus;
      const isEnd = type === SegmentType.TagEnd;
      const isSep = type === SegmentType.TagSep;
      const isOp = type === SegmentType.TagOp;
      const isPair = type === SegmentType.TagPair;
      const isCat = type === SegmentType.TagCat;
      const isMetric = type === SegmentType.MetricName;

      if (isPlus) {
        continue;
      }
      if (addComma && !isEnd && !isSep) {
        query += ',';
      }
      if (isMetric) {
        query += '__name:';
      }
      query += encodeTag(type, segment.value as string);
      if (isOp || isPair || isCat || isSep) {
        addComma = false;
      }
      else {
        addComma = true;
      }
    }

    return `and(${query})`;
  }

  /**
   * This gets the graphite query metric, not including any tag filter.
   */
  getGraphiteMetricQuery(): string {
    return this.getGraphiteSegmentPath()
      // this order matters, to strip off a trailing period and do it before this last one
      .replace(/\.select\smetric.$/, '')
      .replace(/\.$/, '')
      .replace(/^select\smetric$/, '');
  }

  /**
   * This gets the graphite query tag filter, not including any metric name
   */
  getGraphiteTagFilter(): string {
    let filterValues: string[] = [];

    this.gSegments.forEach((segment) => {
      switch (segment.type) {
        case SegmentType.TagPair:
          filterValues.push(':');
          break;

        case SegmentType.TagSep:
          filterValues.push(',');
          break;

        case SegmentType.TagEnd:
          filterValues.push(')');
          break;

        case SegmentType.TagCat:
        case SegmentType.TagVal:
        case SegmentType.TagOp:
          filterValues.push(segment.value as string);
          break;
      }
    });

    return filterValues.join('');
  }

  /**
   * This takes the queries and replaces all query reference placeholders.
   * queryDisplay -> {render} -> targetFull & query
   */
  renderQueryReferences(query: CirconusQuery, queries: CirconusQuery[]) {
    _renderRefs(query, queries);
    // loop through other queries and update targetFull as needed
    for (let q of queries || []) {
      if (q.refId !== query.refId) {
        _renderRefs(q, queries);
      }
    }

    function _renderRefs(thisQuery: CirconusQuery, allQueries: CirconusQuery[]) {
      const placeholderRegex = /\#([A-Z])/g;
      let renderedQuery = `${thisQuery.queryDisplay}`;

      // organize queries by refId (removing reference to self)
      const queriesByRefId = _.keyBy(allQueries, 'refId');
      delete queriesByRefId[thisQuery.refId];

      // use refCount to track circular references
      _.each(queriesByRefId, (q1, q1RefId) => {
        let refCount = 0;
        // loop through all the other queries (the ones not matching `q1RefId`)
        _.each(queriesByRefId, (q2, q2RefId) => {
          if (q2RefId !== q1RefId) {
            // find all references to q1RefId
            const matches = (q2.query || q2.queryDisplay || '').match(placeholderRegex);
            const matchCount = matches?.filter((match: string) => match === `#${q1RefId}`).length || 0;
            refCount += matchCount;
          }
        });
        // this is how many references to this query exist in other queries
        q1.refCount = refCount;
      });

      // Keep interpolating until there are no query placeholder references 
      // (the loop is because the referenced query might contain a reference 
      // to another query).
      while (renderedQuery!.match(placeholderRegex) !== null) {
        const updatedQuery: string = renderedQuery!.replace(placeholderRegex, _refProcessor);
        // end this cycle if nothing was replaced
        if (updatedQuery === renderedQuery) {
          break;
        } 
        else {
          renderedQuery = updatedQuery;
        }
      }
      // check the final rendered query
      delete thisQuery.targetFull;
      if (thisQuery.query !== renderedQuery) {
        thisQuery.query = thisQuery.targetFull = renderedQuery;
      }

      function _refProcessor (entireMatch: string, refIdOnly: string): string {
        const q = queriesByRefId[refIdOnly];
        // if there's no corresponding query, just return the entire match
        // and no replacement will be performed.
        if (!q) {
          return entireMatch;
        }
        // if there are no more references to this query, 
        // remove it from the ref object.
        if (q.refCount && q.refCount <= 0) {
          delete queriesByRefId[refIdOnly];
        }
        // decrement the reference count and proceed with the replacement
        else {
          q.refCount && q.refCount--;
        }
        // replace any CAQL directive
        const queryString = q.query || '';

        return 'caql' === q.queryType ? queryString.replace(/^#\w+=?\w*\s/, '') : queryString;
      }
    };
  }

  /**
   * This returns the query type options, optionally including graphite 
   * depending on the datasource config.
   */
  getQueryTypeOptions(): SelectableValue[] {
    const options = [
      { value: 'caql', label: 'CAQL' },
      { value: 'basic', label: 'Standard' },
      { value: 'alerts', label: 'Alerts' },
      { value: 'alert_counts', label: 'Alert Counts' }
    ];

    if (this.datasource.canShowGraphite()) {
      options.splice(2, 0, { value: 'graphite', label: 'Graphite Style' });
    }

    return options;
  }

  /**
   * This returns the label type options.
   */
  getLabelTypeOptions(): SelectableValue[] {
    const options = [
      { value: 'default', label: 'name and tags' },
      { value: 'name', label: 'name only' },
      { value: 'cardinality', label: 'high cardinality tags' },
      { value: 'custom', label: 'custom' },
    ];

    return options;
  }

  /**
   * This returns the egress override (value type) options.
   */
  getEgressOverrideOptions(): SelectableValue[] {
    const options = [
      { value: 'automatic', label: 'automatic' },
      { value: 'count', label: 'number of data points (count)' },
      { value: 'average', label: 'average value (gauge)' },
      { value: 'stddev', label: 'standard deviation a.k.a. σ (stddev)' },
      { value: 'derive', label: 'rate of change (derive)' },
      { value: 'derive_stddev', label: 'rate of change σ (derive_stddev)' },
      { value: 'counter', label: 'rate of positive change (counter)' },
      { value: 'counter_stddev', label: 'rate of positive change σ (counter_stddev)' },
    ];

    return options;
  }

  /**
   * This returns the rollup type (resolution) options.
   */
  getRollupTypeOptions(): SelectableValue[] {
    const options = [
      { value: 'automatic', label: 'automatic' },
      { value: 'minimum', label: 'minimum' },
      { value: 'exact', label: 'exact' },
    ];

    return options;
  }

  /**
   * This returns the format options.
   */
  getFormatOptions(): SelectableValue[] {
    const options = [
      { value: 'ts', label: 'Time Series' },
      { value: 'table', label: 'Table' },
      { value: 'heatmap', label: 'Heatmap' },
    ];

    return options;
  }

  /**
   * This returns the local filter match options.
   */
  getLocalFilterMatchOptions(): SelectableValue[] {
    const options = [
      { value: 'all', label: 'ALL' },
      { value: 'any', label: 'ANY' },
    ];

    return options;
  }

  /**
   * This returns the alert count query type options.
   */
  getAlertCountQueryTypeOptions(): SelectableValue[] {
    const options = [
      { value: 'instant', label: 'instant' },
      { value: 'range', label: 'range' },
    ];

    return options;
  }

  /**
   * This returns the CAQL min period options.
   */
  getMinPeriodOptions(currentMinPeriod?: string): SelectableValue[] {
    const options = [
      { value: '', label: 'none' },
      { value: '60s', label: '60s' },
      { value: '300s', label: '300s' },
    ];
    const caqlMinPeriod = this.datasource.getCaqlMinPeriod();

    // add any from the datasource config which aren't present already
    if (caqlMinPeriod) {
      let periods = caqlMinPeriod.trim().split(',');
      periods.forEach((duration) => {
        const matches = duration.toLocaleLowerCase().match(DURATION_REGEXP);
        if (matches) {
          duration += matches[2] ? '' : DURATION_UNITS_DEFAULT;
          if (!options.some((opt) => opt.value === duration)) {
            options.push({ value:duration, label:duration });
          }
        }
      });
      // sort
      options.sort((a,b) => {
        const ad = parseDurationMS(a.value || '0');
        const bd = parseDurationMS(b.value || '0');
        return ad < bd ? -1 : ad > bd ? 1 : 0;
      });
    }
    // add the current minPeriod if it's an old, odd value
    if (currentMinPeriod && !options.some((opt) => opt.value === currentMinPeriod)) {
      options.push({ value:currentMinPeriod, label:currentMinPeriod });
    }

    return options;
  }
}
