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
                    this.queryPrefix = (instanceSettings.jsonData || {}).queryPrefix;
                    this.apiToken = (instanceSettings.jsonData || {}).apiToken;
                    this.url = instanceSettings.url;
                    this.supportAnnotations = false;
                    this.supportMetrics = true;
                    this.appName = 'Grafana';
                }
                IrondbDatasource.prototype.query = function (options) {
                    var _this = this;
                    //console.log(`options (query): ${JSON.stringify(options, null, 2)}`);
                    var scopedVars = options.scopedVars;
                    if (lodash_1.default.isEmpty(options['targets'][0])) {
                        return this.$q.when({ data: [] });
                    }
                    return Promise.all([this._buildIrondbParams(options)]).then(function (irondbOptions) {
                        if (lodash_1.default.isEmpty(irondbOptions[0])) {
                            return _this.$q.when({ data: [] });
                        }
                        return _this._irondbRequest(irondbOptions[0]);
                    }).then(function (queryResults) {
                        if (queryResults['data'].constructor === Array) {
                            queryResults['data'].sort(function (a, b) {
                                return a['target'].localeCompare(b['target']);
                            });
                        }
                        //console.log(`queryResults (query): ${JSON.stringify(queryResults, null, 2)}`);
                        return queryResults;
                    }).catch(function (err) {
                        if (err.status !== 0 || err.status >= 300) {
                            _this._throwerr(err);
                        }
                    });
                };
                IrondbDatasource.prototype.annotationQuery = function (options) {
                    throw new Error("Annotation Support not implemented yet.");
                };
                IrondbDatasource.prototype.metricFindQuery = function (query) {
                    var queryUrl = '/find/' + this.accountId + '/tags?query=';
                    queryUrl = queryUrl + 'and(__name:' + query + ')';
                    console.log(queryUrl);
                    return this._irondbSimpleRequest('GET', queryUrl, false, true);
                };
                IrondbDatasource.prototype.metricTagCatsQuery = function (query) {
                    var queryUrl = '/find/' + this.accountId + '/tag_cats?query=';
                    queryUrl = queryUrl + 'and(__name:' + query + ')';
                    console.log(queryUrl);
                    return this._irondbSimpleRequest('GET', queryUrl, false, true);
                };
                IrondbDatasource.prototype.metricTagValsQuery = function (query, cat) {
                    var queryUrl = '/find/' + this.accountId + '/tag_vals?category=' + cat + '&query=';
                    queryUrl = queryUrl + 'and(__name:' + query + ')';
                    console.log(queryUrl);
                    return this._irondbSimpleRequest('GET', queryUrl, false, true);
                };
                IrondbDatasource.prototype.testDatasource = function () {
                    return this.metricFindQuery('ametric').then(function (res) {
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
                    }).catch(function (err) {
                        return {
                            status: 'error',
                            message: err.message,
                            title: 'Error'
                        };
                    });
                };
                IrondbDatasource.prototype._throwerr = function (err) {
                    console.log(err);
                    if (err.data && err.data.error) {
                        throw new Error('Circonus IRONdb Error: ' + err.data.error);
                    }
                    else if (err.data && err.data.user_error) {
                        var name = err.data.method || 'IRONdb';
                        var suffix = '';
                        if (err.data.user_error.query)
                            suffix = ' in"' + err.data.user_error.query + '"';
                        throw new Error(name + ' error: ' + err.data.user_error.message + suffix);
                    }
                    else if (err.statusText === 'Not Found') {
                        throw new Error('Circonus IRONdb Error: ' + err.statusText);
                    }
                    else if (err.statusText && err.status > 0) {
                        throw new Error('Network Error: ' + err.statusText + '(' + err.status + ')');
                    }
                    else {
                        throw new Error('Error: ' + (err ? err.toString() : "unknown"));
                    }
                };
                IrondbDatasource.prototype._irondbSimpleRequest = function (method, url, isCaql, isFind) {
                    if (isCaql === void 0) { isCaql = false; }
                    if (isFind === void 0) { isFind = false; }
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
                        if (!isFind) {
                            baseUrl = baseUrl + '/' + this.queryPrefix + '/series_multi';
                        }
                    }
                    if (isCaql && !isFind) {
                        baseUrl = baseUrl + '/extension/lua/caql_v1';
                    }
                    var options = {
                        method: method,
                        url: baseUrl + url,
                        headers: headers,
                    };
                    //console.log(`simple query (_irondbSimpleRequest): ${JSON.stringify(options, null, 2)}`);
                    return this.backendSrv.datasourceRequest(options);
                };
                IrondbDatasource.prototype._irondbRequest = function (irondbOptions, isCaql) {
                    var _this = this;
                    if (isCaql === void 0) { isCaql = false; }
                    //console.log(`irondbOptions (_irondbRequest): ${JSON.stringify(irondbOptions, null, 2)}`);
                    var headers = { "Content-Type": "application/json" };
                    var options = {};
                    var queries = [];
                    var queryResults = {};
                    queryResults['data'] = [];
                    if ('hosted' == this.irondbType) {
                        headers['X-Circonus-Auth-Token'] = this.apiToken;
                        headers['X-Circonus-App-Name'] = this.appName;
                    }
                    else {
                        headers['X-Circonus-Account'] = this.accountId;
                    }
                    if (irondbOptions['std']['names'].length) {
                        for (var i = 0; i < irondbOptions['std']['names'].length; i++) {
                            options = {};
                            options.url = this.url;
                            if ('hosted' == this.irondbType) {
                                options.url = options.url + '/irondb';
                                options.url = options.url + '/graphite/series_multi';
                            }
                            options.method = 'GET';
                            if ('standalone' == this.irondbType) {
                                options.url = options.url + '/rollup';
                            }
                            var interval = irondbOptions['std']['interval'];
                            var start = irondbOptions['std']['start'];
                            var end = irondbOptions['std']['end'];
                            start = start - (start % interval);
                            end = end - (end % interval);
                            options.url = options.url + '/' + irondbOptions['std']['names'][i]['leaf_data']['uuid'];
                            options.url = options.url + '/' + encodeURIComponent(irondbOptions['std']['names'][i]['leaf_name']);
                            options.url = options.url + '?get_engine=dispatch&start_ts=' + start + '.000';
                            options.url = options.url + '&end_ts=' + end + '.000';
                            options.url = options.url + '&rollup_span=' + interval + 's';
                            options.url = options.url + '&type=' + irondbOptions['std']['names'][i]['leaf_data']['egress_function'];
                            options.name = irondbOptions['std']['names'][i]['leaf_name'];
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
                    return Promise.all(queries.map(function (query) {
                        return _this.backendSrv.datasourceRequest(query).then(function (result) {
                            //console.log(`query (_irondbRequest): ${JSON.stringify(query, null, 2)}`);
                            var queryInterimResults;
                            if (query['isCaql']) {
                                queryInterimResults = _this._convertIrondbCaqlDataToGrafana(result, query);
                            }
                            else {
                                queryInterimResults = _this._convertIrondbDataToGrafana(result, query);
                            }
                            return queryInterimResults;
                        }).then(function (result) {
                            if (result['data'].constructor === Array) {
                                for (var i = 0; i < result['data'].length; i++) {
                                    queryResults['data'].push(result['data'][i]);
                                }
                            }
                            if (result['data'].constructor === Object) {
                                queryResults['data'].push(result['data']);
                            }
                            return queryResults;
                        });
                    })).then(function (result) {
                        return queryResults;
                    }).catch(function (err) {
                        if (err.status !== 0 || err.status >= 300) {
                            _this._throwerr(err);
                        }
                    });
                };
                IrondbDatasource.prototype._buildIrondbParamsAsync = function (options) {
                    var _this = this;
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
                    var estdp = Math.floor((end - start) * 1000 / options.intervalMs);
                    if (estdp > options.maxDataPoints / 8)
                        estdp = options.maxDataPoints / 8;
                    var period = Math.ceil((end - start) / estdp);
                    // The period is in the right realm now, force align to something
                    // that will make it pretty.
                    var align = [86400, 3600, 1800, 1200, 900, 300, 60, 30, 15, 10, 5, 1];
                    for (var i in align) {
                        if (period > 1000 * align[i]) {
                            period = Math.floor(period / (1000 * align[i])) * (1000 * align[i]);
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
                        if (!target['isCaql'] && target['query'] && (target['query'].includes('*') || target['query'].includes('?') || target['query'].includes('[') || target['query'].includes(']') || target['query'].includes('(') || target['query'].includes(')') || target['query'].includes('{') || target['query'].includes('}') || target['query'].includes(';'))) {
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
                    }
                    else {
                        var promises = options.targets.map(function (target) {
                            console.log("target " + JSON.stringify(target));
                            return _this.metricFindQuery(target['query']).then(function (result) {
                                for (var i = 0; i < result.data.length; i++) {
                                    result.data[i]['target'] = target;
                                }
                                return result.data;
                            }).then(function (result) {
                                for (var i = 0; i < result.length; i++) {
                                    if (result[i]['target'].hide) {
                                        continue;
                                    }
                                    if (!target.isCaql) {
                                        result[i]['leaf_data'] = {
                                            egress_function: 'average',
                                            uuid: result[i]['uuid']
                                        };
                                        if (target.egressoverride != "default") {
                                            result[i]['leaf_data'].egress_function = target.egressoverride;
                                        }
                                        if ('hosted' == _this.irondbType) {
                                            cleanOptions['std']['names'].push({ leaf_name: _this.queryPrefix + result[i]['name'], leaf_data: result[i]['leaf_data'] });
                                        }
                                        else {
                                            cleanOptions['std']['names'].push({ leaf_name: result[i]['metric_name'], leaf_data: result[i]['leaf_data'] });
                                        }
                                    }
                                }
                                return cleanOptions;
                            });
                        });
                        return Promise.all(promises).then(function (result) {
                            return cleanOptions;
                        }).catch(function (err) {
                            console.log("err (_buildIrondbParams): " + JSON.stringify(err, null, 2));
                            if (err.status !== 0 || err.status >= 300) {
                            }
                        });
                        return cleanOptions;
                    }
                };
                IrondbDatasource.prototype._buildIrondbParams = function (options) {
                    var self = this;
                    return new Promise(function (resolve, reject) {
                        resolve(self._buildIrondbParamsAsync(options));
                    });
                };
                IrondbDatasource.prototype._convertIrondbDataToGrafana = function (result, query) {
                    var data = result.data;
                    var cleanData = [];
                    var timestamp, origDatapoint, datapoint;
                    if (!data)
                        return { data: cleanData };
                    origDatapoint = data;
                    datapoint = [];
                    cleanData.push({
                        target: query.name,
                        datapoints: datapoint
                    });
                    for (var i = 0; i < origDatapoint.length; i++) {
                        timestamp = origDatapoint[i][0] * 1000;
                        if (null == origDatapoint[i][1]) {
                            continue;
                        }
                        datapoint.push([origDatapoint[i][1], timestamp]);
                    }
                    return { data: cleanData };
                };
                IrondbDatasource.prototype._convertIrondbCaqlDataToGrafana = function (result, query) {
                    var name = query.name;
                    var data = result.data.data;
                    var meta = result.data.meta;
                    var cleanData = [];
                    var timestamp, origDatapoint, datapoint;
                    var st = result.data.head.start;
                    var cnt = result.data.head.count;
                    var period = result.data.head.period;
                    if (!data || data.length == 0)
                        return { data: cleanData };
                    // Only supports one histogram.. So sad.
                    var lookaside = {};
                    for (var si = 0; si < data.length; si++) {
                        var dummy = name + " [" + (si + 1) + "]";
                        var lname = meta[si] ? meta[si].label : dummy;
                        cleanData[si] = { target: lname, datapoints: [] };
                        for (var i = 0; i < data[si].length; i++) {
                            if (data[si][i] == null)
                                continue;
                            var ts = (st + (i * period)) * 1000;
                            if (ts < query.start * 1000)
                                continue;
                            if (data[si][i].constructor === Number) {
                                cleanData[si].datapoints.push([data[si][i], ts]);
                            }
                            else if (data[si][i].constructor === Object) {
                                for (var vstr in data[si][i]) {
                                    var cnt = data[si][i][vstr];
                                    var v = parseFloat(vstr);
                                    var tsstr = ts.toString();
                                    if (lookaside[vstr] == null) {
                                        lookaside[vstr] = { target: vstr, datapoints: [], _ts: {} };
                                        cleanData.push(lookaside[vstr]);
                                    }
                                    if (lookaside[vstr]._ts[tsstr] == null) {
                                        lookaside[vstr]._ts[tsstr] = [cnt, ts];
                                        lookaside[vstr].datapoints.push(lookaside[vstr]._ts[tsstr]);
                                    }
                                    else {
                                        lookaside[vstr]._ts[tsstr][0] += cnt;
                                    }
                                }
                            }
                        }
                    }
                    for (var i = 0; i < cleanData.length; i++) {
                        delete (cleanData[i]._ts);
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