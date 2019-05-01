System.register(['lodash'], function(exports_1) {
    var lodash_1;
    var IrondbQuery;
    function wrapFunction(target, func) {
        return func.render(target);
    }
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            }],
        execute: function() {
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
                    console.log("parseTarget() " + JSON.stringify(this.target));
                    var metricName = this.target.query || '*';
                    var tags = metricName.split(',');
                    metricName = tags.shift();
                    this.segments.push({ type: 'segment', value: metricName });
                    for (var _i = 0; _i < tags.length; _i++) {
                        var tag = tags[_i];
                        tag = tag.split(':');
                        var tagCat = 'tag: ' + tag[0];
                        var tagVal = tag[1];
                        this.segments.push({ type: 'segment', value: tagCat });
                        this.segments.push({ type: 'segment', value: tagVal });
                    }
                    console.log("parseTarget() " + JSON.stringify(this.segments));
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
                    console.log("updateSegmentValue() " + index + " " + JSON.stringify(segment));
                    if (this.segments[index] !== undefined) {
                        this.segments[index].value = segment.value;
                    }
                };
                IrondbQuery.prototype.addSelectMetricSegment = function () {
                    this.segments.push({ value: 'select metric' });
                };
                IrondbQuery.prototype.updateModelTarget = function (targets) {
                    // render query
                    this.target.query = this.getSegmentPathUpTo(this.segments.length).replace(/\.select metric.$/, '');
                    this.target.query = this.target.query.replace(/\.$/, '');
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