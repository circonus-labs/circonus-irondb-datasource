import _ from 'lodash';
import Log from './log';

import micromatch from 'micromatch';
import memoize from 'memoizee';
// eslint-disable-next-line no-duplicate-imports
import { Memoized } from 'memoizee';
import {
  metaInterpolateLabel,
  decodeNameAndTags,
  isStatsdCounter,
  taglessName,
  taglessNameAndTags,
  decodeTag,
  splitTags,
  mergeTags,
  TagSet,
  decodeTagsInLabel,
} from './irondb_query';

import { IronDBVariableQuery } from './types';
import { VariableQueryEditor as IronDBVariableQueryEditor } from './VariableQueryEditor';

import {
  ArrayVector,
  DataFrame,
  Field,
  FieldType,
  formatLabels,
  Labels,
  MutableField,
  ScopedVars,
  TIME_SERIES_TIME_FIELD_NAME,
  TIME_SERIES_VALUE_FIELD_NAME,
  DataSourceApi,
  DataSourceJsonData,
  DataQuery,
  DataSourceInstanceSettings,
  DataQueryResponse,
  DataQueryResponseData,
  DataQueryRequest,
  AnnotationQueryRequest,
  AnnotationEvent,
  LoadingState,
  TimeSeries,
  isTableData,
} from '@grafana/data';
import * as Mustache from 'mustache';

const log = Log('IrondbDatasource');

import { map } from 'rxjs/operators';

const DURATION_UNITS_DEFAULT = 's';
const DURATION_UNITS = {
  ms: 1,
  s: 1000,
  m: 1000 * 60,
  h: 1000 * 60 * 60,
  d: 1000 * 60 * 60 * 24,
};

function parseDurationMs(duration: string): number {
  const matches = duration.toLocaleLowerCase().match(/^([0-9]+)(ms|s|m|h|d)?$/);
  if (!matches) {
    throw new Error('Invalid time duration: ' + duration);
  }
  return parseInt(matches[1], 10) * DURATION_UNITS[matches[2] || DURATION_UNITS_DEFAULT];
}

const _s = [1, 0.5, 0.25, 0.2, 0.1, 0.05, 0.025, 0.02, 0.01, 0.005, 0.002, 0.001];
const _m = [60, 30, 20, 15, 10, 5, 3, 2, 1];
const _h = [60, 30, 20, 15, 10, 5, 3, 2, 1].map((a) => a * 60);
const _d = [24, 12, 8, 6, 4, 3, 2, 1].map((a) => a * 60 * 60);
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

export interface IrondbQueryInterface extends DataQuery {
  expr: string;
  format?: string;
  instant?: boolean;
  range?: boolean;
  hinting?: boolean;
  interval?: string;
  intervalFactor?: number;
  legendFormat?: string;
  valueWithRefId?: boolean;
  requestId?: string;
  showingGraph?: boolean;
  showingTable?: boolean;
}

export interface IrondbOptions extends DataSourceJsonData {
  accountId?: number;
  irondbType: string;
  resultsLimit: string;
  caqlMinPeriod: string;
  apiToken?: string;
  truncateNow?: boolean;
  useCaching?: boolean;
  activityTracking?: boolean;
  allowGraphite: boolean;
  queryPrefix: string;
}

