import {
  AnnotationQueryRequest,
  AnnotationEvent,
  ArrayVector,
  DataFrame,
  DataSourceInstanceSettings,
  DataSourceApi,
  DataQueryResponse,
  DataQueryResponseData,
  DataQueryRequest,
  FieldType,
  LoadingState,
  MutableDataFrame,
  MutableField,
} from '@grafana/data';
import {
  getBackendSrv,
  getTemplateSrv
} from '@grafana/runtime';
import _ from 'lodash';
import Log from './logger';
import { Memoized } from 'memoizee';
import Mustache from 'mustache';
import {
  CirconusQuery,
  CirconusDataSourceOptions,
  DataRequestItems,
  HistogramTransforms,
  CirconusVariableQuery,
  SegmentType,
  TagSet,
} from './types';
import {
  DEFAULT_OPTIONS,
  MAX_DATAPOINTS_THRESHOLD,
  MAX_EXACT_DATAPOINTS_THRESHOLD,
  MIN_DURATION_MS_CAQL,
  MIN_DURATION_MS_FETCH,
  ROLLUP_ALIGN_MS,
  ROLLUP_ALIGN_MS_1DAY,
  isStatsdCounter,
  decodeTag,
  decodeTagsInLabel,
  encodeTag,
  getTimeField,
  getNumberField,
  getTextField,
  getOtherField,
  metaInterpolateLabel,
  mergeTags,
  parseDurationMS,
  prepStringForRegExp,
  setupCache,
  splitTags,
  taglessName,
  taglessNameAndTags,
  md5
} from './common';
const log = Log('Circonus DataSource');

export class DataSource extends DataSourceApi<CirconusQuery, CirconusDataSourceOptions> {
  backendSrv: any;
  templateSrv: any;
  dataSourceOptions: CirconusDataSourceOptions;
  id: number;
  name: string;
  type: string;
  userHash: string;
  url: any;
  appName: string;
  supportAnnotations: boolean;
  supportMetrics: boolean;
  basicAuth?: boolean;
  withCredentials?: boolean;
  datasourceRequest: (options: any) => any;
  queryRange: any;

  constructor(instanceSettings: DataSourceInstanceSettings<CirconusDataSourceOptions>) {
    super(instanceSettings);
    this.backendSrv = getBackendSrv();
    this.templateSrv = getTemplateSrv();
    
    this.dataSourceOptions = instanceSettings.jsonData;
    _.defaults(this.dataSourceOptions, DEFAULT_OPTIONS);

    this.id                 = instanceSettings.id;
    this.name               = instanceSettings.name;
    this.type               = 'Circonus';
    this.userHash           = '';
    this.url                = instanceSettings.url;
    this.appName            = 'Grafana';
    this.supportAnnotations = false;
    this.supportMetrics     = true;
    this.datasourceRequest  = setupCache(this.dataSourceOptions.useCaching, this.backendSrv, this);

    this.query = _.debounce(this.query, 300, { leading:true, trailing:true }) as (options: DataQueryRequest<CirconusQuery>) => Promise<DataQueryResponse>;

    // TODO: support old queries using old snake-case properties

    if (!this.dataSourceOptions.disableUsageStatistics) {
      this.backendSrv
          .get('/api/user')
          .then((info: any) => {
              this.userHash = md5(info.email);
          })
          .catch((e: Error) => log(() => 'error fetching Circonus user info: ' + JSON.stringify(e)));
    }
  }

  /**
   * This is the method which receives each query request from Grafana.
   */
  query(options: DataQueryRequest<CirconusQuery>): Promise<DataQueryResponse> {
    // TEST CODE (RENDERS A SINE WAVE)
    // -------------------------------------------------------------------------
    // const { range } = options;
    // const from = range!.from.valueOf();
    // const to = range!.to.valueOf();
    // const data = options.targets.map((target) => {
    //   const frame = new MutableDataFrame({
    //     refId: target.refId,
    //     fields: [
    //       { name: 'time', type: FieldType.time },
    //       { name: 'value', type: FieldType.number },
    //     ],
    //   });
    //   // duration of the time range, in milliseconds.
    //   const duration = to - from;
    //   // step determines how close in time (ms) the points will be to each other.
    //   const step = duration / 1000;
    //   for (let t = 0; t < duration; t += step) {
    //     frame.add({ time: from + t, value: Math.sin((2 * Math.PI * t) / duration) });
    //   }
    //   return frame;      
    // });
    // return Promise.resolve({ data });
    // -------------------------------------------------------------------------
    // END OF TEST CODE

    if (!_.isUndefined(this.queryRange) && !_.isEqual(options.range, this.queryRange)) {
      if (this.dataSourceOptions.useCaching) {
        const requestCache = this.datasourceRequest as unknown as Memoized<(options: any) => any>;
        requestCache.clear();
      }
    }
    this.queryRange = options.range;
    if (_.isEmpty(options.targets[0])) {
      return Promise.resolve({ data: [] as any[] });
    }

    return this.buildDataRequestItems(options)
      .then((preppedItems: void | DataRequestItems) => {
        if (_.isEmpty(preppedItems) || !preppedItems) {
          return Promise.resolve({ data: [] as any[] });
        }
        return this.dataRequest(preppedItems, true);
      })
      .then((queryResults) => {
        if (queryResults.t === 'ts') {
          if (queryResults.data.constructor === Array) {
            queryResults.data.sort((a: any, b: any): number => {
              return a && null == b
                ? -1
                : b && null == a
                ? 1
                : null == a && null == b
                ? 0
                : (a.target || '').localeCompare(b.target);
            });
          }
        }

        log(() => 'query() queryResults = ' + JSON.stringify(queryResults));
        return queryResults;
      })
      .catch((err) => {
        if (err.status !== 0 || err.status >= 300) {
          this.throwerr(err);
        }
      });
  }

  /**
   * This is the method called to test the data source connection.
   */
  testDatasource() {
    return this.metricTagsQuery('and(__name:ametric)')
      .then((results: any) => {
        const error = _.get(results, 'results[0].error');
        const success = 'Data source is working';
        return error
          ? { status:'error', message:error, title:'Error' }
          : { status:'success', message:success, title:'Success' };
      })
      .catch((error: any) => {
        let message = error.data?.message;
        if (!message) {
          message = `Error ${error.status || ''} ${error.statusText || ''}`;
        }
        return { status:'error', message:message, title:'Error' };
      });
  }

  /**
   * This handles all the variously formatted errors from different requests
   * and ensures that the proper error or message is shown.
   */
  throwerr(error: any) {
    log(() => `throwerr() err = ${JSON.stringify(error)}`);
    // If we're here, there's a few different types of situations we need to address.
    // 1.  A http-connection level error, which won't really have much
    // 2.  A direct to IRONdb error JSON object
    // 3.  An API error JSON object, which puts the IRONdb error inside data.message
    if (typeof error === 'object') {
      if (error.data?.message) {
        let message;
        try {
          message = JSON.parse(error.data.message || error.data);
        }
        catch (error) {
          log(() => `throwerr() failed to parse json from error.data.message. error: ${error}`);
        }
        // This is from the API, which wrapped the IRONdb message in JSON
        if (message?.user_error) {
          throw `${message.user_error.message}, in query: ${message.arguments.q}`;
        }
        else if (error.statusText === 'Not Found') {
          throw `Circonus IRONdb Error: ${error.statusText}`;
        }
        // IRONdb will sometimes return errors with messages avilable here
        else if (typeof error.data.message === 'string') {
          throw error.data.message;
        }
        else if (error.statusText && error.status > 0) {
          throw `Network Error: ${error.statusText} (${error.status})`;
        }
      }
      // IRONdb direct 520 errors will look like this
      else if (error.data?.user_error?.message) {
        throw `${error.data.user_error.message}, in query: ${error.data.arguments.q}`;
      }
      else {
        throw String(error);
      }
    }
    else {
      throw error ? error.toString() : 'unknown';
    }
  }

  /**
   * This exposes the allowGraphite option, to indicate whether Graphite-style
   * queries are enabled.
   */
  canShowGraphite(): boolean {
    return !!this.dataSourceOptions.allowGraphite;
  }

  /**
   * This exposes the caqlMinPeriod field.
   */
  getCaqlMinPeriod(): string {
    return this.dataSourceOptions.caqlMinPeriod;
  }

  /**
   * This gets the account ID formatted for use in an API path endpoint, if
   * it's necessary.
   */
  getAccountIdForApiPath() {
    return this.dataSourceOptions.irondbType === 'standalone' ? `/${this.dataSourceOptions.accountId}` : '';
  }

  /**
   * This indicates whether we should ignore the Check UUID at the beginning 
   * of the the first segment in graphite-style queries (they always start with 
   * check UUIDs as the first segment if no query prefix is used).
   */
  ignoreGraphiteUUIDs() {
    return !(this.dataSourceOptions.queryPrefix || '').trim();
  }

