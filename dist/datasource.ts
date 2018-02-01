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
    var i;
    var irondbOptions = this._buildIrondbParams(options);

    if (_.isEmpty(irondbOptions)) {
      return this.$q.when({ data: [] });
    }

    return this._irondbRequest(irondbOptions);
  }

  annotationQuery(options) {
    throw new Error("Annotation Support not implemented yet.");
  }

  metricFindQuery(query: string) {
    var queryUrl = '';
    console.log(`query (metricFindQuery): ${JSON.stringify(query, null, 2)}`);
    if('*' !== query) {
      queryUrl = queryUrl + '/' + query.replace(/\*$/, '');
    }
    queryUrl = queryUrl + '/metrics/find?query=*';
    console.log(`queryUrl (metricFindQuery): ${JSON.stringify(queryUrl, null, 2)}`);
    return this._irondbSimpleRequest('GET', queryUrl, false, true);
  }

  testDatasource() {
    return this.metricFindQuery('*')
      .then(res => {
        let error = _.get(res, 'results[0].error');
        if(error) {
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
      })
      .catch(err => {
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
    console.log(`method (_irondbSimpleRequest): ${JSON.stringify(method, null, 2)}`);
    console.log(`passed url (_irondbSimpleRequest): ${JSON.stringify(url, null, 2)}`);
    console.log(`url (_irondbSimpleRequest): ${JSON.stringify(this.url, null, 2)}`);
    console.log(`baseUrl (_irondbSimpleRequest): ${JSON.stringify(baseUrl, null, 2)}`);
    console.log(`fullUrl (_irondbSimpleRequest): ${JSON.stringify(baseUrl+url, null, 2)}`);

    var options: any = {
      method: method,
      url: baseUrl + url,
      headers: headers,
    };

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
        options.url = options.url + '&period=60&q=' + irondbOptions['caql']['names'][i];
        options.name = irondbOptions['caql']['names'][i];
        options.headers = headers;
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
    console.log(`queries (_irondbRequest): ${JSON.stringify(queries, null, 2)}`);

    return Promise.all(queries.map(query =>
      this.backendSrv.datasourceRequest(query).then(
        result => {
          console.log(`query (_irondbRequest): ${JSON.stringify(query, null, 2)}`);
          var queryInterimResults;
          if (query['isCaql']) {
            console.log(`result.data (_irondbRequest): ${JSON.stringify(result.data, null, 2)}`);
            queryInterimResults = this._convertIrondbCaqlDataToGrafana(result.data, query['name']);
          } else {
            queryInterimResults = this._convertIrondbDataToGrafana(result.data);
          }
          return queryInterimResults;
        },
        function(err) {
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
        }
      ).then(
        result => {
          for (var i = 0; i < result['data'].length; i++) {
            queryResults['data'].push(result['data'][i]);
          }
          console.log(`queryResults (_irondbRequest): ${JSON.stringify(queryResults, null, 2)}`);
          return queryResults;
        }
      )
    )).then(
      result => {
        console.log(`queryResults (_irondbRequest): ${JSON.stringify(queryResults, null, 2)}`);
        return queryResults;
      }
    );
  }

  _buildIrondbParams(options) {
    var cleanOptions = {};
    var intervalRegex = /'(\d+)m'/gi;
    var i, target;
    var hasTargets = false;
    var start = (new Date(options.range.from)).getTime() / 1000;
    var end = (new Date(options.range.to)).getTime() / 1000;

    cleanOptions['std'] = {};
    cleanOptions['std']['start'] = start;
    cleanOptions['std']['end'] = end;
    cleanOptions['std']['names'] = [];
    cleanOptions['caql'] = {};
    cleanOptions['caql']['start'] = start;
    cleanOptions['caql']['end'] = end;
    cleanOptions['caql']['names'] = [];

    for (i = 0; i < options.targets.length; i++) {
      target = options.targets[i];
      if (target.hide) {
        continue;
      }

      hasTargets = true;
      if (target.isCaql) {
        cleanOptions['caql']['names'].push(target['query']);
      } else {
        if ('hosted' == this.irondbType) {
          console.log(`adding queryPrefix (_irondbRequest): ${JSON.stringify(target['query'], null, 2)}`);
          cleanOptions['std']['names'].push(this.queryPrefix + target['query']);
        } else {
          cleanOptions['std']['names'].push(target['query']);
        }
      }
    }

    if (!hasTargets) {
      return [];
    } else {
      return cleanOptions;
    }
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
}
