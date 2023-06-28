import { css, cx } from '@emotion/css';
import React, { ChangeEvent, useState } from 'react';
import _ from 'lodash';
import QueryManager from '../querymanager';
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
  const [lastQueryType, setLastQueryType] = useState(props.query.queryType);
  const [lastCaql, setLastCaql] = useState('caql' === lastQueryType ? props.query.query : '');
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
    queryType,
    labelType,
    minPeriod
  } = query;

  // initialize the query manager
  const manager = new QueryManager(datasource, query);

  // options for dropdowns
  const queryTypeOptions = manager.getQueryTypeOptions();
  const labelTypeOptions = manager.getLabelTypeOptions();
  const egressOverrideOptions = manager.getEgressOverrideOptions();
  const rollupTypeOptions = manager.getRollupTypeOptions();
  const formatOptions = manager.getFormatOptions();
  const localFilterMatchOptions = manager.getLocalFilterMatchOptions();
  const alertCountQueryTypeOptions = manager.getAlertCountQueryTypeOptions();
  // ensure minPeriod has the 's' suffix (used to be a bare integer)
  if (minPeriod) {
    minPeriod += /[a-zA-Z]$/.test(minPeriod) ? '' : 's';
  }
  const minPeriodOptions = manager.getMinPeriodOptions(minPeriod);

  // double-check the queryType
  if (!queryTypeOptions.some((cfg) => cfg.value === queryType)) {
    queryType = query.isCaql ? 'caql' : datasource.canShowGraphite() ? 'graphite' : 'basic';
  }
  
  // don't allow empty custom labels
  if (!metricLabel && labelType === 'custom') {
    labelType = 'default';
  }

  // make sure the proper segments are there for new queries
  checkForPlusAndSelect();

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
  function changeEditorMode() {
    // CAQL -> Standard
    if (lastQueryType === 'caql' && queryType === 'basic') {
      checkForPlusAndSelect();
    }
    // CAQL -> Graphite
    else if (lastQueryType === 'caql' && queryType === 'graphite') {
      checkForPlusAndSelect();
    }
    // Standard -> CAQL
    else if (lastQueryType === 'basic' && queryType === 'caql') {
      let isEmpty = query.query === 'and(__name:*)';
      if (lastCaql && isEmpty) {
        updateField('queryDisplay', lastCaql);
      }
      else {
        updateField('queryDisplay', buildCAQLFromStandard());
      }
    }
    // Standard -> Graphite
    else if (lastQueryType === 'basic' && queryType === 'graphite') {
      convertStandardToGraphite();
      checkForPlusAndSelect();
    }
    // Graphite -> CAQL
    else if (lastQueryType === 'graphite' && queryType === 'caql') {
      let isEmpty = query.query === '' || query.query === '*' || query.query === '*.*';
      if (lastCaql && isEmpty) {
        updateField('queryDisplay', lastCaql);
      }
      else {
        updateField('queryDisplay', buildCAQLFromGraphite());
      }
    }
    // Graphite -> Standard
    else if (lastQueryType === 'graphite' && queryType === 'basic') {
      convertGraphiteToStandard();
      checkForPlusAndSelect();
    }
    // Alerts
    else if (queryType === 'alerts' || queryType === 'alert_counts') {
      updateField('queryDisplay', '');
    }
    buildQueries();
    setLastQueryType(queryType);
    if ('caql' === queryType) {
        setLastCaql(query.query);
    }
  }

  /**
   * This queries the tag cats endpoint with the current metric name to get 
   * an array of options for the next segment.
   * TODO: debounce this
   */
  async function getStandardCategoryOptions(index: number, search: string): Promise<SelectableValue[]> {
      const isPlusSegment = manager.segments[index]?.type === SegmentType.TagPlus;
      const metricSegment = manager.segments.find((s) => s.type === SegmentType.MetricName);
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
    const metricSegment = manager.segments.find((s) => s.type === SegmentType.MetricName);
    const metricName = encodeTag(SegmentType.MetricName, metricSegment?.value as string);
    const tagCat = manager.segments[index - 2]?.value as string;
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
      const isMetricSegment = manager.segments[index]?.type === SegmentType.MetricName;
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
    const isPlusSegment = manager.gSegments[index]?.type === SegmentType.TagPlus;
    const metricName = manager.getGraphiteSegmentPath()
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
    const metricName = manager.getGraphiteSegmentPath()
      .replace(/\.select\smetric\.$/, '.*')
      .replace(/\.$/, '');
    const tagCat = manager.gSegments[index - 2]?.value as string;
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
    const query = isFirst ? '' : manager.getGraphiteSegmentPathUpTo(index);
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
    // we're adding something, either an operator or a tag
    if (segment.value === 'and(' || segment.value === 'not(' || segment.value === 'or(') {
      manager.addOperator(index, segment.value);
      // we do not have a category yet, so focus on the new category segment
      setSegmentFocus(index + 3);
    }
    else {
      manager.addTag(index, segment.value as string);
      setSegmentFocus(index + 1);
      buildQueries();
    }
  }

  /**
   * This updates a standard operator segment value.
   */
  function updateOperatorSegmentValue(index: number, segment: CirconusSegment) {
    manager.updateSegmentValue(segment, index);
    // we need to remove the entire operator, including sub-segments
    if (segment.value === 'REMOVE') {
      manager.removeOperator(index);
    }
    // otherwise, changing an operator doesn't affect any other segments
    checkForPlusAndSelect();
    buildQueries();
  }

  /**
   * This updates a standard segment value (metric name, tag cat or tag val).
   */
  function updateStandardSegmentValue(index: number, segment: CirconusSegment) {
    manager.updateSegmentValue(segment, index);
    // if we changed the start metric, then we remove all the filters 
    // because they're invalid now
    if (0 === index) {
      manager.removeSegments(index + 1);
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

    manager.updateSegmentValue(segment, index);

    // if we changed the first metric segment, we remove all the filters 
    // because they're in a different namespace now
    if (0 === index) {
      manager.removeSegments(index + 1);
    }
    // if they've entered multiple segments, we need to reconstruct the 
    // name segments by using the entire name entered so far
    if (isMultiSegment) {
      const graphiteName = manager.getGraphiteSegmentPath().replace(/\.$/, '');
      manager.convertStandardToGraphite(graphiteName);
    }
    // if it's not the last segment, there are other segments following.
    // TODO -> figure out how to determine isNotLastSegment
    const isNotLastSegment = true;
    if (isNotLastSegment && segment.type === SegmentType.MetricName) {
      manager.addSelectMetricSegment();
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
      const path = manager.getGraphiteSegmentPath();
      // if there isn't a metric name, add a "select metric" segment
      if (!path || '.' === path) {
        manager.addSelectMetricSegment();
      }
    }
    // always try to add a plus segment (only if there's not one already)
    manager.addPlusSegment();
  }

  /**
   * This takes a standard query egress param and uses it to determine the 
   * corresponding CAQL find() function.
   */
  function getCAQLFindFunction(): string {
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

    return findFunction;
  }

  /**
   * This gets the appropriate histogram transform for CAQL, as needed. The
   * `histTransform` property isn't set manually but is injected during the 
   * query process if viewing a histogram metric in a visualization other than 
   * a heatmap.
   */
  function getCAQLHistogramTransform() {
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
    
    return caqlTransform;
  }

  /**
   * This looks at the current label settings and returns the proper CAQL 
   * label function (with a pipe), for appending to a CAQL query.
   */
  function getCAQLLabel(): string {
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

    return caqlLabel;
  }

  /**
   * This builds a CAQL uery out of standard query segments.
   * @param {string} metricPrefix - a string to be prepended to the metric name...it's used to prepend the `[graphite]` index specifier
   */
  function buildCAQLFromStandard(metricPrefix = ''): string {
    let metric = '*';
    let filter = '';

    manager.segments.forEach((segment: CirconusSegment) => {
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
    let query = `${getCAQLFindFunction()}('${metricPrefix}${metric}'`;
    if (filter) {
      query += `, '${filter}')${getCAQLHistogramTransform()}${getCAQLLabel()}`;
    } 
    else {
      if ('*' === metric) {
        query += ', limit=10';
      }
      query += `)${getCAQLHistogramTransform()}${getCAQLLabel()}`;
    }

    return query;
  }

  /**
   * This builds a CAQL query out of graphite-style query segments.
   */
  function buildCAQLFromGraphite(): string {
    convertGraphiteToStandard();

    return buildCAQLFromStandard('[graphite]');
  }

  /**
   * This converts standard segments to graphite segments.
   */
  function convertStandardToGraphite() {
    manager.convertStandardToGraphite();
    checkForPlusAndSelect();
    buildGraphiteQuery();
  }

  /**
   * This converts graphite segments to standard segments.
   */
  function convertGraphiteToStandard() {
    manager.convertGraphiteToStandard();
    checkForPlusAndSelect();
    buildStandardQuery();
  }

  /**
   * This rebuilds queries after segments have changed.
   */
  function buildQueries() {
    if (manager.error) {
      return;
    }
    if (isGraphiteQuery) {
        buildGraphiteQuery();
    } 
    else if (isStandardQuery) {
        buildStandardQuery();
    }
    manager.renderQueryReferences(query, props.queries as CirconusQuery[]);
  }

  /**
   * This builds a graphite-style query out of the segments.
   */
  function buildGraphiteQuery() {
    query.query = query.queryDisplay = manager.getGraphiteMetricQuery();
    query.tagFilter = manager.getGraphiteTagFilter();
    updateField('queryDisplay', query.queryDisplay);
    updateField('query', query.query);
    updateField('tagFilter', query.tagFilter);
  }

  /**
   * This builds a standard query out of the segments.
   */
  function buildStandardQuery() {
    query.query = query.queryDisplay = manager.getStandardQuery();
    updateField('queryDisplay', query.queryDisplay);
    updateField('query', query.query);
  }

  const isCaqlQuery = queryType === 'caql';
  const isStandardQuery = queryType === 'basic';
  const isGraphiteQuery = queryType === 'graphite';
  const isAlertsQuery = queryType === 'alerts';
  const isAlertCountQuery = queryType === 'alert_counts';
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
            value={queryType}
            onChange={(obj: SelectableValue<string>) => {
              updateField('queryType', obj.value);
              changeEditorMode();
            }}
            />
        </InlineField>
        <div className={cx(styles.fillFlex)}></div>
      </InlineFieldRow>
      {
        isStandardQuery
        ? <InlineFieldRow>
            <InlineField 
              label={<Label className={cx(styles.labels)}>Series</Label>}
              >
              <>
                {
                  manager.segments.map((segment, index) => {
                    switch (segment.type) {
                      case SegmentType.TagOp:
                        return <SegmentAsync
                          value={segment.value}
                          loadOptions={getOperatorOptions}
                          inputMinWidth={150}
                          onChange={(item: SelectableValue) => updateOperatorSegmentValue(index, { type:segment.type, value:item.value })}
                          />;

                      case SegmentType.TagCat:
                        return <SegmentAsync
                          value={segment.value}
                          allowCustomValue={true}
                          loadOptions={(search) => getStandardCategoryOptions(index, search as string)}
                          inputMinWidth={150}
                          onChange={(item: SelectableValue) => updateStandardSegmentValue(index, { type:segment.type, value:item.value })}
                          />;

                      case SegmentType.TagVal:
                        return <SegmentAsync
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
                      case SegmentType.TagSep:
                      case SegmentType.TagEnd:
                        return <div className="gf-form-label">{segment.value}</div>;

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
              </>
            </InlineField>
            <div className={cx(styles.fillFlex)}></div>
          </InlineFieldRow>
        : <></>
      }
      {
        isGraphiteQuery
        ? <InlineFieldRow>
            <InlineField 
              label={<Label className={cx(styles.labels)}>Series</Label>}
              >
              <>
                {
                  manager.gSegments.map((segment, index) => {
                    switch (segment.type) {
                      case SegmentType.TagOp:
                        return <SegmentAsync
                          value={segment.value}
                          loadOptions={getOperatorOptions}
                          inputMinWidth={150}
                          onChange={(item: SelectableValue) => updateOperatorSegmentValue(index, { type:segment.type, value:item.value })}
                          />;

                      case SegmentType.TagCat:
                        return <SegmentAsync
                          value={segment.value}
                          allowCustomValue={true}
                          loadOptions={(search) => getGraphiteCategoryOptions(index, search as string)}
                          inputMinWidth={150}
                          onChange={(item: SelectableValue) => updateGraphiteSegmentValue(index, { type:segment.type, value:item.value })}
                          />;

                      case SegmentType.TagVal:
                        return <SegmentAsync
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
                      case SegmentType.TagSep:
                      case SegmentType.TagEnd:
                        return <div className="gf-form-label">{segment.value}</div>;

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
              updateField('queryDisplay', value);
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
                    let value = event.target.value;
                    updateField('alertId', value);
                    if (value.trim()) {
                      updateField('query', '');
                      updateField('queryDisplay', '');
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
                    updateField('query', value);
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
                    updateField('localFilterMatch', obj.value);
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
                    updateField('localFilter', value);
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
                        updateField('alertCountQueryType', obj.value);
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
                  updateField('labelType', obj.value);
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
                      updateField('metricLabel', value);
                      if (!value.trim()) {
                        updateField('labelType', 'default');
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
                  updateField('metricLabel', value);
                  if (!value.trim() && labelType === 'custom') {
                    updateField('labelType', 'default');
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
                  updateField('egressOverride', obj.value);
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
              updateField('rollupType', obj.value);
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
                  updateField('metricRollup', value);
                  if (!value.trim()) {
                    updateField('rollupType', 'automatic');
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
                  updateField('minPeriod', obj.value);
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
              updateField('format', obj.value);
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
    segmentButton: css`
      height: ${theme.spacing(4)};
    `,
    plusButton: css`
      background-color: ${theme.colors.background.secondary};
    `,
    fillFlex: css`
      display: flex;
      flex-grow: 1;
      background-color: ${theme.colors.background.secondary};
      margin-bottom: ${theme.spacing(0.5)};
    `,
  };
}
