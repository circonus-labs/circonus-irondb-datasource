
import _ from 'lodash';
import memoize from 'memoizee';
import {metaInterpolateLabel,decodeNameAndTags} from './irondb_query';

export default class IrondbDatasource {
  id: number;
  name: string;
  type: string;
  accountId: number;
  irondbType: string;
  resultsLimit: string;
  url: any;
  apiToken: string;
  appName: string;
  supportAnnotations: boolean;
  supportMetrics: boolean;
  basicAuth: any;
  withCredentials: any;
  datasourceRequest: (options: any) => any;

  static readonly DEFAULT_CACHE_ENTRIES = 128;
  static readonly DEFAULT_CACHE_TIME_MS = 60000;

  static requestCacheKey(requestOptions) {
    var httpMethod = requestOptions.method;
    if (httpMethod === "GET") {
      return requestOptions.url;
    }
    else if (httpMethod === "POST") {
      return JSON.stringify(requestOptions.data);
    }
    throw new Error("Unsupported HTTP method type: " + (httpMethod || "?"));
  }

  static setupCache(instanceSettings, backendSrv) {
    var doRequest = function(options) {
      //console.log("cache miss " + IrondbDatasource.requestCacheKey(options));
      return backendSrv.datasourceRequest(options);
    }
    var useCaching = (instanceSettings.jsonData || {}).useCaching || true;
    if (!useCaching) {
      //console.log("caching disabled " + useCaching);
      return doRequest;
    }
    var cacheOpts = {
      max: IrondbDatasource.DEFAULT_CACHE_ENTRIES,
      maxAge: IrondbDatasource.DEFAULT_CACHE_TIME_MS,
      promise: true,
      normalizer: function(args) {
        var requestOptions = args[0];
        var cacheKey = IrondbDatasource.requestCacheKey(requestOptions);
        //console.log("cache lookup " + cacheKey);
        return cacheKey;
      }
    };
    //console.log("caching enabled");
    return memoize(doRequest, cacheOpts);
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
    this.url = instanceSettings.url;
    this.supportAnnotations = false;
    this.supportMetrics = true;
    this.appName = 'Grafana';
    this.datasourceRequest = IrondbDatasource.setupCache(instanceSettings, backendSrv);
  }

  query(options) {
    //console.log(`options (query): ${JSON.stringify(options, null, 2)}`);
    var scopedVars = options.scopedVars;

    if (_.isEmpty(options['targets'][0])) {
      return this.$q.when({ data: [] });
    }

    return Promise.all([this._buildIrondbParams(options)]).then( irondbOptions => {
      if (_.isEmpty(irondbOptions[0])) {
        return this.$q.when({ data: [] });
      }
      return this._irondbRequest(irondbOptions[0]);
    }).then( queryResults => {
      if (queryResults['data'].constructor === Array) {
        queryResults['data'].sort( (a, b): number => {
          return a['target'].localeCompare(b['target']);
        });
      }
      //console.log(`queryResults (query): ${JSON.stringify(queryResults, null, 2)}`);
      return queryResults;
    }).catch( err => {
      if (err.status !== 0 || err.status >= 300) {
        this._throwerr(err);
      }
    });
  }

  annotationQuery(options) {
    throw new Error("Annotation Support not implemented yet.");
  }

