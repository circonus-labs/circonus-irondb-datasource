import _ from 'lodash';
import Log from './log';

// this is used for Graphite-style query parsing
import { Parser } from './parser';

const log = Log('IrondbQuery');

export enum SegmentType {
    MetricName,
    TagCat,
    TagVal,
    TagPair,
    TagSep,
    TagEnd,
    TagOp,
    TagPlus,
}

export interface TagSet {
    [tagCat: string]: string[];
}

export function splitTags(tags: string, decode = true): TagSet {
    const outTags: TagSet = {};
    for (const tag of tags.split(/,/g)) {
        const tagSep = tag.split(/:/g);
        let tagCat = tagSep.shift();
        let tagVal = tagSep.join(':');
        if (decode) {
            tagCat = decodeTag(tagCat);
            tagVal = decodeTag(tagVal);
        }
        let tagVals = outTags[tagCat];
        if (_.isUndefined(tagVals)) {
            outTags[tagCat] = tagVals = [];
        }
        tagVals.push(tagVal);
    }
    return outTags;
}

export function mergeTags(dest: TagSet, source: TagSet) {
    for (const cat in source) {
        let vals = dest[cat];
        if (_.isUndefined(vals)) {
            dest[cat] = vals = [];
        }
        vals.push.apply(vals, source[cat]);
    }
}

export function taglessNameAndTags(name: string): [string, string] {
    let tags = '';
    const tagStart = name.indexOf('ST[');
    if (tagStart !== -1) {
        tags = name.substring(tagStart + 3, name.length - 1);
        name = name.substring(0, tagStart - 1);
    }
    return [name, tags];
}

export function taglessName(name: string): string {
    return taglessNameAndTags(name)[0];
}

// given an array of meta objects, return true if the tag cat
// specified has variance in the array
const _privateNil = {}; // just some truthy value different from every string
function metaTagDiff(meta: any[], tag: string) {
    let keycnt = 0;
    const seen = new Map();
    for (let i = 0; i < meta.length; i++) {
        const [name, tags] = taglessNameAndTags(meta[i].metric_name);
        const tagSet = splitTags(tags);

        for (const tag of meta[i].check_tags) {
            const tagSep = tag.split(/:/g);
            let tagCat = tagSep.shift();
            if (!tagCat.startsWith('__') && tagCat !== '') {
                let tagVal = tagSep.join(':');
                tagCat = decodeTag(tagCat);
                tagVal = decodeTag(tagVal);
                if (tagSet[tagCat] === undefined) {
                    tagSet[tagCat] = [];
                }
                tagSet[tagCat].push(tagVal);
            }
        }

        const mtag = tag !== '' && tagSet[tag] !== undefined ? tagSet[tag][0] : _privateNil;
        if (seen.get(mtag) === undefined) {
            keycnt = keycnt + 1;
        }
        seen.set(mtag, true);
    }
    return keycnt > 1;
}

