import _ from 'lodash';
import Log from './log';
import memoize from 'memoizee';
import { Memoized } from 'memoizee';
import { metaInterpolateLabel, decodeNameAndTags } from './irondb_query';

const log = Log('IrondbDatasource');

const DURATION_UNITS_DEFAULT = 's';
const DURATION_UNITS = {
  ms: 1,
  s: 1000,
  m: 1000 * 60,
  h: 1000 * 60 * 60,
  d: 1000 * 60 * 60 * 24,
};

function parseDurationMs(duration: string): number {
  if (!/^[0-9]+(ms|s|m|h|d)?$/g.test(duration.toLocaleLowerCase())) {
    throw new Error('Invalid time duration: ' + duration);
  }
  let unit = DURATION_UNITS_DEFAULT;
  for (const k in DURATION_UNITS) {
    if (duration.endsWith(k)) {
      unit = k;
      duration = duration.slice(0, duration.length - k.length);
    }
  }
  return parseInt(duration, 10) * DURATION_UNITS[unit];
}

const _s = [1, 0.5, 0.25, 0.2, 0.1, 0.05, 0.025, 0.02, 0.01, 0.005, 0.002, 0.001];
const _m = [60, 30, 20, 15, 10, 5, 3, 2, 1];
const _h = [60, 30, 20, 15, 10, 5, 3, 2, 1].map(a => a * 60);
const _d = [24, 12, 8, 6, 4, 3, 2, 1].map(a => a * 60 * 60);
const _matchset = [_s, _m, _h, _d];

