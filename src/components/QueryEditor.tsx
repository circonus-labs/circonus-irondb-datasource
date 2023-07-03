import { css, cx } from '@emotion/css';
import React, { ChangeEvent, useState } from 'react';
import _ from 'lodash';
import Parser from '../parser';
import { DataSource } from '../datasource';
import {
  GrafanaTheme2,
  QueryEditorProps,
  SelectableValue
} from '@grafana/data';
import {
  Button,
  InlineField,
  InlineFieldRow,
  Input,
  Label,
  SegmentAsync,
  Select,
  TextArea,
  useStyles2
} from '@grafana/ui';
import {
  CaqlFindFunctions,
  CaqlHistogramTransforms,
  CirconusDataSourceOptions,
  CirconusQuery,
  Segment as CirconusSegment,
  SegmentType
} from '../types';
import {
  DEFAULT_QUERY,
  DURATION_REGEXP,
  DURATION_UNITS_DEFAULT,
  parseDurationMS,
  taglessName,
  encodeTag,
  decodeTag,
  escapeStringForRegExp,
  prepStringForRegExp,
  stripGraphiteTags
} from '../common';

type Props = QueryEditorProps<DataSource, CirconusQuery, CirconusDataSourceOptions>;

export function QueryEditor(props: Props) {
  // state & styles
  const [lastFieldChanged, setLastFieldChanged] = useState('');
  const [lastCaql, setLastCaql] = useState('caql' === props.query.queryType ? props.query.queryDisplay : '');
  const tempSegs: CirconusSegment[] = [];
  const [segments, setSegments] = useState(tempSegs);
  const tempGSegs: CirconusSegment[] = [];
  const [gSegments, setGSegments] = useState(tempGSegs);
  const styles = useStyles2(getStyles);

  // props
  const { datasource, query, onChange, onRunQuery } = props;
  _.defaults(query, DEFAULT_QUERY);
  const {
    metricLabel,
    egressOverride,
    rollupType,
    metricRollup,
    format,
    queryDisplay,
    alertId,
    localFilterMatch,
    localFilter,
    alertCountQueryType
  } = query;
  let {
    labelType,
    minPeriod
  } = query;
  let error = '';

  // ensure minPeriod has the 's' suffix (used to be a bare integer)
  if (minPeriod) {
    minPeriod += /[a-zA-Z]$/.test(minPeriod) ? '' : 's';
  }
  
  // don't allow empty custom labels
  if (!metricLabel && labelType === 'custom') {
    labelType = 'default';
  }

  // TODO: support old queries using old snake-case properties

  // parse the query if it hasn't been parsed yet
  if ('basic' === query.queryType && !segments.length) {
    parseStandardQuery();
    checkForPlusAndSelect(); // ensure these segments are there for new queries
  }
  else if ('graphite' === query.queryType && !gSegments.length) {
    parseGraphiteQuery();
    checkForPlusAndSelect(); // ensure these segments are there for new queries
  }

  // options for dropdowns
  const queryTypeOptions = [
    { value: 'caql', label: 'CAQL' },
    { value: 'basic', label: 'Standard' },
    { value: 'alerts', label: 'Alerts' },
    { value: 'alert_counts', label: 'Alert Counts' }
  ];
  if (datasource.canShowGraphite()) {
    queryTypeOptions.splice(2, 0, { value: 'graphite', label: 'Graphite Style' });
  }
  const labelTypeOptions = [
    { value: 'default', label: 'name and tags' },
    { value: 'name', label: 'name only' },
    { value: 'cardinality', label: 'high cardinality tags' },
    { value: 'custom', label: 'custom' },
  ];
  const egressOverrideOptions = [
    { value: 'automatic', label: 'automatic' },
    { value: 'count', label: 'number of data points (count)' },
    { value: 'average', label: 'average value (gauge)' },
    { value: 'stddev', label: 'standard deviation a.k.a. σ (stddev)' },
    { value: 'derive', label: 'rate of change (derive)' },
    { value: 'derive_stddev', label: 'rate of change σ (derive_stddev)' },
    { value: 'counter', label: 'rate of positive change (counter)' },
    { value: 'counter_stddev', label: 'rate of positive change σ (counter_stddev)' },
  ];
  const rollupTypeOptions = [
    { value: 'automatic', label: 'automatic' },
    { value: 'minimum', label: 'minimum' },
    { value: 'exact', label: 'exact' },
  ];
  const formatOptions = [
    { value: 'ts', label: 'Time Series' },
    { value: 'table', label: 'Table' },
    { value: 'heatmap', label: 'Heatmap' },
  ];
  const localFilterMatchOptions = [
    { value: 'all', label: 'ALL' },
    { value: 'any', label: 'ANY' },
  ];
  const alertCountQueryTypeOptions = [
    { value: 'instant', label: 'instant' },
    { value: 'range', label: 'range' },
  ];
  const minPeriodOptions = getMinPeriodOptions(minPeriod);

  // double-check the queryType
  if (!queryTypeOptions.some((cfg) => cfg.value === query.queryType)) {
    query.queryType = query.isCaql ? 'caql' : datasource.canShowGraphite() ? 'graphite' : 'basic';
  }

  /**
   * This updates a query field value when the field changes.
   */
  function updateField(field: string, value: any) {
    setLastFieldChanged(field);
    onChange({
      ...query,
      [field]: value,
    });
    // executes the query
    onRunQuery();
  }

  /**
   * This performs query conversion and other tasks upon changing the query type.
   */
  function changeEditorMode(oldQueryType: string, newQueryType: string) {
    query.queryType = newQueryType as typeof query.queryType;
    // CAQL -> Standard
    if (oldQueryType === 'caql' && newQueryType === 'basic') {
      checkForPlusAndSelect();
    }
    // CAQL -> Graphite
    else if (oldQueryType === 'caql' && newQueryType === 'graphite') {
      checkForPlusAndSelect();
    }
    // Standard -> CAQL
    else if (oldQueryType === 'basic' && newQueryType === 'caql') {
      let isEmpty = query.query === 'and(__name:*)';
      if (lastCaql && isEmpty) {
        query.queryDisplay = lastCaql;
      }
      else {
        query.queryDisplay = buildCAQLFromStandard();
      }
    }
    // Standard -> Graphite
    else if (oldQueryType === 'basic' && newQueryType === 'graphite') {
      convertStandardToGraphite();
      checkForPlusAndSelect();
      buildGraphiteQuery();
    }
    // Graphite -> CAQL
    else if (oldQueryType === 'graphite' && newQueryType === 'caql') {
      let isEmpty = query.query === '' || query.query === '*' || query.query === '*.*';
      if (lastCaql && isEmpty) {
        query.queryDisplay = lastCaql;
      }
      else {
        query.queryDisplay = buildCAQLFromGraphite();
      }
    }
    // Graphite -> Standard
    else if (oldQueryType === 'graphite' && newQueryType === 'basic') {
      convertGraphiteToStandard();
      checkForPlusAndSelect();
      buildStandardQuery();
    }
    // Alerts
    else if (newQueryType === 'alerts' || newQueryType === 'alert_counts') {
      query.queryDisplay = '';
    }
    if ('caql' === newQueryType) {
      setLastCaql(query.queryDisplay);
    }
    buildQueries();
    updateField('query', query.query);
    updateField('queryDisplay', query.queryDisplay);
    updateField('queryType', query.queryType);
  }

  /**
   * This returns the CAQL min period options.
   */
  function getMinPeriodOptions(currentMinPeriod?: string): SelectableValue[] {
    const options = [
      { value: '', label: 'none' },
      { value: '60s', label: '60s' },
      { value: '300s', label: '300s' },
    ];
    const caqlMinPeriod = datasource.getCaqlMinPeriod();

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

  /**
   * This parses a standard query into segments.
   */
  function parseStandardQuery() {
    // reset
    emptySegmentsAndUpdateState();
    error = '';

    const queryString = (query.query || '').slice(4, -1) || '__name:*'; // remove the `and(` & `)` wrappers
    const tags = queryString.split(',');
    let nameIndex = tags.findIndex((tag) => /^__name:/.test(tag));
    if (~nameIndex) {
      const metricName = tags[nameIndex].replace(/^__name:/, '');
      tags.splice(nameIndex, 1);
      segments.push({ type: SegmentType.MetricName, value: decodeTag(metricName) });
    }

    let tagFilter = tags.join(',');
    let newSegments = parseTagFilter(tagFilter);
    Array.prototype.splice.apply(segments, [segments.length, 0, ...newSegments]);
    setSegments([...segments]);
  }

  /**
   * This parses a graphite-style query into segments, with tag filter segments.
   */
  function parseGraphiteQuery() {
    // reset
    emptySegmentsAndUpdateState();
    error = '';

    // parse the query into segments
    let queryString = query.query || '';
    const parser = new Parser(queryString);
    const astNode = parser.getAst();
    if (astNode === null) {
      gSegments.push({ type: SegmentType.MetricName, value:'select metric' });
      gSegments.push({ type: SegmentType.TagPlus });
      return;
    }
    else if (astNode.type === 'error') {
      error = `${astNode.message} at position: ${astNode.pos}`;
      return;
    }
    // graphite functions are not supported, only metric expressions
    else if (astNode.type === 'metric') {
        Array.prototype.splice.apply(gSegments, [0, gSegments.length, ...astNode.segments]);
    }
    gSegments.forEach((segment) => {
      if (!(segment.type in SegmentType)) {
        segment.type = SegmentType.MetricName;
      }
    });
    // add the tag filter if applicable
    const tagFilter = query.tagFilter || '';
    if (tagFilter) {
      let newSegments = parseTagFilter(tagFilter);
      Array.prototype.splice.apply(gSegments, [gSegments.length, 0, ...newSegments]);
    }
    setGSegments([...gSegments]);
  }

  /**
   * This takes a tag/search filter like `and(foo:bar)` or just a list of tags 
   * like `foo:bar,baz:quux` and converts it to a segments array.
   */
  function parseTagFilter(tagFilter = '') {
    const tags = tagFilter.split(',');
    let newSegments: CirconusSegment[] = [];
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
        newSegments.push({ type: SegmentType.TagSep, value: ',' });
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
      newSegments.push({ type: SegmentType.TagPair, value: ':' });
      let end = 0;
      while (tagVal.endsWith(')')) {
        tagVal = tagVal.slice(0, -1);
        end++;
      }
      newSegments.push({ type: SegmentType.TagVal, value: decodeTag(tagVal) });
      for (let i = 0; i < end; i++) {
        newSegments.push({ type: SegmentType.TagPlus });
        newSegments.push({ type: SegmentType.TagEnd, value: ')' });
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
  function convertStandardToGraphite(metricName = '') {
    let nameSegments: CirconusSegment[] = [];
    let filterSegments: CirconusSegment[] = [];
    const hasTwoSegments = 2 === segments.length;
    const hasMetricSegment = segments.some((s) => s?.type === SegmentType.MetricName);
    const hasPlusSegment = segments.some((s) => s?.type === SegmentType.TagPlus);

    // process a passed metricName
    if (metricName) {
      nameSegments = metricName.split('|ST')[0].split('.')
        .map((piece: string) => ({ type: SegmentType.MetricName, value: piece }));
    }
    // if the source segments are only [*][+] then convert to [select metric][+]
    else if (hasTwoSegments && hasMetricSegment && hasPlusSegment) {
      addSelectMetricSegmentAndUpdateState();
      addPlusSegmentAndUpdateState();
    }
    // process segments into name & filter segments
    else {
      segments.forEach((segment) => {
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
    Array.prototype.splice.apply(gSegments, [0, gSegments.length, ...nameSegments, ...filterSegments]);

    // if the standard query was '*', we want a blank graphite query
    if (1 === gSegments.length && '*' === gSegments[0].value) {
      gSegments.splice(0, 1);
    }
    setGSegments([...gSegments]);
  }

  /**
   * This converts the graphite segments array to the standard segments array.
   */
  function convertGraphiteToStandard() {
    let namePieces: string[] = [];
    let filterSegments: CirconusSegment[] = [];
    let uuid = '';

    // split segments into name & filter segments
    gSegments.forEach((segment: CirconusSegment, idx: number) => {
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
    const nameSegments: CirconusSegment[] = [
      { type: SegmentType.MetricName, value: namePieces.join('.') }
    ];
    Array.prototype.splice.apply(segments, [0, segments.length, ...nameSegments, ...filterSegments]);

    // if we have a check UUID then we need to add it as a tag filter
    if (uuid) {
      let firstOpIsAnd = false;
      let hasTagFilter = segments.some((segment) => {
        const isOp = segment.type === SegmentType.TagOp;
        if (isOp) {
          firstOpIsAnd = /^and/.test(segment.value as string);
        }
        return isOp;
      });
      // if there's a tag filter and the outer operator is `and()`, 
      // then insert the UUID at the end of that operator
      if (hasTagFilter && firstOpIsAnd) {
        const lastSegment = segments[segments.length - 1];
        const nextLastSegment = segments[segments.length - 2];
        let spliceIndex = -1;
        if (lastSegment.type === SegmentType.TagEnd) {
          if (nextLastSegment.type === SegmentType.TagPlus) {
            spliceIndex = segments.length - 2;
          }
          else {
            spliceIndex = segments.length - 1;
          }
        }
        if (~spliceIndex) {
          segments.splice(
            spliceIndex,
            0,
            { type: SegmentType.TagSep, value: ',' },
            { type: SegmentType.TagCat, value: '__check_uuid' },
            { type: SegmentType.TagPair, value: ':' },
            { type: SegmentType.TagVal, value: uuid }
          );
        }
      }
      // if there's a tag filter but the outer operator is not `and()`, 
      // then wrap the filter in an `and()` operator.
      else if (hasTagFilter && !firstOpIsAnd) {
        const firstOpIndex = segments.findIndex((segment) => segment.type === SegmentType.TagOp);
        if (~firstOpIndex) {
          segments.splice(firstOpIndex, 0, { type: SegmentType.TagOp, value: 'and(' });
        }
        segments.push(
          { type: SegmentType.TagSep, value: ',' },
          { type: SegmentType.TagCat, value: '__check_uuid' },
          { type: SegmentType.TagPair, value: ':' },
          { type: SegmentType.TagVal, value: uuid },
          { type: SegmentType.TagPlus },
          { type: SegmentType.TagEnd, value: ')' }
        );
      }
      // if there's no tag filter so far, then add an `and()` operator
      else if (!hasTagFilter) {
        segments.push(
          { type: SegmentType.TagOp, value: 'and(' },
          { type: SegmentType.TagCat, value: '__check_uuid' },
          { type: SegmentType.TagPair, value: ':' },
          { type: SegmentType.TagVal, value: uuid },
          { type: SegmentType.TagPlus },
          { type: SegmentType.TagEnd, value: ')' }
        );
      }
    }
    setSegments([...segments]);
  }

  /**
   * This returns either the entire graphite metric segment path (not including 
   * any tag filter), or the path up to the specified index if one is passed.
   */
  function getGraphiteSegmentPath(index?: number) {
    // if an index isn't passed, get the segment path up to the first 
    // non-metric name segment
    if (!_.isNumber(index)) {
      index = gSegments.findIndex((el) => (el.type != null && el.type !== SegmentType.MetricName));
      if (!~index) {
        index = gSegments.length;
      }
    }
    const tagFilterIdx = gSegments.findIndex((el) => (el.type != null && el.type !== SegmentType.MetricName));
    let arr = gSegments.slice(0, Math.min(index, tagFilterIdx));
    if (!arr.length) {
      arr.push({ type: SegmentType.MetricName, value: '' });
    }

    return arr.reduce((str, segment) => `${str}${(segment.value || '')}.`, '');
  }

  /**
   * This updates a segment's value.
   */
  function updateSegmentValueAndUpdateState(segment: CirconusSegment, index: number) {
    const isGraphite = 'graphite' === query.queryType;
    const segs = isGraphite ? gSegments : segments;
    (segs[index] || {}).value = segment.value;
    if (isGraphite) {
      setGSegments([...gSegments]);
    }
    else {
      setSegments([...segments]);
    }
  }

  /**
   * This adds a "select metric" segment before any tag filter segments.
   */
  function addSelectMetricSegmentAndUpdateState() {
    const isGraphite = 'graphite' === query.queryType;
    const segs = isGraphite ? gSegments : segments;
    const hasSelectAlready = segs.some((el) => {
      return el.value === 'select metric';
    });
    let idx = segs.findIndex((el) => {
      return el.type != null && el.type !== SegmentType.MetricName;
    });
    // if there isn't a non-metric segment, add it at the end
    if (!~idx) {
      idx = segs.length;
    }
    // if we don't already have a select segment, add one
    if (!hasSelectAlready) {
      segs.splice(idx, 0, {
        type: SegmentType.MetricName,
        value: 'select metric',
      });
    }
    if (isGraphite) {
      setGSegments([...gSegments]);
    }
    else {
      setSegments([...segments]);
    }
  }

  /**
   * This adds a "plus" segment at the end.
   */
  function addPlusSegmentAndUpdateState() {
    const isGraphite = 'graphite' === query.queryType;
    const segs = isGraphite ? gSegments : segments;
    const hasPlusAlready = segs.some((el) => {
      return el.type === SegmentType.TagPlus;
    });
    // if we don't already have a plus segment, add one
    if (!hasPlusAlready) {
      segs.push({
        type: SegmentType.TagPlus,
      });
    }
    if (isGraphite) {
      setGSegments([...gSegments]);
    }
    else {
      setSegments([...segments]);
    }
  }

  /**
   * This takes an index and removes that segment and all following segments.
   */
  function removeSegmentsAndUpdateState(index?: number) {
    if (_.isNumber(index)) {
      let isGraphite = 'graphite' === query.queryType;
      const segs = isGraphite ? gSegments : segments;
      segs.splice(index, segs.length - index);
      if (isGraphite) {
        setGSegments([...gSegments]);
      }
      else {
        setSegments([...segments]);
      }
    }
  }

  /**
   * This empties out the segments array.
   */
  function emptySegmentsAndUpdateState() {
    const isGraphite = 'graphite' === query.queryType;
    const segs = isGraphite ? gSegments : segments;
    segs.splice(0, segments.length);
    if (isGraphite) {
      setGSegments([...gSegments]);
    }
    else {
      setSegments([...segments]);
    }
  }

  /**
   * This takes the queries and replaces all query reference placeholders.
   * queryDisplay -> {render} -> targetFull & query
   */
  function renderQueryReferences(query: CirconusQuery, queries: CirconusQuery[]) {
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
   * This queries the tag cats endpoint with the current metric name to get 
   * an array of options for the next segment.
   * TODO: debounce this
   */
  async function getStandardCategoryOptions(index: number, search: string): Promise<SelectableValue[]> {
    const isPlusSegment = segments[index]?.type === SegmentType.TagPlus;
    const metricSegment = segments.find((s) => s.type === SegmentType.MetricName);
    const metricName = encodeTag(SegmentType.MetricName, metricSegment?.value as string);
    const options: SelectableValue[] = [];

    // perform query
    const values = await datasource.metricTagCatsQuery(`and(__name:${metricName})`);

    if (values?.data?.length) {
      if (isPlusSegment) {
        options.push({ label: 'and(', value: 'and(' });
        options.push({ label: 'not(', value: 'not(' });
        options.push({ label: 'or(',  value: 'or(' });
      }
      // TODO: figure out where the variables come from ---v
      // _.eachRight(this.templateSrv.variables, (variable) => {
      //   options.push({ label: `$${variable.name}`, value: `$${variable.name}` });
      // });
      for (const tagCat of values.data) {
        let decodedCat = decodeTag(tagCat);
        options.push({ label: decodedCat, value: decodedCat });
      }
    }

    return options;
  }

  /**
   * This queries the tag vals endpoint with the current metric name and tag 
   * category to get an array of options for the next segment.
   * TODO: debounce this
   */
  async function getStandardValueOptions(index: number, search: string): Promise<SelectableValue[]> {
    const metricSegment = segments.find((s) => s.type === SegmentType.MetricName);
    const metricName = encodeTag(SegmentType.MetricName, metricSegment?.value as string);
    const tagCat = segments[index - 2]?.value as string;
    const options: SelectableValue[] = [];

    if (tagCat && tagCat !== 'select tag') {
      const values = await datasource.metricTagValsQuery('and(__name:' + metricName + ')', encodeTag(SegmentType.TagCat, tagCat, false));
      
      const tagVals = values?.data;
      options.push({ label: '*', value: '*' });
      if (tagVals?.length) {
        // TODO: figure out where the variables come from ---v
        // _.eachRight(this.templateSrv.variables, (variable) => {
        //   options.push({ label: `$${variable.name}`, value: `$${variable.name}` });
        // });
        for (const tagVal of tagVals) {
          let decodedVal = decodeTag(tagVal);
          options.push({ label: decodedVal, value: decodedVal });
        }
      }
    }

    return options;
  }

  /**
   * This returns an array of operator options for the next segment.
   */
  async function getOperatorOptions(): Promise<SelectableValue[]> {
    const options = [
      { label: 'REMOVE', value: 'REMOVE' },
      { label: 'and(',   value: 'and(' },
      { label: 'not(',   value: 'not(' },
      { label: 'or(',    value: 'or(' },
    ];

    return Promise.resolve(options);
  }

  /**
   * This queries the tag query endpoint with the current [incomplete] search 
   * to get an array of options for the next segment.
   * TODO: debounce this
   */
  async function getStandardDefaultOptions(index: number, search = ''): Promise<SelectableValue[]> {
      const isMetricSegment = segments[index]?.type === SegmentType.MetricName;
      const options: SelectableValue[] = [];

      if (isMetricSegment) {
        if (encodeTag(SegmentType.MetricName, search) !== search) {
          search = `b/${btoa(escapeStringForRegExp(search))}/`;
        }
        else {
          search += '*';
        }

        // perform query
        const values = await datasource.metricTagsQuery(`and(__name:${search})`, true);

        if (values?.data?.length) {
          const nameSet = new Set(); // use a Set to avoid duplicates
          for (const option of values.data) {
            nameSet.add(taglessName(option.metric_name));
          }
          for (const value of nameSet) {
            options.push({ label: value as string, value: value as string });
          }
        }
      }

      return options;
  }

  /**
   * This queries the tag cats endpoint with the current metric name to get an 
   * array of options for the next segment.
   * TODO: debounce this
   */
  async function getGraphiteCategoryOptions(index: number, search = ''): Promise<SelectableValue[]> {
    const isPlusSegment = gSegments[index]?.type === SegmentType.TagPlus;
    const metricName = getGraphiteSegmentPath()
      .replace(/\.select\smetric\.$/, '.*')
      .replace(/\.$/, '');
    const options: SelectableValue[] = [];

    // perform query
    const values = await datasource.metricTagCatsQuery(`and(__name:${metricName})`);

    if (values?.data?.length) {
      if (isPlusSegment) {
        options.push({ label: 'and(', value: 'and(' });
        options.push({ label: 'not(', value: 'not(' });
        options.push({ label: 'or(',  value: 'or(' });
      }
      // TODO: figure out where the variables come from ---v
      // _.eachRight(this.templateSrv.variables, (variable) => {
      //   options.push({ label: `$${variable.name}`, value: `$${variable.name}` });
      // });
      for (const tagCat of values.data) {
        let decodedCat = decodeTag(tagCat);
        options.push({ label: decodedCat, value: decodedCat });
      }
    }

    return options;
  }

  /**
   * This queries the tag vals endpoint with the current metric name and
   * tag category to get an array of options for the next segment.
   * TODO: debounce this
   */
  async function getGraphiteValueOptions(index: number, search = ''): Promise<SelectableValue[]> {
    const metricName = getGraphiteSegmentPath()
      .replace(/\.select\smetric\.$/, '.*')
      .replace(/\.$/, '');
    const tagCat = gSegments[index - 2]?.value as string;
    const options: SelectableValue[] = [];

    if (tagCat && tagCat !== 'select tag') {
      // perform query
      const values = await datasource.metricTagValsQuery(`and(__name:${metricName})`, encodeTag(SegmentType.TagCat, tagCat, false));
      
      const tagVals = values?.data;
      options.push({ label: '*', value: '*' });
      if (tagVals?.length) {
        // TODO: figure out where the variables come from ---v
        // _.eachRight(this.templateSrv.variables, (variable) => {
        //   options.push({ label: `$${variable.name}`, value: `$${variable.name}` });
        // });
        for (const tagVal of tagVals) {
          let decodedVal = decodeTag(tagVal);
          options.push({ label: decodedVal, value: decodedVal });
        }
      }
    }

    return options;
  }

  /**
   * This queries the graphite endpoint with the current [incomplete] query 
   * path to get an array of options for the next segment.
   * TODO: debounce this
   */
  async function getGraphiteDefaultOptions(index: number, search = ''): Promise<SelectableValue[]> {
    const isFirst = 0 === index;
    const ignoreUUIDs = datasource.ignoreGraphiteUUIDs();
    // if this is not the first segment, then get the entire preceding path
    const query = isFirst ? '' : getGraphiteSegmentPath(index);
    let options: SelectableValue[] = [];

    // perform query
    const values = await datasource.metricGraphiteQuery(`${query}${search}*`, true);

    if (values?.data?.length) {
      // strip tags from the names
      values.data = stripGraphiteTags(values.data);
      for (const option of values.data) {
        const uuidRegExp = /^(\w{8}-\w{4}-\w{4}-\w{4}-\w{12})./;
        const queryRegExp = new RegExp(prepStringForRegExp(query), 'i');
        if (ignoreUUIDs) {
          option.name = option.name.replace(uuidRegExp, '');
        }
        // strip out the query path before this segment to only show this last segment value
        const reducedName = option.name.replace(queryRegExp, '');
        if (reducedName) {
          options.push({
            value: reducedName,
            label: reducedName,
          });
        }
      }
    }
    // de-dupe the options
    if (options.length) {
      options = _.uniqBy(options, 'value');
    }
    // add a wildcard if there are other options or if this is the first segment
    if (isFirst || options.length) {
      options.unshift({
        value: '*',
        label: '*'
      });
    }

    return options;
  }

  /**
   * This sets the focus on the specified segment input.
   */
  function setSegmentFocus(index: number) {
    // TODO: figure out how to set segment focus
  }

  /**
   * This updates a standard plus segment value.
   */
  function updatePlusSegmentValue(index: number, segment: CirconusSegment) {
    let startIndex = index;
    const isGraphite = 'graphite' === query.queryType;
    const segs = isGraphite ? gSegments : segments;
    // we're adding something, either an operator or a tag
    if (segment.value === 'and(' || segment.value === 'not(' || segment.value === 'or(') {
      const firstNonMetricIndex = segs.findIndex((segment) => {
        return segment.type != null && segment.type !== SegmentType.MetricName;
      });
      const isNotTheFirstOperator = firstNonMetricIndex < startIndex;
      // remove any plus segment
      if (segs[startIndex]?.type === SegmentType.TagPlus) {
        segs.splice(startIndex, 1);
      }
      // if this isn't the first operator, add a separator (comma)
      if (isNotTheFirstOperator) {
        segs.splice(startIndex, 0, { type: SegmentType.TagSep, value: ',' });
        startIndex++;
      }
      // add the segments
      segs.splice(
        startIndex,
        0,
        { type: SegmentType.TagOp, value: segment.value },
        { type: SegmentType.TagCat, value: 'select tag' }, // fake: true
        { type: SegmentType.TagPair, value: ':' },
        { type: SegmentType.TagVal, value: '*' },
        { type: SegmentType.TagPlus },
        { type: SegmentType.TagEnd, value: ')' }
      );
      // if this isn't the first operator, add another plus segment
      if (isNotTheFirstOperator) {
        segs.splice(
          startIndex + 6,
          0,
          { type: SegmentType.TagPlus });
      }
      if (isGraphite) {
        setGSegments([...gSegments]);
      }
      else {
        setSegments([...segments]);
      }
      // we do not have a category yet, so focus on the new category segment
      setSegmentFocus(index + 3);
    }
    else {
      // if this is at least the fourth segment, then we have at least one tag 
      // before us, and we need a separator (comma)
      if (startIndex >= 3) {
        segs.splice(startIndex, 0, { type: SegmentType.TagSep, value: ',' });
        startIndex++;
      }
      // add the tag itself
      segs.splice(
        startIndex,
        0,
        { type: SegmentType.TagCat, value: segment.value },
        { type: SegmentType.TagPair, value: ':' },
        { type: SegmentType.TagVal, value: '*' }
      );
      // if index is 1 (the first segment after the metric name), it's the 
      // first addition and we're a tagCat so that means we need to add in 
      // the implicit "and(" at the beginning and ")" at the end
      if (startIndex === 1) {
        segs.splice(startIndex, 0, {
          type: SegmentType.TagOp,
          value: 'and(',
        });
        segs.push({ type: SegmentType.TagEnd, value: ')' });
      }
      if (isGraphite) {
        setGSegments([...gSegments]);
      }
      else {
        setSegments([...segments]);
      }
      setSegmentFocus(index + 1);
      buildQueries();
    }
  }

  /**
   * This updates a standard operator segment value.
   */
  function updateOperatorSegmentValue(index: number, segment: CirconusSegment) {
    updateSegmentValueAndUpdateState(segment, index);
    // we need to remove the entire operator, including sub-segments
    if (segment.value === 'REMOVE') {
      const startIndex = index;
      const isGraphite = 'graphite' === query.queryType;
      const segs = isGraphite ? gSegments : segments;
      let readIndex = startIndex + 1;
      let endsNeeded = 1;
      const lastIndex = segs.length;
      // We need to remove ourself (as well as every other segment) until our 
      // TagEnd. For every TagOp we hit, we need to wait until we hit one more 
      // TagEnd, to remove any sub-ops.
      while (endsNeeded > 0 && readIndex < lastIndex) {
        const type = segs[readIndex].type;
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
      const precedingSegment = segs[startIndex - 1] || {};
      if (precedingSegment.type === SegmentType.TagSep) {
        deleteStart--;
        countDelete++;
      }
      segs.splice(deleteStart, countDelete);
      // If these match, we removed the outermost operator, so we need a new plus segment
      if (lastIndex === readIndex + 1) {
        segs.push({ type: SegmentType.TagPlus });
      }
      if (isGraphite) {
        setGSegments([...gSegments]);
      }
      else {
        setSegments([...segments]);
      }
    }
    // otherwise, changing an operator doesn't affect any other segments
    checkForPlusAndSelect();
    buildQueries();
  }

  /**
   * This updates a standard segment value (metric name, tag cat or tag val).
   */
  function updateStandardSegmentValue(index: number, segment: CirconusSegment) {
    updateSegmentValueAndUpdateState(segment, index);
    // if we changed the start metric, then we remove all the filters 
    // because they're invalid now
    if (0 === index) {
      removeSegmentsAndUpdateState(index + 1);
      checkForPlusAndSelect();
      setSegmentFocus(index + 1);
    }
    buildQueries();
  }

  /**
   * This updates a graphite segment value (metric name, tag cat or tag val).
   */
  function updateGraphiteSegmentValue(index: number, segment: CirconusSegment) {
    const isMultiSegment = /\./.test(String(segment.value));

    updateSegmentValueAndUpdateState(segment, index);

    // if we changed the first metric segment, we remove all the filters 
    // because they're in a different namespace now
    if (0 === index) {
      removeSegmentsAndUpdateState(index + 1);
    }
    // if they've entered multiple segments, we need to reconstruct the 
    // name segments by using the entire name entered so far
    if (isMultiSegment) {
      const graphiteName = getGraphiteSegmentPath().replace(/\.$/, '');
      convertStandardToGraphite(graphiteName);
    }
    // if it's not the last segment, there are other segments following.
    // TODO -> figure out how to determine isNotLastSegment
    const isNotLastSegment = true;
    if (isNotLastSegment && segment.type === SegmentType.MetricName) {
      addSelectMetricSegmentAndUpdateState();
    }
    checkForPlusAndSelect();
    if (isNotLastSegment) {
      setSegmentFocus(index + 1);
    }
    buildQueries();
  }

  /**
   * This checks to see if we need a "select metric" or "plus" segment added.
   */
  function checkForPlusAndSelect() {
    if ('graphite' === query.queryType) {
      // check the metric name so far;
      const path = getGraphiteSegmentPath();
      // if there isn't a metric name, add a "select metric" segment
      if (!path || '.' === path) {
        addSelectMetricSegmentAndUpdateState();
      }
    }
    // always try to add a plus segment (only if there's not one already)
    addPlusSegmentAndUpdateState();
  }

  /**
   * This builds a CAQL query out of standard query segments.
   * @param {string} metricPrefix - a string to be prepended to the metric name...it's used to prepend the `[graphite]` index specifier
   */
  function buildCAQLFromStandard(metricPrefix = ''): string {
    let metric = '*';
    let filter = '';

    // compile the tag filter
    segments.forEach((segment: CirconusSegment) => {
      switch (segment.type) {
        case SegmentType.MetricName:
          metric = segment.value as string;
          break;

        case SegmentType.TagPair:
          filter += ':';
          break;

        case SegmentType.TagSep:
          filter += ',';
          break;

        case SegmentType.TagEnd:
          filter += ')';
          break;

        case SegmentType.TagCat:
        case SegmentType.TagVal:
        case SegmentType.TagOp:
          filter += segment.value;
          break;
      }
    });
    // use the query egress parameters to determine the CAQL find function
    let findFunction = 'find';
    if (query.histTransform && query.paneltype === 'Heatmap') {
      findFunction = 'find:histogram';
    }
    else {
      let egressOverride = query.egressOverride || 'automatic';
      if (egressOverride !== 'average' && egressOverride !== 'automatic') {
        findFunction += `:${CaqlFindFunctions[egressOverride]}`;
      }
    }
    // see if there's a needed histogram transform; the `histTransform` property
    // isn't set manually but is injected during the query process if viewing
    // a histogram metric in a non-heatmap visualization.
    let caqlTransform = '';
    if (query.histTransform) {
      let egressOverride = query.egressOverride || 'automatic';
      if (egressOverride === 'automatic') {
        if (query.histTransform === 'statsd_counter') {
          egressOverride = 'counter';
        }
        else {
          egressOverride = 'average';
        }
      }
      caqlTransform = CaqlHistogramTransforms[egressOverride];
    }
    // determine the proper CAQL label function to be appended to the query
    const labelType = query.labelType;
    let metricLabel = query.metricLabel;
    let caqlLabel = " | label('%cn')";
    if (labelType !== 'default') {
      if (labelType === 'custom' && metricLabel) {
        metricLabel = metricLabel.replace(/'/g, '"');
        caqlLabel = ` | label('${metricLabel}')`;
      }
      else if (labelType === 'name') {
        caqlLabel = " | label('%n')";
      }
      else if (labelType === 'cardinality') {
        caqlLabel = " | label('%n | %t-{*}')";
      }
    }
    // compile the query string itself
    let queryString = `${findFunction}('${metricPrefix}${metric}'`;
    if (filter) {
      queryString += `, '${filter}')${caqlTransform}${caqlLabel}`;
    } 
    else {
      if ('*' === metric) {
        queryString += ', limit=10';
      }
      queryString += `)${caqlTransform}${caqlLabel}`;
    }

    return queryString;
  }

  /**
   * This builds a CAQL query out of graphite-style query segments.
   */
  function buildCAQLFromGraphite(): string {
    convertGraphiteToStandard();
    checkForPlusAndSelect();
    buildStandardQuery();

    return buildCAQLFromStandard('[graphite]');
  }

  /**
   * This rebuilds queries after segments have changed.
   */
  function buildQueries() {
    if (error) {
      return;
    }
    if (query.queryType === 'graphite') {
        buildGraphiteQuery();
    } 
    else if (query.queryType === 'basic') {
        buildStandardQuery();
    }
    renderQueryReferences(query, props.queries as CirconusQuery[]);
  }

  /**
   * This builds a graphite-style query out of the segments.
   */
  function buildGraphiteQuery() {
    const queryString = getGraphiteSegmentPath()
      // this order matters, to strip off a trailing period and do it before this last one
      .replace(/\.select\smetric.$/, '')
      .replace(/\.$/, '')
      .replace(/^select\smetric$/, '');
    query.query = query.queryDisplay = queryString;
    // compile the tag filter
    let filterValues: string[] = [];
    gSegments.forEach((segment) => {
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
    query.tagFilter = filterValues.join('');
    updateField('queryDisplay', query.queryDisplay);
    updateField('query', query.query);
    updateField('tagFilter', query.tagFilter);
  }

  /**
   * This builds a standard query out of the segments.
   */
  function buildStandardQuery() {
    let queryString = '';
    let addComma = false;

    for (const segment of segments) {
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
        queryString += ',';
      }
      if (isMetric) {
        queryString += '__name:';
      }
      queryString += encodeTag(type, segment.value as string);
      if (isOp || isPair || isCat || isSep) {
        addComma = false;
      }
      else {
        addComma = true;
      }
    }

    query.query = query.queryDisplay = `and(${queryString})`;
    updateField('queryDisplay', query.queryDisplay);
    updateField('query', query.query);
  }

  const isCaqlQuery = query.queryType === 'caql';
  const isStandardQuery = query.queryType === 'basic';
  const isGraphiteQuery = query.queryType === 'graphite';
  const isAlertsQuery = query.queryType === 'alerts';
  const isAlertCountQuery = query.queryType === 'alert_counts';
  const isCustomLabelType = labelType === 'custom';
  const isHeatmapFormat = format === 'heatmap';
  const isAutoRollupType = rollupType === 'automatic';

  return (
    <>
      <InlineFieldRow>
        <InlineField 
          label={<Label className={cx(styles.labels)}>Query Type</Label>}
          >
          <Select
            options={queryTypeOptions}
            value={query.queryType}
            onChange={(obj: SelectableValue<string>) => {
              changeEditorMode(query.queryType, obj.value as string);
            }}
            />
        </InlineField>
        <div className={cx(styles.fillFlex)}></div>
      </InlineFieldRow>
      {
        isStandardQuery
        ? <InlineFieldRow>
            <InlineField
              className={cx(styles.noRightMargin)}
              label={<Label className={cx(styles.labels)}>Series</Label>}
              >
              <div className={cx(styles.flexWrap)}>
                {
                  segments.map((segment, index) => {
                    switch (segment.type) {
                      case SegmentType.TagOp:
                        return <SegmentAsync
                          className={cx(styles.tagOp)}
                          value={segment.value}
                          loadOptions={getOperatorOptions}
                          inputMinWidth={150}
                          onChange={(item: SelectableValue) => updateOperatorSegmentValue(index, { type:segment.type, value:item.value })}
                          />;

                      case SegmentType.TagCat:
                        return <SegmentAsync
                          className={cx(styles.tagCat)}
                          value={segment.value}
                          allowCustomValue={true}
                          loadOptions={(search) => getStandardCategoryOptions(index, search as string)}
                          inputMinWidth={150}
                          onChange={(item: SelectableValue) => updateStandardSegmentValue(index, { type:segment.type, value:item.value })}
                          />;

                      case SegmentType.TagVal:
                        return <SegmentAsync
                          className={cx(styles.tagVal)}
                          value={segment.value}
                          allowCustomValue={true}
                          loadOptions={(search) => getStandardValueOptions(index, search as string)}
                          inputMinWidth={150}
                          onChange={(item: SelectableValue) => updateStandardSegmentValue(index, { type:segment.type, value:item.value })}
                          />;

                      case SegmentType.TagPlus:
                        return <SegmentAsync
                          Component={<Button icon="plus" variant="secondary" className={cx(styles.plusButton)} aria-label="Add new segment" />}
                          loadOptions={(search) => getStandardCategoryOptions(index, search as string)}
                          inputMinWidth={150}
                          onChange={(item: SelectableValue) => updatePlusSegmentValue(index, { type:segment.type, value:item.value })}
                          />;

                      case SegmentType.TagPair:
                        return <div className={cx(styles.tagPair) +' gf-form-label'}>{segment.value}</div>;

                      case SegmentType.TagSep:
                        return <div className={cx(styles.tagSep) +' gf-form-label'}>{segment.value}</div>;

                      case SegmentType.TagEnd:
                        return <div className={cx(styles.tagOp) +' gf-form-label'}>{segment.value}</div>;

                      default:
                        return <SegmentAsync
                          value={segment.value}
                          allowCustomValue={true}
                          loadOptions={(search) => getStandardDefaultOptions(index, search as string)}
                          inputMinWidth={150}
                          onChange={(item: SelectableValue) => updateStandardSegmentValue(index, { type:segment.type, value:item.value })}
                          />;
                    }
                  })
                }
              </div>
            </InlineField>
            <div className={cx(styles.fillFlex)}></div>
          </InlineFieldRow>
        : <></>
      }
      {
        isGraphiteQuery
        ? <InlineFieldRow>
            <InlineField
              className={cx(styles.noRightMargin)}
              label={<Label className={cx(styles.labels)}>Series</Label>}
              >
              <>
                {
                  gSegments.map((segment, index) => {
                    switch (segment.type) {
                      case SegmentType.TagOp:
                        return <SegmentAsync
                          className={cx(styles.tagOp)}
                          value={segment.value}
                          loadOptions={getOperatorOptions}
                          inputMinWidth={150}
                          onChange={(item: SelectableValue) => updateOperatorSegmentValue(index, { type:segment.type, value:item.value })}
                          />;

                      case SegmentType.TagCat:
                        return <SegmentAsync
                          className={cx(styles.tagCat)}
                          value={segment.value}
                          allowCustomValue={true}
                          loadOptions={(search) => getGraphiteCategoryOptions(index, search as string)}
                          inputMinWidth={150}
                          onChange={(item: SelectableValue) => updateGraphiteSegmentValue(index, { type:segment.type, value:item.value })}
                          />;

                      case SegmentType.TagVal:
                        return <SegmentAsync
                          className={cx(styles.tagVal)}
                          value={segment.value}
                          allowCustomValue={true}
                          loadOptions={(search) => getGraphiteValueOptions(index, search as string)}
                          inputMinWidth={150}
                          onChange={(item: SelectableValue) => updateGraphiteSegmentValue(index, { type:segment.type, value:item.value })}
                          />;

                      case SegmentType.TagPlus:
                        return <SegmentAsync
                          Component={<Button icon="plus" variant="secondary" className={cx(styles.plusButton)} aria-label="Add new segment" />}
                          loadOptions={(search) => getGraphiteCategoryOptions(index, search as string)}
                          inputMinWidth={150}
                          onChange={(item: SelectableValue) => updatePlusSegmentValue(index, { type:segment.type, value:item.value })}
                          />;

                      case SegmentType.TagPair:
                        return <div className={cx(styles.tagPair) +' gf-form-label'}>{segment.value}</div>;

                      case SegmentType.TagSep:
                        return <div className={cx(styles.tagSep) +' gf-form-label'}>{segment.value}</div>;

                      case SegmentType.TagEnd:
                        return <div className={cx(styles.tagOp) +' gf-form-label'}>{segment.value}</div>;

                      default:
                        return <SegmentAsync
                          value={segment.value}
                          allowCustomValue={true}
                          loadOptions={(search) => getGraphiteDefaultOptions(index, search as string)}
                          inputMinWidth={150}
                          onChange={(item: SelectableValue) => updateGraphiteSegmentValue(index, { type:segment.type, value:item.value })}
                          />;
                    }
                  })
                }
              </>
            </InlineField>
            <div className={cx(styles.fillFlex)}></div>
          </InlineFieldRow>
        : <></>
      }
      {
        isCaqlQuery
        ? <TextArea
            value={queryDisplay}
            placeholder="find('metric','and(tag:val)') | stats:sum()"
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
              let value = event.target.value;
              updateField('queryDisplay', query.queryDisplay = value);
              buildQueries();
            }}
            >
          </TextArea>
        : <></>
      }
      {
        isAlertsQuery || isAlertCountQuery
        ? <>
            <InlineFieldRow>
              <InlineField
                label={<Label className={cx(styles.labels)}>Alert ID</Label>}
                >
                <Input
                  value={alertId}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    let value = event.target.value.trim();
                    updateField('alertId', query.alertId = value ? Number(value) : undefined);
                    if (value) {
                      updateField('query', query.query = '');
                      updateField('queryDisplay', query.queryDisplay = '');
                    }
                  }}
                  autoFocus={lastFieldChanged === 'labelType'}
                  />
              </InlineField>
              <div className={cx(styles.fillFlex)}></div>
            </InlineFieldRow>
            <InlineFieldRow>
              <InlineField 
                label={<Label className={cx(styles.labels)}>Alert Query</Label>}
                >
                <Input
                  value={query.query}
                  placeholder="(metric:available)(active:1)"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    let value = event.target.value;
                    updateField('query', query.query = value);
                  }}
                  autoFocus={lastFieldChanged === 'labelType'}
                  />
              </InlineField>
              <div className={cx(styles.fillFlex)}></div>
            </InlineFieldRow>
            <InlineFieldRow>
              <InlineField 
                label={<Label className={cx(styles.labels)}>Local Filter</Label>}
                >
                <Select
                  options={localFilterMatchOptions}
                  value={localFilterMatch}
                  onChange={(obj: SelectableValue<string>) => {
                    updateField('localFilterMatch', query.localFilterMatch = obj.value as typeof localFilterMatch);
                  }}
                  />
              </InlineField>
              <InlineField 
                grow={true}
                >
                <Input
                  value={localFilter}
                  placeholder="tag:cluster:core-central*,acknowleged:false"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    let value = event.target.value;
                    updateField('localFilter', query.localFilter = value);
                  }}
                  autoFocus={lastFieldChanged === 'localFilterMatch'}
                  />
              </InlineField>
            </InlineFieldRow>
            {
              isAlertCountQuery
              ? <InlineFieldRow>
                  <InlineField 
                    label={<Label className={cx(styles.labels)}>Query Type</Label>}
                    >
                    <Select
                      options={alertCountQueryTypeOptions}
                      value={alertCountQueryType}
                      onChange={(obj: SelectableValue<string>) => {
                        updateField('alertCountQueryType', query.alertCountQueryType = obj.value);
                      }}
                      />
                  </InlineField>
                </InlineFieldRow>
              : <></>
            }
          </>
        : <></>
      }
      {
        isStandardQuery && !isHeatmapFormat
        ? <InlineFieldRow>
            <InlineField 
              label={<Label className={cx(styles.labels)}>Label</Label>}
              >
              <Select
                options={labelTypeOptions}
                value={labelType}
                onChange={(obj: SelectableValue<string>) => {
                  updateField('labelType', query.labelType = obj.value as typeof labelType);
                }}
                />
            </InlineField>
            {
              isCustomLabelType
              ? <InlineField 
                  grow={true}
                  >
                  <Input
                    value={metricLabel}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      let value = event.target.value;
                      updateField('metricLabel', query.metricLabel = value);
                      if (!value.trim()) {
                        updateField('labelType', query.labelType = 'default');
                      }
                    }}
                    autoFocus={lastFieldChanged === 'labelType'}
                    />
                </InlineField>
              : <></>
            }
            <div className={cx(styles.fillFlex)}></div>
          </InlineFieldRow>
        : <></>
      }
      {
        isAlertCountQuery
        ? <InlineFieldRow>
            <InlineField 
              label={<Label className={cx(styles.labels)}>Label</Label>}
              >
              <Input
                value={metricLabel}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  let value = event.target.value;
                  updateField('metricLabel', query.metricLabel = value);
                  if (!value.trim() && labelType === 'custom') {
                    updateField('labelType', query.labelType = 'default');
                  }
                }}
                />
            </InlineField>
            <div className={cx(styles.fillFlex)}></div>
          </InlineFieldRow>
        : <></>
      }
      {
        (isStandardQuery || isGraphiteQuery) && !isHeatmapFormat
        ? <InlineFieldRow>
            <InlineField 
              label={<Label className={cx(styles.labels)}>Value Type</Label>}
              >
              <Select
                options={egressOverrideOptions}
                value={egressOverride}
                onChange={(obj: SelectableValue<string>) => {
                  updateField('egressOverride', query.egressOverride = obj.value as typeof egressOverride);
                }}
                />
            </InlineField>
            <div className={cx(styles.fillFlex)}></div>
          </InlineFieldRow>
        : <></>
      }
      <InlineFieldRow>
        <InlineField 
          label={<Label className={cx(styles.labels)}>Resolution</Label>}
          >
          <Select
            options={rollupTypeOptions}
            value={rollupType}
            onChange={(obj: SelectableValue<string>) => {
              updateField('rollupType', query.rollupType = obj.value as typeof rollupType);
            }}
            />
        </InlineField>
        {
          !isAutoRollupType
          ? <InlineField 
              grow={true}
              >
              <Input
                value={metricRollup}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  let value = event.target.value;
                  updateField('metricRollup', query.metricRollup = value);
                  if (!value.trim()) {
                    updateField('rollupType', query.rollupType = 'automatic');
                  }
                }}
                autoFocus={lastFieldChanged === 'rollupType'}
                />
            </InlineField>
          : <></>
        }
        <div className={cx(styles.fillFlex)}></div>
      </InlineFieldRow>
      {
        isCaqlQuery
        ? <InlineFieldRow>
            <InlineField 
              label={<Label className={cx(styles.labels)}>Force Min Period</Label>}
              >
              <Select
                options={minPeriodOptions}
                value={minPeriod}
                onChange={(obj: SelectableValue<string>) => {
                  updateField('minPeriod', query.minPeriod = obj.value);
                }}
                />
            </InlineField>
            <div className={cx(styles.fillFlex)}></div>
          </InlineFieldRow>
        : <></>
      }
      <InlineFieldRow>
        <InlineField 
          label={<Label className={cx(styles.labels)}>Format</Label>}
          >
          <Select
            options={formatOptions}
            value={format}
            onChange={(obj: SelectableValue<string>) => {
              updateField('format', query.format = obj.value);
            }}
            />
        </InlineField>
        <div className={cx(styles.fillFlex)}></div>
      </InlineFieldRow>
    </>
  );
}