export function metaInterpolateLabel(fmt: string, metaIn: any[], idx: number): string {
    const meta = metaIn[idx];
    // case %d
    let label = fmt.replace(/%d/g, (idx + 1).toString());
    // case %n
    label = label.replace(
        /%n/g,
        taglessName((meta.leaf_data && meta.leaf_data.metric_name) || meta.metric_name || meta.name)
    );
    // case %cn
    label = label.replace(/%cn/g, meta.metric_name || meta.name);

    // allow accessing the check tags
    const [name, stream_tags] = taglessNameAndTags(meta.metric_name || meta.name);
    const tagSet = splitTags(stream_tags);
    for (const tag of meta.check_tags || []) {
        const tagSep = tag.split(/:/g);
        let tagCat = tagSep.shift();
        if (!tagCat.startsWith('__') && tagCat !== '') {
            let tagVal = tagSep.join(':');
            tagCat = decodeTag(tagCat);
            tagVal = decodeTag(tagVal);
            if (tagSet[tagCat] === undefined) {
                tagSet[tagCat] = [];
            }
            tagSet[tagCat].push(tagVal);
        }
    }

    // case %tv
    label = label.replace(/%tv-?{([^}]*)}/g, (x) => {
        const elide = x.substring(3, 4);
        const choose = elide === '-' ? metaTagDiff : () => true;
        const tag = x.substring(elide === '-' ? 5 : 4, x.length - 1);
        if (tag === '*') {
            const tagCats = [];
            for (const k of _.keys(tagSet)) {
                if (!k.startsWith('__') && k !== '' && choose(metaIn, k)) {
                    tagCats.push(k);
                }
            }
            tagCats.sort();
            const tagVals = _.map(tagCats, (tagCat) => tagSet[tagCat][0]);
            return tagVals.join(',');
        }
        if (tagSet[tag] !== undefined && tag !== '' && choose(metaIn, tag)) {
            return tagSet[tag][0];
        }
        return '';
    });
    // case %t
    label = label.replace(/%t-?{([^}]*)}/g, (x) => {
        const elide = x.substring(2, 3);
        const choose = elide === '-' ? metaTagDiff : () => true;
        const tag = x.substring(elide === '-' ? 4 : 3, x.length - 1);
        if (tag === '*') {
            const tagCats = [];
            for (const k of _.keys(tagSet)) {
                if (!k.startsWith('__') && k !== '' && choose(metaIn, k)) {
                    const v = tagSet[k][0];
                    tagCats.push(k + ':' + v);
                }
            }
            tagCats.sort();
            return tagCats.join(',');
        }
        if (tagSet[tag] !== undefined && tag !== '' && choose(metaIn, tag)) {
            return tag + ':' + tagSet[tag][0];
        }
        return '';
    });
    return label;
}

/*
 * map for ascii tags
  perl -e '$valid = qr/[`+A-Za-z0-9!@#\$%^&"'\/\?\._-]/;
  foreach $i (0..7) {
  foreach $j (0..31) { printf "%d,", chr($i*32+$j) =~ $valid; }
  print "\n";
  }'
*/
// prettier-ignore
const vTagMapKey: number[] = [
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,1,1,1,1,1,1,1,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
];

/* Same as above, but allow for ':' and '=' */
// prettier-ignore
const vTagMapValue: number[] = [
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,1,
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
];

function IsTaggableKeyChar(c: number): boolean {
    return vTagMapKey[c] === 1;
}

function IsTaggableValueChar(c: number): boolean {
    return vTagMapValue[c] === 1;
}

type TagPartFunction = (c: number) => boolean;

function IsTaggablePart(tag: string, tagPartFunction: TagPartFunction): boolean {
    let n = 0;
    for (let i = 0; i < tag.length; i++) {
        const c = tag.charCodeAt(i);
        if (tagPartFunction(c)) {
            n += 1;
        }
    }
    return n === tag.length;
}

function IsTaggableKey(tag: string): boolean {
    return IsTaggablePart(tag, IsTaggableKeyChar);
}

function IsTaggableValue(tag: string): boolean {
    return IsTaggablePart(tag, IsTaggableValueChar);
}

export function encodeTag(type: SegmentType, tag: string, exactMatch = true): string {
    if (type === SegmentType.MetricName) {
        type = SegmentType.TagVal;
    }
    let needsBase64 = false;
    if (type === SegmentType.TagCat && !IsTaggableKey(tag)) {
        needsBase64 = true;
    } else if (type === SegmentType.TagVal && !IsTaggableValue(tag)) {
        if (!(tag.length === 1 && tag.charAt(0) === '*')) {
            needsBase64 = true;
        }
    }
    if (needsBase64) {
        let base64Char = '"';
        if (exactMatch) {
            base64Char = '!';
        }
        tag = ['b', base64Char, btoa(tag), base64Char].join('');
    }
    return tag;
}