  /**
   * This performs metric searches and performs other tasks as necessary to 
   * build the metric streams, CAQL queries, alert queries, et al which are 
   * necessary for the main data requests.
   */
  buildDataRequestItems(options: any) {
    const ds = this;
    const templateSrv = this.templateSrv;
    const checkVariablesEncoding = this.checkVariablesEncoding;
    const metricGraphiteQuery = this.metricGraphiteQuery;
    const metricTagsQuery = this.metricTagsQuery;
    const start = new Date(options.range.from).getTime() / 1000;
    const end = new Date(options.range.to).getTime() / 1000;
    const { scopedVars, meta, refId, maxDataPoints } = options;
    const intervalMs = Math.round(
      (options.range.to.valueOf() - options.range.from.valueOf()) / options.maxDataPoints
    );
    // these are the prepped items
    const stdNames: any[] = [];
    const caqlNames: any[] = [];
    const alertNames: any[] = [];
    const localFilters: any[] = [];
    const localFilterMatches: any[] = [];
    const labels: any[] = [];
    const preppedItems: DataRequestItems = {
      scopedVars,
      meta,
      refId,
      maxDataPoints,
      intervalMs,
      std:   { start, end, names:stdNames },
      caql:  { start, end, names:caqlNames },
      alert: { start, end, names:alertNames, localFilters, localFilterMatches, labels, countsOnly: false, queryType: '', target: null },
    };
    // filter out hidden or empty queries
    const targets = _.reject(options.targets, (target) => {
      const isEmpty = target.query == null && target.alertId == null;
      const isNonLength = !target.query?.length && !target.alertId?.length;
      const reject = target.hide || isEmpty || isNonLength;
      return reject;
    });
    // there are no showing queries
    if (!targets.length) {
      return Promise.resolve(preppedItems);
    }

    return Promise
      .allSettled(targets.map((target) => {
        let promise: Promise<any>;
        preppedItems.refId = target.refId;
        if (target.isCaql || target.queryType === 'caql') {
          promise = _buildCaqlItem(target);
        }
        else if (target.queryType === 'alerts' || target.queryType === 'alert_counts') {
          promise = _buildAlertItem(target);
        }
        else {
          promise = _buildMetricItems(target);
        }
        return promise;
      }))
      .then((result) => {
        return preppedItems;
      })
      .catch((err) => {
        log(() => `buildIrondbParamsAsync() error = ${JSON.stringify(err)}`);
      });
    
    /**
     * This builds a CAQL item into the prepped items.
     */
    function _buildCaqlItem(target: any) {
      const { query, rolluptype, metricrollup, format, refId, min_period = '' } = target;

      preppedItems.caql.names.push({
        leaf_name: query,
        leaf_data: { rolluptype, metricrollup, format, refId, min_period },
      });

      return Promise.resolve();
    }
    
    /**
     * This builds an alert item into the prepped items.
     */
    function _buildAlertItem(target: any) {
      let rawQuery = templateSrv.replace(target.query, preppedItems.scopedVars);

      if (target.alertId !== '') {
        rawQuery = `alert_id:${templateSrv.replace(target.alertId, preppedItems.scopedVars)}`;
      }
      preppedItems.alert.names.push(rawQuery);
      preppedItems.alert.localFilters.push(
        templateSrv.replace(target.localFilter, preppedItems.scopedVars)
      );
      preppedItems.alert.localFilterMatches.push(target.localFilterMatch);
      preppedItems.alert.countsOnly = target.queryType === 'alert_counts';
      preppedItems.alert.queryType = target.alertCountQueryType;
      preppedItems.alert.labels.push(
        templateSrv.replace(target.metriclabel, preppedItems.scopedVars)
      );
      preppedItems.alert.target = target;

      return Promise.resolve();
    }

    /**
     * This builds standard or graphite metric items into the prepped items.
     */
    function _buildMetricItems(target: any) {
      const rawQuery = checkVariablesEncoding.call(
        ds,
        templateSrv.replace(target.query, preppedItems.scopedVars)
      );
      const isGraphite = 'graphite' === target.queryType;
      const tagFilter = target.tagFilter || '';
      const promise = isGraphite ?
        metricGraphiteQuery.call(ds, rawQuery, false, start, end, tagFilter) :
        metricTagsQuery.call(ds, rawQuery, false, start, end);
  
      return promise
        .then((result: any) => {
          // filter out text metrics
          result.data = _.filter(result.data, (metric) => {
            const metricTypes = (metric?.type || '').split(',');
            return !metricTypes.includes('text');
          });
          // build the streams
          result.data.forEach((d: any, i: number) => {
            d.target = target; // keep target references
            preppedItems.std.names.push(
              _buildFetchStream(target, result.data, i)
            );
          });
        });
      
      /**
       * This builds a data fetch stream for each metric stream returned 
       * from the query.
       */
      function _buildFetchStream(target: any, data: any[], i: number) {
        const scopedVars = preppedItems.scopedVars;
        let leafName = data[i].metric_name || data[i].name;
        let leafUuid = data[i].leaf_data?.uuid;
        let leafMetricName = data[i].leaf_data?.name;
    
        // get the metric type
        const baseType = ('heatmap' === target.format 
          ? 'histogram' 
          : (data[i].metric_type || data[i].type || data[i].leaf_data?.metric_type || data[i].leaf_data.type));
        let types = (baseType || 'numeric').split(',');
        let thisType;
        while (!thisType) {
          thisType = types.pop();
        }
        // init the data
        data[i].leaf_data = {
          egress_function: 'average',
          uuid: leafUuid || data[i]['uuid'],
          metric_name: leafMetricName,
          metrictype: thisType,
          paneltype: data[i].target.paneltype,
          target,
        };
        // set the transform (egressoverride)
        const egressoverride = thisType === 'histogram' ? 'histogram' : target.egressoverride;
        if (egressoverride && egressoverride !== 'average') {
          if (egressoverride === 'automatic' && isStatsdCounter(leafName)) {
            data[i].leaf_data.egress_function = 'counter';
          }
          else {
            data[i].leaf_data.egress_function = egressoverride;
          }
        }
        // set the label
        let metriclabel = target.metriclabel;
        if (target.labeltype === 'default') {
          metriclabel = '%n | %t{*}';
        }
        else if (target.labeltype === 'name') {
          metriclabel = '%n';
        }
        else if (target.labeltype === 'cardinality') {
          metriclabel = '%n | %t-{*}';
        }
        const interpolatedLabel = metaInterpolateLabel(metriclabel || '', data, i);
        data[i].leaf_data.metriclabel = templateSrv.replace(interpolatedLabel, scopedVars);
        // wrap things up
        data[i].leaf_data.check_tags = data[i].check_tags;
        if (target.rolluptype !== 'automatic' && !_.isEmpty(target.metricrollup)) {
          data[i].leaf_data.rolluptype = target.rolluptype;
          data[i].leaf_data.metricrollup = target.metricrollup;
        }
        // return the item
        return {
          leaf_name: leafName,
          leaf_data: data[i].leaf_data
        };
      }
    }
  }

