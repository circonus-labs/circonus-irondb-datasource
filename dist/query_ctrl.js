///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register(['lodash', './irondb_query', 'app/plugins/sdk', './css/query_editor.css!'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var lodash_1, irondb_query_1, sdk_1;
    var IrondbQueryCtrl;
    function tagless_name(name) {
        var tag_start = name.indexOf("ST[");
        if (tag_start != -1) {
            name = name.substring(0, tag_start - 1);
        }
        return name;
    }
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
                    this.pointTypeOptions = [{ value: "Metric", text: "Metric" }, { value: "CAQL", text: "CAQL" }];
                    this.egressTypeOptions = [{ value: "default", text: "default" },
                        { value: "count", text: "count" },
                        { value: "average", text: "average" },
                        { value: "average_stddev", text: "average_stddev" },
                        { value: "derive", text: "derive" },
                        { value: "derive_stddev", text: "derive_stddev" },
                        { value: "counter", text: "counter" },
                        { value: "counter_stddev", text: "counter_stddev" },
                        { value: "derive2", text: "derive2" },
                        { value: "derive2_stddev", text: "derive2_stddev" },
                        { value: "counter2", text: "counter2" },
                        { value: "counter2_stddev", text: "counter2_stddev" }];
                    lodash_1.default.defaultsDeep(this.target, this.defaults);
                    this.target.isCaql = this.target.isCaql || false;
                    this.target.egressoverride = this.target.egressoverride || "default";
                    this.target.pointtype = this.target.isCaql ? "CAQL" : "Metric";
                    this.target.query = this.target.query || '';
                    this.target.segments = this.target.segments || [];
                    this.queryModel = new irondb_query_1.default(this.datasource, this.target, templateSrv);
                    this.buildSegments();
                    this.loadSegments = false;
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
                    console.log("getSegments() " + index + " " + prefix);
                    var query = prefix && prefix.length > 0 ? prefix : '';
                    if (index === 1) {
                        var metricName = this.segments[0].value;
                        console.log("getSegments() tags for " + metricName);
                        return this.datasource
                            .metricTagCatsQuery(metricName)
                            .then(function (segments) {
                            if (segments.data && segments.data.length > 0) {
                                var tagCats = segments.data;
                                var tagSegments = [];
                                for (var _i = 0; _i < tagCats.length; _i++) {
                                    var tagCat = tagCats[_i];
                                    tagSegments.push(_this.uiSegmentSrv.newSegment({
                                        value: "tag: " + tagCat,
                                        expandable: true
                                    }));
                                }
                                return tagSegments;
                            }
                        })
                            .catch(function (err) {
                            console.log(err);
                            return [];
                        });
                    }
                    else if (index === 2) {
                        var metricName = this.segments[0].value;
                        var tagCat = this.segments[1].value;
                        tagCat = tagCat.slice(5);
                        console.log("getSegments() tag vals for " + metricName + ", " + tagCat);
                        return this.datasource
                            .metricTagValsQuery(metricName, tagCat)
                            .then(function (segments) {
                            if (segments.data && segments.data.length > 0) {
                                var tagVals = segments.data;
                                var tagSegments = [];
                                tagSegments.push(_this.uiSegmentSrv.newSegment({
                                    value: '*',
                                    expandable: true
                                }));
                                for (var _i = 0; _i < tagVals.length; _i++) {
                                    var tagVal = tagVals[_i];
                                    tagSegments.push(_this.uiSegmentSrv.newSegment({
                                        value: tagVal,
                                        expandable: true
                                    }));
                                }
                                return tagSegments;
                            }
                        })
                            .catch(function (err) {
                            console.log(err);
                            return [];
                        });
                    }
                    return this.datasource
                        .metricFindQuery(query + '*')
                        .then(function (results) {
                        var metricnames = lodash_1.default.map(results.data, function (result) {
                            return tagless_name(result.metric_name);
                        });
                        metricnames = lodash_1.default.uniq(metricnames);
                        console.log(JSON.stringify(metricnames));
                        var allSegments = lodash_1.default.map(metricnames, function (segment) {
                            //var queryRegExp = new RegExp(this.escapeRegExp(query), 'i');
                            return _this.uiSegmentSrv.newSegment({
                                value: segment,
                                expandable: true //!segment.leaf,
                            });
                        });
                        /*if (index > 0 && allSegments.length === 0) {
                          return allSegments;
                        }*/
                        // add query references
                        if (index === 0) {
                            lodash_1.default.eachRight(_this.panelCtrl.panel.targets, function (target) {
                                if (target.refId === _this.queryModel.target.refId) {
                                    return;
                                }
                            });
                        }
                        return allSegments;
                    })
                        .catch(function (err) {
                        console.log("getSegments() " + err.toString());
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
                IrondbQueryCtrl.prototype.addSelectTagCatSegment = function () {
                    //this.queryModel.addSelectMetricSegment();
                    var tagCatSegment = this.uiSegmentSrv.newPlusButton();
                    tagCatSegment.html += ' tag';
                    this.segments.push(tagCatSegment);
                };
                IrondbQueryCtrl.prototype.addSelectTagValSegment = function () {
                    //this.queryModel.addSelectMetricSegment();
                    var tagValSegment = this.uiSegmentSrv.newKeyValue("*");
                    this.segments.push(tagValSegment);
                };
                IrondbQueryCtrl.prototype.checkOtherSegments = function (fromIndex) {
                    console.log("checkOtherSegments() " + fromIndex);
                    if (fromIndex === 0) {
                        //this.addSelectMetricSegment();
                        if (!this.loadSegments) {
                            if (this.target.query !== '' && this.segments.length === 1) {
                                this.addSelectTagCatSegment();
                            }
                            this.loadSegments = true;
                        }
                        return;
                    }
                    else if (fromIndex === 1) {
                        this.addSelectTagCatSegment();
                    }
                    else if (fromIndex === 2) {
                        this.addSelectTagValSegment();
                    }
                    else if (fromIndex === 3) {
                        var metricName = this.segments[0].value;
                        var tagCat = this.segments[1].value;
                        var tagVal = this.segments[2].value;
                        tagCat = tagCat.slice(5);
                        metricName += "," + tagCat + ":" + tagVal;
                        console.log(metricName);
                        this.target.query = metricName;
                    }
                    return Promise.resolve();
                    /*var path = this.queryModel.getSegmentPathUpTo(fromIndex + 1);
                    if (path === '') {
                      return Promise.resolve();
                    }
                
                    return this.datasource
                      .metricFindQuery( path + '*' )
                      .then(segments => {
                        if (segments.data.length === 0) {
                          if (path !== '') {
                            this.queryModel.segments = this.queryModel.segments.splice(0, fromIndex + 1);
                            this.segments = this.segments.splice(0, fromIndex + 1);
                          }
                        } else {
                          _.map(segments.data, segment => {
                            var pathRegExp = new RegExp(this.escapeRegExp(path), 'i');
                            var segmentName = segment.name.replace(pathRegExp,'');
                            segment.name = segmentName;
                          });
                          if (this.segments.length === fromIndex) {
                            this.addSelectMetricSegment();
                          } else {
                            return this.checkOtherSegments(fromIndex + 1);
                          }
                        }
                      })
                      .catch(err => {
                      });*/
                };
                IrondbQueryCtrl.prototype.setSegmentFocus = function (segmentIndex) {
                    lodash_1.default.each(this.segments, function (segment, index) {
                        segment.focus = segmentIndex === index;
                    });
                };
                IrondbQueryCtrl.prototype.segmentValueChanged = function (segment, segmentIndex) {
                    var _this = this;
                    console.log("segmentValueChanged()");
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
                    console.log("updateModelTarget()");
                    if (this.segments.length < 3) {
                        this.queryModel.updateModelTarget(this.panelCtrl.panel.targets);
                    }
                };
                IrondbQueryCtrl.prototype.targetChanged = function () {
                    console.log("targetChanged()");
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