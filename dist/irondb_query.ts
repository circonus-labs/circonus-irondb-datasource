import _ from 'lodash';
import { Parser } from './parser';

export enum SegmentType {
  MetricName,
  TagCat,
  TagVal,
  TagPair,
  TagSep,
  TagEnd,
  TagOp,
  TagPlus
};

interface TagSet { [tagCat: string] : string[] };

function splitTags(tags: string, decode: boolean = true): TagSet {
  var outTags: TagSet = {};
  for (var tag of tags.split(/,/g)) {
    var tagSep = tag.split(/:/g);
    var tagCat = tagSep.shift();
    var tagVal = tagSep.join(':');
    if (decode) {
      tagCat = decodeTag(tagCat);
      tagVal = decodeTag(tagVal);
    }
    var tagVals = outTags[tagCat];
    if (_.isUndefined(tagVals)) {
      outTags[tagCat] = tagVals = [];
    }
    tagVals.push(tagVal);
  }
  return outTags;
}

function taglessNameAndTags(name: string): [string, string] {
  var tags = "";
  var tagStart = name.indexOf("ST[");
  if (tagStart != -1) {
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
var _private_nil = {}; // just some truthy value different from every string
function metaTagDiff(meta: any[], tag: string) {
  var keycnt = 0;
  var seen = new Map();
  for (var i = 0; i < meta.length; i++) {
    var [name, tags] = taglessNameAndTags(meta[i].metric_name);
    var tagSet = splitTags(tags);
    var mtag = tagSet[tag] !== undefined ? tagSet[tag][0] : _private_nil;
    if (seen.get(mtag) === undefined) {
      keycnt = keycnt + 1;
    }
    seen.set(mtag, true);
  }
  return keycnt > 1;
}

export function metaInterpolateLabel(fmt: string, meta_in: any[], idx: number): string {
  var meta = meta_in[idx];
  // case %d
  var label = fmt.replace(/%d/g, (idx + 1).toString());
  // case %n
  label = label.replace(/%n/g, taglessName(meta.metric_name));
  // case %cn
  label = label.replace(/%cn/g, meta.metric_name);
  // case %tv
  label = label.replace(/%tv-?{([^}]*)}/g, function(x) {
    var elide = x.substring(3, 4);
    var choose = elide === "-" ? metaTagDiff : () => true;
    var tag = x.substring(elide === "-" ? 5 : 4, x.length - 1);
    var [name, tags] = taglessNameAndTags(meta.metric_name);
    var tagSet = splitTags(tags);
    if (tag === "*") {
      var tagCats = [];
      for (var k of _.keys(tagSet)) {
        if (!k.startsWith("__") && choose(meta_in, k)) {
          tagCats.push(k);
        }
      }
      tagCats.sort();
      var tagVals = _.map(tagCats, tagCat => tagSet[tagCat][0]);
      return tagVals.join(",");
    }
    if (tagSet[tag] !== undefined && choose(meta_in, tag)) {
      return tagSet[tag][0];
    }
    return "";
  });
  // case %t
  label = label.replace(/%t-?{([^}]*)}/g, function(x) {
    var elide = x.substring(2, 3);
    var choose = elide === "-" ? metaTagDiff : () => true;
    var tag = x.substring(elide === "-" ? 4 : 3, x.length - 1);
    var [name, tags] = taglessNameAndTags(meta.metric_name);
    var tagSet = splitTags(tags);
    if (tag === "*") {
      var tagCats = [];
      for (var k of _.keys(tagSet)) {
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
  return label
}

/*
 * map for ascii tags
  perl -e '$valid = qr/[`+A-Za-z0-9!@#\$%^&"'\/\?\._-]/;
  foreach $i (0..7) {
  foreach $j (0..31) { printf "%d,", chr($i*32+$j) =~ $valid; }
  print "\n";
  }'
*/
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
  return vTagMapKey[c] == 1;
}

function IsTaggableValueChar(c: number): boolean {
  return vTagMapValue[c] == 1;
}

type TagPartFunction = (c: number) => boolean;

function IsTaggablePart(tag: string, tagPartFunction: TagPartFunction): boolean {
  var n = 0;
  for (var i = 0; i < tag.length; i++) {
    var c = tag.charCodeAt(i);
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

export function encodeTag(type: SegmentType, tag: string, exactMatch: boolean = true): string {
  if (type === SegmentType.MetricName) {
    type = SegmentType.TagVal;
  }
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
    var base64Char = '"';
    if (exactMatch) {
      base64Char = '!';
    }
    tag = ['b', base64Char, btoa(tag), base64Char].join('');
  }
  return tag;
}

export function decodeTag(tag: string): string {
  if ((tag.startsWith('b"') && tag.endsWith('"')) ||
      (tag.startsWith('b!') && tag.endsWith('!'))) {
    tag = atob(tag.slice(2, tag.length - 1));
  }
  return tag;
}

export function decodeNameAndTags(name: string): string {
  var tags = [];
  var [metric, rawTags] = taglessNameAndTags(name);
  var tagSet = splitTags(rawTags);
  for (var tagCat of _.keys(tagSet)) {
    tags.push(tagCat + ':' + tagSet[tagCat][0]);
  }
  return metric + '|ST[' + tags.join(',') + ']';
}

export default class IrondbQuery {
  datasource: any;
  target: any;
  segments: any[];
  error: any;
  checkOtherSegmentsIndex: number;
  templateSrv: any;
  scopedVars: any;

  /** @ngInject */
  constructor(datasource, target, templateSrv?, scopedVars?) {
    this.datasource = datasource;
    this.target = target;
    this.parseTarget();
  }

  parseTarget() {
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
    this.segments.push({ type: SegmentType.MetricName, value: decodeTag(metricName) });

    var first = true;
    for(var tag of tags) {
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
  }

  getSegmentPathUpTo(index) {
    var arr = this.segments.slice(0, index);

    return _.reduce(
      arr,
      function(result, segment) {
        return result ? result + segment.value + '.' : segment.value + '.';
      },
      ''
    );
  }

  parseTargetRecursive(astNode, func) {
    if (astNode === null) {
      return null;
    }

    switch (astNode.type) {
      case 'metric':
        this.segments = astNode.segments;
        break;
    }
  }

  updateSegmentValue(segment, index) {
    //console.log("IrondbQuery.updateSegmentValue() " + index + " " + JSON.stringify(segment));
    //console.log("IrondbQuery.updateSegmentValue() len " + this.segments.length);
    if (this.segments[index] !== undefined) {
      this.segments[index].value = segment.value;
    }
  }

  addSelectMetricSegment() {
    this.segments.push({ value: 'select metric' });
  }

  updateModelTarget(targets) {
    //console.log("IrondbQuery.updateModelTarget() " + JSON.stringify(targets));
    // render query
    //this.target.query = this.getSegmentPathUpTo(this.segments.length).replace(/\.select metric.$/, '');
    //this.target.query = this.target.query.replace(/\.$/, '');

    this.updateRenderedTarget(this.target, targets);

    // loop through other queries and update targetFull as needed
    for (const target of targets || []) {
      if (target.refId !== this.target.refId) {
        this.updateRenderedTarget(target, targets);
      }
    }
  }

  updateRenderedTarget(target, targets) {
    // render nested query
    var targetsByRefId = _.keyBy(targets, 'refId');

    // no references to self
    delete targetsByRefId[target.refId];

    var targetWithNestedQueries = target.query;

    // Use ref count to track circular references
    function countTargetRefs(targetsByRefId, refId) {
      let refCount = 0;
      _.each(targetsByRefId, (t, id) => {
        if (id !== refId) {
        }
      });
      targetsByRefId[refId].refCount = refCount;
    }
    _.each(targetsByRefId, (t, id) => {
      countTargetRefs(targetsByRefId, id);
    });

    delete target.targetFull;
    if (target.query !== targetWithNestedQueries) {
      target.targetFull = targetWithNestedQueries;
    }
  }
}

function wrapFunction(target, func) {
  return func.render(target);
}
