///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register(['lodash'], function(exports_1) {
    var lodash_1;
    var IrondbDatasource;
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            }],
        execute: function() {
            IrondbDatasource = (function () {
                /** @ngInject */
                function IrondbDatasource(instanceSettings, $q, backendSrv, templateSrv) {
                    this.$q = $q;
                    this.backendSrv = backendSrv;
                    this.templateSrv = templateSrv;
                    this.type = 'irondb';
                    this.name = instanceSettings.name;
                    this.id = instanceSettings.id;
                    this.accountId = (instanceSettings.jsonData || {}).accountId;
                    this.irondbType = (instanceSettings.jsonData || {}).irondbType;
                    this.apiToken = (instanceSettings.jsonData || {}).apiToken;
                    /*    this.urls = _.map(instanceSettings.url.split(','), function(url) {
                          return url.trim();
                        });*/
                    this.url = instanceSettings.url;
                    this.supportAnnotations = false;
                    this.supportMetrics = true;
                }
                IrondbDatasource.prototype.query = function (options) {
                    console.log("options (query): " + JSON.stringify(options, null, 2));
                    var scopedVars = options.scopedVars;
                    var queryTargets = [];
                    var queryModel;
                    var i;
                    var irondbOptions = this._buildIrondbParams(options);
                    console.log("irondbOptions (query): " + JSON.stringify(irondbOptions, null, 2));
                    if (lodash_1.default.isEmpty(irondbOptions)) {
                        return this.$q.when({ data: [] });
                    }
                    for (i = 0; i < irondbOptions['targets'].length; i++) {
                        if (lodash_1.default.isEmpty(irondbOptions['targets'][i])) {
                            continue;
                        }
                        var queryResults;
                        queryResults = this._irondbRequest(irondbOptions['targets'][i], irondbOptions['start'], irondbOptions['end']);
                        console.log("queryResults (query): " + JSON.stringify(queryResults, null, 2));
                    }
                };
                IrondbDatasource.prototype.annotationQuery = function (options) {
                    throw new Error("Annotation Support not implemented yet.");
                };
                IrondbDatasource.prototype.metricFindQuery = function (query) {
                    var queryUrl = '/graphite/' + this.accountId;
                    console.log("query (metricFindQuery): " + JSON.stringify(query, null, 2));
                    if ('*' !== query) {
                        queryUrl = queryUrl + '/' + query.replace(/\*$/, '');
                    }
                    queryUrl = queryUrl + '/metrics/find?query=*';
                    console.log("queryUrl (metricFindQuery): " + JSON.stringify(queryUrl, null, 2));
                    return this._irondbSimpleRequest('GET', queryUrl);
                };
                IrondbDatasource.prototype.testDatasource = function () {
                    return this.metricFindQuery('*')
                        .then(function (res) {
                        var error = lodash_1.default.get(res, 'results[0].error');
                        if (error) {
                            return {
                                status: 'error',
                                message: error,
                                title: 'Error'
                            };
                        }
                        return {
                            status: 'success',
                            message: 'Data source is working',
                            title: 'Success'
                        };
                    })
                        .catch(function (err) {
                        return {
                            status: 'error',
                            message: err.message,
                            title: 'Error'
                        };
                    });
                };
                IrondbDatasource.prototype._irondbSimpleRequest = function (method, url, isCaql) {
                    if (isCaql === void 0) { isCaql = false; }
                    var baseUrl = this.url;
                    if ('hosted' == this.irondbType) {
                        baseUrl = baseUrl + '/irondb';
                    }
                    if (isCaql) {
                        baseUrl = baseUrl + '/extension/lua/caql_v1';
                    }
                    console.log("method (_irondbSimpleRequest): " + JSON.stringify(method, null, 2));
                    console.log("passed url (_irondbSimpleRequest): " + JSON.stringify(url, null, 2));
                    console.log("url (_irondbSimpleRequest): " + JSON.stringify(this.url, null, 2));
                    console.log("baseUrl (_irondbSimpleRequest): " + JSON.stringify(baseUrl, null, 2));
                    console.log("fullUrl (_irondbSimpleRequest): " + JSON.stringify(baseUrl + url, null, 2));
                    var options = {
                        method: method,
                        url: baseUrl + url,
                    };
                    return this.backendSrv.datasourceRequest(options);
                };
                IrondbDatasource.prototype._irondbRequest = function (irondbOptions, start, end, isCaql) {
                    var _this = this;
                    if (isCaql === void 0) { isCaql = false; }
                    console.log("irondbOptions (_irondbRequest): " + JSON.stringify(irondbOptions, null, 2));
                    var url = this.url;
                    if ('hosted' == this.irondbType) {
                        url = url + '/irondb';
                    }
                    if (isCaql) {
                        url = url + '/extension/lua/caql_v1';
                    }
                    url = url + '/graphite/' + this.accountId;
                    url = url + '/series?start=' + start + '&end=' + end + '&name=' + irondbOptions['query'];
                    console.log("baseUrl (_irondbRequest): " + JSON.stringify(this.url, null, 2));
                    var options = {
                        method: 'GET',
                        url: url,
                    };
                    if (this.basicAuth || this.withCredentials) {
                        options.withCredentials = true;
                    }
                    if (this.basicAuth) {
                        options.headers = options.headers || {};
                        options.headers.Authorization = this.basicAuth;
                    }
                    console.log("options (_irondbRequest): " + JSON.stringify(options, null, 2));
                    var result = this.backendSrv.datasourceRequest(options);
                    console.log("result (_irondbRequest): " + JSON.stringify(result, null, 2));
                    return this.backendSrv.datasourceRequest(options).then(function (result) {
                        console.log("result (_irondbRequest): " + JSON.stringify(result, null, 2));
                        return _this._convertIrondbDataToGrafana(result.data);
                    }, function (err) {
                        console.log("err (_irondbRequest): " + JSON.stringify(err, null, 2));
                        if (err.status !== 0 || err.status >= 300) {
                            if (err.data && err.data.error) {
                                throw {
                                    message: 'IRONdb Error: ' + err.data.error,
                                    data: err.data,
                                    config: err.config,
                                };
                            }
                            else if (err.statusText === 'Not Found') {
                                throw {
                                    message: 'IRONdb Error: ' + err.statusText,
                                    data: err.data,
                                    config: err.config,
                                };
                            }
                            else {
                                throw {
                                    message: 'Network Error: ' + err.statusText + '(' + err.status + ')',
                                    data: err.data,
                                    config: err.config,
                                };
                            }
                        }
                    });
                };
                IrondbDatasource.prototype._buildIrondbParams = function (options) {
                    var cleanOptions = {};
                    var intervalRegex = /'(\d+)m'/gi;
                    var i, target;
                    var hasTargets = false;
                    cleanOptions['start'] = (new Date(options.range.from)).getTime() / 1000;
                    cleanOptions['end'] = (new Date(options.range.to)).getTime() / 1000;
                    cleanOptions['targets'] = [];
                    for (i = 0; i < options.targets.length; i++) {
                        target = options.targets[i];
                        if (target.hide) {
                            continue;
                        }
                        hasTargets = true;
                        cleanOptions['targets'].push(target);
                    }
                    if (!hasTargets) {
                        return [];
                    }
                    else {
                        return cleanOptions;
                    }
                };
                IrondbDatasource.prototype._convertIrondbDataToGrafana = function (data) {
                    var cleanData = [];
                    var timestamp, origDatapoint, datapoint;
                    if (!data || !data.series)
                        return { data: cleanData };
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
                                datapoint.push([origDatapoint[i], timestamp]);
                            }
                        }
                    }
                    return { data: cleanData };
                };
                return IrondbDatasource;
            })();
            exports_1("default", IrondbDatasource);
        }
    }
});
//# sourceMappingURL=datasource.js.map