  /**
   * This performs the data query requests.
   */
  dataRequest(preppedItems: DataRequestItems, followLimit = true) {
    let queries: any = [];
    let queryResults: any = { data:[], t:'ts' };

    // headers
    let headers: any = {
      'Content-Type': 'application/json',
      'X-Snowth-Advisory-Limit': followLimit ? this.dataSourceOptions.resultsLimit : 100,
      'Accept': 'application/json',
    };
    if ('hosted' === this.dataSourceOptions.irondbType) {
      headers['X-Circonus-Auth-Token'] = this.dataSourceOptions.apiToken;
      headers['X-Circonus-App-Name'] = this.appName;
    }
    else {
      headers['X-Circonus-Account'] = this.dataSourceOptions.accountId;
    }

    // standard metric streams
    if (preppedItems.std.names.length) {
      const leafData = preppedItems.std.names[0].leaf_data;
      const paneltype = leafData.target.format || leafData.format || 'ts';
      for (let i = 0; i < preppedItems.std.names.length; i++) {
        const thisLeafData = preppedItems.std.names[i].leaf_data;
        let options: any = {
          url: this.url,
          method: 'POST',
          name: 'fetch',
          headers: headers,
          withCredentials: this.basicAuth || this.withCredentials,
          paneltype: paneltype,
          format: thisLeafData.format,
          isCaql: false,
          isGraphite: false,
          retry: 1,
        };
        // finish up the URL
        if ('hosted' === this.dataSourceOptions.irondbType) {
          options.url += '/irondb';
        }
        options.url += '/fetch';
        let start = preppedItems.std.start;
        let end = preppedItems.std.end;
        const interval = this.getRollupSpan(preppedItems, start, end, false, preppedItems.std.names[i].leaf_data);
        // when shifting the range to truncate the end, never shift less than minTruncation
        const end_shift = Math.max(interval, parseInt(this.dataSourceOptions.minTruncation || '0', 10));
        // if the range ends within 1s, it's "now"
        const ends_now = Date.now() - end * 1000 < 1000;
        start -= interval;
        // sometimes we want to drop the last interval b/c that data is frequently incomplete
        end = ends_now && this.dataSourceOptions.truncateNow ? end - end_shift : end + interval;
        // compile the data streams
        let metricLabels = [];
        let check_tags = [];
        let streams: any[] = [];
        let data = {
          streams: streams,
          period: interval,
          start: start,
          count: Math.round((end - start) / interval),
          reduce: [{
            label: '',
            method: paneltype === 'heatmap' ? 'merge' : 'pass'
          }],
        };
        metricLabels.push(thisLeafData.metriclabel);
        check_tags.push(thisLeafData.check_tags);
        // check the transform
        let transform = thisLeafData.egress_function;
        if (thisLeafData.metrictype === 'histogram') {
          if (paneltype === 'heatmap') {
            transform = 'none';
          }
          else {
            transform = HistogramTransforms[transform as 'count' || 'average' || 'stddev' || 'derive' || 'derive_stddev' || 'counter' || 'counter_stddev' || 'histogram'];
            const leafName = preppedItems.std.names[i].leaf_name;
            let transformMode = 'default';
            if (isStatsdCounter(leafName)) {
              transformMode = 'statsd_counter';
            }
            thisLeafData.target.hist_transform = transformMode;
          }
        }
        const stream = {
          transform: transform,
          name: thisLeafData.metric_name || preppedItems.std.names[i].leaf_name,
          uuid: thisLeafData.uuid,
          kind: thisLeafData.metrictype,
        };
        // graphite metrics which are incomplete won't have UUIDs, so don't include them
        if (stream.uuid) {
          streams.push(stream);
        }
        options.data = data;
        options.metricLabels = metricLabels;
        options.check_tags = check_tags;
        if (this.basicAuth) {
          options.headers.Authorization = this.basicAuth;
        }
        // add this query
        queries.push(options);
      }
    }

    // CAQL queries
    if (preppedItems.caql.names.length) {
      for (let i=0; i<preppedItems.caql.names.length; i++) {
        let options = {
          url: this.url,
          method: 'POST',
          data: '',
          headers: headers,
          start: preppedItems.caql.start,
          end: preppedItems.caql.end,
          retry: 1,
          withCredentials: this.basicAuth || this.withCredentials,
          isCaql: true,
          name: preppedItems.caql.names[i],
          format: preppedItems.caql.names[i].leaf_data?.format,
          refId: preppedItems.caql.names[i].leaf_data?.refId,
        };
        if ('hosted' === this.dataSourceOptions.irondbType) {
          options.url += '/irondb';
        }
        options.url += '/extension/lua';
        if ('hosted' === this.dataSourceOptions.irondbType) {
          options.url += '/public';
        }
        options.url += '/caql_v1';
        // render CAQL query
        const caqlQuery = this.templateSrv.replace(
          preppedItems.caql.names[i].leaf_name,
          preppedItems.scopedVars
        );
        const minPeriod = preppedItems.caql.names[i].leaf_data?.min_period;
        // prefix with the target's min_period if min_period isn't in the query already
        const caqlQueryMP = (minPeriod && !/^#min_period=/.test(caqlQuery) ? `#min_period=${minPeriod} ` : '') + caqlQuery;
        // render start, end, & period
        const minPeriodMatches = caqlQueryMP.match(/#min_period=(\d+\w{0,2}?)\s/i);
        const minPeriodDirective = minPeriodMatches ?
          Math.round(parseDurationMS(minPeriodMatches[1]) / 1000) :
          null;
        const calculatedInterval = this.getRollupSpan(
          preppedItems,
          options.start,
          options.end,
          true,
          preppedItems.caql.names[i].leaf_data
        );
        // any min_period directive overrides the resolution here if it's lower and we're already at the min resolution
        const intervalIsMin = calculatedInterval === Math.round(MIN_DURATION_MS_CAQL / 1000);
        const interval = minPeriodDirective && intervalIsMin
          ? Math.min(calculatedInterval, minPeriodDirective)
          : calculatedInterval;
        // when shifting the range to truncate the end, never shift less than minTruncation
        const end_shift = Math.max(interval, parseInt(this.dataSourceOptions.minTruncation || '0', 10));
        // if the range ends within 1s, it's "now"
        const ends_now = Date.now() - options.end * 1000 < 1000;
        options.start -= interval;
        // sometimes we want to drop the last interval b/c that data is frequently incomplete
        options.end = ends_now && this.dataSourceOptions.truncateNow ? options.end - end_shift : options.end + interval;
        let reqData = {
          start: options.start.toFixed(3),
          end: options.end.toFixed(3),
          period: interval,
          format: 'DF4',
          q: caqlQueryMP,
        };
        options.data = JSON.stringify(reqData);
        // basic auth
        if (this.basicAuth) {
          options.headers.Authorization = this.basicAuth;
        }
        // add the query
        queries.push(options);
      }
    }

    // alert queries
    if (preppedItems.alert.names.length) {
      for (let i = 0; i < preppedItems.alert.names.length; i++) {
        let options: any = {
          url: `${this.url}${'hosted' === this.dataSourceOptions.irondbType ? '/v2' : ''}/alert`,
          method: 'GET',
          headers: headers,
          retry: 1,
          start: preppedItems.alert.start,
          end: preppedItems.alert.end,
          isAlert: true,
          countsOnly: preppedItems.alert.countsOnly,
          label: preppedItems.alert.labels[i],
          localFilter: preppedItems.alert.localFilters[i],
          localFilterMatch: preppedItems.alert.localFilterMatches[i],
          queryType: preppedItems.alert.queryType,
          target: preppedItems.alert.target,
          withCredentials: this.basicAuth || this.withCredentials,
          isCaql: false,
          refId: preppedItems.refId,
        };
        // finish URL
        const alertQuery = this.templateSrv.replace(
          preppedItems.alert.names[i],
          preppedItems.scopedVars
        );
        if (alertQuery.startsWith('alert_id:')) {
          options.url += `/${alertQuery.split(':')[1]}`;
        }
        else {
          options.url += `?search=${encodeURIComponent(alertQuery)}&size=1000`;
        }
        // basic auth (not sure if this is actually set anywhere...?)
        if (this.basicAuth) {
          options.headers.Authorization = this.basicAuth;
        }
        // add this query
        queries.push(options);
      }
    }

    return Promise.all(
        queries.map((query: any, i: number, queries: any) =>
          this.datasourceRequest(query)
            .then((result: any) => {
              const warning = result.data?.head?.warning;
              if (query.isCaql && warning && !this.dataSourceOptions.hideCAQLWarnings) {
                this.throwerr(`Warning: ${result.data.head.warning} - Graph not rendered. To render the potentially incomplete data, check "Hide CAQL Warnings" in the datasource settings.`);
              }
              if (!_.isUndefined(query.isAlert)) {
                if (query.countsOnly) {
                  return this.countAlerts(result, query);
                }
                else {
                  return this.enrichAlertsWithRules(result, query).then((results) => {
                    return this.convertAlertDataToGrafana(results);
                  });
                }
              }
              else if (query.isGraphite) {
                return this.convertIrondbGraphiteDataToGrafana(result, query);
              }
              else {
                return this.convertIrondbDf4DataToGrafana(result, query);
              }
            })
            .then((result: any) => {
              const query = result.query;
              if (_.isArray(result.data)) {
                for (let i=0; i<result.data.length; i++) {
                  if ('target' in result && 'refId' in result.target) {
                    result.data[i].target = result.target.refId;
                  }
                  else if (query && query.refId) {
                    result.data[i].target = query.refId;
                  }
                  queryResults.data.push(result.data[i]);
                }
              }
              if (_.isObject(result.data)) {
                if ('target' in result && 'refId' in result.target) {
                  result.data.target = result.target.refId;
                }
                else if (query && query.refId) {
                  result.data.target = query.refId;
                }
                queryResults.data.push(result.data);
              }
              if (null != result.t) {
                queryResults.t = result.t;
              }

              return queryResults;
            })
        )
      )
      .then((result) => {
        return queryResults;
      })
      .catch((err) => {
        if (err.status !== 0 || err.status >= 300) {
          this.throwerr(err);
        }
      });
  }

  /**
   * This determines the data period for a request.
   */
  getRollupSpan(preppedItems: DataRequestItems, start: number, end: number, isCaql: boolean, leafData: any) {
    let rolluptype = leafData.rolluptype;
    const metricrollup = leafData.metricrollup;
    if (rolluptype !== 'automatic' && _.isEmpty(metricrollup)) {
      rolluptype = 'automatic';
    }
    if (rolluptype === 'exact') {
      const exactMs = parseDurationMS(metricrollup);
      const exactDatapoints = Math.floor(((end - start) * 1000) / exactMs);
      if (exactDatapoints > (preppedItems.maxDataPoints || 1000000) * MAX_EXACT_DATAPOINTS_THRESHOLD) {
        this.throwerr('Too many datapoints requested.');
      }
      // check rollup alignment
      for (const alignMs of ROLLUP_ALIGN_MS) {
        if (exactMs < alignMs) {
          if (alignMs % exactMs !== 0) {
            this.throwerr('Unaligned rollup period requested.');
          }
        }
      }
      const isGreaterThanOneDay = exactMs > ROLLUP_ALIGN_MS_1DAY;
      const notAlignedToDays = exactMs % ROLLUP_ALIGN_MS_1DAY !== 0;
      if (isGreaterThanOneDay && notAlignedToDays) {
        this.throwerr('Unaligned rollup period requested.');
      }

      return _forceRollupAlignment(exactMs) / 1000;
    }
    else {
      let minimumMs = isCaql ? MIN_DURATION_MS_CAQL : MIN_DURATION_MS_FETCH;
      if (rolluptype === 'minimum') {
        minimumMs = parseDurationMS(metricrollup);
      }
      const intervalMs = Math.max(preppedItems.intervalMs, minimumMs);
      let interval = _nudgeInterval(_forceRollupAlignment(intervalMs) / 1000, -1);
      while ((end - start) / interval > (preppedItems.maxDataPoints || 1000000) * MAX_DATAPOINTS_THRESHOLD) {
        interval = _nudgeInterval(interval + 0.001, 1);
      }

      return interval;
    }

    /**
     * This aligns a rollup value to the nearest 10s increment
     */
    function _forceRollupAlignment(rollupMs: number) {
      if (rollupMs < 60000) {
        rollupMs = Math.max(10000, Math.ceil(rollupMs / 10000) * 10000);
      }
      return rollupMs;
    }

    /**
     * This nudges an interval value either up or down.
     */
    function _nudgeInterval(input: number, dir: number) {
      const _s = [1, 0.5, 0.25, 0.2, 0.1, 0.05, 0.025, 0.02, 0.01, 0.005, 0.002, 0.001];
      const _m = [60, 30, 20, 15, 10, 5, 3, 2, 1];
      const _h = [60, 30, 20, 15, 10, 5, 3, 2, 1].map((a) => a * 60);
      const _d = [24, 12, 8, 6, 4, 3, 2, 1].map((a) => a * 60 * 60);
      const _matchset = [_s, _m, _h, _d];

      if (dir !== -1) {
        dir = 1;
      }
      // dir says if we're not a match do we choose 1 (larger) or -1 (smaller)
      if (input < 0.001) {
        return 0.001;
      }
      for (let si = 0; si < _matchset.length; si++) {
        const set = _matchset[si];
        if (input < set[0]) {
          for (let idx = 1; idx < set.length; idx++) {
            if (input > set[idx]) {
              if (dir === -1) {
                return set[idx];
              }
              else {
                return set[idx - 1];
              }
            }
            if (input === set[idx]) {
              return set[idx];
            }
          }
        }
      }
      if (input % 86400 === 0) {
        return input;
      }
      if (dir === 1) {
        return (1 + Math.floor(input / 86400)) * 86400;
      }
      return Math.floor(input / 86400) * 86400;
    }
  }

  /**
   * This is used to load variable values (in the dashboard config variable
   * setup and also whenever refreshing variable values when viewing a 
   * dashboard).
   * 
   * Older versions of grafana had support for an experimental
   * tag extraction feature which the older version of this datasource 
   * relied on. That experimental code was removed in Grafana 8.
   * 
   * In order to support extraction of tag values we need to implement
   * our own variable query.
   * 
   * There is code here (called out below) that attempts to migrate
   * the prior setup (that relied on the experimental feature) into
   * the new CirconusVariableQuery structure.
   */
  metricFindQuery(query: CirconusVariableQuery | string, options: any) {
    const variable = options.variable;
    const range = options.range;
    let from = undefined;
    let to = undefined;

    // setup time range for query
    if (!_.isUndefined(range)) {
      from = range.from.valueOf() / 1000;
      to = range.to.valueOf() / 1000;
      if (!_.isUndefined(this.queryRange) && !_.isEqual(range, this.queryRange)) {
        if (this.dataSourceOptions.useCaching) {
          const requestCache = this.datasourceRequest as unknown as Memoized < (options: any) => any > ;
          requestCache.clear();
        }
      }
      this.queryRange = range;
    }

    let q: CirconusVariableQuery;
    if (typeof query === 'string') {
      // attempt to translate variable.useTags into the new CirconusVariableQuery structure
      q = {
        queryType: variable?.useTags && variable.tagValuesQuery
          ? 'tag values'
          : 'metric names',
        metricFindQuery: query,
        tagCategory: variable?.useTags ? variable.tagValuesQuery : '',
        resultsLimit: 100,
      };
    }
    else {
      q = query as CirconusVariableQuery;
    }

    if (q !== undefined) {
      const queryType = (q && q.queryType) || (q.tagCategory ? 'tag values' : 'metric names');
      const resultsLimit = (q && q.resultsLimit) || 100;
      let metricQuery = this.templateSrv.replace(q.metricFindQuery, null, (value: string | string[] = [], variable: any) => {
        return _processVariableValue(value, variable);
      });

      if (
        'graphite style' !== queryType &&
        !(metricQuery.includes('and(') || metricQuery.includes('or(') || metricQuery.includes('not('))
      ) {
        // ensure that non-graphite-style queries are wrapped by an operator
        metricQuery = 'and(__name:' + metricQuery + ')';
      }

      // tag values w/ an optional metric filter
      if ('tag values' === queryType) {
        return this.metricTagValsQuery(metricQuery, q.tagCategory, from, to, resultsLimit)
          .then((results: any) => {
            let result_count = results.headers.get('X-Snowth-Search-Result-Count');
            if (result_count > 1000) {
              setTimeout(function () {
                _showResultWarning(result_count);
              }, 100);
            }
            else {
              _removeResultWarning();
            }
            return _.map(results.data, (result) => {
              return {
                value: decodeTag(result)
              };
            });
          });
      }
      // tag categories w/ a metric filter
      else if ('tag categories' === queryType) {
        return this.metricTagCatsQuery(metricQuery, from, to, resultsLimit)
          .then((results: any) => {
            let result_count = results.headers.get('X-Snowth-Search-Result-Count');
            if (result_count > 1000) {
              setTimeout(function () {
                _showResultWarning(result_count);
              }, 100);
            }
            else {
              _removeResultWarning();
            }
            return _.map(results.data, (result) => {
              return {
                value: decodeTag(result)
              };
            });
          });
      }
      // graphite-style metric names
      else if ('graphite style' === queryType) {
        return this.metricGraphiteQuery(metricQuery, false, from, to, '', resultsLimit)
          .then((results: any) => {
            let result_count = results.headers.get('X-Snowth-Search-Result-Count');
            if (result_count > 1000) {
              setTimeout(function () {
                _showResultWarning(result_count);
              }, 100);
            }
            else {
              _removeResultWarning();
            }
            let deduped: any[] = [];
            results.data.forEach((result: any) => {
              const name = (result.name || '')
                .replace(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}\./)
                .split('.')
                .pop()
                .split(';')
                .shift();
              if (!deduped.find((obj) => obj.value === name)) {
                deduped.push({
                  value: name
                });
              }
            });
            return deduped;
          });
      }
      // last metric values
      else if ('last value' === queryType) {
        return this.metricTagsQuery(metricQuery, false, from, to, resultsLimit, true)
          .then((results: any) => {
            let result_count = results.headers.get('X-Snowth-Search-Result-Count');
            if (result_count > 1000) {
              setTimeout(function () {
                _showResultWarning(result_count);
              }, 100);
            }
            else {
              _removeResultWarning();
            }
            return _.map(results.data, (result) => {
              let latest = (result.latest.text || result.latest.numeric || []).slice(-1)[0];
              return {
                value: latest[1] || ''
              };
            });
          });
      }
      // metric names
      else {
        return this.metricTagsQuery(metricQuery, false, from, to, resultsLimit)
          .then((results: any) => {
            let result_count = results.headers.get('X-Snowth-Search-Result-Count');
            if (result_count > 1000) {
              setTimeout(function () {
                _showResultWarning(result_count);
              }, 100);
            }
            else {
              _removeResultWarning();
            }
            return _.map(results.data, (result) => {
              return {
                value: result.metric_name
              };
            });
          });
      }
    }
    return Promise.resolve([]);

    /**
     * This manually finds the edit pane 'Preview' header and injects a 
     * warning beforehand.
     */
    function _showResultWarning(result_count: number) {
      let form = document.querySelector('[aria-label="Variable editor Form"]');
      let header = Array.from(form ? form.querySelectorAll('h3,h4,h5') : [])
        .find((el: any) => /^Preview\s/.test(el['innerText']));
      if (header) {
        let span = document.createElement('span');
        span.className = 'result-warning';
        span.style.color = 'rgb(235, 123, 24)';
        span.style.marginBottom = '1rem';
        span.innerHTML =
          `<strong>Warning:</strong> ${result_count} results found.<br />Only the first 1000 results are used&hellip;please refine your query.`;
        let parent = header.parentElement as HTMLElement;
        let grandparent = parent?.parentElement as HTMLElement;
        Array.from(grandparent?.getElementsByClassName('result-warning')).forEach((el) => el.remove());
        grandparent?.insertBefore(span, parent);
      }
    }

    /**
     * This manually removes any edit pane results warning added previously.
     */
    function _removeResultWarning() {
      let form = document.querySelector('[aria-label="Variable editor Form"]');
      let header = Array.from(form ? form.querySelectorAll('h3,h4,h5') : []).find((el: any) => /^Preview\s/.test(el['innerText']));
      if (header) {
        const parent = header.parentElement as HTMLElement;
        const grandparent = parent.parentElement as HTMLElement;
        Array.from(grandparent.getElementsByClassName('result-warning')).forEach((el) => el.remove());
      }
    }

    /**
     * This processes a variable value during the nested variable 
     * replacement process.
     */
    function _processVariableValue(value: string | string[] = [], variable: any) {
      // if no multi or include all do not regexEscape
      if (!variable.multi && !variable.includeAll) {
        return encodeTag(SegmentType.MetricName, value as string);
      }
      if (typeof value === 'string') {
        return encodeTag(SegmentType.MetricName, value as string);
      }
      else if (value.length === 1) {
        return encodeTag(SegmentType.MetricName, value[0] as string);
      }

      let q = '';
      for (let i = 0; i < value.length; i++) {
        if (i) {
          q += ',';
        }
        q += value[i];
        i++;
      }

      return q;
    }
  }

  /**
   * This performs a graphite-style metric search.
   */
  metricGraphiteQuery(
    query: string,
    ignoreLimit: boolean,
    from?: number,
    to?: number,
    tagFilter?: string,
    customLimit?: number
  ) {
    const ignoreUUIDs = this.ignoreGraphiteUUIDs();
    let queryUrl = `/${this.dataSourceOptions.queryPrefix}/metrics/find`;
    let qsParams = [`query=${ignoreUUIDs ? '*.' : ''}${query}`, 'activity=0', 'include_type=1'];
    if (tagFilter) {
      qsParams.push(`irondb_tag_filter=${tagFilter}`);
    }
    queryUrl += `?${qsParams.join('&')}`;
    let followLimit = customLimit ? true : !ignoreLimit;
    return this.searchRequest('GET', queryUrl, false, true, followLimit, true, customLimit);
  }

  /**
   * This performs a standard (non-graphite-style) metric search
   */
  metricTagsQuery(
    query: string,
    allowEmptyWildcard = false,
    from?: number,
    to?: number,
    customLimit?: number,
    requestLatest = false
  ) {
    if (!query || (!allowEmptyWildcard && query === 'and(__name:*)')) {
      return Promise.resolve({ data: [] });
    }
    let queryUrl = `/find${this.getAccountIdForApiPath()}/tags?query=${query}`;
    if (this.dataSourceOptions.activityTracking && from && to) {
      queryUrl += `&activity_start_secs=${_.toInteger(from)}`;
      queryUrl += `&activity_end_secs=${_.toInteger(to)}`;
    }
    if (requestLatest) {
      queryUrl += '&latest=2';
    }

    return this.searchRequest('GET', queryUrl, false, true, true, false, customLimit);
  }

  /**
   * This performs a tag vals query.
   */
  metricTagValsQuery(
    metricQuery: string,
    cat: string,
    from?: number,
    to?: number,
    customLimit?: number
  ) {
    let queryUrl = `/find${this.getAccountIdForApiPath()}/tag_vals?category=${cat}&query=${metricQuery}`;
    if (this.dataSourceOptions.activityTracking && from && to) {
      queryUrl += `&activity_start_secs=${_.toInteger(from)}`;
      queryUrl += `&activity_end_secs=${_.toInteger(to)}`;
    }

    return this.searchRequest('GET', queryUrl, false, true, true, false, customLimit);
  }

  /**
   * This performs a tag cats query.
   */
  metricTagCatsQuery(
    metricQuery: string,
    from?: number,
    to?: number,
    customLimit?: number
  ) {
    let queryUrl = `/find${this.getAccountIdForApiPath()}/tag_cats?query=${metricQuery}`;
    if (this.dataSourceOptions.activityTracking && from && to) {
      queryUrl += `&activity_start_secs=${_.toInteger(from)}`;
      queryUrl += `&activity_end_secs=${_.toInteger(to)}`;
    }

    return this.searchRequest('GET', queryUrl, false, true, true, false, customLimit);
  }

  /**
   * This performs the autocomplete/variable/ancillary search requests.
   */
  searchRequest(
    method: string,
    url: string,
    isCaql = false,
    isFind = false,
    followLimit = true,
    isGraphite = false,
    customLimit?: number
  ) {
    const limit = customLimit || this.dataSourceOptions.resultsLimit;
    let baseUrl = this.url;
    let headers: any = {
      'Content-Type': 'application/json',
      'X-Snowth-Advisory-Limit': followLimit ? limit : 100,
    };

    if ('hosted' !== this.dataSourceOptions.irondbType) {
      headers['X-Circonus-Account'] = this.dataSourceOptions.accountId;
    }
    else if ('hosted' === this.dataSourceOptions.irondbType && !isCaql) {
      baseUrl += `/irondb${isGraphite ? '/graphite' : ''}`;
      if (!isFind) {
        baseUrl += '/series_multi';
      }
      headers['X-Circonus-Auth-Token'] = this.dataSourceOptions.apiToken;
      headers['X-Circonus-App-Name'] = this.appName;
    }
    if ('standalone' === this.dataSourceOptions.irondbType && !isCaql) {
      if (isGraphite) {
        baseUrl += `/graphite/${this.dataSourceOptions.accountId}`;
        if (!isFind) {
          baseUrl += `/${this.dataSourceOptions.queryPrefix}/series_multi`;
        }
      }
      else if (!isFind) {
        baseUrl += '/series_multi';
      }
    }
    if (isCaql && !isFind) {
      baseUrl += '/extension/lua/caql_v1';
    }
    const options: any = {
      method: method,
      url: baseUrl + url,
      headers: headers,
      retry: 1,
    };

    return this.datasourceRequest(options);
  }

  /**
   * This looks at the variables and checks for variable values which need 
   * base64 encoding due to being used as tag values. (This is rather 
   * brute-force, but since we can't fully parse the query here, it's all we 
   * can do.)
   * We're basically looking at all the current variable values and encoding 
   * them if they're preceded by a colon.
   */
  checkVariablesEncoding(query: string) {
    const slashifyCharsRegExp = /([\\\[\]\(\)\:\-\^\$\?\+\*\.])/g;
    let vars = this.templateSrv.getVariables();

    vars.forEach((cfg: any) => {
      let val = cfg?.current?.value || '';
      let valRegExp;
      try {
        let slashedVal = slashifyCharsRegExp.test(val) ? val.replace(slashifyCharsRegExp, '\\$1') : val;
        valRegExp = new RegExp(`:${slashedVal}`, 'g');
        if (valRegExp.test(query)) {
          query = query.replace(valRegExp, `:${encodeTag(SegmentType.MetricName, val as string)}`);
        }
      } catch (e) {}
    });

    return query;
  }

  /**
   * This compares an alert to some filters and returns a boolean indicating
   * whether there's NOT a match (no match = true).
   */
  alertDoesNotMatchFilter(filter_pairs: any[], match: string, alert: any) {
    let doesNotMatch = true;

    // nothing to filter on, everything matches
    if (filter_pairs.length === 0) {
      doesNotMatch = false;
    }
    else {
      // ALL matches
      if (match === 'all') {
        let localNotMatch = false;
        for (const pair of filter_pairs) {
          if (!_doesMatch(pair, alert)) {
            localNotMatch = true;
          }
        }
        doesNotMatch = localNotMatch;
      }
      // ANY match
      else {
        let localNotMatch = true;
        for (const pair of filter_pairs) {
          if (_doesMatch(pair, alert)) {
            localNotMatch = false;
          }
        }
        doesNotMatch = localNotMatch;
      }
    }
    
    return doesNotMatch;

    /**
     * This checks an alert against a criteria and returns true if there's 
     * a match.
     * Supported pair.key: alert_id, tag, acknowledged, severities
     */
    function _doesMatch(pair: any, alert: any) {
      let match = false;

      switch (pair.key) {
        case 'alert_id':
          if (alert['_cid'].endsWith(`/${pair.value}`)) {
            match = true;
          }
          break;

        case 'acknowledged':
          if (pair.value === 'true') {
            match = alert['_acknowledgement'] !== null;
          }
          else if (pair.value === 'false') {
            match = alert['_acknowledgement'] === null;
          }
          else {
            match = true;
          }
          break;

        case 'severities':
          match = pair.value.indexOf(alert['_severity']) !== -1;
          break;

        case 'tag':
          const tags: any[] = [];
          const cn = alert['_canonical_metric_name'];
          if (cn) {
            const stream_tags = taglessNameAndTags(cn)[1];
            const temptags = stream_tags.split(',');
            for (const tag of temptags) {
              const tagSep = tag.split(/:/g);
              let tagCat = tagSep.shift() as string;
              if (!tagCat.startsWith('__')) {
                let tagVal = tagSep.join(':');
                tags.push({ cat: decodeTag(tagCat), val: decodeTag(tagVal), });
              }
            }
          }
          for (const tag of alert['_tags']) {
            const tagSep = tag.split(/:/g);
            let tagCat = tagSep.shift();
            if (!tagCat.startsWith('__') && tagCat !== '') {
              let tagVal = tagSep.join(':');
              tags.push({ cat: decodeTag(tagCat), val: decodeTag(tagVal), });
            }
          }
          for (const tag of tags) {
            const pp = pair.value.split(':');
            const valRegExp = new RegExp(prepStringForRegExp(pp[1]), 'i');
            if (tag.cat === pp[0] && valRegExp.test(tag.val)) {
              match = true;
            }
          }
          break;
      }

      return match;
    }
  }

  /**
   * This counts the alerts returned by a query, to be shown for "count only"
   * alert queries.
   */
  countAlerts(alerts: any, query: any) {
    const tempData: any[] = alerts.data;
    let data = _.isArray(tempData) ? tempData : [tempData];

    // if there's a local filter, parse it into match pairs 
    // (a filter is a series of field:value tokens separated by commas)
    let filter_pairs = [];
    const filter_match = query.localFilterMatch;
    if (query.localFilter) {
      const tokens = query.localFilter.split(',');
      for (const t of tokens) {
        const x = t.trim();
        const i = x.indexOf(':');
        if (~i) {
          const pair: any = {};
          pair.key = x.slice(0, i);
          pair.value = x.slice(i + 1);
          filter_pairs.push(pair);
        }
      }
    }

    // for range queries, fill minute buckets with zeroes
    const countBuckets: any = {};
    if (query.queryType === 'range') {
      let qs = query.start;
      qs = qs - (qs % 60); // floor to the previous minute
      let qe = query.end;
      qe = qe - (qe % 60); // floor to the previous minute
      for (let i = qs; i < qe; i += 60) {
        countBuckets[String(i)] = 0;
      }
    }

    // do the counting, either total or by minute
    let count = 0;
    for (let i=0; i<data.length; i++) {
      if (this.alertDoesNotMatchFilter(filter_pairs, filter_match, data[i])) {
        continue;
      }
      const alert = data[i];
      let epoch = alert._occurred_on;
      if (query.queryType === 'range') {
        epoch = epoch - (epoch % 60); // floor to the previous minute
        if (String(epoch) in countBuckets) {
          countBuckets[String(epoch)]++;
        }
      }
      else {
        count = count + 1;
      }
    }

    // compile the data frames
    const label = query.label || 'Value';
    const timeField: any = getTimeField();
    timeField.refId = query.refId;
    const valueField = getNumberField(label);
    const dataFrames: DataFrame[] = [];
    if (query.queryType === 'range') {
      for (let [epoch, count] of Object.entries(countBuckets)) {
        timeField.values.add(Number(epoch) * 1000);
        valueField.values.add(count);
      }
      dataFrames.push({
        length: timeField.values.length,
        fields: [timeField, valueField],
      });
    }
    else {
      valueField.values.add(count);
      dataFrames.push({
        length: 1,
        fields: [valueField],
      });
    }

    return {
      t: 'ts',
      data: dataFrames,
      target: query.target,
      state: LoadingState.Done,
    };
  }

  /**
   * This pulls rulesets to add to alert data for enrichment. 
   * Any local filters are applied.
   */
  enrichAlertsWithRules(alerts: any, query: any) {
    const tempData = alerts.data;
    let data = _.isArray(tempData) ? tempData : [tempData];
    const queries = [];
    const headers = {
      'Content-Type': 'application/json',
      'X-Circonus-Auth-Token': this.dataSourceOptions.apiToken,
      'X-Circonus-App-Name': this.appName,
      'Accept': 'application/json',
    };
    if ('hosted' !== this.dataSourceOptions.irondbType) {
      this.throwerr('Alert queries are only supported on hosted IRONdb installations.');
    }

    // if there's a local filter, parse it into match pairs 
    // (a filter is a series of field:value tokens separated by commas)
    let filter_pairs = [];
    const filter_match = query.localFilterMatch;
    if (query.localFilter) {
      const tokens = query.localFilter.split(',');
      for (const t of tokens) {
        const x = t.trim();
        const i = x.indexOf(':');
        if (~i) {
          const pair: any = {};
          pair.key = x.slice(0, i);
          pair.value = x.slice(i + 1);
          filter_pairs.push(pair);
        }
      }
    }

    // finish compiling the queries
    for (let i = 0; i < data.length; i++) {
      if (this.alertDoesNotMatchFilter(filter_pairs, filter_match, data[i])) {
        continue;
      }
      let options: any = {
        url: this.url,
        method: 'GET',
        headers: headers,
        retry: 1,
        alert_data: data[i],
        withCredentials: this.basicAuth || this.withCredentials,
      };
      if ('hosted' === this.dataSourceOptions.irondbType) {
        options.url += '/v2';
      }
      options.url += data[i]._rule_set;
      if (this.basicAuth) {
        options.headers.Authorization = this.basicAuth;
      }
      queries.push(options);
    }

    return Promise.all(queries.map((query) =>
        this.datasourceRequest(query)
        .then((result: any) => {
          return {
            alert: query.alert_data,
            rule: result.data,
          };
        })
        .catch((failed: any) => {
          // skipping ruleset groups for now, as they would be hard to implement
          return {
            alert: query.alert_data,
            rule: null,
          };
        })
      ))
      .then((results) => {
        return results;
      });
  }

  /**
   * This converts data from CAQL in the DF4 format to Grafana's format.
   */
  convertIrondbDf4DataToGrafana(result: any, query: any) {
    const name = query.name;
    const metricLabels = query.metricLabels || {};
    const check_tags = query.check_tags || [];
    const data = result.data.data;
    const meta = result.data.meta;
    const start = result.data.head.start;
    const period = result.data.head.period;
    const error = result.data.head.error as any[];
    const format = query.format || 'ts';

    // don't proceed if we have errors or no streams
    if (!_.isEmpty(error)) {
      this.throwerr(error.join('\n'));
    }
    if (!data || !data.length) {
      return { data: [] };
    }

    // format data for tables:
    // To tabulate, we need to invert the data that comes back and iterate
    // values for each return instead of each return then values.
    // We use the first result record to fill the timeField
    // because we are guaranteed to have the same number of records
    // across all the results due to how IRONdb works.
    if (format === 'table') {
      const timeField = getTimeField();
      // TODO: do we need refId? --v It's breaking the MutableField type spec
      // timeField.refId = query.refId;
      const labelFields = new Set<MutableField>();
      const valueFields = new Set<MutableField>();
      const allLabels: any = {};
      const allValues: any = {};

      for (let i = 0; i < data[0].length; i++) {
        const ts = (start + i * period) * 1000;
        if (ts < query.start * 1000) {
          continue;
        }

        for (let si = 0; si < data.length; si++) {
          // first we add a timeField entry for each result.
          // this is in case tag values differ.
          timeField.values.add(ts);

          const dummy = name + ' [' + (si + 1) + ']';
          let lname = meta[si] ? meta[si].label : dummy;
          lname = taglessName(lname);
          let tags = meta[si].tags;
          const metricLabel = metricLabels[si];
          if (_.isString(metricLabel)) {
            lname = metricLabel;
          }

          if (check_tags[si] !== undefined) {
            if (tags === undefined) {
              tags = check_tags[si];
            }
            else {
              tags.push.apply(tags, check_tags[si]);
            }
          }
          if (tags !== undefined) {
            for (const tag of tags) {
              const tagSep = tag.split(/:/g);
              let tagCat = tagSep.shift();
              let tagVal = tagSep.join(':');
              if (!tagCat.startsWith('__')) {
                tagCat = decodeTag(tagCat);
                tagVal = decodeTag(tagVal);
                if (!allLabels[tagCat]) {
                  const lfield = {
                    name: tagCat,
                    config: { filterable: false },
                    type: FieldType.other,
                    refId: query.refId,
                    values: new ArrayVector(),
                  };
                  allLabels[tagCat] = lfield;
                  labelFields.add(lfield);
                }
                const lfield = allLabels[tagCat];
                lfield.values.add(tagVal);
              }
            }
          }
          if (!allValues[lname]) {
            const vfield = {
              name: lname,
              config: {
                filterable: false,
                displayName: lname,
              },
              refId: query.refId,
              type: FieldType.number,
              values: new ArrayVector(),
            };
            allValues[lname] = vfield;
            valueFields.add(vfield);
          }
          const vfield = allValues[lname];
          if (data[si][i] !== null && data[si][i].constructor === Number) {
            vfield.values.add(data[si][i]);
          }
          else {
            vfield.values.add(null);
          }
        }
      }

      return {
        t: 'table',
        data: {
          length: timeField.values.length,
          fields: [timeField, ...labelFields, ...valueFields],
        },
        state: LoadingState.Done,
      };
    }

    // format data for other visualizations like charts
    const dataFrames: DataQueryResponseData[] = [];
    // only supports one histogram
    const lookaside: any = {};
    for (let si = 0; si < data.length; si++) {
      const dummy = `${name} [${si+1}]`;
      const tname = meta[si] ? meta[si].label : dummy;
      const explicitTags = tname.match(/\|ST\[[^\]]*\]/) != null;
      let lname = taglessName(tname);
      let tags = meta[si].tags;
      const metricLabel = metricLabels[si];
      if (_.isString(metricLabel)) {
        lname = metricLabel;
      }
      const labels: any = {};

      if (check_tags[si] !== undefined) {
        if (tags === undefined) {
          tags = check_tags[si];
        } else {
          tags.push.apply(tags, check_tags[si]);
        }
      }

      let decoded_tags = [];
      if (tags !== undefined) {
        for (const tag of tags) {
          const tagSep = tag.split(/:/g);
          let tagCat = tagSep.shift();
          let tagVal = tagSep.join(':');
          if (!tagCat.startsWith('__')) {
            tagCat = decodeTag(tagCat);
            tagVal = decodeTag(tagVal);
            labels[tagCat] = tagVal;
            decoded_tags.push(`${tagCat}:${tagVal}`);
          }
        }
      }
      lname = decodeTagsInLabel(lname);
      let dname = lname;
      if (decoded_tags.length > 0 && explicitTags) {
        dname += ` { ${decoded_tags.join(', ')} }`;
      }

      let timeField = getTimeField();
      timeField.config.interval = period * 1000;

      let numberField = getNumberField();
      numberField.config.displayName = dname;
      numberField.labels = labels;

      const frame = new MutableDataFrame({
        refId: query.refId,
        fields: [timeField, numberField],
      });

      // loop through all the points
      for (let i = 0; i < data[si].length; i++) {
        // if this point is before the start, skip it
        const ts = (start + i * period) * 1000;
        if (ts < query.start * 1000) {
          continue;
        }
        // if it's null or a number, proceed
        if (null === data[si][i] || _.isNumber(data[si][i])) {
          frame.add({
            Time: ts,
            Value: data[si][i]
          });
        }
        // if it's an object, process it for a heatmap
        if (data[si][i] && Object === data[si][i].constructor) {
          for (let vstr in data[si][i]) {
            const cnt = data[si][i][vstr];
            const v = parseFloat(vstr);
            vstr = v.toString();
            const tsstr = ts.toString();
            if (_.isUndefined(lookaside[vstr])) {
              lookaside[vstr] = {
                target: vstr,
                title: vstr,
                tags: labels,
                datapoints: [],
                _ts: {}
              };
              dataFrames.push(lookaside[vstr]);
            }
            if (_.isUndefined(lookaside[vstr]._ts[tsstr])) {
              lookaside[vstr]._ts[tsstr] = [cnt, ts];
              lookaside[vstr].datapoints.push(lookaside[vstr]._ts[tsstr]);
            }
            else {
              lookaside[vstr]._ts[tsstr][0] += cnt;
            }
          }
        }
      }
      if (timeField.values.length) {
        dataFrames.push(frame);
      }
    }
    return {
      data: dataFrames,
      query: query,
    };
  }

