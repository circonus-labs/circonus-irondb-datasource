///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import _ from 'lodash';

export default class IrondbDatasource {
  id: number;
  name: string;
  type: string;
  accountId: number;
  irondbType: string;
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
    this.apiToken = (instanceSettings.jsonData || {}).apiToken;
    this.url = instanceSettings.url;
    this.supportAnnotations = false;
    this.supportMetrics = true;
    this.appName = 'Grafana';
  }

  query(options) {
    console.log(`options (query): ${JSON.stringify(options, null, 2)}`);
    var scopedVars = options.scopedVars;
    var queryTargets = [];
    var queryModel;
    var i;
    var irondbOptions = this._buildIrondbParams(options);

    console.log(`irondbOptions (query): ${JSON.stringify(irondbOptions, null, 2)}`);

    if (_.isEmpty(irondbOptions)) {
      return this.$q.when({ data: [] });
    }

    var queryResults = this._irondbRequest(irondbOptions);
    console.log(`queryResults (query): ${JSON.stringify(queryResults, null, 2)}`);
    return queryResults;
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
    return this._irondbSimpleRequest('GET', queryUrl);
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

  _irondbSimpleRequest(method, url, isCaql = false) {
    var baseUrl = this.url;
    var headers = { "Content-Type": "application/json" };

    if ('hosted' == this.irondbType && !isCaql) {
      baseUrl = baseUrl + '/irondb/graphite/series_multi';
      headers['X-Circonus-Auth-Token'] = this.apiToken;
      headers['X-Circonus-App-Name'] = this.appName;
    }
    if ('standalone' == this.irondbType && !isCaql) {
      baseUrl = baseUrl + '/graphite/' + this.accountId + '/series_multi';
    }
    if (isCaql) {
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
    var url = this.url;
    var headers = { "Content-Type": "application/json" };

    if ('hosted' == this.irondbType) {
      url = url + '/irondb/graphite/series_multi';
      headers['X-Circonus-Auth-Token'] = this.apiToken;
      headers['X-Circonus-App-Name'] = this.appName;
    }
    if ('standalone' == this.irondbType) {
      url = url + '/graphite/' + this.accountId + '/series_multi';
    }
    if (isCaql) {
      url = url + '/extension/lua/caql_v1';
    }
    console.log(`baseUrl (_irondbRequest): ${JSON.stringify(this.url, null, 2)}`);

    var options: any = {
      method: 'POST',
      url: url,
      data: irondbOptions,
      headers: headers,
    };
    if (this.basicAuth || this.withCredentials) {
      options.withCredentials = true;
    }
    if (this.basicAuth) {
      options.headers.Authorization = this.basicAuth;
    }
    console.log(`options (_irondbRequest): ${JSON.stringify(options, null, 2)}`);

    var result = this.backendSrv.datasourceRequest(options);
    console.log(`result (_irondbRequest): ${JSON.stringify(result, null, 2)}`);

    return this.backendSrv.datasourceRequest(options).then(
      result => {
        console.log(`result (_irondbRequest): ${JSON.stringify(result, null, 2)}`);
        return this._convertIrondbDataToGrafana(result.data);
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
    );
  }

  _buildIrondbParams(options) {
    var cleanOptions = {};
    var intervalRegex = /'(\d+)m'/gi;
    var i, target;
    var hasTargets = false;

    cleanOptions['start'] = (new Date(options.range.from)).getTime() / 1000;
    cleanOptions['end'] = (new Date(options.range.to)).getTime() / 1000;
    cleanOptions['names'] = [];

    for (i = 0; i < options.targets.length; i++) {
      target = options.targets[i];
      if (target.hide) {
        continue;
      }

      hasTargets = true;
      cleanOptions['names'].push(target['query']);
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
}