export function decodeTag(tag: string): string {
    if ((tag.startsWith('b"') && tag.endsWith('"')) || (tag.startsWith('b!') && tag.endsWith('!'))) {
        tag = atob(tag.slice(2, tag.length - 1));
    }
    return tag;
}

export function decodeTagsInLabel(label: string): string {
    let i = 0;
    let l = label.length;
    let replaced = label;
    while (i < l && i !== -1) {
        i = label.indexOf('b"', i);
        if (i === -1) {
            return replaced;
        } else {
            const j = label.indexOf('"', i + 2);
            if (j === -1) {
                //malformed base64 encoding.
                return replaced;
            }
            const t = decodeTag(label.substring(i, j + 1));
            replaced = replaced.replace(label.substring(i, j + 1), t);
            i = j + 1;
        }
    }
    return replaced;
}

export function decodeNameAndTags(name: string): string {
    const tags = [];
    const [metric, rawTags] = taglessNameAndTags(name);
    const tagSet = splitTags(rawTags);
    for (const tagCat of _.keys(tagSet)) {
        tags.push(tagCat + ':' + tagSet[tagCat][0]);
    }
    return metric + (tags.length > 1 ? '|ST[' + tags.join(',') + ']' : '');
}

export function isStatsdCounter(name: string): boolean {
    const [metric, rawTags] = taglessNameAndTags(name);
    const tagSet = splitTags(rawTags);
    const statsdType = tagSet['statsd_type'];
    if (statsdType !== undefined && statsdType.includes('count')) {
        return true;
    }
    return false;
}

export default class IrondbQuery {
    datasource: any;
    target: any;
    segments: any[];
    gSegments: any[];
    error: any;
    templateSrv: any;
    scopedVars: any;

    /** @ngInject */
    constructor(datasource, target, templateSrv?, scopedVars?) {
        this.datasource = datasource;
        this.target = target;
        this.parseGraphiteTarget();
        this.parseTarget();
    }

    // this parses a standard query into segments
    parseTarget() {
        this.segments = [];
        this.error = null;

        log(() => 'parseTarget() target = ' + JSON.stringify(this.target));
        let metricName = this.target.query;
        // Strip 'and(__name:)' from metric name
        metricName = metricName.slice(11, -1) || '*';
        const tags = metricName.split(',');
        metricName = tags.shift();
        this.segments.push({ type: SegmentType.MetricName, value: decodeTag(metricName) });

        let tag_filter = tags.join(',');
        let new_segments = this.parseTagQuery(tag_filter);
        this.segments = this.segments.concat(new_segments);
    }

    // this parses a graphite-style target into segments and also adds the tag filter segments
    parseGraphiteTarget() {
        this.gSegments = [];
        this.error = null;

        // parse the query into segments
        var parser = new Parser(this.target.query || '');
        var astNode = parser.getAst();
        if (astNode === null) {
            this.gSegments.push({ type: SegmentType.TagPlus });
            return;
        } else if (astNode.type === 'error') {
            this.error = astNode.message + ' at position: ' + astNode.pos;
            return;
        }
        // graphite functions are not supported, only metric expressions
        switch (astNode.type) {
            case 'metric':
                this.gSegments = astNode.segments;
                break;
        }
        // add the tag filter if applicable
        const tag_filter = this.target.tag_filter || '';
        if (tag_filter) {
            let new_segments = this.parseTagQuery(tag_filter);
            this.gSegments = this.gSegments.concat(new_segments);
        }
    }

