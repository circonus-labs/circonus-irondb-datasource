import _ from 'lodash';
import Log from './log';

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
  label = label.replace(/%n/g, taglessName(meta.metric_name));
  // case %cn
  label = label.replace(/%cn/g, meta.metric_name);

  // allow accessing the check tags
  const [name, stream_tags] = taglessNameAndTags(meta.metric_name);
  const tagSet = splitTags(stream_tags);
  for (const tag of meta.check_tags) {
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

    log(() => 'parseTarget() target = ' + JSON.stringify(this.target));
    let metricName = this.target.query;
    // Strip 'and(__name:)' from metric name
    metricName = metricName.slice(11, -1) || '*';
    const tags = metricName.split(',');
    metricName = tags.shift();
    this.segments.push({
      type: SegmentType.MetricName,
      value: decodeTag(metricName),
    });

    let first = true;
    for (let tag of tags) {
      if (first) {
        first = false;
      } else {
        this.segments.push({ type: SegmentType.TagSep });
      }
      tag = tag.split(':');
      let tagCat = tag.shift();
      let tagVal = tag.join(':');
      let tagOp = false;
      let tagIndex = 4;
      if (tagCat.startsWith('and(') || tagCat.startsWith('not(')) {
        tagOp = true;
      } else if (tagCat.startsWith('or(')) {
        tagOp = true;
        tagIndex = 3;
      }
      if (tagOp) {
        this.segments.push({
          type: SegmentType.TagOp,
          value: tagCat.slice(0, tagIndex),
        });
        tagCat = tagCat.slice(tagIndex);
      }
      this.segments.push({
        type: SegmentType.TagCat,
        value: decodeTag(tagCat),
      });
      this.segments.push({ type: SegmentType.TagPair });
      let end = 0;
      while (tagVal.endsWith(')')) {
        tagVal = tagVal.slice(0, -1);
        end++;
      }
      this.segments.push({
        type: SegmentType.TagVal,
        value: decodeTag(tagVal),
      });
      for (let i = 0; i < end; i++) {
        this.segments.push({ type: SegmentType.TagPlus });
        this.segments.push({ type: SegmentType.TagEnd });
      }
    }
    if (tags.length === 0) {
      this.segments.push({ type: SegmentType.TagPlus });
    }

    log(() => 'parseTarget() SegmentType = ' + JSON.stringify(_.map(this.segments, (s) => SegmentType[s.type])));
  }

  updateSegmentValue(segment, index) {
    log(() => 'updateSegmentValue() ' + index + ' segment = ' + JSON.stringify(segment));
    log(() => 'updateSegmentValue() length = ' + this.segments.length);
    if (this.segments[index] !== undefined) {
      this.segments[index].value = segment.value;
    }
  }

  addSelectMetricSegment() {
    this.segments.push({ value: 'select metric' });
  }
}