  metricFindQuery(query: string, options: any) {
    var variable = options.variable;
    if (query !== "" && variable !== undefined) {
      var metricName = query;
      var tagCat = variable.tagValuesQuery;
      if (variable.useTags && tagCat !== "") {
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
    return this.irondbType === "standalone" ? ("/" + this.accountId) : "";
  }

  metricTagsQuery(query: string, allowEmptyWildcard: boolean = false) {
    if (query === "" || query === undefined || (!allowEmptyWildcard && query === "and(__name:*)")) {
      return Promise.resolve({ data: [] });
    }
    var queryUrl = '/find' + this.getAccountId() + '/tags?query=';
    queryUrl = queryUrl + query;
    //console.log(queryUrl);
    return this._irondbSimpleRequest('GET', queryUrl, false, true);
  }

  metricTagCatsQuery(query: string) {
    var queryUrl = '/find' + this.getAccountId() + '/tag_cats?query=';
    queryUrl = queryUrl + 'and(__name:' + query + ')';
    //console.log(queryUrl);
    return this._irondbSimpleRequest('GET', queryUrl, false, true, false);
  }

  metricTagValsQuery(query: string, cat: string) {
    var queryUrl = '/find' + this.getAccountId() + '/tag_vals?category=' + cat + '&query=';
    queryUrl = queryUrl + 'and(__name:' + query + ')';
    //console.log(queryUrl);
    return this._irondbSimpleRequest('GET', queryUrl, false, true, false);
  }

  testDatasource() {
    return this.metricTagsQuery('and(__name:ametric)').then( res => {
      let error = _.get(res, 'results[0].error');
      if (error) {
        return {
          status: 'error',
          message: error,
          title: 'Error'
        }
      }
      return {
        status: 'success',
        message: 'Data source is working',
        title: 'Success'
      };
    }).catch( err => {
      var message = (err.data || {}).message;
      if (message === undefined) {
        message = "Error " + (err.status || "") + " " + (err.statusText || "");
      }
      return {
        status: 'error',
        message: message,
        title: 'Error'
      };
    });
  }

  _throwerr(err) {
    //console.log(err);
    if (err.data && err.data.error) {
      throw new Error('Circonus IRONdb Error: ' + err.data.error);
    } else if (err.data && err.data.user_error) {
      var name = err.data.method || 'IRONdb';
      var suffix = ''
      if (err.data.user_error.query) suffix = ' in"' + err.data.user_error.query + '"';
      throw new Error(name + ' error: ' + err.data.user_error.message + suffix);
    } else if (err.statusText === 'Not Found') {
      throw new Error('Circonus IRONdb Error: ' + err.statusText);
    } else if(err.statusText && err.status > 0)  {
      throw new Error('Network Error: ' + err.statusText + '(' + err.status + ')');
    } else {
      throw new Error('Error: ' + (err ? err.toString() : "unknown"));
    }
  }
  _irondbSimpleRequest(method, url, isCaql = false, isFind = false, isLimited = true) {
    var baseUrl = this.url;
    var headers = { "Content-Type": "application/json" };

    if ('hosted' != this.irondbType) {
      headers['X-Circonus-Account'] = this.accountId;
    }
    if ('hosted' == this.irondbType && !isCaql) {
      baseUrl = baseUrl + '/irondb';
      if (!isFind) {
        baseUrl = baseUrl + '/series_multi';
      }
      headers['X-Circonus-Auth-Token'] = this.apiToken;
      headers['X-Circonus-App-Name'] = this.appName;
    }
    headers['X-Snowth-Advisory-Limit'] = isLimited ? this.resultsLimit : "none";
    if ('standalone' == this.irondbType && !isCaql) {
      if (!isFind) {
        baseUrl = baseUrl + '/series_multi';
      }
    }
    if (isCaql && !isFind) {
      baseUrl = baseUrl + '/extension/lua/caql_v1';
    }

    var options: any = {
      method: method,
      url: baseUrl + url,
      headers: headers,
      retry: 1,
    };

    //console.log(`simple query (_irondbSimpleRequest): ${JSON.stringify(options, null, 2)}`);
    return this.datasourceRequest(options);
  }

  _irondbRequest(irondbOptions, isCaql = false, isLimited = true) {
    //console.log(`irondbOptions (_irondbRequest): ${JSON.stringify(irondbOptions, null, 2)}`);
    var headers = { "Content-Type": "application/json" };
    var options: any = {};
    var queries = [];
    var queryResults = {};
    queryResults['data'] = [];

    if ('hosted' == this.irondbType) {
      headers['X-Circonus-Auth-Token'] = this.apiToken;
      headers['X-Circonus-App-Name'] = this.appName;
    } else {
      headers['X-Circonus-Account'] = this.accountId;
    }
    headers['X-Snowth-Advisory-Limit'] = isLimited ? this.resultsLimit : "none";
    headers['Accept'] = 'application/json';
    if (irondbOptions['std']['names'].length) {
      var paneltype = irondbOptions['std']['names'][0]['leaf_data']['paneltype'] || "Graph";
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
      var metricLabels = [];
      var interval = irondbOptions['std']['interval'];
      var start = irondbOptions['std']['start'];
      var end = irondbOptions['std']['end'];
      start = Math.floor(start - (start % interval));
      end = Math.floor(end - (end % interval));
      var reduce = paneltype === "Heatmap" ? 'merge' : 'pass';
      var streams = [];
      var data = { 'streams': streams };
      data['period'] = interval;
      data['start'] = start;
      data['count'] = Math.round((end - start) / interval);
      data['reduce'] = [{ 'label': '', 'method': reduce }];
      for (var i = 0; i < irondbOptions['std']['names'].length; i++) {
        var metrictype = paneltype === "Heatmap" ? "histogram" : "numeric";
        metricLabels.push(irondbOptions['std']['names'][i]['leaf_data']['metriclabel']);

        var stream = {};
        var transform = irondbOptions['std']['names'][i]['leaf_data']['egress_function'];
        transform = paneltype === "Heatmap" ? 'none' : transform;
        stream['transform'] = transform;
        stream['name'] = irondbOptions['std']['names'][i]['leaf_name'];
        stream['uuid'] = irondbOptions['std']['names'][i]['leaf_data']['uuid'];
        stream['kind'] = metrictype;
        streams.push(stream);
      }
      //console.log(JSON.stringify(data));
      options.data = data;
      options.name = "fetch";
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
      for (var i = 0; i < irondbOptions['caql']['names'].length; i++) {
        options = {};
        options.url = this.url;
        if ('hosted' == this.irondbType) {
          options.url = options.url + '/irondb';
        }
        options.method = 'GET';
        options.url = options.url + '/extension/lua';
        if ('hosted' == this.irondbType) {
          options.url = options.url + '/public';
        }
        var caqlQuery = this.templateSrv.replace(irondbOptions['caql']['names'][i]);
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
    //console.log(`queries (_irondbRequest): ${JSON.stringify(queries, null, 2)}`);

    return Promise.all(queries.map(query =>
      this.datasourceRequest(query).then( result => {
        //console.log(`query (_irondbRequest): ${JSON.stringify(query, null, 2)}`);
        //console.log(JSON.stringify(result));
        return this._convertIrondbDf4DataToGrafana(result, query);
      }).then( result => {
        if (result['data'].constructor === Array) {
          for (var i = 0; i < result['data'].length; i++) {
            queryResults['data'].push(result['data'][i]);
          }
        }
        if (result['data'].constructor === Object) {
          queryResults['data'].push(result['data']);
        }
        return queryResults;
      })
    )).then( result => {
      return queryResults;
    }).catch( err => {
      if (err.status !== 0 || err.status >= 300) {
        this._throwerr(err);
      }
    });
  }

  _buildIrondbParamsAsync(options) {
    var cleanOptions = {};
    var intervalRegex = /'(\d+)m'/gi;
    var i, target;
    var hasTargets = false;
    var start = (new Date(options.range.from)).getTime() / 1000;
    var end = (new Date(options.range.to)).getTime() / 1000;
    var hasWildcards = false;

    // Pick a reasonable period for CAQL
    // We assume will use something close the request interval
    // unless it would produce more than maxDataPoints / 8
    // CAQL analytics at one point per pixel is almost never what
    // someone will want.
    var estdp = Math.floor((end-start)*1000/options.intervalMs);
    if (estdp > options.maxDataPoints/2) estdp = options.maxDataPoints/2;
    var period = Math.ceil((end-start) / estdp);
    // The period is in the right realm now, force align to something
    // that will make it pretty.
    var align = [86400,3600,1800,1200,900,300,60,30,15,10,5,1];
    for (var j in align) {
      if(period > 1000*align[j]) {
        period = Math.floor(period / (1000*align[j])) * (1000*align[j]);
        break;
      }
    }
    if (period < 60) {
      period = 60;
    }
    else {
      period = period - (period % 60);
    }

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

    for (i = 0; i < options.targets.length; i++) {
      target = options.targets[i];
      if (target.hide) {
        continue;
      }
      hasTargets = true;
      if ( !target['isCaql'] && target['query'] && ( target['query'].includes('*') || target['query'].includes('?') || target['query'].includes('[') || target['query'].includes(']') || target['query'].includes('(') || target['query'].includes(')') || target['query'].includes('{') || target['query'].includes('}') || target['query'].includes(';') ) ) {
        hasWildcards = true;
      }
    }

    if (!hasTargets) {
      return {};
    }

    for (i = 0; i < options.targets.length; i++) {
      target = options.targets[i];
      if (target.hide || !target['query'] || target['query'].length == 0) {
        continue;
      }
      if (target.isCaql) {
        cleanOptions['caql']['names'].push(target['query']);
      }
    }

    if (target.isCaql) {
      /*for (i = 0; i < options.targets.length; i++) {
        target = options.targets[i];
        if (target.hide || !target['query'] || target['query'].length == 0) {
          continue;
        }
        if (!target.isCaql) {
          //console.log(`target['query'] (_buildIrondbParamsAsync): ${JSON.stringify(target['query'], null, 2)}`);
          if ('hosted' == this.irondbType) {
            cleanOptions['std']['names'].push(this.queryPrefix + target['query']);
          } else {
            cleanOptions['std']['names'].push(target['query']);
          }
        }
      }*/
      return cleanOptions;
    } else {
      var promises = options.targets.map(target => {
        //console.log("_buildIrondbParamsAsync() target " + JSON.stringify(target));
        var rawQuery = this.templateSrv.replace(target['query']);
        return this.metricTagsQuery(rawQuery).then( result => {
          // Don't mix numeric results with histograms and text metrics
          var metricFilter = "numeric";
          if (target['paneltype'] === "Heatmap") {
            metricFilter = "histogram";
          }
          result.data = _.filter(result.data, function(metric) {
            var metricTypes = metric.type.split(",");
            return _.includes(metricTypes, metricFilter);
          });
          for (var i = 0; i < result.data.length; i++) {
            result.data[i]['target'] = target;
          }
          return result.data;
        }).then( result => {
          for (var i = 0; i < result.length; i++) {
            if (result[i]['target'].hide) {
              continue;
            }
            if (!target.isCaql) {
              result[i]['leaf_data'] = {
                egress_function: 'average',
                uuid: result[i]['uuid'],
                paneltype: result[i]['target']['paneltype']
              };
              if (target.egressoverride !== "average") {
                result[i]['leaf_data'].egress_function = target.egressoverride;
              }
              var leaf_name = result[i]['metric_name'];
              if (target.labeltype !== "default") {
                var metriclabel = target.metriclabel;
                if (target.labeltype === "name") {
                  metriclabel = "%n";
                }
                else if (target.labeltype === "cardinality") {
                  metriclabel = "%n | %t-{*}";
                }
                metriclabel = metaInterpolateLabel(metriclabel, result, i);
                metriclabel = this.templateSrv.replace(metriclabel);
                result[i]['leaf_data'].metriclabel = metriclabel;
              }
              cleanOptions['std']['names'].push({ leaf_name: leaf_name, leaf_data: result[i]['leaf_data'] });
            }
          }
          return cleanOptions;
        });
      });

      return Promise.all(promises).then( result => {
        return cleanOptions;
      }).catch( err => {
        //console.log(`err (_buildIrondbParams): ${JSON.stringify(err, null, 2)}`);
        if (err.status !== 0 || err.status >= 300) {
        }
      });
      return cleanOptions;
    }
  }

  _buildIrondbParams(options) {
    var self = this;
    return new Promise( function(resolve, reject) {
      resolve(self._buildIrondbParamsAsync(options));
    });
  }

  _convertIrondbDf4DataToGrafana(result, query) {
    var name = query.name;
    var data = result.data.data;
    var meta = result.data.meta;
    var cleanData = [];
    var timestamp, origDatapoint, datapoint;
    var st = result.data.head.start;
    var cnt = result.data.head.count;
    var period = result.data.head.period;

    if (!data || data.length == 0) return { data: cleanData };
    // Only supports one histogram.. So sad.
    var lookaside = {}
    for (var si = 0; si < data.length; si++) {
      var dummy = name + " [" + (si+1) + "]";
      var lname = meta[si] ? meta[si].label : dummy;
      var metricLabel = query.metricLabels[si];
      if (_.isString(metricLabel)) {
        lname = metricLabel;
      }
      for (var i = 0; i < data[si].length; i++) {
        if (data[si][i] == null) continue;
        var ts = (st + (i*period)) * 1000;
        if(ts < query.start*1000) continue;
        if (data[si][i].constructor === Number) {
          if (cleanData[si] === undefined) {
            cleanData[si] = { target: lname, datapoints: [] };
          }
          cleanData[si].datapoints.push([ data[si][i], ts])
        }
        else if(data[si][i].constructor === Object) {
          for (var vstr in data[si][i]) {
            var cnt = data[si][i][vstr];
            var v = parseFloat(vstr);
            vstr = v.toString();
            var tsstr = ts.toString();
            if (lookaside[vstr] == null) {
              lookaside[vstr] = { target: vstr, datapoints: [], _ts: {} };
              cleanData.push(lookaside[vstr]);
            }
            if(lookaside[vstr]._ts[tsstr] == null) {
              lookaside[vstr]._ts[tsstr] = [ cnt, ts ];
              lookaside[vstr].datapoints.push(lookaside[vstr]._ts[tsstr]);
            } else {
              lookaside[vstr]._ts[tsstr][0] += cnt;
            }
          }
        }
      }
    }
    for (var i=0; i<cleanData.length; i++) {
      delete(cleanData[i]._ts);
    }
    return { data: cleanData };
  }

}
