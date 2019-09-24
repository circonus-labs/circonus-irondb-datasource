import _ from 'lodash';
import Log from './log';
import memoize from 'memoizee';
import { Memoized } from 'memoizee';
import { metaInterpolateLabel } from './irondb_query';

const log = Log('IrondbDatasource');

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
      options = {};
      options.url = this.url;
      if ('hosted' === this.irondbType) {
        options.url = options.url + '/irondb';
        options.url = options.url + '/fetch';
      }
      options.method = 'POST';
      if ('standalone' === this.irondbType) {
        options.url = options.url + '/fetch';
      }
      const metricLabels = [];
      const interval = irondbOptions['std']['interval'];
      let start = irondbOptions['std']['start'];
      let end = irondbOptions['std']['end'];
      start = Math.floor(start - (start % interval));
      end = Math.floor(end - (end % interval));
      const reduce = paneltype === 'Heatmap' ? 'merge' : 'pass';
      const streams = [];
      const data = { streams: streams };
      data['period'] = interval;
      data['start'] = start;
      data['count'] = Math.round((end - start) / interval);
      data['reduce'] = [{ label: '', method: reduce }];
      for (let i = 0; i < irondbOptions['std']['names'].length; i++) {
        const metrictype = paneltype === 'Heatmap' ? 'histogram' : 'numeric';
        metricLabels.push(irondbOptions['std']['names'][i]['leaf_data']['metriclabel']);

        const stream = {};
        let transform = irondbOptions['std']['names'][i]['leaf_data']['egress_function'];
        transform = paneltype === 'Heatmap' ? 'none' : transform;
        stream['transform'] = transform;
        stream['name'] = irondbOptions['std']['names'][i]['leaf_name'];
        stream['uuid'] = irondbOptions['std']['names'][i]['leaf_data']['uuid'];
        stream['kind'] = metrictype;
        streams.push(stream);
      }
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
        const caqlQuery = this.templateSrv.replace(irondbOptions['caql']['names'][i]);
        options.url = options.url + '/caql_v1?format=DF4&start=' + irondbOptions['caql']['start'];
        options.url = options.url + '&end=' + irondbOptions['caql']['end'];
        options.url = options.url + '&period=' + irondbOptions['caql']['interval'];
        options.url = options.url + '&q=' + encodeURIComponent(caqlQuery);
        options.name = irondbOptions['caql']['names'][i];
        options.headers = headers;
        options.start = irondbOptions['caql']['start'];
        options.end = irondbOptions['caql']['end'];
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

  getRollupSpan(options, start, end) {
    // Pick a reasonable period for CAQL
    // We assume will use something close the request interval
    // unless it would produce more than maxDataPoints / 8
    // CAQL analytics at one point per pixel is almost never what
    // someone will want.
    let estdp = Math.floor(((end - start) * 1000) / options.intervalMs);
    if (estdp > options.maxDataPoints / 2) {
      estdp = options.maxDataPoints / 2;
    }
    let period = Math.ceil((end - start) / estdp);
    // The period is in the right realm now, force align to something
    // that will make it pretty.
    const align = [86400, 3600, 1800, 1200, 900, 300, 60, 30, 15, 10, 5, 1];
    for (const j in align) {
      if (period > 1000 * align[j]) {
        period = Math.floor(period / (1000 * align[j])) * (1000 * align[j]);
        break;
      }
    }
    if (period < 60) {
      period = 60;
    } else {
      period = period - (period % 60);
    }
    return period;
  }

  filterMetricsByType(target, data) {
    // Don't mix numeric results with histograms and text metrics
    let metricFilter = 'numeric';
    if (target['paneltype'] === 'Heatmap') {
      metricFilter = 'histogram';
    }
    return _.filter(data, metric => {
      const metricTypes = metric.type.split(',');
      return _.includes(metricTypes, metricFilter);
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
    const period = this.getRollupSpan(options, start, end);

    cleanOptions['std'] = {};
    cleanOptions['std']['start'] = start;
    cleanOptions['std']['end'] = end;
    cleanOptions['std']['names'] = [];
    cleanOptions['std']['interval'] = period;
    cleanOptions['caql'] = {};
    cleanOptions['caql']['start'] = start;
    cleanOptions['caql']['end'] = end;
    cleanOptions['caql']['names'] = [];
    cleanOptions['caql']['interval'] = period;

    const targets = _.reject(options.targets, target => {
      return target.hide || !target['query'] || target['query'].length === 0;
    });

    if (!targets.length) {
      return {};
    }

    const promises = targets.map(target => {
      if (target.isCaql) {
        cleanOptions['caql']['names'].push(target['query']);
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

    if (!data || data.length === 0) {
      return { data: cleanData };
    }
    // Only supports one histogram.. So sad.
    const lookaside = {};
    for (let si = 0; si < data.length; si++) {
      const dummy = name + ' [' + (si + 1) + ']';
      let lname = meta[si] ? meta[si].label : dummy;
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
