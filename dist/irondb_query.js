System.register(['lodash'], function(exports_1) {
    var lodash_1;
    var SegmentType, IrondbQuery;
    function taglessName(name) {
        var tag_start = name.indexOf("ST[");
        if (tag_start != -1) {
            name = name.substring(0, tag_start - 1);
        }
        return name;
    }
    exports_1("taglessName", taglessName);
    function wrapFunction(target, func) {
        return func.render(target);
    }
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            }],
        execute: function() {
            (function (SegmentType) {
                SegmentType[SegmentType["MetricName"] = 0] = "MetricName";
                SegmentType[SegmentType["TagCat"] = 1] = "TagCat";
                SegmentType[SegmentType["TagVal"] = 2] = "TagVal";
                SegmentType[SegmentType["TagPair"] = 3] = "TagPair";
                SegmentType[SegmentType["TagSep"] = 4] = "TagSep";
                SegmentType[SegmentType["TagEnd"] = 5] = "TagEnd";
                SegmentType[SegmentType["TagOp"] = 6] = "TagOp";
                SegmentType[SegmentType["TagPlus"] = 7] = "TagPlus";
            })(SegmentType || (SegmentType = {}));
            exports_1("SegmentType", SegmentType);
            ;
            IrondbQuery = (function () {
                /** @ngInject */
                function IrondbQuery(datasource, target, templateSrv, scopedVars) {
                    this.datasource = datasource;
                    this.target = target;
                    this.parseTarget();
                }
                IrondbQuery.prototype.parseTarget = function () {
                    this.segments = [];
                    this.error = null;
                    if (this.target.rawQuery) {
                        return;
                    }
                    //console.log("IrondbQuery.parseTarget() " + JSON.stringify(this.target));
                    var metricName = this.target.query;
                    // Strip 'and(__name:)' from metric name
                    metricName = metricName.slice(11, -1) || '*';
                    var tags = metricName.split(',');
                    metricName = tags.shift();
                    this.segments.push({ type: SegmentType.MetricName, value: metricName });
                    var first = true;
                    for (var _i = 0; _i < tags.length; _i++) {
                        var tag = tags[_i];
                        if (first) {
                            first = false;
                        }
                        else {
                            this.segments.push({ type: SegmentType.TagSep });
                        }
                        tag = tag.split(':');
                        var tagCat = tag[0];
                        var tagVal = tag[1];
                        var tagOp = false, tagIndex = 4;
                        if (tagCat.startsWith("and(") || tagCat.startsWith("not(")) {
                            tagOp = true;
                        }
                        else if (tagCat.startsWith("or(")) {
                            tagOp = true;
                            tagIndex = 3;
                        }
                        if (tagOp) {
                            this.segments.push({ type: SegmentType.TagOp, value: tagCat.slice(0, tagIndex) });
                            tagCat = tagCat.slice(tagIndex);
                        }
                        this.segments.push({ type: SegmentType.TagCat, value: tagCat });
                        this.segments.push({ type: SegmentType.TagPair });
                        var end = 0;
                        while (tagVal.endsWith(")")) {
                            tagVal = tagVal.slice(0, -1);
                            end++;
                        }
                        this.segments.push({ type: SegmentType.TagVal, value: tagVal });
                        for (var i = 0; i < end; i++) {
                            this.segments.push({ type: SegmentType.TagPlus });
                            this.segments.push({ type: SegmentType.TagEnd });
                        }
                    }
                    if (tags.length === 0) {
                        this.segments.push({ type: SegmentType.TagPlus });
                    }
                    //console.log("IrondbQuery.parseTarget() " + JSON.stringify(_.map(this.segments, (s) => SegmentType[s.type])));
                };
                IrondbQuery.prototype.getSegmentPathUpTo = function (index) {
                    var arr = this.segments.slice(0, index);
                    return lodash_1.default.reduce(arr, function (result, segment) {
                        return result ? result + segment.value + '.' : segment.value + '.';
                    }, '');
                };
                IrondbQuery.prototype.parseTargetRecursive = function (astNode, func) {
                    if (astNode === null) {
                        return null;
                    }
                    switch (astNode.type) {
                        case 'metric':
                            this.segments = astNode.segments;
                            break;
                    }
                };
                IrondbQuery.prototype.updateSegmentValue = function (segment, index) {
                    //console.log("IrondbQuery.updateSegmentValue() " + index + " " + JSON.stringify(segment));
                    //console.log("IrondbQuery.updateSegmentValue() len " + this.segments.length);
                    if (this.segments[index] !== undefined) {
                        this.segments[index].value = segment.value;
                    }
                };
                IrondbQuery.prototype.addSelectMetricSegment = function () {
                    this.segments.push({ value: 'select metric' });
                };
                IrondbQuery.prototype.updateModelTarget = function (targets) {
                    //console.log("IrondbQuery.updateModelTarget() " + JSON.stringify(targets));
                    // render query
                    //this.target.query = this.getSegmentPathUpTo(this.segments.length).replace(/\.select metric.$/, '');
                    //this.target.query = this.target.query.replace(/\.$/, '');
                    this.updateRenderedTarget(this.target, targets);
                    // loop through other queries and update targetFull as needed
                    for (var _i = 0, _a = targets || []; _i < _a.length; _i++) {
                        var target = _a[_i];
                        if (target.refId !== this.target.refId) {
                            this.updateRenderedTarget(target, targets);
                        }
                    }
                };
                IrondbQuery.prototype.updateRenderedTarget = function (target, targets) {
                    // render nested query
                    var targetsByRefId = lodash_1.default.keyBy(targets, 'refId');
                    // no references to self
                    delete targetsByRefId[target.refId];
                    var targetWithNestedQueries = target.query;
                    // Use ref count to track circular references
                    function countTargetRefs(targetsByRefId, refId) {
                        var refCount = 0;
                        lodash_1.default.each(targetsByRefId, function (t, id) {
                            if (id !== refId) {
                            }
                        });
                        targetsByRefId[refId].refCount = refCount;
                    }
                    lodash_1.default.each(targetsByRefId, function (t, id) {
                        countTargetRefs(targetsByRefId, id);
                    });
                    delete target.targetFull;
                    if (target.query !== targetWithNestedQueries) {
                        target.targetFull = targetWithNestedQueries;
                    }
                };
                return IrondbQuery;
            })();
            exports_1("default", IrondbQuery);
        }
    }
});
//# sourceMappingURL=irondb_query.js.map