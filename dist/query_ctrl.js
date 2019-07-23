///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register(['lodash', './irondb_query', 'app/plugins/sdk', './css/query_editor.css!'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var lodash_1, irondb_query_1, irondb_query_2, sdk_1;
    var IrondbQueryCtrl;
    function isEven(x) {
        return x % 2 == 0;
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
                irondb_query_2 = irondb_query_1_1;
            },
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            },
            function (_1) {}],
        execute: function() {
            /*const changePanelType = (dashboard, oldPanel, newPluginId: string) => {
              const index = dashboard.panels.findIndex(panel => {
                return panel.id === oldPanel.id;
              });
            
              const deletedPanel = dashboard.panels.splice(index, 1);
              dashboard.events.emit('panel-removed', deletedPanel);
            
              var newPanel = oldPanel.getSaveModel();
              console.log(newPanel.type);
              newPanel.type = newPluginId;
              console.log(newPanel.type);
              console.log(newPanel.events);
              console.log(newPanel.id + " " + oldPanel.id);
              newPanel = new oldPanel.constructor(newPanel);
              console.log(newPanel.events);
              console.log(newPanel.type);
            
              dashboard.panels.splice(index, 0, newPanel);
              dashboard.sortPanelsByGridPos();
              dashboard.events.emit('panel-added', newPanel);
            };*/
            IrondbQueryCtrl = (function (_super) {
                __extends(IrondbQueryCtrl, _super);
                /** @ngInject **/
                function IrondbQueryCtrl($scope, $injector, uiSegmentSrv, templateSrv) {
                    _super.call(this, $scope, $injector);
                    this.uiSegmentSrv = uiSegmentSrv;
                    this.templateSrv = templateSrv;
                    this.defaults = {};
                    this.labelTypeOptions = [{ value: "default", text: "name and tags" },
                        { value: "name", text: "name only" },
                        { value: "cardinality", text: "high cardinality tags" },
                        { value: "custom", text: "custom" }];
                    this.egressTypeOptions = [{ value: "count", text: "number of data points (count)" },
                        { value: "average", text: "average value (gauge)" },
                        { value: "average_stddev", text: "standard deviation a.k.a. σ (stddev)" },
                        { value: "derive", text: "rate of change (derive)" },
                        { value: "derive_stddev", text: "rate of change σ (derive_stddev)" },
                        { value: "counter", text: "rate of positive change (counter)" },
                        { value: "counter_stddev", text: "rate of positive change σ (counter_stddev)" }];
                    this.caqlFindFunctions = {
                        count: "count",
                        average: "average",
                        average_stddev: "stddev",
                        derive: "derivative",
                        derive_stddev: "derivative_stddev",
                        counter: "counter",
                        counter_stddev: "counter_stddev" };
                    lodash_1.default.defaultsDeep(this.target, this.defaults);
                    this.target.isCaql = this.target.isCaql || false;
                    this.target.egressoverride = this.target.egressoverride || "average";
                    this.target.metriclabel = this.target.metriclabel || "";
                    this.target.labeltype = this.target.labeltype || "default";
                    this.target.query = this.target.query || '';
                    this.target.segments = this.target.segments || [];
                    this.target.paneltype = this.panelCtrl.pluginName;
                    this.queryModel = new irondb_query_1.default(this.datasource, this.target, templateSrv);
                    this.buildSegments();
                    this.updateMetricLabelValue(false);
                    /*console.log("TYPE " + this.panelCtrl.pluginName + " " + this.panelCtrl.pluginId);
                    console.log(this.panel.constructor);
                    console.log(window["PanelModel"]);
                    console.log(eval("new PanelModel()"));*/
                }
                IrondbQueryCtrl.prototype.toggleEditorMode = function () {
                    //console.log("toggleEditorMode()");
                    this.target.isCaql = !this.target.isCaql;
                    this.typeValueChanged();
                    /*var newPanel = this.panel.getSaveModel();
                    newPanel.type = "heatmap";
                    this.isHistogram = !this.isHistogram;
                    changePanelType(this.panelCtrl.dashboard, this.panel, this.isHistogram ? "heatmap" : "graph");
                    this.panel.changeType(this.isHistogram ? "heatmap" : "graph");
                    this.panel.initialized();
                    this.panelCtrl.refresh();
                    this.panel.render();*/
                };
                IrondbQueryCtrl.prototype.typeValueChanged = function () {
                    if (this.target.isCaql) {
                        var caqlQuery = this.segmentsToCaqlFind();
                        this.target.query = caqlQuery;
                    }
                    else {
                        this.target.query = "";
                        this.target.egressoverride = "average";
                        this.target.labeltype = "default";
                        this.emptySegments();
                        this.parseTarget();
                    }
                    this.error = null;
                    this.panelCtrl.refresh();
                };
                IrondbQueryCtrl.prototype.labelTypeValueChanged = function () {
                    if (this.target.labeltype === "custom") {
                        setTimeout(function () {
                            document.getElementById("metriclabel").focus();
                        }, 50);
                    }
                    this.panelCtrl.refresh();
                };
                IrondbQueryCtrl.prototype.metricLabelKeyUp = function (event) {
                    var self = this;
                    var element = event.currentTarget;
                    if (event.keyCode === 13) {
                        setTimeout(function () {
                            self.target.metriclabel = element.value;
                            self.updateMetricLabelValue();
                        }, 0);
                    }
                };
                IrondbQueryCtrl.prototype.updateMetricLabelValue = function (refresh) {
                    if (refresh === void 0) { refresh = true; }
                    if (this.target.metriclabel === "" && this.target.labeltype === "custom") {
                        this.target.labeltype = "default";
                    }
                    if (refresh) {
                        this.panelCtrl.refresh();
                    }
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
                    //console.log("getSegments() " + index + " " + prefix);
                    var query = prefix && prefix.length > 0 ? prefix : '';
                    var segmentType = this.segments[index]._type;
                    //console.log("getSegments() " + index + " " + SegmentType[segmentType]);
                    if (segmentType === irondb_query_2.SegmentType.MetricName) {
                        return this.datasource
                            .metricTagsQuery("and(__name:" + query + "*)", true)
                            .then(function (results) {
                            var metricnames = lodash_1.default.map(results.data, function (result) {
                                return irondb_query_2.taglessName(result.metric_name);
                            });
                            metricnames = lodash_1.default.uniq(metricnames);
                            //console.log(JSON.stringify(metricnames));
                            var allSegments = lodash_1.default.map(metricnames, function (segment) {
                                //var queryRegExp = new RegExp(this.escapeRegExp(query), 'i');
                                return _this.newSegment(irondb_query_2.SegmentType.MetricName, {
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
                            //console.log("getSegments() " + err.toString());
                            return [];
                        });
                    }
                    else if (segmentType === irondb_query_2.SegmentType.TagCat || segmentType === irondb_query_2.SegmentType.TagPlus) {
                        var metricName = irondb_query_2.encodeTag(irondb_query_2.SegmentType.TagVal, this.segments[0].value);
                        //console.log("getSegments() tags for " + metricName);
                        return this.datasource
                            .metricTagCatsQuery(metricName)
                            .then(function (segments) {
                            if (segments.data && segments.data.length > 0) {
                                var tagCats = segments.data;
                                var tagSegments = [];
                                for (var _i = 0; _i < tagCats.length; _i++) {
                                    var tagCat = tagCats[_i];
                                    tagSegments.push(_this.newSegment(irondb_query_2.SegmentType.TagCat, {
                                        value: irondb_query_2.decodeTag(tagCat),
                                        expandable: true
                                    }));
                                }
                                if (segmentType === irondb_query_2.SegmentType.TagPlus) {
                                    // For Plus, we want to allow new operators, so put those on the front
                                    tagSegments.unshift(_this.newSegment(irondb_query_2.SegmentType.TagOp, { value: "and(" }));
                                    tagSegments.unshift(_this.newSegment(irondb_query_2.SegmentType.TagOp, { value: "not(" }));
                                    tagSegments.unshift(_this.newSegment(irondb_query_2.SegmentType.TagOp, { value: "or(" }));
                                }
                                return tagSegments;
                            }
                        })
                            .catch(function (err) {
                            //console.log(err);
                            return [];
                        });
                    }
                    else if (segmentType === irondb_query_2.SegmentType.TagOp) {
                        var tagSegments = [
                            this.newSegment(irondb_query_2.SegmentType.TagOp, { value: "REMOVE" }),
                            this.newSegment(irondb_query_2.SegmentType.TagOp, { value: "and(" }),
                            this.newSegment(irondb_query_2.SegmentType.TagOp, { value: "not(" }),
                            this.newSegment(irondb_query_2.SegmentType.TagOp, { value: "or(" })
                        ];
                        return Promise.resolve(tagSegments);
                    }
                    else if (segmentType === irondb_query_2.SegmentType.TagVal) {
                        var metricName = irondb_query_2.encodeTag(irondb_query_2.SegmentType.TagVal, this.segments[0].value);
                        var tagCat = this.segments[index - 2].value;
                        if (tagCat === "select tag") {
                            return Promise.resolve([]);
                        }
                        //console.log("getSegments() tag vals for " + metricName + ", " + tagCat);
                        return this.datasource
                            .metricTagValsQuery(metricName, irondb_query_2.encodeTag(irondb_query_2.SegmentType.TagCat, tagCat))
                            .then(function (segments) {
                            if (segments.data && segments.data.length > 0) {
                                var tagVals = segments.data;
                                var tagSegments = [];
                                tagSegments.push(_this.newSegment(irondb_query_2.SegmentType.TagVal, {
                                    value: '*',
                                    expandable: true
                                }));
                                lodash_1.default.eachRight(_this.templateSrv.variables, function (variable) {
                                    tagSegments.push(_this.newSegment(irondb_query_2.SegmentType.TagVal, {
                                        type: 'template',
                                        value: '$' + variable.name,
                                        expandable: true,
                                    }));
                                });
                                for (var _i = 0; _i < tagVals.length; _i++) {
                                    var tagVal = tagVals[_i];
                                    tagSegments.push(_this.newSegment(irondb_query_2.SegmentType.TagVal, {
                                        value: irondb_query_2.decodeTag(tagVal),
                                        expandable: true
                                    }));
                                }
                                return tagSegments;
                            }
                        })
                            .catch(function (err) {
                            //console.log(err);
                            return [];
                        });
                    }
                    return Promise.resolve([]);
                };
                IrondbQueryCtrl.prototype.parseTarget = function () {
                    this.queryModel.parseTarget();
                    this.buildSegments();
                };
                IrondbQueryCtrl.prototype.setSegmentType = function (segment, type) {
                    segment._type = type;
                    segment._typeName = irondb_query_2.SegmentType[type];
                    return segment;
                };
                IrondbQueryCtrl.prototype.newSegment = function (type, options) {
                    var segment = this.uiSegmentSrv.newSegment(options);
                    return this.setSegmentType(segment, type);
                };
                IrondbQueryCtrl.prototype.mapSegment = function (segment) {
                    var uiSegment;
                    if (segment.type === irondb_query_2.SegmentType.TagOp) {
                        uiSegment = this.uiSegmentSrv.newOperator(segment.value);
                    }
                    else if (segment.type === irondb_query_2.SegmentType.TagEnd) {
                        uiSegment = this.uiSegmentSrv.newOperator(")");
                    }
                    else if (segment.type === irondb_query_2.SegmentType.TagPair) {
                        uiSegment = this.uiSegmentSrv.newCondition(":");
                    }
                    else if (segment.type === irondb_query_2.SegmentType.TagSep) {
                        uiSegment = this.uiSegmentSrv.newCondition(",");
                    }
                    else if (segment.type === irondb_query_2.SegmentType.TagPlus) {
                        uiSegment = this.buildSelectTagPlusSegment();
                    }
                    else {
                        uiSegment = this.uiSegmentSrv.newSegment(segment);
                    }
                    return this.setSegmentType(uiSegment, segment.type);
                };
                IrondbQueryCtrl.prototype.buildSegments = function () {
                    var _this = this;
                    this.segments = lodash_1.default.map(this.queryModel.segments, function (s) { return _this.mapSegment(s); });
                    var checkOtherSegmentsIndex = this.queryModel.checkOtherSegmentsIndex || 0;
                    this.checkOtherSegments(checkOtherSegmentsIndex);
                };
                IrondbQueryCtrl.prototype.addSelectMetricSegment = function () {
                    this.queryModel.addSelectMetricSegment();
                    var segment = this.uiSegmentSrv.newSelectMetric();
                    this.setSegmentType(segment, irondb_query_2.SegmentType.MetricName);
                    this.segments.push(segment);
                };
                IrondbQueryCtrl.prototype.buildSelectTagPlusSegment = function () {
                    //this.queryModel.addSelectMetricSegment();
                    var tagCatSegment = this.uiSegmentSrv.newPlusButton();
                    this.setSegmentType(tagCatSegment, irondb_query_2.SegmentType.TagPlus);
                    return tagCatSegment;
                };
                IrondbQueryCtrl.prototype.addSelectTagPlusSegment = function () {
                    this.segments.push(this.buildSelectTagPlusSegment());
                };
                IrondbQueryCtrl.prototype.newSelectTagValSegment = function () {
                    var tagValSegment = this.uiSegmentSrv.newKeyValue("*");
                    this.setSegmentType(tagValSegment, irondb_query_2.SegmentType.TagVal);
                    return tagValSegment;
                };
                IrondbQueryCtrl.prototype.checkOtherSegments = function (fromIndex) {
                    if (fromIndex === this.segments.length) {
                        var segmentType = this.segments[fromIndex - 1]._type;
                        //console.log("checkOtherSegments() " + (fromIndex - 1) + " " + SegmentType[segmentType]);
                        if (segmentType === irondb_query_2.SegmentType.MetricName) {
                            this.addSelectTagPlusSegment();
                        }
                    }
                    return Promise.resolve();
                };
                IrondbQueryCtrl.prototype.setSegmentFocus = function (segmentIndex) {
                    lodash_1.default.each(this.segments, function (segment, index) {
                        segment.focus = segmentIndex === index;
                    });
                };
                IrondbQueryCtrl.prototype.segmentValueChanged = function (segment, segmentIndex) {
                    var _this = this;
                    //console.log("segmentValueChanged()");
                    this.error = null;
                    this.queryModel.updateSegmentValue(segment, segmentIndex);
                    if (segment._type === irondb_query_2.SegmentType.TagOp) {
                        if (segment.value === "REMOVE") {
                            // We need to remove ourself, as well as every other segment until our TagEnd
                            // For every TagOp we hit, we need to get one more TagEnd to remove any sub-ops
                            var endIndex = segmentIndex + 1;
                            var endsNeeded = 1;
                            var lastIndex = this.segments.length;
                            while (endsNeeded > 0 && endIndex < lastIndex) {
                                var type = this.segments[endIndex]._type;
                                if (type === irondb_query_2.SegmentType.TagOp) {
                                    endsNeeded++;
                                }
                                else if (type === irondb_query_2.SegmentType.TagEnd) {
                                    endsNeeded--;
                                    if (endsNeeded == 0) {
                                        break; // don't increment endIndex
                                    }
                                }
                                endIndex++; // keep going
                            }
                            var deleteStart = segmentIndex;
                            var countDelete = endIndex - segmentIndex + 1;
                            if (segmentIndex > 2) {
                                // If I'm not the very first operator, then i have a comma in front of me that needs killing
                                deleteStart--;
                                countDelete++;
                            }
                            this.segments.splice(deleteStart, countDelete);
                            if (lastIndex === endIndex + 1) {
                                // If these match, we removed the outermost operator, so we need a new + button
                                this.segments.push(this.buildSelectTagPlusSegment());
                            }
                        }
                        // else Changing an Operator doesn't need to affect any other segments
                        this.targetChanged();
                        return;
                    }
                    else if (segment._type === irondb_query_2.SegmentType.TagPlus) {
                        if (segment.value === "and(" ||
                            segment.value === "not(" ||
                            segment.value === "or(") {
                            // Remove myself
                            this.segments.splice(segmentIndex, 1);
                            if (segmentIndex > 2) {
                                this.segments.splice(segmentIndex, 0, this.mapSegment({ type: irondb_query_2.SegmentType.TagSep }));
                            }
                            // and replace it with a TagOp + friends
                            this.segments.splice(segmentIndex + 1, 0, this.mapSegment({ type: irondb_query_2.SegmentType.TagOp, value: segment.value }), this.mapSegment({ type: irondb_query_2.SegmentType.TagCat, value: "select tag", fake: true }), this.mapSegment({ type: irondb_query_2.SegmentType.TagPair }), this.newSelectTagValSegment(), this.buildSelectTagPlusSegment(), this.mapSegment({ type: irondb_query_2.SegmentType.TagEnd }));
                            if (segmentIndex > 2) {
                                this.segments.splice(segmentIndex + 7, 0, this.buildSelectTagPlusSegment());
                            }
                            // Do not trigger targetChanged().  We do not have a valid category, which we need, so set focus on it
                            this.setSegmentFocus(segmentIndex + 3);
                            return;
                        }
                        else {
                            // Remove myself
                            this.segments.splice(segmentIndex, 1);
                            if (segmentIndex > 2) {
                                this.segments.splice(segmentIndex, 0, this.mapSegment({ type: irondb_query_2.SegmentType.TagSep }));
                            }
                            // and replace it with a TagOp + friends
                            this.segments.splice(segmentIndex + 1, 0, this.mapSegment({ type: irondb_query_2.SegmentType.TagCat, value: segment.value }), this.mapSegment({ type: irondb_query_2.SegmentType.TagPair }), this.newSelectTagValSegment(), this.buildSelectTagPlusSegment());
                            if (segmentIndex == 1) {
                                // if index is 1 (immediatley after metric name), it's the first add and we're a tagCat 
                                // so that means we need to add in the implicit and() in the front
                                this.segments.splice(segmentIndex, 0, this.mapSegment({ type: irondb_query_2.SegmentType.TagOp, value: "and(" }));
                                this.segments.push(this.mapSegment({ type: irondb_query_2.SegmentType.TagEnd }));
                            }
                        }
                    }
                    if (segmentIndex == 0) {
                        // If we changed the start metric, all the filters are invalid
                        this.spliceSegments(segmentIndex + 1);
                    }
                    if (segment.expandable) {
                        return this.checkOtherSegments(segmentIndex + 1).then(function () {
                            _this.setSegmentFocus(segmentIndex + 1);
                            _this.targetChanged();
                        });
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
                IrondbQueryCtrl.prototype.segmentsToStreamTags = function () {
                    var segments = this.segments.slice();
                    // First element is always metric name
                    var metricName = segments.shift().value;
                    var query = "and(__name:" + irondb_query_2.encodeTag(irondb_query_2.SegmentType.TagVal, metricName);
                    var noComma = false; // because last was a tag:pair
                    for (var _i = 0; _i < segments.length; _i++) {
                        var segment = segments[_i];
                        var type = segment._type;
                        if (type === irondb_query_2.SegmentType.TagPlus) {
                            continue;
                        }
                        if (!noComma && type !== irondb_query_2.SegmentType.TagEnd && type !== irondb_query_2.SegmentType.TagSep) {
                            query += ",";
                        }
                        if (type === irondb_query_2.SegmentType.TagOp || type === irondb_query_2.SegmentType.TagPair || type === irondb_query_2.SegmentType.TagCat || type === irondb_query_2.SegmentType.TagSep) {
                            noComma = true;
                        }
                        else {
                            noComma = false;
                        }
                        query += irondb_query_2.encodeTag(type, segment.value);
                    }
                    query += ")";
                    return query;
                };
                IrondbQueryCtrl.prototype.queryFunctionToCaqlFind = function () {
                    if (this.target.paneltype === "Heatmap") {
                        return "find:histogram";
                    }
                    var findFunction = "find";
                    var egressOverride = this.target.egressoverride;
                    if (egressOverride !== "average") {
                        egressOverride = this.caqlFindFunctions[egressOverride];
                        findFunction += ":" + egressOverride;
                    }
                    return findFunction;
                };
                IrondbQueryCtrl.prototype.buildCaqlLabel = function () {
                    var labeltype = this.target.labeltype;
                    var metriclabel = this.target.metriclabel;
                    if (labeltype !== "default") {
                        if (labeltype === "custom" && metriclabel !== "") {
                            metriclabel = metriclabel.replace(/'/g, "\"");
                            return " | label('" + metriclabel + "')";
                        }
                        else if (labeltype === "name") {
                            return " | label('%n')";
                        }
                        else if (labeltype === "cardinality") {
                            return " | label('%n | %t-{*}')";
                        }
                    }
                    // Always use label() for tag decoding
                    return " | label('%cn')";
                };
                IrondbQueryCtrl.prototype.segmentsToCaqlFind = function () {
                    var segments = this.segments.slice();
                    // First element is always metric name
                    var metricName = segments.shift().value;
                    var tagless = segments.length === 1 && segments[0]._type == irondb_query_2.SegmentType.TagPlus;
                    if (metricName === "*" && tagless) {
                        return "";
                    }
                    var query = this.queryFunctionToCaqlFind() + "('" + metricName + "'";
                    if (tagless) {
                        query += ")" + this.buildCaqlLabel();
                        return query;
                    }
                    var firstTag = true;
                    var noComma = false; // because last was a tag:pair
                    for (var _i = 0; _i < segments.length; _i++) {
                        var segment = segments[_i];
                        var type = segment._type;
                        if (type === irondb_query_2.SegmentType.TagPlus) {
                            continue;
                        }
                        if (!noComma && type !== irondb_query_2.SegmentType.TagEnd && type !== irondb_query_2.SegmentType.TagSep) {
                            query += ",";
                            if (firstTag) {
                                query += " '";
                                firstTag = false;
                            }
                        }
                        if (type === irondb_query_2.SegmentType.TagOp || type === irondb_query_2.SegmentType.TagPair || type === irondb_query_2.SegmentType.TagCat || type === irondb_query_2.SegmentType.TagSep) {
                            noComma = true;
                        }
                        else {
                            noComma = false;
                        }
                        query += irondb_query_2.encodeTag(type, segment.value);
                    }
                    query += "')" + this.buildCaqlLabel();
                    return query;
                };
                IrondbQueryCtrl.prototype.updateModelTarget = function () {
                    var streamTags = this.segmentsToStreamTags();
                    //console.log("updateModelTarget() " + streamTags);
                    this.queryModel.updateModelTarget(this.panelCtrl.panel.targets);
                    this.queryModel.target.query = streamTags;
                };
                IrondbQueryCtrl.prototype.targetChanged = function () {
                    //console.log("targetChanged()");
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