function getStyles(theme: GrafanaTheme2) {
  return {
    labels: css`
      display: flex;
      color: ${theme.colors.primary.text};
      -moz-box-align: center;
      align-items: center;
      -moz-box-pack: justify;
      justify-content: space-between;
      flex-shrink: 0;
      padding: 0px ${theme.spacing(1)};
      font-weight: 500;
      font-size: 12px;
      background-color: ${theme.colors.background.secondary};
      height: ${theme.spacing(4)};
      line-height: ${theme.spacing(4)};
      margin-right: ${theme.spacing(0.5)};
      margin-bottom: 0;
      border-radius: ${theme.spacing(0.25)};
      border: medium none;
      width: 128px;
    `,
    plusButton: css`
      background-color: ${theme.colors.background.secondary};
      margin-right: ${theme.spacing(0.5)};
    `,
    fillFlex: css`
      display: flex;
      flex: 1 1 auto;
      background-color: ${theme.colors.background.secondary};
      margin-bottom: ${theme.spacing(0.5)};
    `,
    flexWrap: css`
      display: flex;
      flex: 1 1 auto;
    `,
    tagOp: css`
      color: #eb7b18;
    `,
    tagEnd: css`
      color: #eb7b18;
      margin-right: 0;
    `,
    tagCat: css`
      color: #598;
      padding-right: ${theme.spacing(0.5)};
      margin-right: 0;
    `,
    tagVal: css`
      color: #5ca;
      padding-left: ${theme.spacing(0.5)};
    `,
    tagPair: css`
      color: #888;
      padding-right: ${theme.spacing(0.5)};
      padding-left: ${theme.spacing(0.5)};
      margin-right: 0;
    `,
    tagSep: css`
      color: #888;
    `,
    noRightMargin: css`
      margin-right: 0;
    `,
  };
}
