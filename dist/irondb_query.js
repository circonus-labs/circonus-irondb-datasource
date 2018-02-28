System.register(['lodash', './parser'], function(exports_1) {
    var lodash_1, parser_1;
    var IrondbQuery;
    function wrapFunction(target, func) {
        return func.render(target);
    }
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (parser_1_1) {
                parser_1 = parser_1_1;
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
                    //console.log(`this.target (parseTarget): ${JSON.stringify(this.target, null, 2)}`);
                    if (this.target.rawQuery) {
                        return;
                    }
                    var parser = new parser_1.Parser(this.target.query);
                    var astNode = parser.getAst();
                    if (astNode === null) {
                        this.checkOtherSegmentsIndex = 0;
                        return;
                    }
                    if (astNode.type === 'error') {
                        this.error = astNode.message + ' at position: ' + astNode.pos;
                        this.target.rawQuery = true;
                        return;
                    }
                    try {
                        this.parseTargetRecursive(astNode, null);
                    }
                    catch (err) {
                        console.log('error parsing target:', err.message);
                        this.error = err.message;
                        this.target.rawQuery = true;
                    }
                    this.checkOtherSegmentsIndex = this.segments.length - 1;
                };
                IrondbQuery.prototype.getSegmentPathUpTo = function (index) {
                    var arr = this.segments.slice(0, index);
                    //console.log(`arr (getSegmentPathUpTo): ${JSON.stringify(arr, null, 2)}`);
                    return lodash_1.default.reduce(arr, function (result, segment) {
                        //console.log(`segment (getSegmentPathUpTo): ${JSON.stringify(segment, null, 2)}`);
                        //console.log(`result (getSegmentPathUpTo): ${JSON.stringify(result, null, 2)}`);
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
                    this.segments[index].value = segment.value;
                };
                IrondbQuery.prototype.addSelectMetricSegment = function () {
                    this.segments.push({ value: 'select metric' });
                };
                IrondbQuery.prototype.updateModelTarget = function (targets) {
                    // render query
                    //console.log(`this.segments.length (updateModelTarget): ${JSON.stringify(this.segments.length, null, 2)}`);
                    //console.log(`this.target.query (updateModelTarget): ${JSON.stringify(this.target.query, null, 2)}`);
                    this.target.query = this.getSegmentPathUpTo(this.segments.length).replace(/\.select metric.$/, '');
                    //console.log(`this.target.query (updateModelTarget): ${JSON.stringify(this.target.query, null, 2)}`);
                    this.target.query = this.target.query.replace(/\.$/, '');
                    //console.log(`this.target.query (updateModelTarget): ${JSON.stringify(this.target.query, null, 2)}`);
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
                    //console.log(`target (updateRenderedTarget): ${JSON.stringify(target, null, 2)}`);
                    //console.log(`targets (updateRenderedTarget): ${JSON.stringify(targets, null, 2)}`);
                    // render nested query
                    var targetsByRefId = lodash_1.default.keyBy(targets, 'refId');
                    //console.log(`targetsByRefId (updateRenderedTarget): ${JSON.stringify(targetsByRefId, null, 2)}`);
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
                        //console.log(`t (updateRenderedTarget): ${JSON.stringify(t, null, 2)}`);
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