  /**
   * This converts data from the metric data/fetch endpoint to Grafana's format.
   */
  convertIrondbGraphiteDataToGrafana(result: any, query: any) {
    let data = result.data;
    let cleanData: any[] = [];

    if (!data || !data.series) {
      return {
        data: cleanData
      };
    }
    if (data.series && data.step && data.from && data.to) {
      // convert secs to ms
      data.step *= 1000;
      data.from *= 1000;
      data.to *= 1000;
      for (const name in data.series) {
        const origDatapoint = data.series[name];
        let timestamp = data.from - data.step;
        let datapoint: any[] = [];
        cleanData.push({
          target: name,
          datapoints: datapoint,
        });
        for (let i = 0; i < origDatapoint.length; i++) {
          timestamp += data.step;
          if (null == origDatapoint[i]) {
            continue;
          }
          datapoint.push([origDatapoint[i], timestamp]);
        }
      }
    }
    return {
      data: cleanData,
      query: query,
    };
  }

  /**
   * This converts alert data to Grafana's format.
   */
  convertAlertDataToGrafana(enrichedResults: any[]) {
    if (_.isUndefined(enrichedResults) || enrichedResults.length === 0) {
      return { data: [] };
    }

    const dataFrames: DataFrame[] = [];
    enrichedResults.forEach(_addAlert);

    return {
      t: 'table',
      data: dataFrames,
      state: LoadingState.Done,
    };

    /**
     * This adds an alert result data frame.
     */
    function _addAlert(alertResult: any) {
      const timeField = getTimeField();
      const alternateTimeField = getTimeField('alert_timestamp');
      const labelFields = new Set<MutableField>();
      const valueFields = new Set<MutableField>();
      const allValues: any = {};
      const fields: any = {
        _acknowledgement: getTextField('acknowledgement'),
        _alert_url: getTextField('circonus_alert_url'),
        _check_name: getTextField('check_name'),
        _cleared_on: getTimeField('cleared_timestamp'),
        _metric_link: getTextField('metric_link'),
        _severity: getNumberField('severity'),
        derive: getTextField('derive'),
        metric_type: getTextField('metric_type'),
        _value: getOtherField('alert_value'),
        _cleared_value: getOtherField('cleared_value'),
        _cid: getTextField('alert_id'),
      };
      const specialFields: any = {
        _signature: getTextField('check_uuid'),
        _canonical_metric_name: getTextField('metric_name'),
        _metric_name: 1,
        _tags: 1,
      };
      const thresholdFields: any = {
        threshold_1: getNumberField('threshold_1'),
        threshold_2: getNumberField('threshold_2'),
        threshold_3: getNumberField('threshold_3'),
        threshold_4: getNumberField('threshold_4'),
        threshold_5: getNumberField('threshold_5'),
      };
      const alert = alertResult.alert;
      const rule = alertResult.rule;
      const tags: TagSet = {};

      for (const key in alert) {
        if (key === '_occurred_on') {
          const epoch = alert[key];
          timeField.values.add(epoch * 1000);
          alternateTimeField.values.add(epoch * 1000);
          // Also create a time window 30 minutes before the alert up to 30 mins 
          // after `cleared_on`. If it's not a cleared alert, use 30 mins after 
          // the alert timestamp as the window (or now if it's recent).
          const before = epoch - 1800;
          const cleared = alert._cleared_on;
          let after = epoch + 1800;
          if (cleared != null) {
            after = cleared + 1800;
          }
          if (after > Math.floor(Date.now() / 1000)) {
            after = Math.floor(Date.now() / 1000);
          }
          const window_start = getNumberField('alert_window_start');
          const window_end = getNumberField('alert_window_end');
          valueFields.add(window_start);
          valueFields.add(window_end);
          window_start.values.add(before * 1000);
          window_end.values.add(after * 1000);
          // special field called 'state' which contains "ALERTING" or "OK"
          const state = getTextField('state');
          valueFields.add(state);
          if (cleared != null) {
            state.values.add('OK');
          }
          else {
            state.values.add('ALERTING');
          }
        }
        else if (key === '_cid') {
          const cid = alert[key];
          fields[key].values.add(cid.replace('/alert/', ''));
          valueFields.add(fields[key]);
        }
        else if (key === '_cleared_on') {
          const epoch = alert[key];
          if (epoch !== null) {
            fields[key].values.add(epoch * 1000);
          }
          else {
            fields[key].values.add(null);
          }
          if (!allValues[key]) {
            allValues[key] = fields[key];
            valueFields.add(fields[key]);
          }
        }
        else if (fields[key] !== undefined) {
          let val = alert[key];
          if (key === '_cleared_value' && alert[key] === null) {
            val = '';
          }
          if ((key === '_value' && alert[key] === null) || alert[key] === '') {
            val = '';
          }
          fields[key].values.add(val);
          if (!allValues[key]) {
            allValues[key] = fields[key];
            valueFields.add(fields[key]);
          }
        }
        else if (specialFields[key] !== undefined) {
          if (key === '_signature') {
            const check_uuid = alert[key].substring(0, alert[key].indexOf('`'));
            specialFields[key].values.add(check_uuid);
            if (!allValues[key]) {
              allValues[key] = specialFields[key];
              valueFields.add(specialFields[key]);
            }
          }
          else if (key === '_canonical_metric_name') {
            const cn = alert[key];
            if (cn !== undefined && cn !== '') {
              const [n, stream_tags] = taglessNameAndTags(cn);
              specialFields[key].values.add(n);
              if (!allValues[key]) {
                allValues[key] = specialFields[key];
                valueFields.add(specialFields[key]);
              }
              const real_cn = getTextField('canonical_metric_name');
              valueFields.add(real_cn);
              real_cn.values.add(cn);
              const st = splitTags(stream_tags);
              mergeTags(tags, st);
            }
          }
          else if (key === '_metric_name' && alert._canonical_metric_name === '') {
            const name = alert[key];
            specialFields._canonical_metric_name?.values?.add(name);
            if (!allValues[key]) {
              allValues[key] = specialFields._canonical_metric_name;
              valueFields.add(specialFields._canonical_metric_name);
            }
          }
          else if (key === '_tags') {
            for (const tag of alert[key]) {
              const tagSep = tag.split(/:/g);
              let tagCat = tagSep.shift();
              if (!tagCat.startsWith('__') && tagCat !== '') {
                let tagVal = tagSep.join(':');
                tagCat = decodeTag(tagCat);
                tagVal = decodeTag(tagVal);
                if (tags[tagCat] === undefined) {
                  tags[tagCat] = [];
                }
                tags[tagCat].push(tagVal);
              }
            }
          }
        }
      }

      // deal with accumulated tags and make a single comma separated field of tags.
      const tagField = getTextField('tags');
      valueFields.add(tagField);
      let i = 0;
      let combinedTags = '';
      for (const tag in tags) {
        if (i) {
          combinedTags += '|';
        }
        if (tag !== '' && !tag.startsWith('__')) {
          i++;
          combinedTags += `${tag}:${tags[tag][0]}`;
          // also add a dedicated field per tag so people can split them out
          // if they want to
          const tf = getTextField(tag);
          tf.values.add(tags[tag][0]);
          valueFields.add(tf);
        }
      }
      tagField.values.add(combinedTags);

      // add the threshold fields even if there is no ruleset
      for (let i = 1; i < 6; i++) {
        const key = `threshold_${i}`;
        if (!allValues[key]) {
          allValues[key] = thresholdFields[key];
          valueFields.add(thresholdFields[key]);
        }
      }

      let doneMap: any = {};
      if (rule?.metric_type === 'numeric') {
        // add up to 5 thresholds (one for each severity) based on severity 
        // from the `rule` object.
        let d = rule.derive;
        if (d === 'mixed') {
          // find the first rule with a windowing_function
          for (const r of rule.rules) {
            d = r.windowing_function;
            if (d != null) {
              break;
            }
          }
        }
        const deriveField = getTextField('function');
        valueFields.add(deriveField);
        deriveField.values.add(d);
        for (const r of rule.rules) {
          const sev = r.severity;
          // sev 0 means to clear the alert, ignore it for thresholding purposes
          if (sev === 0) {
            continue;
          }
          const key = `threshold_${sev}`;
          thresholdFields[key].values.add(r.value);
          doneMap[sev] = 1;
        }
      }

      for (let i = 1; i < 6; i++) {
        if (doneMap[i] === undefined) {
          const key = `threshold_${i}`;
          thresholdFields[key].values.add(-1);
        }
      }

      /* Add a text based description of the rules that are attached to this 
      alert, separated by pipes.
      "rules": [
        {
          "severity": 1,
          "criteria": "max value",
          "wait": 0,
          "windowing_duration": 120,
          "value": "1000",
          "windowing_min_duration": 0,
          "windowing_function": "average"
        }
      */
      const ruleField = getTextField('rule_text');
      const notesField = getTextField('notes');
      valueFields.add(ruleField);
      valueFields.add(notesField);
      if (rule != null) {
        if (rule.notes?.length) {
          notesField.values.add(rule.notes);
        }
        else {
          // metric notes (from the alert object) is an embedded JSON string
          const mn = alert.metric_notes;
          if (mn?.length) {
            try {
              const notes = JSON.parse(mn);
              notesField.values.add(notes.notes);
            }
            catch (err) {
              notesField.values.add('');
            }
          }
        }
        let text = '';
        let i = 0;
        for (const r of rule.rules) {
          let winfunc = r.windowing_function;
          let duration = '';
          if (winfunc === null) {
            winfunc = 'value';
          }
          else {
            duration = `(over ${r.windowing_duration} seconds) `;
          }
          let t = `if the ${winfunc} ${duration}`;
          if (r.criteria === 'on absence') {
            t += `is absent for ${r.value} seconds, `;
          }
          else if (r.criteria === 'max value') {
            t += `is present and >= ${r.value}, `;
          }
          else if (r.criteria === 'min value') {
            t += `is present and < ${r.value}, `;
          }
          else if (r.criteria === 'matches') {
            t += `is present and matches '${r.value}', `;
          }
          else if (r.criteria === 'does not match') {
            t += `is present and does not match '${r.value}', `;
          }
          if (i) {
            t += "and prior rules aren't triggered, ";
          }
          if (r.severity === 0) {
            t += 'clear the alert.';
          }
          else {
            t += `trigger a sev ${r.severity} alert and wait ${r.wait} minutes before notifying.`;
          }
          if (i) {
            text += '|';
          }
          text += t;
          i++;
        }
        ruleField.values.add(text);
      }
      else {
        ruleField.values.add('');
        notesField.values.add('');
      }

      dataFrames.push({
        length: timeField.values.length,
        fields: [timeField, alternateTimeField, ...labelFields, ...valueFields],
      });
    }
  }

