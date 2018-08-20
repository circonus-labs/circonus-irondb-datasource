///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import _ from 'lodash';

export default class IrondbDatasource {
  id: number;
  name: string;
  type: string;
  accountId: number;
  irondbType: string;
  queryPrefix: string;
  url: any;
  apiToken: string;
  appName: string;
  supportAnnotations: boolean;
  supportMetrics: boolean;
  basicAuth: any;
  withCredentials: any;

  /** @ngInject */
  constructor(instanceSettings, private $q, private backendSrv, private templateSrv) {
    this.type = 'irondb';
    this.name = instanceSettings.name;
    this.id = instanceSettings.id;
    this.accountId = (instanceSettings.jsonData || {}).accountId;
    this.irondbType = (instanceSettings.jsonData || {}).irondbType;
    this.queryPrefix = (instanceSettings.jsonData || {}).queryPrefix;
    this.apiToken = (instanceSettings.jsonData || {}).apiToken;
    this.url = instanceSettings.url;
    this.supportAnnotations = false;
    this.supportMetrics = true;
    this.appName = 'Grafana';
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

  metricFindQuery(query: string) {
    var queryUrl = '/' + this.queryPrefix;
    queryUrl = queryUrl + '/metrics/find?query=' + query;
    return this._irondbSimpleRequest('GET', queryUrl, false, true);
  }

  testDatasource() {
    return this.metricFindQuery('*').then( res => {
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
      return {
        status: 'error',
        message: err.message,
        title: 'Error'
      };
    });
  }

  _throwerr(err) {
    if (err.data && err.data.error) {
      throw {
        message: 'Circonus IRONdb Error: ' + err.data.error,
        data: err.data,
        config: err.config,
      };
    } else if (err.data && err.data.user_error) {
      var name = err.data.method || 'IRONdb';
      var suffix = ''
      if (err.data.user_error.query) suffix = ' in"' + err.data.user_error.query + '"';
      throw {
        message: name + ' error: ' + err.data.user_error.message + suffix,
        data: err.data,
        config: err.config,
      };
    } else if (err.statusText === 'Not Found') {
      throw {
        message: 'Circonus IRONdb Error: ' + err.statusText,
        data: err.data,
        config: err.config,
      };
    } else if(err.statusText && err.status > 0)  {
      throw {
        message: 'Network Error: ' + err.statusText + '(' + err.status + ')',
        data: err.data,
        config: err.config,
      };
    } else {
      throw {
        message: 'Error: ' + (err ? err.toString() : "unknown"),
        err: err,
      };
    }
  }
  _irondbSimpleRequest(method, url, isCaql = false, isFind = false) {
    var baseUrl = this.url;
    var headers = { "Content-Type": "application/json" };

    if ('hosted' != this.irondbType) {
      headers['X-Circonus-Account'] = this.accountId;
    }
    if ('hosted' == this.irondbType && !isCaql) {
      baseUrl = baseUrl + '/irondb/graphite';
      if (!isFind) {
        baseUrl = baseUrl + '/series_multi';
      }
      headers['X-Circonus-Auth-Token'] = this.apiToken;
      headers['X-Circonus-App-Name'] = this.appName;
    }
    if ('standalone' == this.irondbType && !isCaql) {
      baseUrl = baseUrl + '/graphite/' + this.accountId;
      if (!isFind) {
        baseUrl = baseUrl + '/' + this.queryPrefix + '/series_multi';
      }
    }
    if (isCaql && !isFind) {
      baseUrl = baseUrl + '/extension/lua/caql_v1';
    }

    var options: any = {
      method: method,
      url: baseUrl + url,
      headers: headers,
    };

    //console.log(`simple query (_irondbSimpleRequest): ${JSON.stringify(options, null, 2)}`);
    return this.backendSrv.datasourceRequest(options);
  }

  _irondbRequest(irondbOptions, isCaql = false) {
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
    if (irondbOptions['std']['names'].length) {
      options = {};
      options.url = this.url;
      if ('hosted' == this.irondbType) {
        options.url = options.url + '/irondb';
        options.url = options.url + '/graphite/series_multi';
      }
      options.method = 'POST';
      if ('standalone' == this.irondbType) {
        options.url = options.url + '/graphite/' + this.accountId + '/' + this.queryPrefix + '/series_multi';
      }

      options.data = irondbOptions['std'];
      options.headers = headers;
      if (this.basicAuth || this.withCredentials) {
        options.withCredentials = true;
      }
      if (this.basicAuth) {
        options.headers.Authorization = this.basicAuth;
      }
      options.isCaql = false;
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
        options.url = options.url + '/caql_v1?format=DF4&start=' + irondbOptions['caql']['start'];
        options.url = options.url + '&end=' + irondbOptions['caql']['end'];
        options.url = options.url + '&period=' + irondbOptions['caql']['interval'];
        options.url = options.url + '&q=' + encodeURIComponent(irondbOptions['caql']['names'][i]);
        options.name = irondbOptions['caql']['names'][i];
        options.headers = headers;
        options.start = irondbOptions['caql']['start'];
        options.end = irondbOptions['caql']['end'];
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
      this.backendSrv.datasourceRequest(query).then( result => {
        //console.log(`query (_irondbRequest): ${JSON.stringify(query, null, 2)}`);
        var queryInterimResults;
        if (query['isCaql']) {
          queryInterimResults = this._convertIrondbCaqlDataToGrafana(result, query);
        } else {
          queryInterimResults = this._convertIrondbDataToGrafana(result);
        }
        return queryInterimResults;
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
    // unless it would produce more than maxDataPoints / 4
    // CAQL analytics at one point per pixel is almost never what
    // someone will want.
    var estdp = Math.floor((end-start)*1000/options.intervalMs);
    if (estdp > options.maxDataPoints/4) estdp = options.maxDataPoints/4;
    var period = Math.ceil((end-start) / estdp)
    // The period is in the right realm now, force align to something
    // that will make it pretty.
    var align = [86400,3600,1800,1200,900,300,60,30,15,10,5,1];
    for (var i in align) {
      if(period > 1000*align[i]) {
        period = Math.floor(period / (1000*align[i])) * (1000*align[i]);
        break;
      }
    }

    cleanOptions['std'] = {};
    cleanOptions['std']['start'] = start;
    cleanOptions['std']['end'] = end;
    cleanOptions['std']['names'] = [];
    cleanOptions['std']['interval'] = options.intervalMs / 1000;
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
      if ( !target['isCaql'] && ( target['query'].includes('*') || target['query'].includes('?') || target['query'].includes('[') || target['query'].includes(']') || target['query'].includes('(') || target['query'].includes(')') || target['query'].includes('{') || target['query'].includes('}') ) ) {
        hasWildcards = true;
      }
    }

    if (!hasTargets) {
      return {};
    }

    if (!hasWildcards) {
      for (i = 0; i < options.targets.length; i++) {
        target = options.targets[i];
        if (target.hide) {
          continue;
        }
        if (target.isCaql) {
          cleanOptions['caql']['names'].push(target['query']);
        } else {
          //console.log(`target['query'] (_buildIrondbParamsAsync): ${JSON.stringify(target['query'], null, 2)}`);
          if ('hosted' == this.irondbType) {
            cleanOptions['std']['names'].push(this.queryPrefix + target['query']);
          } else {
            cleanOptions['std']['names'].push(target['query']);
          }
        }
      }
      return cleanOptions;
    } else {
      var promises = options.targets.map(target => {
        return this.metricFindQuery(target['query']).then( result => {
          for (var i = 0; i < result.data.length; i++) {
            result.data[i]['target'] = target;
          }
          return result.data;
        }).then( result => {
          for (var i = 0; i < result.length; i++) {
            if (result[i]['target'].hide) {
              continue;
            }
            if (target.isCaql) {
              cleanOptions['caql']['names'].push(result[i]['name']);
            } else {
              if ('hosted' == this.irondbType) {
                cleanOptions['std']['names'].push(this.queryPrefix + result[i]['name']);
              } else {
                cleanOptions['std']['names'].push(result[i]['name']);
              }
            }
          }
          return cleanOptions;
        });
      });

      return Promise.all(promises).then( result => {
        return cleanOptions;
      }).catch( err => {
        console.log(`err (_buildIrondbParams): ${JSON.stringify(err, null, 2)}`);
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

  _convertIrondbDataToGrafana(result) {
    var data = result.data
    var cleanData = [];

    var timestamp, origDatapoint, datapoint;

    if (!data || !data.series) return { data: cleanData };
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
          datapoints: datapoint
        });
        for (var i = 0; i < origDatapoint.length; i++) {
          timestamp += data.step;
          if (null == origDatapoint[i]) {
            continue;
          }
          datapoint.push([ origDatapoint[i], timestamp ]);
        }
      }
    }
    return { data: cleanData };
  }

  _convertIrondbCaqlDataToGrafana(result, query) {
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
      cleanData[si] = { target: lname, datapoints: [] };
      for (var i = 0; i < data[si].length; i++) {
        if (data[si][i] == null) continue;
        var ts = (st + (i*period)) * 1000;
        if(ts < query.start*1000) continue;
        if (data[si][i].constructor === Number) {
          cleanData[si].datapoints.push([ data[si][i], ts])
        }
        else if(data[si][i].constructor === Object) {
          for (var vstr in data[si][i]) {
            var cnt = data[si][i][vstr];
            var v = parseFloat(vstr);
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