    // this takes a tag/search query like `and(foo:bar)` and converts it to a segments array
    parseTagQuery(tag_query = '') {
        const tags = tag_query ? tag_query.split(',') : [];
        let new_segments = [];
        let first = true;

        for (let tag of tags) {
            if (first) {
                first = false;
            } else {
                new_segments.push({ type: SegmentType.TagSep });
            }
            let tag_pcs = tag.split(':');
            let tag_cat = tag_pcs.shift();
            let tagVal = tag_pcs.join(':');
            let tagOp = false;
            let tagIndex = 4;
            if (tag_cat.startsWith('and(') || tag_cat.startsWith('not(')) {
                tagOp = true;
            } else if (tag_cat.startsWith('or(')) {
                tagOp = true;
                tagIndex = 3;
            }
            if (tagOp) {
                new_segments.push({ type: SegmentType.TagOp, value: tag_cat.slice(0, tagIndex) });
                tag_cat = tag_cat.slice(tagIndex);
            }
            new_segments.push({ type: SegmentType.TagCat, value: decodeTag(tag_cat) });
            new_segments.push({ type: SegmentType.TagPair });
            let end = 0;
            while (tagVal.endsWith(')')) {
                tagVal = tagVal.slice(0, -1);
                end++;
            }
            new_segments.push({ type: SegmentType.TagVal, value: decodeTag(tagVal) });
            for (let i = 0; i < end; i++) {
                new_segments.push({ type: SegmentType.TagPlus });
                new_segments.push({ type: SegmentType.TagEnd });
            }
        }
        // if there were no tags, go ahead and add a plus segment
        if (tags.length === 0) {
            new_segments.push({ type: SegmentType.TagPlus });
        }

        return new_segments;
    }

    // this converts the standard segments array (or another arbitrary string) to the graphite segments array
    convertStandardToGraphite(metricNameOverride = '') {
        let gSegments = (this.gSegments = []);
        let metricName = String(metricNameOverride);

        if (!metricNameOverride) {
            this.segments.some(function (segment) {
                if (segment.type === SegmentType.MetricName) {
                    metricName = segment.value;
                    return true;
                }
            });
        }
        metricName.split('.').forEach(function (piece) {
            if (piece) {
                gSegments.push({ value: piece });
            }
        });
        // if the standard query was '*', we want a blank graphite query
        if (1 === this.gSegments.length && '*' === this.gSegments[0].value) {
            this.gSegments.splice(0, 1);
        }
    }

    // this converts the graphite segments array to the standard segments array
    convertGraphiteToStandard() {
        this.segments = [];
        const graphiteName = this.getGraphiteSegmentPathUpTo(this.gSegments.length)
            .replace(/\.select metric\.$/, '.*')
            .replace(/\.$/, '');
        const matches = graphiteName.match(/^(\w{8}-\w{4}-\w{4}-\w{4}-\w{12})?\.?(.*)$/) || [null, '', '*'];
        const hasUUID = !!matches[1];
        this.segments.push({ type: SegmentType.MetricName, value: matches[2] }); // if there's no metric expression segment selected yet, this will be plain "select metric"
        // have a UUID? then add it as a tag
        if (hasUUID) {
            let tagCat = '__check_uuid';
            let tagVal = matches[1];
            this.segments.push({ type: SegmentType.TagOp, value: 'and(' });
            this.segments.push({ type: SegmentType.TagCat, value: tagCat });
            this.segments.push({ type: SegmentType.TagPair });
            this.segments.push({ type: SegmentType.TagVal, value: tagVal });
            this.segments.push({ type: SegmentType.TagPlus });
            this.segments.push({ type: SegmentType.TagEnd });
            // don't have a UUID? then add a plus segment
        } else {
            this.segments.push({ type: SegmentType.TagPlus });
        }
    }

    // return the entire graphite metric segment path (not including any tag filter)
    getGraphiteSegmentPath() {
        var idx = this.gSegments.findIndex((el) => {
            return el.type != null && el.type !== SegmentType.MetricName;
        });
        if (!~idx) {
            idx = this.gSegments.length;
        }
        return this.getGraphiteSegmentPathUpTo(idx);
    }

    // return the graphite metric segment path up to the specified index
    getGraphiteSegmentPathUpTo(index) {
        var arr = this.gSegments.slice(0, index);
        if (!arr.length) {
            arr.push('');
        }
        return arr.reduce((str, segment) => {
            return (str || '') + (segment.value || '') + '.';
        }, '');
    }