function nudgeInterval(input, dir) {
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
          } else {
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

const HISTOGRAM_TRANSFORMS = {
  count: 'count',
  average: 'average',
  stddev: 'stddev',
  derive: 'rate',
  derive_stddev: 'derive_stddev',
  counter: 'rate',
  counter_stddev: 'counter_stddev',
};

export default class IrondbDatasource {
  id: number;
  name: string;
  type: string;
  accountId: number;
  irondbType: string;
  resultsLimit: string;
  useCaching: boolean;
  activityTracking: boolean;
  url: any;
  apiToken: string;
  appName: string;
  supportAnnotations: boolean;
  supportMetrics: boolean;
  basicAuth: any;
  withCredentials: any;
  datasourceRequest: (options: any) => any;
  queryRange: any;

  static readonly DEFAULT_CACHE_ENTRIES = 128;
  static readonly DEFAULT_CACHE_TIME_MS = 60000;

  static stripActivityWindow(url) {
    return _.split(url, '&')
      .map(p => p.split('='))
      .filter(p => !p[0].startsWith('activity_'))
      .map(p => p.join('='))
      .join('&');
  }

  static requestCacheKey(requestOptions) {
    const httpMethod = requestOptions.method;
    if (httpMethod === 'GET') {
      return IrondbDatasource.stripActivityWindow(requestOptions.url);
    } else if (httpMethod === 'POST') {
      return JSON.stringify(requestOptions.data);
    }
    throw new Error('Unsupported HTTP method type: ' + (httpMethod || '?'));
  }

  static setupCache(useCaching, backendSrv) {
    const doRequest = options => {
      return backendSrv.datasourceRequest(options);
    };
    if (!useCaching) {
      log(() => 'setupCache() caching disabled');
      return doRequest;
    }
    const cacheOpts = {
      max: IrondbDatasource.DEFAULT_CACHE_ENTRIES,
      maxAge: IrondbDatasource.DEFAULT_CACHE_TIME_MS,
      promise: true,
      normalizer: args => {
        const requestOptions = args[0];
        const cacheKey = IrondbDatasource.requestCacheKey(requestOptions);
        log(() => 'normalizer() cache lookup key = ' + cacheKey);
        return cacheKey;
      },
    };
    log(() => 'setupCache() caching enabled');
    return memoize(options => {
      log(() => 'doRequest() cache miss key = ' + IrondbDatasource.requestCacheKey(options));
      return doRequest(options);
    }, cacheOpts);
  }

  /** @ngInject */
  constructor(instanceSettings, private $q, private backendSrv, private templateSrv) {
    this.type = 'irondb';
    this.name = instanceSettings.name;
    this.id = instanceSettings.id;
    this.accountId = (instanceSettings.jsonData || {}).accountId;
    this.irondbType = (instanceSettings.jsonData || {}).irondbType;
    this.resultsLimit = (instanceSettings.jsonData || {}).resultsLimit;
    this.apiToken = (instanceSettings.jsonData || {}).apiToken;
    this.useCaching = (instanceSettings.jsonData || {}).useCaching;
    this.activityTracking = (instanceSettings.jsonData || {}).activityTracking;
    this.url = instanceSettings.url;
    this.supportAnnotations = false;
    this.supportMetrics = true;
    this.appName = 'Grafana';
    this.datasourceRequest = IrondbDatasource.setupCache(this.useCaching, backendSrv);
  }

  query(options) {
    log(() => 'query() options = ' + JSON.stringify(options));

    if (!_.isUndefined(this.queryRange) && !_.isEqual(options.rangeRaw, this.queryRange)) {
      log(() => 'query() time range changed ' + JSON.stringify(this.queryRange) + ' -> ' + JSON.stringify(options.rangeRaw));
      if (this.useCaching) {
        log(() => 'query() clearing cache');
        const requestCache = (this.datasourceRequest as unknown) as Memoized<(options: any) => any>;
        requestCache.clear();
      }
    }
    this.queryRange = options.rangeRaw;

    if (_.isEmpty(options['targets'][0])) {
      return this.$q.when({ data: [] });
    }

    return Promise.all([this.buildIrondbParams(options)])
      .then(irondbOptions => {
        if (_.isEmpty(irondbOptions[0])) {
          return this.$q.when({ data: [] });
        }
        return this.irondbRequest(irondbOptions[0]);
      })
      .then(queryResults => {
        if (queryResults['data'].constructor === Array) {
          queryResults['data'].sort((a, b): number => {
            return a['target'].localeCompare(b['target']);
          });
        }
        log(() => 'query() queryResults = ' + JSON.stringify(queryResults));
        return queryResults;
      })
      .catch(err => {
        if (err.status !== 0 || err.status >= 300) {
          this.throwerr(err);
        }
      });
  }

  annotationQuery(options) {
    throw new Error('Annotation Support not implemented yet.');
  }

  metricFindQuery(query: string, options: any) {
    const variable = options.variable;
    if (query !== '' && variable !== undefined) {
      const metricName = query;
      const tagCat = variable.tagValuesQuery;
      if (variable.useTags && tagCat !== '') {
        return this.metricTagValsQuery(metricName, tagCat).then(results => {
          return _.map(results.data, result => {
            return { value: result };
          });
        });
      }
    }
    return Promise.resolve([]);
  }

  getAccountId() {
    return this.irondbType === 'standalone' ? '/' + this.accountId : '';
  }

  metricTagsQuery(query: string, allowEmptyWildcard = false, activityWindow: [number, number] = null) {
    if (query === '' || query === undefined || (!allowEmptyWildcard && query === 'and(__name:*)')) {
      return Promise.resolve({ data: [] });
    }
    let queryUrl = '/find' + this.getAccountId() + '/tags?query=';
    queryUrl = queryUrl + query;
    if (this.activityTracking && !_.isEmpty(activityWindow)) {
      log(() => 'metricTagsQuery() activityWindow = ' + JSON.stringify(activityWindow));
      queryUrl += '&activity_start_secs=' + _.toInteger(activityWindow[0]);
      queryUrl += '&activity_end_secs=' + _.toInteger(activityWindow[1]);
    }
    log(() => 'metricTagsQuery() queryUrl = ' + queryUrl);
    return this.irondbSimpleRequest('GET', queryUrl, false, true);
  }

  metricTagCatsQuery(query: string) {
    let queryUrl = '/find' + this.getAccountId() + '/tag_cats?query=';
    queryUrl = queryUrl + 'and(__name:' + query + ')';
    log(() => 'metricTagCatsQuery() queryUrl = ' + queryUrl);
    return this.irondbSimpleRequest('GET', queryUrl, false, true, false);
  }

  metricTagValsQuery(query: string, cat: string) {
    let queryUrl = '/find' + this.getAccountId() + '/tag_vals?category=' + cat + '&query=';
    queryUrl = queryUrl + 'and(__name:' + query + ')';
    log(() => 'metricTagValsQuery() queryUrl = ' + queryUrl);
    return this.irondbSimpleRequest('GET', queryUrl, false, true, false);
  }

  testDatasource() {
    return this.metricTagsQuery('and(__name:ametric)')
      .then(res => {
        const error = _.get(res, 'results[0].error');
        if (error) {
          return {
            status: 'error',
            message: error,
            title: 'Error',
          };
        }
        return {
          status: 'success',
          message: 'Data source is working',
          title: 'Success',
        };
      })
      .catch(err => {
        let message = (err.data || {}).message;
        if (message === undefined) {
          message = 'Error ' + (err.status || '') + ' ' + (err.statusText || '');
        }
        return {
          status: 'error',
          message: message,
          title: 'Error',
        };
      });
  }

  throwerr(err) {
    log(() => 'throwerr() err = ' + err);
    if (err.data && err.data.error) {
      throw new Error('Circonus IRONdb Error: ' + err.data.error);
    } else if (err.data && err.data.user_error) {
      const name = err.data.method || 'IRONdb';
      let suffix = '';
      if (err.data.user_error.query) {
        suffix = ' in"' + err.data.user_error.query + '"';
      }
      throw new Error(name + ' error: ' + err.data.user_error.message + suffix);
    } else if (err.statusText === 'Not Found') {
      throw new Error('Circonus IRONdb Error: ' + err.statusText);
    } else if (err.statusText && err.status > 0) {
      throw new Error('Network Error: ' + err.statusText + '(' + err.status + ')');
    } else {
      throw new Error('Error: ' + (err ? err.toString() : 'unknown'));
    }
  }

  irondbSimpleRequest(method, url, isCaql = false, isFind = false, isLimited = true) {
    let baseUrl = this.url;
    const headers = { 'Content-Type': 'application/json' };

    if ('hosted' !== this.irondbType) {
      headers['X-Circonus-Account'] = this.accountId;
    }
    if ('hosted' === this.irondbType && !isCaql) {
      baseUrl = baseUrl + '/irondb';
      if (!isFind) {
        baseUrl = baseUrl + '/series_multi';
      }
      headers['X-Circonus-Auth-Token'] = this.apiToken;
      headers['X-Circonus-App-Name'] = this.appName;
    }
    headers['X-Snowth-Advisory-Limit'] = isLimited ? this.resultsLimit : 'none';
    if ('standalone' === this.irondbType && !isCaql) {
      if (!isFind) {
        baseUrl = baseUrl + '/series_multi';
      }
    }
    if (isCaql && !isFind) {
      baseUrl = baseUrl + '/extension/lua/caql_v1';
    }

    const options: any = {
      method: method,
      url: baseUrl + url,
      headers: headers,
      retry: 1,
    };

    log(() => 'irondbSimpleRequest() options = ' + JSON.stringify(options));
    return this.datasourceRequest(options);
  }

  irondbRequest(irondbOptions, isLimited = true) {
    log(() => 'irondbRequest() irondbOptions = ' + JSON.stringify(irondbOptions));
    const headers = { 'Content-Type': 'application/json' };
    let options: any = {};
    const queries = [];
    const queryResults = {};
    queryResults['data'] = [];

    if ('hosted' === this.irondbType) {
      headers['X-Circonus-Auth-Token'] = this.apiToken;
      headers['X-Circonus-App-Name'] = this.appName;
    } else {
      headers['X-Circonus-Account'] = this.accountId;
    }
    headers['X-Snowth-Advisory-Limit'] = isLimited ? this.resultsLimit : 'none';
    headers['Accept'] = 'application/json';
    if (irondbOptions['std']['names'].length) {
      const paneltype = irondbOptions['std']['names'][0]['leaf_data']['paneltype'] || 'Graph';
      for (let i = 0; i < irondbOptions['std']['names'].length; i++) {
        options = {};
        options.url = this.url;
        if ('hosted' === this.irondbType) {
          options.url = options.url + '/irondb';
        }
        options.url = options.url + '/fetch';
        options.method = 'POST';
        const metricLabels = [];
        let start = irondbOptions['std']['start'];
        let end = irondbOptions['std']['end'];
        const interval = this.getRollupSpan(irondbOptions, start, end, false, irondbOptions['std']['names'][i]['leaf_data']);
        start -= interval;
        end += interval;
        const reduce = paneltype === 'Heatmap' ? 'merge' : 'pass';
        const streams = [];
        const data = { streams: streams };
        data['period'] = interval;
        data['start'] = start;
        data['count'] = Math.round((end - start) / interval);
        data['reduce'] = [{ label: '', method: reduce }];
        const metrictype = irondbOptions['std']['names'][i]['leaf_data']['metrictype'];
        metricLabels.push(irondbOptions['std']['names'][i]['leaf_data']['metriclabel']);

        const stream = {};
        let transform = irondbOptions['std']['names'][i]['leaf_data']['egress_function'];
        if (metrictype === 'histogram') {
          if (paneltype === 'Heatmap') {
            transform = 'none';
          } else {
            transform = HISTOGRAM_TRANSFORMS[transform];
          }
        }
        stream['transform'] = transform;
        stream['name'] = irondbOptions['std']['names'][i]['leaf_name'];
        stream['uuid'] = irondbOptions['std']['names'][i]['leaf_data']['uuid'];
        stream['kind'] = metrictype;
        streams.push(stream);
        log(() => 'irondbRequest() data = ' + JSON.stringify(data));
        options.data = data;
        options.name = 'fetch';
        options.headers = headers;
        if (this.basicAuth || this.withCredentials) {
          options.withCredentials = true;
        }
        if (this.basicAuth) {
          options.headers.Authorization = this.basicAuth;
        }
        options.metricLabels = metricLabels;
        options.paneltype = paneltype;
        options.isCaql = false;
        options.retry = 1;
        queries.push(options);
      }
    }
    if (irondbOptions['caql']['names'].length) {
      for (let i = 0; i < irondbOptions['caql']['names'].length; i++) {
        options = {};
        options.url = this.url;
        if ('hosted' === this.irondbType) {
          options.url = options.url + '/irondb';
        }
        options.method = 'GET';
        options.url = options.url + '/extension/lua';
        if ('hosted' === this.irondbType) {
          options.url = options.url + '/public';
        }
        let start = irondbOptions['caql']['start'];
        let end = irondbOptions['caql']['end'];
        const interval = this.getRollupSpan(irondbOptions, start, end, true, irondbOptions['caql']['names'][i].leaf_data);
        start -= interval;
        end += interval;
        const caqlQuery = this.templateSrv.replace(irondbOptions['caql']['names'][i].leaf_name);
        options.url = options.url + '/caql_v1?format=DF4&start=' + start.toFixed(3);
        options.url = options.url + '&end=' + end.toFixed(3);
        options.url = options.url + '&period=' + interval;
        options.url = options.url + '&q=' + encodeURIComponent(caqlQuery);
        options.name = irondbOptions['caql']['names'][i];
        options.headers = headers;
        options.start = start;
        options.end = end;
        options.retry = 1;
        if (this.basicAuth || this.withCredentials) {
          options.withCredentials = true;
        }
        if (this.basicAuth) {
          options.headers.Authorization = this.basicAuth;
        }
        options.isCaql = true;
        queries.push(options);
      }
    }
    log(() => 'irondbRequest() queries = ' + JSON.stringify(queries));

    return Promise.all(
      queries.map(query =>
        this.datasourceRequest(query)
          .then(result => {
            log(() => 'irondbRequest() query = ' + JSON.stringify(query));
            log(() => 'irondbRequest() result = ' + JSON.stringify(result));
            return this.convertIrondbDf4DataToGrafana(result, query);
          })
          .then(result => {
            if (result['data'].constructor === Array) {
              for (let i = 0; i < result['data'].length; i++) {
                queryResults['data'].push(result['data'][i]);
              }
            }
            if (result['data'].constructor === Object) {
              queryResults['data'].push(result['data']);
            }
            return queryResults;
          })
      )
    )
      .then(result => {
        return queryResults;
      })
      .catch(err => {
        if (err.status !== 0 || err.status >= 300) {
          this.throwerr(err);
        }
      });
  }

  static readonly MAX_DATAPOINTS_THRESHOLD = 1.5;
  static readonly MAX_EXACT_DATAPOINTS_THRESHOLD = 1.5;
  static readonly MIN_DURATION_MS_FETCH = 1;
  static readonly MIN_DURATION_MS_CAQL = 60 * 1000;
  static readonly ROLLUP_ALIGN_MS = _.map([1, 60, 3600, 86400], x => x * 1000);
  static readonly ROLLUP_ALIGN_MS_1DAY = 86400 * 1000;

  static checkRollupAligned(rollupMs) {
    for (const alignMs of IrondbDatasource.ROLLUP_ALIGN_MS) {
      if (rollupMs < alignMs) {
        if (alignMs % rollupMs !== 0) {
          throw new Error('Unaligned rollup period requested');
        }
      }
    }
    if (rollupMs > IrondbDatasource.ROLLUP_ALIGN_MS_1DAY && rollupMs % IrondbDatasource.ROLLUP_ALIGN_MS_1DAY !== 0) {
      throw new Error('Unaligned rollup period requested');
    }
  }

  getRollupSpan(options, start, end, isCaql, leafData) {
    log(() => `getRollupSpan() intervalMs = ${options.intervalMs}, maxDataPoints = ${options.maxDataPoints}`);
    log(() => `getRollupSpan() ${isCaql ? 'CAQL' : '/fetch'} ${JSON.stringify(leafData)}`);
    let rolluptype = leafData.rolluptype;
    const metricrollup = leafData.metricrollup;
    if (rolluptype !== 'automatic' && _.isEmpty(metricrollup)) {
      rolluptype = 'automatic';
      log(() => `getRollupSpan() defaulting to automatic`);
    }
    if (rolluptype === 'exact') {
      const exactMs = parseDurationMs(metricrollup);
      const exactDatapoints = Math.floor(((end - start) * 1000) / exactMs);
      log(() => `getRollupSpan() exactMs = ${exactMs}, exactDatapoints = ${exactDatapoints}`);
      if (exactDatapoints > options.maxDataPoints * IrondbDatasource.MAX_EXACT_DATAPOINTS_THRESHOLD) {
        throw new Error('Too many datapoints requested');
      }
      IrondbDatasource.checkRollupAligned(exactMs);
      return exactMs / 1000.0;
    } else {
      let minimumMs = IrondbDatasource.MIN_DURATION_MS_FETCH;
      if (isCaql) {
        minimumMs = IrondbDatasource.MIN_DURATION_MS_CAQL;
      }
      if (rolluptype === 'minimum') {
        minimumMs = parseDurationMs(metricrollup);
        log(() => `getRollupSpan() minimumMs = ${minimumMs}`);
      }
      let intervalMs = options.intervalMs;
      if (intervalMs < minimumMs) {
        intervalMs = minimumMs;
      }
      let interval = nudgeInterval(intervalMs / 1000, -1);
      while ((end - start) / interval > options.maxDatapoints * IrondbDatasource.MAX_DATAPOINTS_THRESHOLD) {
        interval = nudgeInterval(interval + 0.001, 1);
      }
      log(() => `getRollupSpan() intervalMs = ${intervalMs} -> interval ${interval}`);
      return interval;
    }
  }

  filterMetricsByType(target, data) {
    // Don't mix text metrics with numeric and histogram results
    const metricFilter = 'text';
    return _.filter(data, metric => {
      const metricTypes = metric.type.split(',');
      return !_.includes(metricTypes, metricFilter);
    });
  }

  buildFetchStream(target, result, i) {
    result[i]['leaf_data'] = {
      egress_function: 'average',
      uuid: result[i]['uuid'],
      paneltype: result[i]['target']['paneltype'],
    };
    if (target.egressoverride !== 'average') {
      result[i]['leaf_data'].egress_function = target.egressoverride;
    }
    const leafName = result[i]['metric_name'];
    if (target.labeltype !== 'default') {
      let metriclabel = target.metriclabel;
      if (target.labeltype === 'name') {
        metriclabel = '%n';
      } else if (target.labeltype === 'cardinality') {
        metriclabel = '%n | %t-{*}';
      }
      metriclabel = metaInterpolateLabel(metriclabel, result, i);
      metriclabel = this.templateSrv.replace(metriclabel);
      result[i]['leaf_data'].metriclabel = metriclabel;
    }
    if (target.rolluptype !== 'automatic' && !_.isEmpty(target.metricrollup)) {
      result[i]['leaf_data'].rolluptype = target.rolluptype;
      result[i]['leaf_data'].metricrollup = target.metricrollup;
    }
    result[i]['leaf_data'].metrictype = result[i]['type'];
    return { leaf_name: leafName, leaf_data: result[i]['leaf_data'] };
  }

  buildFetchParamsAsync(cleanOptions, target, start, end) {
    const rawQuery = this.templateSrv.replace(target['query']);
    return this.metricTagsQuery(rawQuery, false, [start, end])
      .then(result => {
        result.data = this.filterMetricsByType(target, result.data);
        for (let i = 0; i < result.data.length; i++) {
          result.data[i]['target'] = target;
        }
        return result.data;
      })
      .then(result => {
        for (let i = 0; i < result.length; i++) {
          cleanOptions['std']['names'].push(this.buildFetchStream(target, result, i));
        }
        return cleanOptions;
      });
  }

  buildIrondbParamsAsync(options) {
    const cleanOptions = {};
    const start = new Date(options.range.from).getTime() / 1000;
    const end = new Date(options.range.to).getTime() / 1000;
    const intervalMs = Math.round((options.range.to.valueOf() - options.range.from.valueOf()) / options.maxDataPoints);

    cleanOptions['maxDataPoints'] = options.maxDataPoints;
    cleanOptions['intervalMs'] = intervalMs;
    cleanOptions['std'] = {};
    cleanOptions['std']['start'] = start;
    cleanOptions['std']['end'] = end;
    cleanOptions['std']['names'] = [];
    cleanOptions['caql'] = {};
    cleanOptions['caql']['start'] = start;
    cleanOptions['caql']['end'] = end;
    cleanOptions['caql']['names'] = [];

    const targets = _.reject(options.targets, target => {
      return target.hide || !target['query'] || target['query'].length === 0;
    });

    if (!targets.length) {
      return {};
    }

    const promises = targets.map(target => {
      if (target.isCaql) {
        cleanOptions['caql']['names'].push({
          leaf_name: target['query'],
          leaf_data: {
            rolluptype: target.rolluptype,
            metricrollup: target.metricrollup,
          },
        });
        return Promise.resolve(cleanOptions);
      } else {
        return this.buildFetchParamsAsync(cleanOptions, target, start, end);
      }
    });

    return Promise.all(promises)
      .then(result => {
        return cleanOptions;
      })
      .catch(err => {
        log(() => 'buildIrondbParams() err = ' + JSON.stringify(err));
        if (err.status !== 0 || err.status >= 300) {
        }
      });
  }

  buildIrondbParams(options) {
    const self = this;
    return new Promise((resolve, reject) => {
      resolve(self.buildIrondbParamsAsync(options));
    });
  }

  convertIrondbDf4DataToGrafana(result, query) {
    const name = query.name;
    const metricLabels = query.metricLabels || {};
    const data = result.data.data;
    const meta = result.data.meta;
    const cleanData = [];
    const st = result.data.head.start;
    const period = result.data.head.period;
    const error = result.data.head.error as any[];

    if (!_.isEmpty(error)) {
      throw new Error(error.join('\n'));
    }
    if (!data || data.length === 0) {
      return { data: cleanData };
    }
    // Only supports one histogram.. So sad.
    const lookaside = {};
    for (let si = 0; si < data.length; si++) {
      const dummy = name + ' [' + (si + 1) + ']';
      let lname = meta[si] ? meta[si].label : dummy;
      lname = decodeNameAndTags(lname);
      const metricLabel = metricLabels[si];
      if (_.isString(metricLabel)) {
        lname = metricLabel;
      }
      for (let i = 0; i < data[si].length; i++) {
        if (data[si][i] === null) {
          continue;
        }
        const ts = (st + i * period) * 1000;
        if (ts < query.start * 1000) {
          continue;
        }
        if (data[si][i].constructor === Number) {
          if (cleanData[si] === undefined) {
            cleanData[si] = { target: lname, datapoints: [] };
          }
          cleanData[si].datapoints.push([data[si][i], ts]);
        } else if (data[si][i].constructor === Object) {
          for (let vstr in data[si][i]) {
            const cnt = data[si][i][vstr];
            const v = parseFloat(vstr);
            vstr = v.toString();
            const tsstr = ts.toString();
            if (_.isUndefined(lookaside[vstr])) {
              lookaside[vstr] = { target: vstr, datapoints: [], _ts: {} };
              cleanData.push(lookaside[vstr]);
            }
            if (_.isUndefined(lookaside[vstr]._ts[tsstr])) {
              lookaside[vstr]._ts[tsstr] = [cnt, ts];
              lookaside[vstr].datapoints.push(lookaside[vstr]._ts[tsstr]);
            } else {
              lookaside[vstr]._ts[tsstr][0] += cnt;
            }
          }
        }
      }
    }
    for (let i = 0; i < cleanData.length; i++) {
      if (_.isUndefined(cleanData[i])) {
        log(() => 'convertIrondbDf4DataToGrafana() No data at ' + st + ' for ' + meta[i].kind + ' "' + meta[i].label + '"');
        continue;
      }
      delete cleanData[i]._ts;
    }
    return { data: _.compact(cleanData) };
  }
}
