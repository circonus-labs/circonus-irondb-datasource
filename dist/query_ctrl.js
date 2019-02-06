///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register(['lodash', './irondb_query', 'app/plugins/sdk', './css/query_editor.css!'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var lodash_1, irondb_query_1, sdk_1;
    var IrondbQueryCtrl;
    function mapToDropdownOptions(results) {
        return lodash_1.default.map(results, function (value) {
            return { text: value, value: value };
        });
    }
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (irondb_query_1_1) {
                irondb_query_1 = irondb_query_1_1;
            },
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            },
            function (_1) {}],
        execute: function() {
            IrondbQueryCtrl = (function (_super) {
                __extends(IrondbQueryCtrl, _super);
                /** @ngInject **/
                function IrondbQueryCtrl($scope, $injector, uiSegmentSrv, templateSrv) {
                    _super.call(this, $scope, $injector);
                    this.uiSegmentSrv = uiSegmentSrv;
                    this.templateSrv = templateSrv;
                    this.defaults = {};
                    this.pointTypeOptions = [{ id: "Metric", name: "Metric" }, { id: "CAQL", name: "CAQL" }];
                    this.egressTypeOptions = [{ id: "default", name: "default" },
                        { id: "avg", name: "average" },
                        { id: "sum", name: "sum" },
                        { id: "count", name: "count" },
                        { id: "stddev", name: "\u03C3" },
                        { id: "derivative", name: "derivative" },
                        { id: "d_stddev", name: "\u03C3 derivative" },
                        { id: "counter", name: "counter" },
                        { id: "c_stddev", name: "\u03C3 counter" }];
                    lodash_1.default.defaultsDeep(this.target, this.defaults);
                    this.target.isCaql = this.target.isCaql || false;
                    this.target.egressoverride = this.target.egressoverride || "default";
                    this.target.pointtype = this.target.isCaql ? "CAQL" : "Metric";
                    this.target.query = this.target.query || '';
                    this.target.segments = this.target.segments || [];
                    this.queryModel = new irondb_query_1.default(this.datasource, this.target, templateSrv);
                    this.buildSegments();
                }
                IrondbQueryCtrl.prototype.typeValueChanged = function () {
                    this.target.isCaql = (this.target.pointtype == "CAQL");
                    this.error = null;
                    this.panelCtrl.refresh();
                };
                IrondbQueryCtrl.prototype.egressValueChanged = function () {
                    this.panelCtrl.refresh();
                };
                IrondbQueryCtrl.prototype.onChangeInternal = function () {
                    this.panelCtrl.refresh(); // Asks the panel to refresh data.
                };
                IrondbQueryCtrl.prototype.getCollapsedText = function () {
                    return this.target.query;
                };
                IrondbQueryCtrl.prototype.getSegments = function (index, prefix) {
                    var _this = this;
                    var query = prefix && prefix.length > 0 ? prefix : '';
                    if (index > 0) {
                        query = this.queryModel.getSegmentPathUpTo(index) + query;
                    }
                    return this.datasource
                        .metricFindQuery(query + '*')
                        .then(function (segments) {
                        var allSegments = lodash_1.default.map(segments.data, function (segment) {
                            var queryRegExp = new RegExp(_this.escapeRegExp(query), 'i');
                            return _this.uiSegmentSrv.newSegment({
                                value: segment.name.replace(queryRegExp, ''),
                                expandable: !segment.leaf,
                            });
                        });
                        if (index > 0 && allSegments.length === 0) {
                            return allSegments;
                        }
                        // add query references
                        if (index === 0) {
                            lodash_1.default.eachRight(_this.panelCtrl.panel.targets, function (target) {
                                if (target.refId === _this.queryModel.target.refId) {
                                    return;
                                }
                            });
                        }
                        // de-dupe segments
                        allSegments = lodash_1.default.uniqBy(allSegments, 'value');
                        // add wildcard option
                        allSegments.unshift(_this.uiSegmentSrv.newSegment('*'));
                        return allSegments;
                    })
                        .catch(function (err) {
                        return [];
                    });
                };
                IrondbQueryCtrl.prototype.parseTarget = function () {
                    this.queryModel.parseTarget();
                    this.buildSegments();
                };
                IrondbQueryCtrl.prototype.buildSegments = function () {
                    var _this = this;
                    this.segments = lodash_1.default.map(this.queryModel.segments, function (segment) {
                        return _this.uiSegmentSrv.newSegment(segment);
                    });
                    var checkOtherSegmentsIndex = this.queryModel.checkOtherSegmentsIndex || 0;
                    this.checkOtherSegments(checkOtherSegmentsIndex);
                };
                IrondbQueryCtrl.prototype.addSelectMetricSegment = function () {
                    this.queryModel.addSelectMetricSegment();
                    this.segments.push(this.uiSegmentSrv.newSelectMetric());
                };
                IrondbQueryCtrl.prototype.checkOtherSegments = function (fromIndex) {
                    var _this = this;
                    if (fromIndex === 0) {
                        this.addSelectMetricSegment();
                        return;
                    }
                    var path = this.queryModel.getSegmentPathUpTo(fromIndex + 1);
                    if (path === '') {
                        return Promise.resolve();
                    }
                    return this.datasource
                        .metricFindQuery(path + '*')
                        .then(function (segments) {
                        if (segments.data.length === 0) {
                            if (path !== '') {
                                _this.queryModel.segments = _this.queryModel.segments.splice(0, fromIndex + 1);
                                _this.segments = _this.segments.splice(0, fromIndex + 1);
                            }
                        }
                        else {
                            lodash_1.default.map(segments.data, function (segment) {
                                var pathRegExp = new RegExp(_this.escapeRegExp(path), 'i');
                                var segmentName = segment.name.replace(pathRegExp, '');
                                segment.name = segmentName;
                            });
                            if (_this.segments.length === fromIndex) {
                                _this.addSelectMetricSegment();
                            }
                            else {
                                return _this.checkOtherSegments(fromIndex + 1);
                            }
                        }
                    })
                        .catch(function (err) {
                    });
                };
                IrondbQueryCtrl.prototype.setSegmentFocus = function (segmentIndex) {
                    lodash_1.default.each(this.segments, function (segment, index) {
                        segment.focus = segmentIndex === index;
                    });
                };
                IrondbQueryCtrl.prototype.segmentValueChanged = function (segment, segmentIndex) {
                    var _this = this;
                    this.error = null;
                    this.queryModel.updateSegmentValue(segment, segmentIndex);
                    this.spliceSegments(segmentIndex + 1);
                    if (segment.expandable) {
                        return this.checkOtherSegments(segmentIndex + 1).then(function () {
                            _this.setSegmentFocus(segmentIndex + 1);
                            _this.targetChanged();
                        });
                    }
                    else {
                        this.spliceSegments(segmentIndex + 1);
                    }
                    this.setSegmentFocus(segmentIndex + 1);
                    this.targetChanged();
                };
                IrondbQueryCtrl.prototype.spliceSegments = function (index) {
                    this.segments = this.segments.splice(0, index);
                    this.queryModel.segments = this.queryModel.segments.splice(0, index);
                };
                IrondbQueryCtrl.prototype.emptySegments = function () {
                    this.queryModel.segments = [];
                    this.segments = [];
                };
                IrondbQueryCtrl.prototype.updateModelTarget = function () {
                    this.queryModel.updateModelTarget(this.panelCtrl.panel.targets);
                };
                IrondbQueryCtrl.prototype.targetChanged = function () {
                    if (this.queryModel.error) {
                        return;
                    }
                    var oldTarget = this.queryModel.target.query;
                    this.updateModelTarget();
                    if (this.queryModel.target !== oldTarget) {
                        this.panelCtrl.refresh();
                    }
                };
                IrondbQueryCtrl.prototype.showDelimiter = function (index) {
                    return index !== this.segments.length - 1;
                };
                IrondbQueryCtrl.prototype.escapeRegExp = function (regexp) {
                    var specialChars = "[]{}()*?.,";
                    var fixedRegExp = [];
                    for (var i = 0; i < regexp.length; ++i) {
                        var c = regexp.charAt(i);
                        switch (c) {
                            case '?':
                                fixedRegExp.push(".");
                                break;
                            case '*':
                                fixedRegExp.push(".*?");
                                break;
                            default:
                                if (specialChars.indexOf(c) >= 0) {
                                    fixedRegExp.push("\\");
                                }
                                fixedRegExp.push(c);
                        }
                    }
                    return fixedRegExp.join('');
                };
                IrondbQueryCtrl.templateUrl = 'partials/query.editor.html';
                return IrondbQueryCtrl;
            })(sdk_1.QueryCtrl);
            exports_1("IrondbQueryCtrl", IrondbQueryCtrl);
        }
    }
});
//# sourceMappingURL=query_ctrl.js.map