  /**
   * This pulls alerts to show as annotations.
   */
  annotationQuery(query: AnnotationQueryRequest<CirconusQuery>): Promise<AnnotationEvent[]> {
    if (!_.isUndefined(this.queryRange) && !_.isEqual(query.range, this.queryRange)) {
      if (this.dataSourceOptions.useCaching) {
        const requestCache = this.datasourceRequest as unknown as Memoized<(options: any) => any>;
        requestCache.clear();
      }
    }
    this.queryRange = query.range;

    let queries: any[] = [];
    let headers: any = { 'Content-Type': 'application/json' };

    headers['X-Circonus-Auth-Token'] = this.dataSourceOptions.apiToken;
    headers['X-Circonus-App-Name'] = this.appName;
    headers['Accept'] = 'application/json';

    if (query.annotation['annotationQueryType'] === 'alerts') {
      let options: any = {
        url: `${this.url}/v2/alert`,
        method: 'GET',
        headers: headers,
        retry: 1,
        start: query.range.from.valueOf() / 1000,
        end: query.range.to.valueOf() / 1000,
        isAlert: true,
        localFilter: query.annotation['annotationFilterText'],
        localFilterMatch: query.annotation['annotationFilterApply'],
        annotation: query.annotation,
        withCredentials: this.basicAuth || this.withCredentials,
        isCaql: false,
      };
      const alertId = this.templateSrv.replace(query.annotation.alertId);
      const alertQuery = this.templateSrv.replace(query.annotation.annotationQueryText);
      if (alertId !== '') {
        options.url += `/${alertId}`;
      }
      else {
        options.url += `?search=${encodeURIComponent(alertQuery)}&size=500`;
      }
      if (this.basicAuth) {
        options.headers.Authorization = this.basicAuth;
      }
      queries.push(options);
    }

    return Promise.all(
      queries.map((query) =>
        this.datasourceRequest(query)
        .then((result: any) => {
          if (!_.isUndefined(query.isAlert)) {
            return this.enrichAlertsWithRules(result, query);
          }
          return Promise.resolve([]);
        })
        .then((results: any[]) => {
          // this is a list of objects with "alert" and "rule" fields.
          const events: AnnotationEvent[] = [];
          for (const a of results) {
            const alert = a['alert'];
            const rule = a['rule'];
            const tags: TagSet = {};

            if (alert['_occurred_on'] < query.start || alert['_occurred_on'] > query.end) {
              continue;
            }

            const cn = alert['_canonical_metric_name'];
            const metric = alert['_metric_name'];
            if (cn !== undefined && cn !== '') {
              const stream_tags = taglessNameAndTags(cn)[1];
              const st = splitTags(stream_tags);
              mergeTags(tags, st);
            }
            for (const tag of alert['_tags']) {
              const tagSep = tag.split(/:/g);
              let tagCat = tagSep.shift();
              if (!tagCat.startsWith('__') && tagCat !== '') {
                let tagVal = tagSep.join(':');
                tagCat = decodeTag(tagCat);
                tagVal = decodeTag(tagVal);
                if (tags[tagCat] === undefined) {
                  tags[tagCat] = [];
                }
                tags[tagCat].push(tagVal);
              }
            }

            const annotationTags = [];
            for (const tagCat in tags) {
              annotationTags.push(tagCat + ':' + tags[tagCat][0]);
            }

            // each circonus alert can produce 2 events, one for the alert and one for the clear.
            // alert first.
            const alert_match: any = {};
            alert_match.metric = metric;
            alert_match.value = alert['_value'];

            const data: any = {};
            data.evalMatches = [];
            data.evalMatches.push(alert_match);

            let notes =
              rule !== undefined && rule !== null && rule['notes'] !== null && rule['notes'] !== '' ?
              rule['notes'] :
              'Oh no!';

            notes = Mustache.render(notes, tags);

            const event: any = {
              time: alert['_occurred_on'] * 1000,
              title: 'ALERTING',
              text: `<br />${notes}<br />Sev: ${alert['_severity']}<br />`+
                (alert['_metric_link'] !== null && alert['_metric_link'] !== ''
                  ? `<a href="${alert['_metric_link']}" target="_blank">Info</a><br />`
                  : ''),
              tags: annotationTags,
              alertId: alert['_cid'].replace('/alert/', ''),
              newState: 'alerting',
              source: query.annotation,
              data: data,
            };

            events.push(event);

            notes =
              rule !== undefined && rule !== null && rule['notes'] !== null && rule['notes'] !== '' ?
              rule['notes'] :
              'Yay!';

            notes = Mustache.render(notes, tags);

            // clear if it's cleared:
            if (alert['_cleared_on'] !== null) {
              const alert_match: any = {};
              alert_match.metric = metric;
              alert_match.value = alert['_cleared_value'];
              const data: any = {};
              data.evalMatches = [];
              data.evalMatches.push(alert_match);

              const event: any = {
                time: alert['_cleared_on'] * 1000,
                title: 'OK',
                text: `<br />${notes}<br />Sev: ${alert['_severity']}<br />` +
                  (alert['_metric_link'] !== null && alert['_metric_link'] !== ''
                    ? `<a href="${alert['_metric_link']}" target="_blank">Info</a><br />`
                    : ''),
                tags: annotationTags,
                alertId: alert['_cid'].replace('/alert/', ''),
                newState: 'ok',
                source: query.annotation,
                data: data,
              };
              events.push(event);
            }
          }
          return events;
        })
      )
    ).then((results) => {
      return results;
    });
  }

