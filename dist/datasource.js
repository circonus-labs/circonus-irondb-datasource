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
                    this.url = instanceSettings.url;
                    this.supportAnnotations = false;
                    this.supportMetrics = true;
                    this.appName = 'Grafana';
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
                    return this._irondbRequest(irondbOptions);
                };
                IrondbDatasource.prototype.annotationQuery = function (options) {
                    throw new Error("Annotation Support not implemented yet.");
                };
                IrondbDatasource.prototype.metricFindQuery = function (query) {
                    var queryUrl = '';
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
                    var headers = { "Content-Type": "application/json" };
                    if ('hosted' == this.irondbType && !isCaql) {
                        baseUrl = baseUrl + '/irondb/graphite/series_multi';
                        headers['X-Circonus-Auth-Token'] = this.apiToken;
                        headers['X-Circonus-App-Name'] = this.appName;
                    }
                    if ('standalone' == this.irondbType && !isCaql) {
                        baseUrl = baseUrl + '/graphite/' + this.accountId + '/graphite./series_multi';
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
                        headers: headers,
                    };
                    return this.backendSrv.datasourceRequest(options);
                };
                IrondbDatasource.prototype._irondbRequest = function (irondbOptions, isCaql) {
                    var _this = this;
                    if (isCaql === void 0) { isCaql = false; }
                    console.log("irondbOptions (_irondbRequest): " + JSON.stringify(irondbOptions, null, 2));
                    var url = this.url;
                    var headers = { "Content-Type": "application/json" };
                    var options = {
                        method: 'POST',
                        url: this.url,
                    };
                    if ('hosted' == this.irondbType) {
                        options.url = options.url + '/irondb';
                        headers['X-Circonus-Auth-Token'] = this.apiToken;
                        headers['X-Circonus-App-Name'] = this.appName;
                    }
                    if (isCaql || irondbOptions['isCaql']) {
                        options.method = 'GET';
                        options.url = options.url + '/extension/lua';
                        if ('hosted' == this.irondbType) {
                            options.url = options.url + '/public';
                        }
                        options.url = options.url + '/caql_v1';
                        options.url = options.url + '?start=' + irondbOptions['start'];
                        options.url = options.url + '&end=' + irondbOptions['end'];
                        options.url = options.url + '&period=60';
                        options.url = options.url + '&q=' + irondbOptions['names'][0];
                    }
                    if ('hosted' == this.irondbType && !irondbOptions['isCaql']) {
                        options.url = options.url + '/graphite/series_multi';
                    }
                    if ('standalone' == this.irondbType && !irondbOptions['isCaql']) {
                        options.url = options.url + '/graphite/' + this.accountId + '/graphite./series_multi';
                    }
                    console.log("baseUrl (_irondbRequest): " + JSON.stringify(this.url, null, 2));
                    options.data = irondbOptions;
                    options.headers = headers;
                    if (this.basicAuth || this.withCredentials) {
                        options.withCredentials = true;
                    }
                    if (this.basicAuth) {
                        options.headers.Authorization = this.basicAuth;
                    }
                    console.log("options (_irondbRequest): " + JSON.stringify(options, null, 2));
                    var result = this.backendSrv.datasourceRequest(options);
                    return this.backendSrv.datasourceRequest(options).then(function (result) {
                        if (isCaql || irondbOptions['isCaql']) {
                            return _this._convertIrondbCaqlDataToGrafana(result.data, options['data']['names'][0]);
                        }
                        else {
                            return _this._convertIrondbDataToGrafana(result.data);
                        }
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
                    cleanOptions['names'] = [];
                    cleanOptions['isCaql'] = false;
                    for (i = 0; i < options.targets.length; i++) {
                        target = options.targets[i];
                        if (target.hide) {
                            continue;
                        }
                        hasTargets = true;
                        if (target.isCaql) {
                            cleanOptions['isCaql'] = true;
                        }
                        cleanOptions['names'].push(target['query']);
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
                IrondbDatasource.prototype._convertIrondbCaqlDataToGrafana = function (data, name) {
                    var cleanData = [];
                    var timestamp, origDatapoint, datapoint;
                    if (!data || data.length == 0)
                        return { data: cleanData };
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
                            datapoint.push([data[i][1][0], data[i][0] * 1000]);
                        }
                    }
                    else if (data[0][2].constructor === Object) {
                        for (var i = 0; i < data.length; i++) {
                            if (null == data[i][2][0]) {
                                continue;
                            }
                            datapoint.push([data[i][2][0], data[i][0] * 1000]);
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