    updateSegmentValue(segment, index) {
        let isGraphite = 'graphite' === this.target.querytype;
        if (this[isGraphite ? 'gSegments' : 'segments'][index] !== undefined) {
            this[isGraphite ? 'gSegments' : 'segments'][index].value = segment.value;
        }
    }

    // add a "select metric" segment before any tag filter segments
    addSelectMetricSegment() {
        let isGraphite = 'graphite' === this.target.querytype;
        let hasSelectAlready = this[isGraphite ? 'gSegments' : 'segments'].some((el) => {
            return el.value === 'select metric';
        });
        let idx = this[isGraphite ? 'gSegments' : 'segments'].findIndex((el) => {
            return el.type != null && el.type !== SegmentType.MetricName;
        });
        // if there isn't a non-metric segment, add it at the end
        if (!~idx) {
            idx = this[isGraphite ? 'gSegments' : 'segments'].length;
        }
        // if we don't already have a select segment, add one
        if (!hasSelectAlready) {
            this[isGraphite ? 'gSegments' : 'segments'].splice(idx, 0, {
                type: SegmentType.MetricName,
                value: 'select metric',
            });
        }
    }

    // this takes an index and removes that segment and all following segments
    removeSegments(fromIndex) {
        if (null == fromIndex) {
            return;
        }
        let isGraphite = 'graphite' === this.target.querytype;
        this[isGraphite ? 'gSegments' : 'segments'] = this[isGraphite ? 'gSegments' : 'segments'].splice(0, fromIndex);
    }

    // this empties the segments
    emptySegments() {
        let isGraphite = 'graphite' === this.target.querytype;
        this[isGraphite ? 'gSegments' : 'segments'] = [];
    }

    // this removes an entire operator (e.g. "and(...)" including sub-operators) from a standard query
    removeStandardOperator(startIndex) {
        let endIndex = startIndex + 1;
        let endsNeeded = 1;
        const lastIndex = this.segments.length;
        // We need to remove ourself (as well as every other segment) until our TagEnd.
        // For every TagOp we hit, we need to wait until we hit one more TagEnd (to remove any sub-ops).
        while (endsNeeded > 0 && endIndex < lastIndex) {
            const type = this.segments[endIndex].type;
            if (type === SegmentType.TagOp) {
                endsNeeded++;
            } else if (type === SegmentType.TagEnd) {
                endsNeeded--;
                if (endsNeeded === 0) {
                    break; // don't increment endIndex
                }
            }
            endIndex++; // keep going
        }
        let deleteStart = startIndex;
        let countDelete = endIndex - startIndex + 1;
        // If I'm not the very first operator, then I have a comma in front of me that needs killing
        if (startIndex > 2) {
            deleteStart--;
            countDelete++;
        }
        this.segments.splice(deleteStart, countDelete);
        // If these match, we removed the outermost operator, so we need a new plus segment
        if (lastIndex === endIndex + 1) {
            this.segments.push({ type: SegmentType.TagPlus });
        }
    }

    // this adds an operator--and(), not(), or()--and the first filter tag to a standard query
    addStandardOperator(startIndex, value) {
        if (value === 'and(' || value === 'not(' || value === 'or(') {
            // Remove any plus segment
            if (this.segments[startIndex] && this.segments[startIndex].type === SegmentType.TagPlus) {
                this.segments.splice(startIndex, 1);
            }
            // if this isn't the first operator, add a separator (comma)
            if (startIndex > 2) {
                this.segments.splice(startIndex, 0, { type: SegmentType.TagSep });
            }
            // add the segments
            this.segments.splice(
                startIndex + 1,
                0,
                { type: SegmentType.TagOp, value: value },
                { type: SegmentType.TagCat, value: 'select tag', fake: true },
                { type: SegmentType.TagPair },
                { value: '*' },
                { type: SegmentType.TagPlus },
                { type: SegmentType.TagEnd }
            );
            // if this isn't the first operator, add another plus segment
            if (startIndex > 2) {
                this.segments.splice(startIndex + 7, 0, { type: SegmentType.TagPlus });
            }
        }
    }