  /* an alert looks like this:
    {
    "_cid": "/alert/48145680",
    "_acknowledgement": null,
    "_alert_url": "https://mlb-infrastructure.circonus.com/fault-detection/alerts/48145680",
    "_broker": "/broker/2761",
    "_check": "/check/283849",
    "_check_name": "AMQ - legacy 02 npd activemq",
    "_cleared_on": null,
    "_cleared_value": null,
    "_maintenance": [
      "/maintenance/169927",
      "/maintenance/167993"
    ],
    "_metric_link": null,
    "_metric_name": "QueueSize",
    "_canonical_metric_name": "QueueSize|ST[brokerName:Internal_ActiveMQ_Broker,destinationName:lookup.background.job.topic.qa,destinationType:Queue,host:activemq02-internal.legacy.us-east4.bdatasf-gcp-npd.mlbinfra.net,type:Broker]",
    "_signature": "8f6126f5-3be4-4324-9831-ce468bef21e7`QueueSize|ST[brokerName:Internal_ActiveMQ_Broker,destinationName:lookup.background.job.topic.qa,destinationType:Queue,host:activemq02-internal.legacy.us-east4.bdatasf-gcp-npd.mlbinfra.net,type:Broker]",
    "_metric_notes": "{\"notes\":\"AMQ QueueSize has gotten too large, check subscribers\"}",
    "_occurred_on": 1609958123,
    "_rule_set": "/rule_set/268647",
    "_severity": 1,
    "_tags": [
      "category:partner",
      "env:npd",
      "service:amq"
    ],
    "_value": "1091"
  }
  
  and the `rule` field will look like:
  {
    "derive": "average",
    "_cid": "/rule_set/268647",
    "metric_name": "QueueSize",
    "check": "/check/0",
    "metric_type": "numeric",
    "tags": [],
    "_host": null,
    "notes": "AMQ QueueSize has gotten too large, check subscribers",
    "lookup_key": null,
    "name": null,
    "parent": null,
    "rules": [
      {
        "severity": 1,
        "criteria": "max value",
        "wait": 0,
        "windowing_duration": 120,
        "value": "1000",
        "windowing_min_duration": 0,
        "windowing_function": "average"
      }
    ],
    "link": null,
    "filter": "and(service:amq,not(env:prod),not(host:activemq*-internal.sportradar.us-east4.bdatasf-gcp-npd.mlbinfra.net))",
    "contact_groups": {
      "1": ["/contact_group/5738"], "2": [], "3": [], "4": [], "5": []
    }
  }
  */  
}