export default class IrondbDatasource extends DataSourceApi<IrondbQueryInterface, IrondbOptions> {
  id: number;
  name: string;
  type: string;
  accountId: number;
  irondbType: string;
  resultsLimit: string;
  caqlMinPeriod: string;
  truncateNow: boolean;
  useCaching: boolean;
  activityTracking: boolean;
  allowGraphite: boolean;
  queryPrefix: string;
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
      .map((p) => p.split('='))
      .filter((p) => !p[0].startsWith('activity_'))
      .map((p) => p.join('='))
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
    const doRequest = (options) => {
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
      normalizer: (args) => {
        const requestOptions = args[0];
        const cacheKey = IrondbDatasource.requestCacheKey(requestOptions);
        log(() => 'normalizer() cache lookup key = ' + cacheKey);
        return cacheKey;
      },
    };
    log(() => 'setupCache() caching enabled');
    return memoize((options) => {
      log(() => 'doRequest() cache miss key = ' + IrondbDatasource.requestCacheKey(options));
      return doRequest(options);
    }, cacheOpts);
  }

  /** @ngInject */
  constructor(
    instanceSettings: DataSourceInstanceSettings<IrondbOptions>,
    private $q,
    private backendSrv,
    private templateSrv
  ) {
    super(instanceSettings);
    this.type = 'irondb';
    this.name = instanceSettings.name;
    this.id = instanceSettings.id;
    this.accountId = instanceSettings.jsonData.accountId;
    this.irondbType = instanceSettings.jsonData.irondbType;
    this.resultsLimit = instanceSettings.jsonData.resultsLimit;
    this.caqlMinPeriod = instanceSettings.jsonData.caqlMinPeriod;
    this.apiToken = instanceSettings.jsonData.apiToken;
    this.useCaching = instanceSettings.jsonData.useCaching;
    this.truncateNow = instanceSettings.jsonData.truncateNow;
    this.activityTracking = instanceSettings.jsonData.activityTracking;
    this.allowGraphite = instanceSettings.jsonData.allowGraphite;
    this.queryPrefix = instanceSettings.jsonData.queryPrefix;
    this.url = instanceSettings.url;
    this.supportAnnotations = false;
    this.supportMetrics = true;
    this.appName = 'Grafana';
    this.datasourceRequest = IrondbDatasource.setupCache(this.useCaching, backendSrv);
  }

  query(options: DataQueryRequest<IrondbQueryInterface>): Promise<DataQueryResponse> {
    log(() => 'query() options = ' + JSON.stringify(options));

    if (!_.isUndefined(this.queryRange) && !_.isEqual(options.range, this.queryRange)) {
      log(
        () => 'query() time range changed ' + JSON.stringify(this.queryRange) + ' -> ' + JSON.stringify(options.range)
      );
      if (this.useCaching) {
        log(() => 'query() clearing cache');
        const requestCache = this.datasourceRequest as unknown as Memoized<(options: any) => any>;
        requestCache.clear();
      }
    }
    this.queryRange = options.range;

    if (_.isEmpty(options['targets'][0])) {
      return this.$q.when({ data: [] });
    }

    return Promise.all([this.buildIrondbParams(options)])
      .then((irondbOptions) => {
        if (_.isEmpty(irondbOptions[0])) {
          return this.$q.when({ data: [] });
        }
        return this.irondbRequest(irondbOptions, true);
      })
      .then((queryResults) => {
        if (queryResults.t === 'ts') {
          if (queryResults['data'].constructor === Array) {
            queryResults['data'].sort((a, b): number => {
              return a && null == b
                ? -1
                : b && null == a
                ? 1
                : null == a && null == b
                ? 0
                : (a['target'] || '').localeCompare(b['target']);
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

  annotationQuery(query: AnnotationQueryRequest<IrondbQueryInterface>): Promise<AnnotationEvent[]> {
    log(() => 'annotationQuery() options = ' + JSON.stringify(query.annotation));
    log(() => 'annotationQuery() range = ' + JSON.stringify(query.range));

    if (!_.isUndefined(this.queryRange) && !_.isEqual(query.range, this.queryRange)) {
      log(() => 'query() time range changed ' + JSON.stringify(this.queryRange) + ' -> ' + JSON.stringify(query.range));
      if (this.useCaching) {
        log(() => 'query() clearing cache');
        const requestCache = this.datasourceRequest as unknown as Memoized<(options: any) => any>;
        requestCache.clear();
      }
    }
    this.queryRange = query.range;

    let options: any = {};
    const queries = [];
    const headers = { 'Content-Type': 'application/json' };
    // const start = new Date(query.rangeRaw.from).getTime() / 1000;
    // const end = new Date(query.rangeRaw.to).getTime() / 1000;

    headers['X-Circonus-Auth-Token'] = this.apiToken;
    headers['X-Circonus-App-Name'] = this.appName;
    headers['Accept'] = 'application/json';

    if (query.annotation['annotationQueryType'] === 'alerts') {
      options = {};
      options.url = this.url;
      options.url = options.url + '/v2';
      options.method = 'GET';
      options.url = options.url + '/alert';
      const alertId = this.templateSrv.replace(query.annotation['alertId']);
      const alertQuery = this.templateSrv.replace(query.annotation['annotationQueryText']);
      if (alertId !== '') {
        options.url = options.url + '/' + alertId;
      } else {
        options.url = options.url + '?search=' + encodeURIComponent(alertQuery) + '&size=500';
      }
      options.headers = headers;
      options.retry = 1;
      options.start = query.range.from.valueOf() / 1000;
      options.end = query.range.to.valueOf() / 1000;
      options.isAlert = true;
      options.local_filter = query.annotation['annotationFilterText'];
      options.local_filter_match = query.annotation['annotationFilterApply'];
      options.annotation = query.annotation;
      if (this.basicAuth || this.withCredentials) {
        options.withCredentials = true;
      }
      if (this.basicAuth) {
        options.headers.Authorization = this.basicAuth;
      }
      options.isCaql = false;
      queries.push(options);
    }

    return Promise.all(
      queries.map((query) =>
        this.datasourceRequest(query)
          .then((result) => {
            log(() => 'annotationQuery() query = ' + JSON.stringify(query));
            log(() => 'annotationQuery() result = ' + JSON.stringify(result));
            if (!_.isUndefined(query.isAlert)) {
              return this.enrichAlertsWithRules(result, query);
            }
          })
          .then((results) => {
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
                const [n, stream_tags] = taglessNameAndTags(cn);
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
                rule !== undefined && rule !== null && rule['notes'] !== null && rule['notes'] !== ''
                  ? rule['notes']
                  : 'Oh no!';

              notes = Mustache.render(notes, tags);

              const event: any = {
                time: alert['_occurred_on'] * 1000,
                title: 'ALERTING',
                text:
                  '<br />' +
                  notes +
                  '<br />' +
                  'Sev: ' +
                  alert['_severity'] +
                  '<br >' +
                  (alert['_metric_link'] !== null && alert['_metric_link'] !== ''
                    ? '<a href="' + alert['_metric_link'] + '" target="_blank">Info</a><br />'
                    : ''),
                tags: annotationTags,
                alertId: alert['_cid'].replace('/alert/', ''),
                newState: 'alerting',
                source: query.annotation,
                data: data,
              };

              events.push(event);

              notes =
                rule !== undefined && rule !== null && rule['notes'] !== null && rule['notes'] !== ''
                  ? rule['notes']
                  : 'Yay!';

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
                  text:
                    '<br />' +
                    notes +
                    '<br />' +
                    'Sev: ' +
                    alert['_severity'] +
                    '<br >' +
                    (alert['_metric_link'] !== null && alert['_metric_link'] !== ''
                      ? '<a href="' + alert['_metric_link'] + '" target="_blank">Info</a><br />'
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

  interpolateExpr(value: string | string[] = [], variable: any) {
    // if no multi or include all do not regexEscape
    if (!variable.multi && !variable.includeAll) {
      return value;
    }

    if (typeof value === 'string') {
      return value;
    }

    if (value.length === 1) {
      return value[0];
    }

    let q = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0) {
        q = q + ',';
      }
      q = q + value[i];
      i = i + 1;
    }
    return q;
  }

  // This is used to load variable values (in the dashboard config variable setup
  // and also whenever refreshing variable values when viewing a dashboard.
  // It relies on types/IronDBVariableQuery
  //
  // Older versions of grafana had support for an experimental
  // tag extraction feature which the older version of this
  // datasource relied on.  That experimental code was removed in Grafana 8.
  //
  // In order to support extraction of tag values we need to implement
  // our own variable query.
  //
  // There is code here (called out below) that attempts to migrate
  // the prior setup (that relied on the experimental feature) into
  // the new IronDBVariableQuery structure.
  metricFindQuery(query: IronDBVariableQuery | string, options: any) {
    const variable = options.variable;
    const range = options.range;
    let from = undefined;
    let to = undefined;

    // setup time range for query
    if (!_.isUndefined(range)) {
      from = range.from.valueOf() / 1000;
      to = range.to.valueOf() / 1000;
      if (!_.isUndefined(this.queryRange) && !_.isEqual(range, this.queryRange)) {
        log(() => 'query() time range changed ' + JSON.stringify(this.queryRange) + ' -> ' + JSON.stringify(range));
        if (this.useCaching) {
          log(() => 'query() clearing cache');
          const requestCache = this.datasourceRequest as unknown as Memoized<(options: any) => any>;
          requestCache.clear();
        }
      }
      this.queryRange = range;
    }

    let q: IronDBVariableQuery = null;
    if (typeof query === 'string') {
      // attempt to translate variable.useTags into the new IronDBVariableQuery structure
      q = {
        metricFindQuery: query,
        tagCategory: variable !== undefined && variable.useTags ? variable.tagValuesQuery : '',
      };
    } else {
      q = query;
    }

    log(() => 'Options: ' + JSON.stringify(options));
    if (q !== undefined) {
      log(() => 'metricFindQuery() incoming query = ' + q.metricFindQuery);
      log(() => 'metricFindQuery() incoming regex = ' + variable.regex);
      let metricQuery = this.templateSrv.replace(q.metricFindQuery, null, this.interpolateExpr);
      log(() => 'metricFindQuery() interpolatedQuery = ' + metricQuery);
      log(() => 'metricFindQuery() tagCat = ' + q.tagCategory);
      if (!(metricQuery.includes('and(') || metricQuery.includes('or(') || metricQuery.includes('not('))) {
        metricQuery = 'and(__name:' + metricQuery + ')';
      }
      if (q.tagCategory !== '') {
        return this.metricFindTagValsQuery(metricQuery, q.tagCategory, from, to).then((results) => {
          let result_count = results.headers.get('X-Snowth-Search-Result-Count');
          if (result_count > 1000) {
            setTimeout(function () {
              showResultWarning(result_count);
            }, 100);
          } else {
            removeResultWarning();
          }
          return _.map(results.data, (result) => {
            return { value: result };
          });
        });
      } else {
        return this.metricTagsQuery(metricQuery, false, from, to).then((results) => {
          let result_count = results.headers.get('X-Snowth-Search-Result-Count');
          if (result_count > 1000) {
            setTimeout(function () {
              showResultWarning(result_count);
            }, 100);
          } else {
            removeResultWarning();
          }
          return _.map(results.data, (result) => {
            return { value: result.metric_name };
          });
        });
      }
    }
    return Promise.resolve([]);

    // manually find the edit pane 'Preview' header and inject a warning beforehand
    function showResultWarning(result_count) {
      let form = document.querySelector('[aria-label="Variable editor Form"]');
      let header = Array.from(form ? form.querySelectorAll('h3,h4,h5') : []).find(function (el) {
        return /^Preview\s/.test(el['innerText']);
      });
      if (header) {
        let span = document.createElement('span');
        span.className = 'result-warning';
        span.style.color = 'rgb(235, 123, 24)';
        span.style.marginBottom = '1rem';
        span.innerHTML =
          '<strong>Warning:</strong> ' +
          result_count +
          ' results found.<br />Only the first 1000 results are used&hellip;please refine your query.';
        let parent = header.parentElement;
        let grandparent = parent.parentElement;
        Array.from(grandparent.getElementsByClassName('result-warning')).forEach(function (el) {
          el.remove();
        });
        grandparent.insertBefore(span, parent);
      }
    }

    // manually remove any edit pane results warning added previously
    function removeResultWarning() {
      let form = document.querySelector('[aria-label="Variable editor Form"]');
      let header = Array.from(form ? form.querySelectorAll('h3,h4,h5') : []).find(function (el) {
        return /^Preview\s/.test(el['innerText']);
      });
      if (header) {
        Array.from(header.parentElement.parentElement.getElementsByClassName('result-warning')).forEach(function (el) {
          el.remove();
        });
      }
    }
  }

  getAccountId() {
    return this.irondbType === 'standalone' ? '/' + this.accountId : '';
  }

  // this indicates whether we should ignore the Check UUID at the beginning of the the first segment in graphite-style queries.
  // (they always start with check UUIDs as the first segment if no query prefix is used)
  ignoreGraphiteUUIDs() {
    return !(this.queryPrefix || '').trim();
  }

  metricGraphiteQuery(query: string, doNotFollowLimit: boolean) {
    const ignoreUUIDs = this.ignoreGraphiteUUIDs();
    let queryUrl = '/' + this.queryPrefix;
    queryUrl = queryUrl + '/metrics/find?query=' + (ignoreUUIDs ? '*.' : '') + query + '&activity=0';
    return this.irondbSimpleRequest('GET', queryUrl, false, true, !doNotFollowLimit, true);
  }

  metricTagsQuery(query: string, allowEmptyWildcard = false, from?: number = null, to?: number = null) {
    if (query === '' || query === undefined || (!allowEmptyWildcard && query === 'and(__name:*)')) {
      return Promise.resolve({ data: [] });
    }
    let queryUrl = '/find' + this.getAccountId() + '/tags?query=';
    queryUrl = queryUrl + query;
    if (this.activityTracking && from && to) {
      log(() => 'metricTagsQuery() activityWindow = [' + from + ',' + to + ']');
      queryUrl += '&activity_start_secs=' + _.toInteger(from);
      queryUrl += '&activity_end_secs=' + _.toInteger(to);
    }
    log(() => 'metricTagsQuery() queryUrl = ' + queryUrl);
    return this.irondbSimpleRequest('GET', queryUrl, false, true);
  }

  // Used by metricFindQuery
  metricFindTagValsQuery(metricQuery: string, cat: string, from?: number = null, to: number = null) {
    let queryUrl = '/find' + this.getAccountId() + '/tag_vals?category=' + cat + '&query=' + metricQuery;
    if (this.activityTracking && from && to) {
      log(() => 'metricFindTagsQuery() activityWindow = [' + from + ',' + to + ']');
      queryUrl += '&activity_start_secs=' + _.toInteger(from);
      queryUrl += '&activity_end_secs=' + _.toInteger(to);
    }
    log(() => 'metricFindTagValsQuery() queryUrl = ' + queryUrl);
    return this.irondbSimpleRequest('GET', queryUrl, false, true, false);
  }

  metricTagValsQuery(encodedMetricName: string, cat: string, from?: number = null, to: number = null) {
    let queryUrl =
      '/find' + this.getAccountId() + '/tag_vals?category=' + cat + '&query=and(__name:' + encodedMetricName + ')';
    if (this.activityTracking && from && to) {
      log(() => 'metricTagsValsQuery() activityWindow = [' + from + ',' + to + ']');
      queryUrl += '&activity_start_secs=' + _.toInteger(from);
      queryUrl += '&activity_end_secs=' + _.toInteger(to);
    }
    log(() => 'metricTagValsQuery() queryUrl = ' + queryUrl);
    return this.irondbSimpleRequest('GET', queryUrl, false, true, false);
  }

  metricTagCatsQuery(encodedMetricName: string, from?: number = null, to: number = null) {
    let queryUrl = '/find' + this.getAccountId() + '/tag_cats?query=and(__name:' + encodedMetricName + ')&query=';
    if (this.activityTracking && from && to) {
      log(() => 'metricTagsCatsQuery() activityWindow = [' + from + ',' + to + ']');
      queryUrl += '&activity_start_secs=' + _.toInteger(from);
      queryUrl += '&activity_end_secs=' + _.toInteger(to);
    }
    log(() => 'metricTagCatsQuery() queryUrl = ' + queryUrl);
    return this.irondbSimpleRequest('GET', queryUrl, false, true, false);
  }

  testDatasource() {
    return this.metricTagsQuery('and(__name:ametric)')
      .then((res) => {
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
      .catch((err) => {
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

  irondbSimpleRequest(method, url, isCaql = false, isFind = false, followLimit = true, isGraphite = false) {
    let baseUrl = this.url;
    const headers = { 'Content-Type': 'application/json' };

    if ('hosted' !== this.irondbType) {
      headers['X-Circonus-Account'] = this.accountId;
    }
    if ('hosted' === this.irondbType && !isCaql) {
      baseUrl = baseUrl + '/irondb' + (isGraphite ? '/graphite' : '');
      if (!isFind) {
        baseUrl = baseUrl + '/series_multi';
      }
      headers['X-Circonus-Auth-Token'] = this.apiToken;
      headers['X-Circonus-App-Name'] = this.appName;
    }
    headers['X-Snowth-Advisory-Limit'] = followLimit ? this.resultsLimit : 100;
    if ('standalone' === this.irondbType && !isCaql) {
      if (isGraphite) {
        baseUrl = baseUrl + '/graphite/' + this.accountId;
        if (!isFind) {
          baseUrl = baseUrl + '/' + this.queryPrefix + '/series_multi';
        }
      } else if (!isFind) {
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

  irondbRequest(optionsAll, followLimit = true) {
    const irondbOptions = optionsAll[0];
    log(() => 'irondbRequest() irondbOptions = ' + JSON.stringify(irondbOptions));
    const headers = { 'Content-Type': 'application/json' };
    let options: any = {};
    const queries = [];
    const queryResults = {};
    queryResults['data'] = [];
    queryResults['t'] = 'ts';

    if ('hosted' === this.irondbType) {
      headers['X-Circonus-Auth-Token'] = this.apiToken;
      headers['X-Circonus-App-Name'] = this.appName;
    } else {
      headers['X-Circonus-Account'] = this.accountId;
    }
    headers['X-Snowth-Advisory-Limit'] = followLimit ? this.resultsLimit : 100;
    headers['Accept'] = 'application/json';
    if (irondbOptions['graphite']['names'].length) {
      const ignoreUUIDs = this.ignoreGraphiteUUIDs();
      options = {};
      options.method = 'POST';
      options.url = this.url;
      if ('hosted' === this.irondbType) {
        options.url = options.url + '/irondb/graphite/series_multi';
      }
      if ('standalone' === this.irondbType) {
        options.url = options.url + '/graphite/' + this.accountId + '/' + this.queryPrefix + '/series_multi';
      }
      let start = irondbOptions['graphite']['start'];
      let end = irondbOptions['graphite']['end'];
      const interval = this.getRollupSpan(
        irondbOptions,
        start,
        end,
        false,
        irondbOptions['graphite']['names'][0]['leaf_data']
      );
      let ends_now = Date.now() - end * 1000 < 1000; // if the range ends within 1s, it's "now"
      start -= interval;
      end = ends_now && this.truncateNow ? end - interval : end + interval; // drop the last interval b/c that data is frequently incomplete
      // build new request params/data
      options.data = {
        start: start,
        end: end,
        interval: interval,
        names: [],
        activity: 0,
      };
      for (var obj of irondbOptions['graphite']['names']) {
        const name_matches = obj['leaf_name'].match(/^(\w{8}-\w{4}-\w{4}-\w{4}-\w{12})?\.?(.*)$/) || [null, '', ''];
        const new_obj = {
          leaf_name: ignoreUUIDs ? name_matches[2] : obj['leaf_name'],
          leaf_data: {
            egress_function: this.translateEgressForGraphite(obj['leaf_data']['egress_function'] || ''),
            name: name_matches[2],
            uuid: name_matches[1],
          },
        };
        options.data.names.push(new_obj);
      }
      // wrap up other request metadata
      options.name = 'fetch';
      options.headers = headers;
      if (this.basicAuth || this.withCredentials) {
        options.withCredentials = true;
      }
      if (this.basicAuth) {
        options.headers.Authorization = this.basicAuth;
      }
      options.paneltype = irondbOptions['graphite']['names'][0]['leaf_data']['format'] || 'ts';
      options.isCaql = false;
      options.isGraphite = true;
      options.retry = 1;
      queries.push(options);
    }
    if (irondbOptions['std']['names'].length) {
      const paneltype = irondbOptions['std']['names'][0]['leaf_data']['format'] || 'ts';
      for (let i = 0; i < irondbOptions['std']['names'].length; i++) {
        options = {};
        options.url = this.url;
        if ('hosted' === this.irondbType) {
          options.url = options.url + '/irondb';
        }
        options.method = 'POST';
        options.url = options.url + '/fetch';
        let start = irondbOptions['std']['start'];
        let end = irondbOptions['std']['end'];
        const interval = this.getRollupSpan(
          irondbOptions,
          start,
          end,
          false,
          irondbOptions['std']['names'][i]['leaf_data']
        );
        let ends_now = Date.now() - end * 1000 < 1000; // if the range ends within 1s, it's "now"
        start -= interval;
        end = ends_now && this.truncateNow ? end - interval : end + interval; // drop the last interval b/c that data is frequently incomplete
        const metricLabels = [];
        const check_tags = [];
        const reduce = paneltype === 'heatmap' ? 'merge' : 'pass';
        const streams = [];
        const data = { streams: streams };
        data['period'] = interval;
        data['start'] = start;
        data['count'] = Math.round((end - start) / interval);
        data['reduce'] = [{ label: '', method: reduce }];
        const metrictype = irondbOptions['std']['names'][i]['leaf_data']['metrictype'];
        metricLabels.push(irondbOptions['std']['names'][i]['leaf_data']['metriclabel']);
        check_tags.push(irondbOptions['std']['names'][i]['leaf_data']['check_tags']);
        const stream = {};
        let transform = irondbOptions['std']['names'][i]['leaf_data']['egress_function'];
        if (metrictype === 'histogram') {
          if (paneltype === 'heatmap') {
            transform = 'none';
          } else {
            transform = HISTOGRAM_TRANSFORMS[transform];
            const leafName = irondbOptions['std']['names'][i]['leaf_name'];
            let transformMode = 'default';
            if (isStatsdCounter(leafName)) {
              transformMode = 'statsd_counter';
            }
            irondbOptions['std']['names'][i]['leaf_data']['target']['hist_transform'] = transformMode;
          }
        }
        stream['transform'] = transform;
        stream['name'] = irondbOptions['std']['names'][i]['leaf_name'];
        stream['uuid'] = irondbOptions['std']['names'][i]['leaf_data']['uuid'];
        stream['kind'] = metrictype;
        streams.push(stream);
        log(() => 'irondbRequest() data = ' + JSON.stringify(data));
        options.data = data;
        options.metricLabels = metricLabels;
        options.check_tags = check_tags;

        options.name = 'fetch';
        options.headers = headers;
        if (this.basicAuth || this.withCredentials) {
          options.withCredentials = true;
        }
        if (this.basicAuth) {
          options.headers.Authorization = this.basicAuth;
        }
        options.paneltype = paneltype;
        options.format = irondbOptions['std']['names'][i]['leaf_data']['format'];
        options.isCaql = false;
        options.isGraphite = false;
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
        // render CAQL query
        const caqlQuery = this.templateSrv.replace(
          irondbOptions['caql']['names'][i].leaf_name,
          irondbOptions['scopedVars']
        );
        const minPeriod = (irondbOptions['caql']['names'][i].leaf_data || {}).min_period;
        const caqlQueryMP =
          (minPeriod && !/^#min_period=/.test(caqlQuery) ? '#min_period=' + minPeriod + ' ' : '') + caqlQuery; // prefix with min_period if min_period isn't in the query already
        // render start, end, & period
        let start = irondbOptions['caql']['start'];
        let end = irondbOptions['caql']['end'];
        const minPeriodMatches = caqlQueryMP.match(/#min_period=(\d+\w{0,2})\s/i);
        const minPeriodDirective = minPeriodMatches ? Math.round(parseDurationMs(minPeriodMatches[1]) / 1000) : null;
        const calculatedInterval = this.getRollupSpan(
          irondbOptions,
          start,
          end,
          true,
          irondbOptions['caql']['names'][i].leaf_data
        );
        // any min_period directive overrides the resolution here if it's lower and we're already at the min resolution
        const interval =
          minPeriodDirective && calculatedInterval === Math.round(IrondbDatasource.MIN_DURATION_MS_CAQL / 1000)
            ? Math.min(calculatedInterval, minPeriodDirective)
            : calculatedInterval;
        let ends_now = Date.now() - end * 1000 < 1000; // if the range ends within 1s, it's "now"
        start -= interval;
        end = ends_now && this.truncateNow ? end - interval : end + interval; // drop the last interval b/c that data is frequently incomplete
        options.url = options.url + '/caql_v1?format=DF4&start=' + start.toFixed(3);
        options.url = options.url + '&end=' + end.toFixed(3);
        options.url = options.url + '&period=' + interval;
        options.url = options.url + '&q=' + encodeURIComponent(caqlQueryMP);
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
        options.format = irondbOptions['caql']['names'][i]['leaf_data']['format'];
        options.refId = irondbOptions['caql']['names'][i]['leaf_data']['refId'];
        queries.push(options);
      }
    }
    if (irondbOptions['alert']['names'].length) {
      for (let i = 0; i < irondbOptions['alert']['names'].length; i++) {
        options = {};
        options.url = this.url;
        if ('hosted' === this.irondbType) {
          options.url = options.url + '/v2';
        }
        options.method = 'GET';
        options.url = options.url + '/alert';
        const alertQuery = this.templateSrv.replace(irondbOptions['alert']['names'][i], irondbOptions['scopedVars']);
        if (alertQuery.startsWith('alert_id:')) {
          options.url = options.url + '/' + alertQuery.split(':')[1];
        } else {
          options.url = options.url + '?search=' + encodeURIComponent(alertQuery) + '&size=1000';
        }
        options.headers = headers;
        options.retry = 1;
        options.start = irondbOptions['alert']['start'];
        options.end = irondbOptions['alert']['end'];
        options.isAlert = true;
        options.counts_only = irondbOptions['alert']['counts_only'];
        options.label = irondbOptions['alert']['labels'][i];
        options.local_filter = irondbOptions['alert']['local_filters'][i];
        options.local_filter_match = irondbOptions['alert']['local_filter_matches'][i];
        options.query_type = irondbOptions['alert']['query_type'];
        options.target = irondbOptions['alert']['target'];
        if (this.basicAuth || this.withCredentials) {
          options.withCredentials = true;
        }
        if (this.basicAuth) {
          options.headers.Authorization = this.basicAuth;
        }
        options.isCaql = false;
        options.refId = irondbOptions['refId'];
        queries.push(options);
      }
    }
    log(() => 'irondbRequest() queries = ' + JSON.stringify(queries));

    return Promise.all(
      queries.map((query, i, queries) =>
        this.datasourceRequest(query)
          .then((result) => {
            log(() => 'irondbRequest() query = ' + JSON.stringify(query));
            log(() => 'irondbRequest() result = ' + JSON.stringify(result));
            if (!_.isUndefined(query.isAlert)) {
              if (query.counts_only === false) {
                return this.enrichAlertsWithRules(result, query).then((results) => {
                  return this.convertAlertDataToGrafana(results);
                });
              } else {
                return this.countAlerts(result, query);
              }
            } else if (query.isGraphite) {
              return this.convertIrondbGraphiteDataToGrafana(result, query);
            } else {
              return this.convertIrondbDf4DataToGrafana(result, query);
            }
          })
          .then((result) => {
            const query = result.query;
            if (result['data'].constructor === Array) {
              for (let i = 0; i < result['data'].length; i++) {
                if ('target' in result && 'refId' in result['target']) {
                  result['data'][i]['target'] = result['target']['refId'];
                } else if (query.refId) {
                  result['data'][i]['target'] = query.refId;
                }
                queryResults['data'].push(result['data'][i]);
              }
            }
            if (result['data'].constructor === Object) {
              if ('target' in result && 'refId' in result['target']) {
                result['data']['target'] = result['target']['refId'];
              } else if (query.refId) {
                result['data']['target'] = query.refId;
              }
              queryResults['data'].push(result['data']);
            }
            if (null != result['t']) {
              queryResults['t'] = result['t'];
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

  filterMatches(pair, alert) {
    // support keys:
    //
    // alert_id
    // tag
    // acknowledged
    // severities
    if (pair.key === 'alert_id') {
      if (alert['_cid'].endsWith(pair.value)) {
        return true;
      }
      return false;
    }

    if (pair.key === 'acknowledged') {
      if (pair.value === 'true') {
        return alert['_acknowledgement'] !== null;
      } else if (pair.value === 'false') {
        return alert['_acknowledgement'] === null;
      } else {
        return true;
      }
    }

    if (pair.key === 'severities') {
      return pair.value.indexOf(alert['_severity']) !== -1;
    }

    if (pair.key === 'tag') {
      const tags: any[] = [];
      const cn = alert['_canonical_metric_name'];
      if (cn !== undefined && cn !== '') {
        const [n, stream_tags] = taglessNameAndTags(cn);
        const temptags = stream_tags.split(',');
        for (const tag of temptags) {
          const tagSep = tag.split(/:/g);
          let tagCat = tagSep.shift();
          if (!tagCat.startsWith('__') && tagCat !== '') {
            let tagVal = tagSep.join(':');
            tagCat = decodeTag(tagCat);
            tagVal = decodeTag(tagVal);
            tags.push({
              cat: tagCat,
              val: tagVal,
            });
          }
        }
      }
      for (const tag of alert['_tags']) {
        const tagSep = tag.split(/:/g);
        let tagCat = tagSep.shift();
        if (!tagCat.startsWith('__') && tagCat !== '') {
          let tagVal = tagSep.join(':');
          tagCat = decodeTag(tagCat);
          tagVal = decodeTag(tagVal);
          tags.push({
            cat: tagCat,
            val: tagVal,
          });
        }
      }

      let mmatch = false;
      for (const tag of tags) {
        const pp = pair.value.split(':');
        if (tag.cat === pp[0]) {
          if (micromatch.isMatch(tag.val, pp[1])) {
            return true;
          }
        }
      }
      return false;
    }
  }

  // apply filter_pairs to alert and return true if it doesn't match
  alertFiltered(filter_pairs, match, alert) {
    if (filter_pairs.length === 0) {
      return false; //nothing to filter on, everything matches
    }

    // AND case
    if (match === 'all') {
      for (const pair of filter_pairs) {
        if (!this.filterMatches(pair, alert)) {
          return true;
        }
      }
      return false;
    } else {
      for (const pair of filter_pairs) {
        if (this.filterMatches(pair, alert)) {
          return false;
        }
      }
      return true;
    }
    return true;
  }

  countAlerts(alerts, query) {
    const datatemp = alerts.data;
    let data = [];
    if (datatemp.constructor === Array) {
      data = datatemp;
    } else {
      data.push(datatemp);
    }
    const queries = [];

    const filter_pairs = [];
    const filter_match = query['local_filter_match'];
    if (query['local_filter'] !== undefined && query['local_filter'] !== '') {
      // parse the filter into match pairs
      // a filter is a series of field:value tokens separated by commas
      const tokens = query['local_filter'].split(',');
      for (const t of tokens) {
        const x = t.trim();
        const i = x.indexOf(':');
        if (i === -1) {
          continue;
        }
        const pair: any = {};
        pair.key = x.slice(0, i);
        pair.value = x.slice(i + 1);
        filter_pairs.push(pair);
      }
    }

    const countBuckets = {};

    if (query['query_type'] === 'range') {
      // fill the buckets minutely with zeroes
      let qs = query.start;
      qs = qs - (qs % 60);
      let qe = query.end;
      qe = qe - (qe % 60);
      for (let i = qs; i < qe; i += 60) {
        countBuckets[i.toString()] = 0;
      }
    }

    let count = 0;
    for (let i = 0; i < data.length; i++) {
      if (this.alertFiltered(filter_pairs, filter_match, data[i])) {
        continue;
      }
      const alert = data[i];
      let epoch = alert['_occurred_on'];

      if (query['query_type'] === 'range') {
        // floor the timestamp to its minute so we can bucket counts by minute
        epoch = epoch - (epoch % 60);

        if (epoch.toString() in countBuckets) {
          countBuckets[epoch.toString()] = countBuckets[epoch.toString()] + 1;
        }
      } else {
        count = count + 1;
      }
    }

    let label = 'Value';
    if (query['label']) {
      label = query['label'];
    }
    const timeField = getTimeField();
    timeField['refId'] = query['refId'];
    const valueField = getNumberField(label);
    const dataFrames: DataFrame[] = [];

    if (query['query_type'] === 'range') {
      for (let [epoch, count] of Object.entries(countBuckets)) {
        timeField.values.add(Number(epoch) * 1000);
        valueField.values.add(count);
      }

      dataFrames.push({
        length: timeField.values.length,
        fields: [timeField, valueField],
      });
    } else {
      valueField.values.add(count);
      dataFrames.push({
        length: 1,
        fields: [valueField],
      });
    }

    return {
      t: 'ts',
      data: dataFrames,
      target: query['target'],
      state: LoadingState.Done,
    };
  }

  // this also applies any local filters.
  enrichAlertsWithRules(alerts, query) {
    const datatemp = alerts.data;
    let data = [];
    if (datatemp.constructor === Array) {
      data = datatemp;
    } else {
      data.push(datatemp);
    }
    const queries = [];
    const enrich_results = [];

    const headers = { 'Content-Type': 'application/json' };
    if ('hosted' !== this.irondbType) {
      this.throwerr('Alert queries only supported on hosted irondb requests');
    }

    headers['X-Circonus-Auth-Token'] = this.apiToken;
    headers['X-Circonus-App-Name'] = this.appName;
    headers['Accept'] = 'application/json';

    const filter_pairs = [];
    const filter_match = query['local_filter_match'];
    if (query['local_filter'] !== undefined && query['local_filter'] !== '') {
      // parse the filter into match pairs
      // a filter is a series of field:value tokens separated by commas
      const tokens = query['local_filter'].split(',');
      for (const t of tokens) {
        const x = t.trim();
        const i = x.indexOf(':');
        if (i === -1) {
          continue;
        }
        const pair: any = {};
        pair.key = x.slice(0, i);
        pair.value = x.slice(i + 1);
        filter_pairs.push(pair);
      }
    }

    for (let i = 0; i < data.length; i++) {
      if (this.alertFiltered(filter_pairs, filter_match, data[i])) {
        continue;
      }

      let options: any = {};
      options.url = this.url;
      if ('hosted' === this.irondbType) {
        options.url = options.url + '/v2';
      }
      options.method = 'GET';
      options.url = options.url + data[i]['_rule_set'];
      options.headers = headers;
      options.retry = 1;
      options.alert_data = data[i];
      if (this.basicAuth || this.withCredentials) {
        options.withCredentials = true;
      }
      if (this.basicAuth) {
        options.headers.Authorization = this.basicAuth;
      }
      queries.push(options);
    }

    return Promise.all(
      queries.map((query) =>
        this.datasourceRequest(query)
          .then((result) => {
            log(() => 'enrichAlertsWithRules() query = ' + JSON.stringify(query));
            log(() => 'enrichAlertsWithRules() result = ' + JSON.stringify(result));
            return {
              alert: query.alert_data,
              rule: result.data,
            };
          })
          .catch((failed) => {
            // TODO: skipping ruleset groups for now, this would be hard to implement
            return {
              alert: query.alert_data,
              rule: null,
            };
          })
      )
    ).then((results) => {
      return results;
    });
  }

  static readonly MAX_DATAPOINTS_THRESHOLD = 1.5;
  static readonly MAX_EXACT_DATAPOINTS_THRESHOLD = 1.5;
  static readonly MIN_DURATION_MS_FETCH = 1;
  static readonly MIN_DURATION_MS_CAQL = 60 * 1000;
  static readonly ROLLUP_ALIGN_MS = _.map([1, 60, 3600, 86400], (x) => x * 1000);
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

  // force <1m rollups to be aligned along 10s increments
  static forceRollupAlignment(rollup_ms) {
    if (rollup_ms < 60000) {
      rollup_ms = Math.max(10000, Math.ceil(rollup_ms / 10000) * 10000);
    }
    return rollup_ms;
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
      return IrondbDatasource.forceRollupAlignment(exactMs) / 1000;
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
      let interval = nudgeInterval(IrondbDatasource.forceRollupAlignment(intervalMs) / 1000, -1);
      while ((end - start) / interval > options.maxDatapoints * IrondbDatasource.MAX_DATAPOINTS_THRESHOLD) {
        interval = nudgeInterval(interval + 0.001, 1);
      }
      log(() => `getRollupSpan() intervalMs = ${intervalMs} -> interval ${interval}`);
      return interval;
    }
  }

  translateEgressForGraphite(egressType: string) {
    const lookup = {
      automatic: 'default',
      count: 'count',
      sum: 'sum',
      average: 'avg',
      stddev: 'stddev',
      derive: 'derivative',
      derive_stddev: 'd_stddev',
      counter: 'counter',
      counter_stddev: 'c_stddev',
    };
    return lookup[egressType] || 'default';
  }

  filterMetricsByType(target, data) {
    // Don't mix text metrics with numeric and histogram results
    const metricFilter = 'text';
    return _.filter(data, (metric) => {
      const metricTypes = ((metric || {}).type || '').split(',');
      return !_.includes(metricTypes, metricFilter);
    });
  }

  buildFetchStream(target, result, i, scopedVars) {
    result[i]['leaf_data'] = {
      egress_function: 'average',
      uuid: result[i]['uuid'],
      paneltype: result[i]['target']['paneltype'],
      target: target,
    };
    let leafName = result[i]['metric_name'] || result[i]['name'];
    if (target.egressoverride !== 'average') {
      if (target.egressoverride === 'automatic') {
        if (isStatsdCounter(leafName)) {
          result[i]['leaf_data'].egress_function = 'counter';
        }
      } else {
        result[i]['leaf_data'].egress_function = target.egressoverride;
      }
    }
    let metriclabel = target.metriclabel;
    if (target.labeltype === 'default') {
      metriclabel = '%n | %t{*}';
    } else if (target.labeltype === 'name') {
      metriclabel = '%n';
    } else if (target.labeltype === 'cardinality') {
      metriclabel = '%n | %t-{*}';
    }
    metriclabel = metaInterpolateLabel(metriclabel || '', result, i);
    metriclabel = this.templateSrv.replace(metriclabel, scopedVars);
    result[i]['leaf_data'].metriclabel = metriclabel;
    result[i]['leaf_data'].check_tags = result[i].check_tags;
    if (target.rolluptype !== 'automatic' && !_.isEmpty(target.metricrollup)) {
      result[i]['leaf_data'].rolluptype = target.rolluptype;
      result[i]['leaf_data'].metricrollup = target.metricrollup;
    }
    result[i]['leaf_data'].metrictype = result[i]['type'];
    if ('graphite' === target.querytype && 'hosted' === this.irondbType) {
      leafName = this.queryPrefix + leafName;
    }
    return { leaf_name: leafName, leaf_data: result[i]['leaf_data'] };
  }

  buildAlertFetchStream(target, result, i) {
    result[i]['leaf_data'] = {
      target: target,
    };
    const metricName = result[i]['metric_name'];
    const check_uuid = result[i]['uuid'];
    let check_id = undefined;
    for (const tag of result[i]['check_tags']) {
      const ts = splitTags(tag);
      if (!_.isUndefined(ts['__check_id'])) {
        check_id = ts['__check_id'];
        break;
      }
    }
    const active = target.alert_state === 'active';
    let leafName = '(metric:' + metricName + ')';
    if (!_.isUndefined(check_id)) {
      leafName = leafName + '(check_id:' + check_id + ')';
    }
    if (active) {
      leafName = leafName + '(active:1)';
    }
    return { leaf_name: leafName, leaf_data: result[i]['leaf_data'] };
  }

  buildFetchParamsAsync(cleanOptions, target, start, end) {
    const rawQuery = this.templateSrv.replace(target['query'], cleanOptions['scopedVars']);
    const isGraphite = 'graphite' === target.querytype;
    const queryFn = isGraphite ? this.metricGraphiteQuery : this.metricTagsQuery;

    return queryFn
      .call(this, rawQuery, false, start, end)
      .then((result) => {
        result.data = this.filterMetricsByType(target, result.data);
        for (let i = 0; i < result.data.length; i++) {
          result.data[i]['target'] = target;
        }
        return result.data;
      })
      .then((result) => {
        for (let i = 0; i < result.length; i++) {
          cleanOptions[isGraphite ? 'graphite' : 'std']['names'].push(
            this.buildFetchStream(target, result, i, cleanOptions['scopedVars'])
          );
        }
        return cleanOptions;
      });
  }

  buildAlertQueryAsync(cleanOptions, target, start, end) {
    let rawQuery = this.templateSrv.replace(target['query'], cleanOptions['scopedVars']);
    if (target['alert_id'] !== '') {
      rawQuery = 'alert_id:' + this.templateSrv.replace(target['alert_id'], cleanOptions['scopedVars']);
    }
    cleanOptions['alert']['names'].push(rawQuery);
    cleanOptions['alert']['local_filters'].push(
      this.templateSrv.replace(target['local_filter'], cleanOptions['scopedVars'])
    );
    cleanOptions['alert']['local_filter_matches'].push(target['local_filter_match']);
    cleanOptions['alert']['counts_only'] = target.querytype === 'alert_counts';
    cleanOptions['alert']['query_type'] = target['alert_count_query_type'];
    cleanOptions['alert']['labels'].push(this.templateSrv.replace(target['metriclabel'], cleanOptions['scopedVars']));
    cleanOptions['alert']['target'] = target;
  }

  buildIrondbParamsAsync(options) {
    const cleanOptions = {};
    const start = new Date(options.range.from).getTime() / 1000;
    const end = new Date(options.range.to).getTime() / 1000;
    const intervalMs = Math.round((options.range.to.valueOf() - options.range.from.valueOf()) / options.maxDataPoints);

    cleanOptions['scopedVars'] = options.scopedVars;
    cleanOptions['meta'] = options.meta;
    cleanOptions['refId'] = options.refId;
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
    cleanOptions['graphite'] = {};
    cleanOptions['graphite']['start'] = start;
    cleanOptions['graphite']['end'] = end;
    cleanOptions['graphite']['names'] = [];
    cleanOptions['alert'] = {};
    cleanOptions['alert']['names'] = [];
    cleanOptions['alert']['start'] = start;
    cleanOptions['alert']['end'] = end;
    cleanOptions['alert']['local_filters'] = [];
    cleanOptions['alert']['local_filter_matches'] = [];
    cleanOptions['alert']['labels'] = [];

    const targets = _.reject(options.targets, (target) => {
      const reject =
        target.hide ||
        (target['query'] === undefined && target['alert_id'] === undefined) ||
        (target['query'].length === 0 && target['alert_id'].length === 0);
      return reject;
    });

    if (!targets.length) {
      return {};
    }

    const promises = targets.map((target) => {
      if (target.isCaql || target.querytype === 'caql') {
        cleanOptions['caql']['names'].push({
          leaf_name: target['query'],
          leaf_data: {
            rolluptype: target.rolluptype,
            metricrollup: target.metricrollup,
            format: target.format,
            refId: target.refId,
            min_period: target.min_period || this.caqlMinPeriod,
          },
        });
        cleanOptions['refId'] = target.refId;
        return Promise.resolve(cleanOptions);
      } else if (target.querytype === 'alerts' || target.querytype === 'alert_counts') {
        return this.buildAlertQueryAsync(cleanOptions, target, start, end);
      } else {
        return this.buildFetchParamsAsync(cleanOptions, target, start, end);
      }
    });

    return Promise.all(promises)
      .then((result) => {
        return cleanOptions;
      })
      .catch((err) => {
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
    const check_tags = query.check_tags || [];
    const data = result.data.data;
    const meta = result.data.meta;
    const cleanData = [];
    const st = result.data.head.start;
    const period = result.data.head.period;
    const error = result.data.head.error as any[];
    const format = query.format || 'ts';

    if (!_.isEmpty(error)) {
      throw new Error(error.join('\n'));
    }
    if (!data || data.length === 0) {
      return { data: cleanData };
    }
    log(() => 'Format: ' + format);

    if (format === 'table') {
      // to tabulate we need to invert the data that comes back and iterate
      // values for each return instead of each return then values.
      // we use the first result record to fill the timeField
      // because we are guaranteed to have the same number of records
      // across all the results due to how irondb works.
      const timeField = getTimeField();
      timeField['refId'] = query['refId'];
      const labelFields = new Set<MutableField>();
      const valueFields = new Set<MutableField>();
      const all_labels = {};
      const all_values = {};

      for (let i = 0; i < data[0].length; i++) {
        const ts = (st + i * period) * 1000;
        if (ts < query.start * 1000) {
          continue;
        }

        for (let si = 0; si < data.length; si++) {
          // first we add a timeField entry for each result.
          // this is in case tag values differ.
          log(() => 'convertIrondbDf4DataToGrafana(table) ts: ' + ts);
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
            } else {
              tags.push.apply(tags, check_tags[si]);
            }
          }
          log(() => 'convertIrondbDf4DataToGrafana(table) name: ' + lname + ', tags: ' + tags);
          if (tags !== undefined) {
            for (const tag of tags) {
              const tagSep = tag.split(/:/g);
              let tagCat = tagSep.shift();
              let tagVal = tagSep.join(':');
              if (!tagCat.startsWith('__')) {
                tagCat = decodeTag(tagCat);
                tagVal = decodeTag(tagVal);
                if (!all_labels[tagCat]) {
                  const lfield = {
                    name: tagCat,
                    config: { filterable: false },
                    type: FieldType.other,
                    refId: query.refId,
                    values: new ArrayVector(),
                  };
                  all_labels[tagCat] = lfield;
                  labelFields.add(lfield);
                }
                const lfield = all_labels[tagCat];
                lfield.values.add(tagVal);
              }
            }
          }
          if (!all_values[lname]) {
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
            all_values[lname] = vfield;
            valueFields.add(vfield);
          }
          const vfield = all_values[lname];
          if (data[si][i] !== null && data[si][i].constructor === Number) {
            vfield.values.add(data[si][i]);
          } else {
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

    const dataFrames: DataQueryResponseData[] = [];

    // Only supports one histogram.. So sad.
    const lookaside = {};

    for (let si = 0; si < data.length; si++) {
      const dummy = name + ' [' + (si + 1) + ']';
      const tname = meta[si] ? meta[si].label : dummy;
      const explicitTags = tname.match(/\|ST\[[^\]]*\]/) != null;
      let lname = taglessName(tname);
      let tags = meta[si].tags;
      const metricLabel = metricLabels[si];
      if (_.isString(metricLabel)) {
        lname = metricLabel;
      }
      log(() => 'convertIrondbDf4DataToGrafana() tags: ' + tags);
      const labels = {};

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
            decoded_tags.push(tagCat + ':' + tagVal);
          }
        }
      }
      lname = decodeTagsInLabel(lname);
      let dname = lname;
      if (decoded_tags.length > 0 && explicitTags) {
        dname = dname + ' { ' + decoded_tags.join(', ') + ' }';
      }

      let timeField = getTimeField();
      timeField['refId'] = query.refId;
      const numericValueField = {
        name: TIME_SERIES_VALUE_FIELD_NAME,
        type: FieldType.number,
        config: {
          displayName: dname,
        },
        refId: query.refId,
        labels: labels,
        values: new ArrayVector<number>(),
      };

      log(() => 'convertIrondbDf4DataToGrafana() Labels: ' + JSON.stringify(labels));
      for (let i = 0; i < data[si].length; i++) {
        if (data[si][i] === null) {
          continue;
        }
        const ts = (st + i * period) * 1000;
        if (ts < query.start * 1000) {
          continue;
        }

        if (data[si][i].constructor === Number) {
          timeField.values.add(ts);
          numericValueField.values.add(data[si][i]);
        } else if (data[si][i].constructor === Object) {
          for (let vstr in data[si][i]) {
            const cnt = data[si][i][vstr];
            const v = parseFloat(vstr);
            vstr = v.toString();
            const tsstr = ts.toString();
            if (_.isUndefined(lookaside[vstr])) {
              lookaside[vstr] = { target: vstr, title: vstr, tags: labels, datapoints: [], _ts: {} };
              dataFrames.push(lookaside[vstr]);
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
      if (numericValueField.values.length > 0) {
        dataFrames.push({
          length: timeField.values.length,
          fields: [timeField, numericValueField],
        });
      }
    }
    return {
      data: dataFrames,
      query: query,
    };
  }

  convertIrondbGraphiteDataToGrafana(result, query) {
    var data = result.data;
    var cleanData = [];

    var timestamp, origDatapoint, datapoint;

    if (!data || !data.series) {
      return { data: cleanData };
    }
    if (data.series && data.step && data.from && data.to) {
      /* Report values in millisecs */
      data.step *= 1000;
      data.from *= 1000;
      data.to *= 1000;
      for (var name in data.series) {
        timestamp = data.from - data.step;
        origDatapoint = data.series[name];
        datapoint = [];
        cleanData.push({
          target: name,
          datapoints: datapoint,
        });
        for (var i = 0; i < origDatapoint.length; i++) {
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

  // an alert looks like this:

  //   {
  //   "_cid": "/alert/48145680",
  //   "_acknowledgement": null,
  //   "_alert_url": "https://mlb-infrastructure.circonus.com/fault-detection/alerts/48145680",
  //   "_broker": "/broker/2761",
  //   "_check": "/check/283849",
  //   "_check_name": "AMQ - legacy 02 npd activemq",
  //   "_cleared_on": null,
  //   "_cleared_value": null,
  //   "_maintenance": [
  //     "/maintenance/169927",
  //     "/maintenance/167993",
  //     "/maintenance/167992",
  //     "/maintenance/167991",
  //     "/maintenance/167575",
  //     "/maintenance/167574",
  //     "/maintenance/167573",
  //     "/maintenance/166899",
  //     "/maintenance/166898",
  //     "/maintenance/166839",
  //     "/maintenance/166838",
  //     "/maintenance/171161",
  //     "/maintenance/161011",
  //     "/maintenance/161010",
  //     "/maintenance/160774",
  //     "/maintenance/160773",
  //     "/maintenance/159757"
  //   ],
  //   "_metric_link": null,
  //   "_metric_name": "QueueSize",
  //   "_canonical_metric_name": "QueueSize|ST[brokerName:Internal_ActiveMQ_Broker,destinationName:lookup.background.job.topic.qa,destinationType:Queue,host:activemq02-internal.legacy.us-east4.bdatasf-gcp-npd.mlbinfra.net,type:Broker]",
  //   "_signature": "8f6126f5-3be4-4324-9831-ce468bef21e7`QueueSize|ST[brokerName:Internal_ActiveMQ_Broker,destinationName:lookup.background.job.topic.qa,destinationType:Queue,host:activemq02-internal.legacy.us-east4.bdatasf-gcp-npd.mlbinfra.net,type:Broker]",
  //   "_metric_notes": "{\"notes\":\"AMQ QueueSize has gotten too large, check subscribers\"}",
  //   "_occurred_on": 1609958123,
  //   "_rule_set": "/rule_set/268647",
  //   "_severity": 1,
  //   "_tags": [
  //     "category:partner",
  //     "env:npd",
  //     "service:amq"
  //   ],
  //   "_value": "1091"
  // }

  // and the `rule` field will look like:

  // {
  //   "derive": "average",
  //   "_cid": "/rule_set/268647",
  //   "metric_name": "QueueSize",
  //   "check": "/check/0",
  //   "metric_type": "numeric",
  //   "tags": [],
  //   "_host": null,
  //   "notes": "AMQ QueueSize has gotten too large, check subscribers",
  //   "lookup_key": null,
  //   "name": null,
  //   "parent": null,
  //   "rules": [
  //     {
  //       "severity": 1,
  //       "criteria": "max value",
  //       "wait": 0,
  //       "windowing_duration": 120,
  //       "value": "1000",
  //       "windowing_min_duration": 0,
  //       "windowing_function": "average"
  //     }
  //   ],
  //   "link": null,
  //   "filter": "and(service:amq,not(env:prod),not(host:activemq*-internal.sportradar.us-east4.bdatasf-gcp-npd.mlbinfra.net))",
  //   "contact_groups": {
  //     "1": [
  //       "/contact_group/5738"
  //     ],
  //     "3": [],
  //     "5": [],
  //     "4": [],
  //     "2": []
  //   }
  // }

  convertAlertDataToGrafana(enrich_results) {
    const cleanData = [];

    if (_.isUndefined(enrich_results) || enrich_results.length === 0) {
      return { data: cleanData };
    }

    const dataFrames: DataFrame[] = [];

    for (let si = 0; si < enrich_results.length; si++) {
      const timeField = getTimeField();
      const alternateTimeField = getTimeField('alert_timestamp');
      const labelFields = new Set<MutableField>();
      const valueFields = new Set<MutableField>();
      const all_labels = {};
      const all_values = {};
      const fields = {
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

      const specialFields = {
        _signature: getTextField('check_uuid'),
        _canonical_metric_name: getTextField('metric_name'),
        _metric_name: 1,
        _tags: 1,
      };

      const thresholdFields = {
        threshold_1: getNumberField('threshold_1'),
        threshold_2: getNumberField('threshold_2'),
        threshold_3: getNumberField('threshold_3'),
        threshold_4: getNumberField('threshold_4'),
        threshold_5: getNumberField('threshold_5'),
      };

      const alert = enrich_results[si]['alert'];
      const rule = enrich_results[si]['rule'];
      const tags: TagSet = {};

      for (const key in alert) {
        if (key === '_occurred_on') {
          const epoch = alert[key];
          timeField.values.add(epoch * 1000); // to milliseconds
          alternateTimeField.values.add(epoch * 1000);
          // also create a time window 30 minutes before the alert up to 30 mins after the  cleared_on timestamp
          // if it's not a cleared alert, use an 30 mins after the alert timestamp as the window (or now if it's recent)
          const before = epoch - 1800;
          const cleared = alert['_cleared_on'];
          let after = epoch + 1800;
          if (cleared !== null && cleared !== undefined) {
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
          if (cleared !== null && cleared !== undefined) {
            state.values.add('OK');
          } else {
            state.values.add('ALERTING');
          }
        } else if (key === '_cid') {
          const cid = alert[key];
          fields[key].values.add(cid.replace('/alert/', ''));
          valueFields.add(fields[key]);
        } else if (key === '_cleared_on') {
          const epoch = alert[key];
          if (epoch !== null) {
            fields[key].values.add(epoch * 1000);
          } else {
            fields[key].values.add(null);
          }
          if (!all_values[key]) {
            all_values[key] = fields[key];
            valueFields.add(fields[key]);
          }
        } else if (fields[key] !== undefined) {
          let val = alert[key];
          if (key === '_cleared_value' && alert[key] === null) {
            val = '';
          }
          if ((key === '_value' && alert[key] === null) || alert[key] === '') {
            val = '';
          }
          fields[key].values.add(val);
          if (!all_values[key]) {
            all_values[key] = fields[key];
            valueFields.add(fields[key]);
          }
        } else if (specialFields[key] !== undefined) {
          if (key === '_signature') {
            const check_uuid = alert['_signature'].substring(0, alert['_signature'].indexOf('`'));
            specialFields[key].values.add(check_uuid);
            if (!all_values[key]) {
              all_values[key] = specialFields[key];
              valueFields.add(specialFields[key]);
            }
          } else if (key === '_canonical_metric_name') {
            const cn = alert[key];
            if (cn !== undefined && cn !== '') {
              const [n, stream_tags] = taglessNameAndTags(cn);
              specialFields[key].values.add(n);
              if (!all_values[key]) {
                all_values[key] = specialFields[key];
                valueFields.add(specialFields[key]);
              }

              const real_cn = getTextField('canonical_metric_name');
              valueFields.add(real_cn);
              real_cn.values.add(cn);

              const st = splitTags(stream_tags);
              mergeTags(tags, st);
            }
          } else if (key === '_metric_name' && alert['_canonical_metric_name'] === '') {
            const name = alert[key];
            specialFields['_canonical_metric_name'].values.add(name);
            if (!all_values[key]) {
              all_values[key] = specialFields['_canonical_metric_name'];
              valueFields.add(specialFields['_canonical_metric_name']);
            }
          } else if (key === '_tags') {
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
        if (i > 0) {
          combinedTags = combinedTags + '|';
        }
        if (tag !== '' && !tag.startsWith('__')) {
          i++;
          combinedTags = combinedTags + tag + ':' + tags[tag][0];

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
        const key = 'threshold_' + i;
        if (!all_values[key]) {
          all_values[key] = thresholdFields[key];
          valueFields.add(thresholdFields[key]);
        }
      }

      let done_map: any = {};
      if (!_.isUndefined(rule) && rule !== null && rule['metric_type'] === 'numeric') {
        // add up to 5 thresholds (one for each severity) based on severity from the `rule` object.
        let d = rule['derive'];
        if (d === 'mixed') {
          // loop to find the first rule with a windowing_function
          for (const r of rule['rules']) {
            d = r['windowing_function'];
            if (d !== undefined && d !== null) {
              break;
            }
          }
        }
        const deriveField = getTextField('function');
        valueFields.add(deriveField);
        deriveField.values.add(d);

        for (const r of rule['rules']) {
          const sev = r['severity'];
          if (sev === 0) {
            continue; // sev 0 means to clear the alert, ignore it for thresholding purposes.
          }
          const key = 'threshold_' + sev;
          thresholdFields[key].values.add(r['value']);
          done_map[sev] = 1;
        }
      }

      for (let i = 1; i < 6; i++) {
        if (done_map[i] === undefined) {
          const key = 'threshold_' + i;
          thresholdFields[key].values.add(-1);
        }
      }

      // add a text based description of the rules that are attached to this alert, separated by pipes
      //   "rules": [
      //     {
      //       "severity": 1,
      //       "criteria": "max value",
      //       "wait": 0,
      //       "windowing_duration": 120,
      //       "value": "1000",
      //       "windowing_min_duration": 0,
      //       "windowing_function": "average"
      //     }
      const ruleField = getTextField('rule_text');
      const notesField = getTextField('notes');
      valueFields.add(ruleField);
      valueFields.add(notesField);
      if (!_.isUndefined(rule) && rule !== null) {
        if (rule['notes'] !== null && rule['notes'].length > 0) {
          notesField.values.add(rule['notes']);
        } else {
          const mn = alert['metric_notes'];
          if (mn !== undefined && mn.length > 0) {
            // metric notes from the alert object is an embedded javascript string. eww.
            try {
              const notes = JSON.parse(mn);
              notesField.values.add(notes['notes']);
            } catch (err) {
              notesField.values.add('');
            }
          }
        }
        let text = '';
        let i = 0;
        for (const r of rule['rules']) {
          let winfunc = r['windowing_function'];
          let duration = '';
          if (winfunc === null) {
            winfunc = 'value';
          } else {
            duration = '(over ' + r['windowing_duration'] + ' seconds) ';
          }
          let t = 'if the ' + winfunc + ' ' + duration;
          if (r['criteria'] === 'on absence') {
            t += 'is absent for ' + r['value'] + ' seconds, ';
          } else if (r['criteria'] === 'max value') {
            t += 'is present and >= ' + r['value'] + ', ';
          } else if (r['criteria'] === 'min value') {
            t += 'is present and < ' + r['value'] + ', ';
          } else if (r['criteria'] === 'matches') {
            t += "is present and matches '" + r['value'] + "', ";
          } else if (r['criteria'] === 'does not match') {
            t += "is present and does not match '" + r['value'] + "', ";
          }
          if (i > 0) {
            t += "and prior rules aren't triggered, ";
          }
          if (r['severity'] === 0) {
            t += 'clear the alert.';
          } else {
            t += 'trigger a sev ' + r['severity'] + ' alert and wait ' + r['wait'] + ' minutes before notifying.';
          }
          if (i > 0) {
            text += '|';
          }
          text += t;
          i++;
        }

        ruleField.values.add(text);
      } else {
        ruleField.values.add('');
        notesField.values.add('');
      }

      dataFrames.push({
        length: timeField.values.length,
        fields: [timeField, alternateTimeField, ...labelFields, ...valueFields],
      });
    }

    return {
      t: 'table',
      data: dataFrames,
      state: LoadingState.Done,
    };
  }
}

function getTimeField(name = TIME_SERIES_TIME_FIELD_NAME): MutableField {
  return {
    name: name,
    type: FieldType.time,
    config: {},
    values: new ArrayVector<number>(),
  };
}

function getNumberField(name = TIME_SERIES_VALUE_FIELD_NAME): MutableField {
  return {
    name: name,
    type: FieldType.number,
    config: {},
    values: new ArrayVector<number>(),
  };
}

function getTextField(name): MutableField {
  return {
    name: name,
    type: FieldType.string,
    config: {},
    values: new ArrayVector<string>(),
  };
}

function getOtherField(name): MutableField {
  return {
    name: name,
    type: FieldType.other,
    config: {},
    values: new ArrayVector(),
  };
}
