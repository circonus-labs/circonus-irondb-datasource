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
    console.log(`options (query): ${JSON.stringify(options, null, 2)}`);
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
//      console.log(`queryResults (query): ${JSON.stringify(queryResults, null, 2)}`);
      return queryResults;
    }).catch( err => {
      console.log(`err (query): ${JSON.stringify(err, null, 2)}`);
      if (err.status !== 0 || err.status >= 300) {
        if (err.data && err.data.error) {
          throw {
            message: 'IRONdb Error: ' + err.data.error,
            data: err.data,
            config: err.config,
          };
        } else if (err.statusText === 'Not Found') {
          throw {
            message: 'IRONdb Error: ' + err.statusText,
            data: err.data,
            config: err.config,
          };
        } else {
          throw {
            message: 'Network Error: ' + err.statusText + '(' + err.status + ')',
            data: err.data,
            config: err.config,
          };
        }
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

  _irondbSimpleRequest(method, url, isCaql = false, isFind = false) {
    var baseUrl = this.url;
    var headers = { "Content-Type": "application/json" };

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

//    console.log(`simple query (_irondbSimpleRequest): ${JSON.stringify(options, null, 2)}`);
    return this.backendSrv.datasourceRequest(options);
  }

  _irondbRequest(irondbOptions, isCaql = false) {
    console.log(`irondbOptions (_irondbRequest): ${JSON.stringify(irondbOptions, null, 2)}`);
    var headers = { "Content-Type": "application/json" };
    var options: any = {};
    var queries = [];
    var queryResults = {};
    queryResults['data'] = [];

    if ('hosted' == this.irondbType) {
      headers['X-Circonus-Auth-Token'] = this.apiToken;
      headers['X-Circonus-App-Name'] = this.appName;
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
      options.isHistogram = false;
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
        options.url = options.url + '/caql_v1?start=' + irondbOptions['caql']['start'];
        options.url = options.url + '&end=' + irondbOptions['caql']['end'];
        options.url = options.url + '&period=' + irondbOptions['caql']['interval'];
        options.url = options.url + '&q=' + irondbOptions['caql']['names'][i];
        options.name = irondbOptions['caql']['names'][i];
        options.headers = headers;
        if (this.basicAuth || this.withCredentials) {
          options.withCredentials = true;
        }
        if (this.basicAuth) {
          options.headers.Authorization = this.basicAuth;
        }
        options.isCaql = true;
        options.isHistogram = irondbOptions['caql']['isHistogram'][i];
        queries.push(options);
      }
    }
    console.log(`queries (_irondbRequest): ${JSON.stringify(queries, null, 2)}`);

    return Promise.all(queries.map(query =>
      this.backendSrv.datasourceRequest(query).then( result => {
        console.log(`query (_irondbRequest): ${JSON.stringify(query, null, 2)}`);
        var queryInterimResults;
        if (query['isHistogram']) {
          queryInterimResults = this._convertIrondbCaqlDataToGrafanaHeatmap(result.data, query);
        } else if (query['isCaql']) {
          queryInterimResults = this._convertIrondbCaqlDataToGrafana(result.data, query['name']);
        } else {
          queryInterimResults = this._convertIrondbDataToGrafana(result.data);
        }
//console.log(`queryInterimResults (_irondbRequest): ${JSON.stringify(queryInterimResults, null, 2)}`);
        return queryInterimResults;
      }).then( result => {
        if (result['data'].constructor === Array) {
          for (var i = 0; i < result['data'].length; i++) {
//console.log(`Array element result['data'] (_irondbRequest)`);
            queryResults['data'].push(result['data'][i]);
          }
        }
        if (result['data'].constructor === Object) {
//console.log(`Hash element result['data'] (_irondbRequest)`);
          queryResults['data'].push(result['data']);
        }
        return queryResults;
      })
    )).then( result => {
//      console.log(`queryResults (_irondbRequest): ${JSON.stringify(queryResults, null, 2)}`);
      return queryResults;
    }).catch( err => {
      console.log(`err (_irondbRequest): ${JSON.stringify(err, null, 2)}`);
      if (err.status !== 0 || err.status >= 300) {
        if (err.data && err.data.error) {
          throw {
            message: 'IRONdb Error: ' + err.data.error,
            data: err.data,
            config: err.config,
          };
        } else if (err.statusText === 'Not Found') {
          throw {
            message: 'IRONdb Error: ' + err.statusText,
            data: err.data,
            config: err.config,
          };
        } else {
          throw {
            message: 'Network Error: ' + err.statusText + '(' + err.status + ')',
            data: err.data,
            config: err.config,
          };
        }
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

    cleanOptions['std'] = {};
    cleanOptions['std']['start'] = start;
    cleanOptions['std']['end'] = end;
    cleanOptions['std']['names'] = [];
    cleanOptions['std']['interval'] = options.intervalMs / 1000;
    cleanOptions['caql'] = {};
    cleanOptions['caql']['start'] = start;
    cleanOptions['caql']['end'] = end;
    cleanOptions['caql']['names'] = [];
    cleanOptions['caql']['isHistogram'] = [];
    cleanOptions['caql']['interval'] = Math.floor(options.maxDataPoints / 40) * (options.intervalMs / 1000);

    for (i = 0; i < options.targets.length; i++) {
      target = options.targets[i];
      if (target.hide) {
        continue;
      }
      hasTargets = true;
      if ( !target['isCaql'] && !target['isHistogram'] && ( target['query'].includes('*') || target['query'].includes('?') || target['query'].includes('[') || target['query'].includes(']') || target['query'].includes('(') || target['query'].includes(')') || target['query'].includes('{') || target['query'].includes('}') ) ) {
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
        if (target.isCaql || target.isHistogram) {
          cleanOptions['caql']['names'].push(target['query']);
          if (target.isHistogram) {
            cleanOptions['caql']['isHistogram'].push(target.isHistogram);
          } else {
            cleanOptions['caql']['isHistogram'].push(false);
          }
        } else {
//          console.log(`target['query'] (_buildIrondbParamsAsync): ${JSON.stringify(target['query'], null, 2)}`);
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
              if (target.isHistogram) {
                cleanOptions['caql']['isHistogram'].push(target.isHistogram);
              } else {
                cleanOptions['caql']['isHistogram'].push(false);
              }
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
          if (err.data && err.data.error) {
            throw {
              message: 'IRONdb Error: ' + err.data.error,
              data: err.data,
              config: err.config,
            };
          } else if (err.statusText === 'Not Found') {
            throw {
              message: 'IRONdb Error: ' + err.statusText,
              data: err.data,
              config: err.config,
            };
          } else {
            throw {
              message: 'Network Error: ' + err.statusText + '(' + err.status + ')',
              data: err.data,
              config: err.config,
            };
          }
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

  _convertIrondbDataToGrafana(data) {
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

  _convertIrondbCaqlDataToGrafana(data, name) {
    var cleanData = [];
    var timestamp, origDatapoint, datapoint;

    if (!data || data.length == 0) return { data: cleanData };
    datapoint = [];
    cleanData.push({
      target: name,
      datapoints: datapoint
    });
    if (data[0][1].constructor === Array) {
      for (var i = 0; i < data.length; i++) {
        if (null == data[i][1][0]) {
          continue;
        }
        datapoint.push([ data[i][1][0], data[i][0] * 1000 ]);
      }
    } else if (data[0][2].constructor === Object) {
      for (var i = 0; i < data.length; i++) {
        if (null == data[i][2][0]) {
          continue;
        }
        datapoint.push([ data[i][2][0], data[i][0] * 1000 ]);
      }
    }
    return { data: cleanData };
  }

  _convertIrondbCaqlDataToGrafanaHeatmap(data, query) {
    var cleanData = [];
    var timestamp, origDatapoint, datapoint;

//console.log(`data (_convertHeatmap): ${JSON.stringify(data, null, 2)}`);
    if (!data || data.length == 0) return { data: cleanData };
    if (data[0].constructor === Array) {
      if (data[0][1].constructor === Array) {
        for (var i = 0; i < data.length; i++) {
//console.log(`data[${i}] (_convertHeatmap): ${JSON.stringify(data[i], null, 2)}`);
          data[i][1].forEach( value => {
            let found = cleanData.some( bkt => {
              return bkt.target === value;
            });
            if (!found) {
              cleanData.push( { target: value, datapoints: [] } );
            }
            let bucket = cleanData.find( bkt => {
              return bkt.target === value;
            });
            bucket['datapoints'].push([ value, data[i][0] * 1000 ]);
          });
//console.log(`cleanData (_convertHeatmap): ${JSON.stringify(cleanData, null, 2)}`);
        }
      } else if (data[0][2].constructor === Object) {
        for (var i = 0; i < data.length; i++) {
//console.log(`data[${i}] (_convertHeatmap): ${JSON.stringify(data[i], null, 2)}`);
          Object.keys( data[i][2] ).forEach( key => {
            let found = cleanData.some( bkt => {
              return bkt.target === key;
            });
            if (!found) {
              cleanData.push( { target: key, datapoints: [] } );
            }
            let bucket = cleanData.find( bkt => {
              return bkt.target === key;
            });
            bucket['datapoints'].push([ data[i][2][key], data[i][0] * 1000 ]);
          });
//console.log(`cleanData (_convertHeatmap): ${JSON.stringify(cleanData, null, 2)}`);
        }
      }
    }
    return { data: cleanData };
  }
}