    // this adds a tag (and category) to a standard query
    addStandardTag(startIndex, value) {
        // if this is at least the third segment, then we have at least one tag before us and we need a separator
        if (startIndex > 2) {
            this.segments.splice(startIndex, 0, { type: SegmentType.TagSep });
        }
        // add the tag
        this.segments.splice(
            startIndex + (startIndex > 2 ? 1 : 0),
            0,
            { type: SegmentType.TagCat, value: value },
            { type: SegmentType.TagPair },
            { value: '*' }
        );
        // if index is 1 (immediately after metric name), it's the first add and we're a tagCat
        // so that means we need to add in the implicit and() in the front
        if (startIndex === 1) {
            this.segments.splice(startIndex, 0, { type: SegmentType.TagOp, value: 'and(' });
            this.segments.push({ type: SegmentType.TagEnd });
        }
    }

    // this takes an array of all targets in a panel and replaces all of their query reference placeholders
    renderQueries(targets: any) {
        this.renderQueryReferences(this.target, targets);
        // loop through other queries and update targetFull as needed
        for (let target of targets || []) {
            if (target.refId !== this.target.refId) {
                this.renderQueryReferences(target, targets);
            }
        }
    }

    // this takes target.queryDisplay, replaces query reference placeholders (e.g. '#A')...
    // ...and inserts that rendered query into target.query and target.targetFull.
    renderQueryReferences(
        target: { refId: string | number; query: any; queryDisplay: string; targetFull: any },
        targets: any
    ) {
        const placeholderRegex = /\#([A-Z])/g;
        let renderedQuery = `${target.queryDisplay}`;

        // organize targets by refId
        const targetsByRefId = _.keyBy(targets, 'refId');
        // remove reference to self
        delete targetsByRefId[target.refId];

        // Use ref count to track circular references
        // NOTE: (cfiskeaux 09-2021) why are we checking thisT.query (the rendered query)
        // instead of thisT.queryDisplay (the raw query with placeholders)?
        _.each(targetsByRefId, (t, refId) => {
            let refCount = 0;
            // loop through all the other targets (the ones not matching `refId`)
            _.each(targetsByRefId, (thisT, thisRefId) => {
                if (thisRefId !== refId) {
                    // find all references to refId
                    const matches = ((thisT.query || '').match(placeholderRegex) || []).filter((match) => {
                        return match === '#' + refId;
                    });
                    refCount += matches.length;
                }
            });
            // this will now show how many references to this query exist in other queries
            t.refCount = refCount;
        });

        // Keep interpolating until there are no query placeholder references (the reason
        // for the loop is that the referenced query might contain another reference to another query).
        while (renderedQuery.match(placeholderRegex) !== null) {
            const updatedQuery = renderedQuery.replace(
                placeholderRegex,
                (entireMatch: string, matchGrp: string, offsetIdx: number, origString: string) => {
                    const t = targetsByRefId[matchGrp];
                    // if there's no corresponding target, just return the entire match and no replacement will be done
                    if (!t) {
                        return entireMatch;
                    }
                    // if there are no more references to this target, then remove it from the ref object
                    if (t.refCount <= 0) {
                        delete targetsByRefId[matchGrp];
                    }
                    // decrement the reference count and proceed with the replacement
                    t.refCount--;
                    return t.query;
                }
            );
            // end this cycle if nothing was replaced
            if (updatedQuery === renderedQuery) {
                break;
            } else {
                renderedQuery = updatedQuery;
            }
        }
        // check the final rendered query
        delete target.targetFull;
        if (target.query !== renderedQuery) {
            target.query = target.targetFull = renderedQuery;
        }
    }
}
