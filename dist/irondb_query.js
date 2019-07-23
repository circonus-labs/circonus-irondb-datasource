System.register(['lodash'], function(exports_1) {
    var lodash_1;
    var SegmentType, _private_nil, vTagMapKey, vTagMapValue, IrondbQuery;
    function splitTags(tags, decode) {
        if (decode === void 0) { decode = true; }
        var outTags = {};
        for (var _i = 0, _a = tags.split(/,/g); _i < _a.length; _i++) {
            var tag = _a[_i];
            var tagSep = tag.split(/:/g);
            var tagCat = tagSep.shift();
            var tagVal = tagSep.join(':');
            if (decode) {
                tagCat = decodeTag(tagCat);
                tagVal = decodeTag(tagVal);
            }
            var tagVals = outTags[tagCat];
            if (lodash_1.default.isUndefined(tagVals)) {
                outTags[tagCat] = tagVals = [];
            }
            tagVals.push(tagVal);
        }
        return outTags;
    }
    function taglessNameAndTags(name) {
        var tags = "";
        var tagStart = name.indexOf("ST[");
        if (tagStart != -1) {
            tags = name.substring(tagStart + 3, name.length - 1);
            name = name.substring(0, tagStart - 1);
        }
        return [name, tags];
    }
    function taglessName(name) {
        return taglessNameAndTags(name)[0];
    }
    exports_1("taglessName", taglessName);
    function metaTagDiff(meta, tag) {
        var keycnt = 0;
        var seen = new Map();
        for (var i = 0; i < meta.length; i++) {
            var _a = taglessNameAndTags(meta[i].metric_name), name = _a[0], tags = _a[1];
            var tagSet = splitTags(tags);
            var mtag = tagSet[tag] !== undefined ? tagSet[tag][0] : _private_nil;
            if (seen.get(mtag) === undefined) {
                keycnt = keycnt + 1;
            }
            seen.set(mtag, true);
        }
        return keycnt > 1;
    }
    function metaInterpolateLabel(fmt, meta_in, idx) {
        var meta = meta_in[idx];
        // case %d
        var label = fmt.replace(/%d/g, (idx + 1).toString());
        // case %n
        label = label.replace(/%n/g, taglessName(meta.metric_name));
        // case %cn
        label = label.replace(/%cn/g, meta.metric_name);
        // case %tv
        label = label.replace(/%tv-?{([^}]*)}/g, function (x) {
            var elide = x.substring(3, 4);
            var choose = elide === "-" ? metaTagDiff : function () { return true; };
            var tag = x.substring(elide === "-" ? 5 : 4, x.length - 1);
            var _a = taglessNameAndTags(meta.metric_name), name = _a[0], tags = _a[1];
            var tagSet = splitTags(tags);
            if (tag === "*") {
                var tagCats = [];
                for (var _i = 0, _b = lodash_1.default.keys(tagSet); _i < _b.length; _i++) {
                    var k = _b[_i];
                    if (!k.startsWith("__") && choose(meta_in, k)) {
                        tagCats.push(k);
                    }
                }
                tagCats.sort();
                var tagVals = lodash_1.default.map(tagCats, function (tagCat) { return tagSet[tagCat][0]; });
                return tagVals.join(",");
            }
            if (tagSet[tag] !== undefined && choose(meta_in, tag)) {
                return tagSet[tag][0];
            }
            return "";
        });
        // case %t
        label = label.replace(/%t-?{([^}]*)}/g, function (x) {
            var elide = x.substring(2, 3);
            var choose = elide === "-" ? metaTagDiff : function () { return true; };
            var tag = x.substring(elide === "-" ? 4 : 3, x.length - 1);
            var _a = taglessNameAndTags(meta.metric_name), name = _a[0], tags = _a[1];
            var tagSet = splitTags(tags);
            if (tag === "*") {
                var tagCats = [];
                for (var _i = 0, _b = lodash_1.default.keys(tagSet); _i < _b.length; _i++) {
                    var k = _b[_i];
                    if (!k.startsWith("__") && choose(meta_in, k)) {
                        var v = tagSet[k][0];
                        tagCats.push(k + ":" + v);
                    }
                }
                tagCats.sort();
                return tagCats.join(",");
            }
            if (tagSet[tag] !== undefined && choose(meta_in, tag)) {
                return tag + ":" + tagSet[tag][0];
            }
            return "";
        });
        return label;
    }
    exports_1("metaInterpolateLabel", metaInterpolateLabel);
    function IsTaggableKeyChar(c) {
        return vTagMapKey[c] == 1;
    }
    function IsTaggableValueChar(c) {
        return vTagMapValue[c] == 1;
    }
    function IsTaggablePart(tag, tagPartFunction) {
        var n = 0;
        for (var i = 0; i < tag.length; i++) {
            var c = tag.charCodeAt(i);
            if (tagPartFunction(c)) {
                n += 1;
            }
        }
        return n === tag.length;
    }
    function IsTaggableKey(tag) {
        return IsTaggablePart(tag, IsTaggableKeyChar);
    }
    function IsTaggableValue(tag) {
        return IsTaggablePart(tag, IsTaggableValueChar);
    }
    function encodeTag(type, tag) {
        var needsBase64 = false;
        if (type === SegmentType.TagCat && !IsTaggableKey(tag)) {
            needsBase64 = true;
        }
        else if (type === SegmentType.TagVal && !IsTaggableValue(tag)) {
            if (!(tag.length === 1 && tag.charAt(0) === '*')) {
                needsBase64 = true;
            }
        }
        if (needsBase64) {
            tag = 'b"' + btoa(tag) + '"';
        }
        return tag;
    }
    exports_1("encodeTag", encodeTag);
    function decodeTag(tag) {
        if (tag.startsWith('b"') && tag.endsWith('"')) {
            tag = atob(tag.slice(2, tag.length - 1));
        }
        return tag;
    }
    exports_1("decodeTag", decodeTag);
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
            ;
            // given an array of meta objects, return true if the tag cat
            // specified has variance in the array
            _private_nil = {}; // just some truthy value different from every string
            /*
             * map for ascii tags
              perl -e '$valid = qr/[`+A-Za-z0-9!@#\$%^&"'\/\?\._-]/;
              foreach $i (0..7) {
              foreach $j (0..31) { printf "%d,", chr($i*32+$j) =~ $valid; }
              print "\n";
              }'
            */
            vTagMapKey = [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1,
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1,
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ];
            /* Same as above, but allow for ':' and '=' */
            vTagMapValue = [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1,
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1,
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ];
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
                        var tagCat = tag.shift();
                        var tagVal = tag.join(':');
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
                        this.segments.push({ type: SegmentType.TagCat, value: decodeTag(tagCat) });
                        this.segments.push({ type: SegmentType.TagPair });
                        var end = 0;
                        while (tagVal.endsWith(")")) {
                            tagVal = tagVal.slice(0, -1);
                            end++;
                        }
                        this.segments.push({ type: SegmentType.TagVal, value: decodeTag(tagVal) });
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