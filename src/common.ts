import memoize from 'memoizee';
import { DataSource } from './datasource';
import _ from 'lodash';
import {
  ArrayVector,
  FieldType,
  MutableField,
  TIME_SERIES_TIME_FIELD_NAME,
  TIME_SERIES_VALUE_FIELD_NAME
} from '@grafana/data';
import {
  CirconusDataSourceOptions,
  CirconusQuery,
  SegmentType,
  TagSet
} from './types';

export const DEFAULT_QUERY: Partial<CirconusQuery> = {
  queryType: 'basic',
  labelType: 'default',
  metricLabel: '',
  egressOverride: 'automatic',
  rollupType: 'automatic',
  metricRollup: '',
  minPeriod: '',
  format: 'ts',
  queryDisplay: '',
  query: '',
};

export const DEFAULT_OPTIONS: Partial<CirconusDataSourceOptions> = {
  path: 'https://api.circonus.com',
  apiToken: '',
  irondbType: 'hosted',
  queryPrefix: '',
  caqlMinPeriod: '',
  resultsLimit: '100',
  truncateNow: false,
  minTruncation: '30',
  useCaching: true,
  activityTracking: true,
  allowGraphite: false,
  hideCAQLWarnings: false,
  disableUsageStatistics: false,
};

export const MAX_DATAPOINTS_THRESHOLD = 1.5;

export const MAX_EXACT_DATAPOINTS_THRESHOLD = 1.5;

export const MIN_DURATION_MS_FETCH = 1;

export const MIN_DURATION_MS_CAQL = 60 * 1000;

export const ROLLUP_ALIGN_MS = _.map([1, 60, 3600, 86400], (x) => x * 1000);

export const ROLLUP_ALIGN_MS_1DAY = 86400 * 1000;

/**
 * Use this to test and see if a tag piece (cat or val) contains invalid chars 
 * and needs to be base64 encoded. Normally `*` isn't a valid char but it is 
 * for searching purposes.
 */
export const INVALID_TAG_CHARS_REGEXP = /[^`+A-Za-z0-9!@#\$%^&"'\/\?\._\*-]/;

export const DURATION_REGEXP = /^([0-9]+)(ms|s|m|h|d)?$/;

export const DURATION_UNITS_DEFAULT = 's';

export const DURATION_UNITS = {
    ms: 1,
    s: 1000,
    m: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24,
};

/**
 * This takes a duration string and converts it to milliseconds. If no units 
 * are specified, seconds are the assumed unit.
 */
export function parseDurationMS(duration: string): number {
  const matches = duration.toLocaleLowerCase().match(DURATION_REGEXP);
  if (!matches) {
      throw new Error('Invalid time duration: ' + duration);
  }
  const units = (matches[2] || DURATION_UNITS_DEFAULT) as keyof typeof DURATION_UNITS;
  return parseInt(matches[1], 10) * DURATION_UNITS[units];
}

/**
 * This takes an array of tags and compiles them into a TagSet (an object keyed 
 * by tag), so there's a list of all tag vals for each tag cat.
 */
export function splitTags(tags: string, decode = true): TagSet {
  const outTags: TagSet = {};
  for (const tag of tags.split(/,/g)) {
    const tagSep = tag.split(/:/g);
    let tagCat = tagSep.shift() as string;
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

/**
 * This merges one TagSet into another TagSet.
 */
export function mergeTags(dest: TagSet, source: TagSet) {
  for (const cat in source) {
    let vals = dest[cat];
    if (_.isUndefined(vals)) {
      dest[cat] = vals = [];
    }
    vals.push.apply(vals, source[cat]);
  }
}

/**
 * This takes a canonical metric name and splits it into two pieces:
 * the display name portion and the tags portion.
 */
export function taglessNameAndTags(name: string): [string, string] {
  let tags = '';
  const tagStart = name.indexOf('ST[');
  if (~tagStart) {
    tags = name.substring(tagStart + 3, name.length - 1);
    name = name.substring(0, tagStart - 1);
  }
  return [name, tags];
}

/**
 * This takes a canonical metric name and returns only the display name portion.
 */
export function taglessName(name: string): string {
  return taglessNameAndTags(name)[0];
}

/**
 * This renders a metric label for a standard query metric stream.
 */
export function metaInterpolateLabel(fmt: string, metaIn: any[], idx: number): string {
  const meta = metaIn[idx];
  // case %d
  let label = fmt.replace(/%d/g, (idx + 1).toString());
  // case %n
  const displayName = taglessName(meta.leaf_data?.metric_name || meta.metric_name || meta.name);
  label = label.replace(/%n/g, displayName);
  // case %cn
  label = label.replace(/%cn/g, meta.metric_name || meta.name);

  // allow accessing the check tags
  const stream_tags = taglessNameAndTags(meta.metric_name || meta.name)[1];
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
    const choose = elide === '-' ? _metaTagDiff : () => true;
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
    const choose = elide === '-' ? _metaTagDiff : () => true;
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

  /**
   * This takes an array of meta objects and returns true if the tag cat
   * specified has variance in the array.
   */
  function _metaTagDiff(meta: any[], tag: string) {
    let keycnt = 0;
    const seen = new Map();
    
    for (let i = 0; i < meta.length; i++) {
      const tags = taglessNameAndTags(meta[i].metric_name)[1];
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
      // the fallback empty object is just a truthy value which is different
      // from every string.
      const mtag = tag !== '' && tagSet[tag] !== undefined ? tagSet[tag][0] : {};
      if (seen.get(mtag) === undefined) {
        keycnt = keycnt + 1;
      }
      seen.set(mtag, true);
    }

    return keycnt > 1;
  }
}

/**
 * This takes a tag piece and encodes it if necessary (and doesn't if not).
 */
export function encodeTag(type: SegmentType, tag: string, exactMatch = true): string {
  const isMetric = type === SegmentType.MetricName;
  const isCat = type === SegmentType.TagCat;
  const isVal = type === SegmentType.TagVal;
  // needs base64 encoding if a tag piece fails this regexp test
  if ((isCat || isVal || isMetric) && INVALID_TAG_CHARS_REGEXP.test(tag)) {
    let delimiter = '"';
    if (exactMatch) {
      delimiter = '!';
    }
    tag = `b${delimiter}${btoa(tag)}${delimiter}`;
  }
  return tag;
}

/**
 * This takes a base64 encoded tag piece and decodes it.
 */
export function decodeTag(tag: string): string {
  if (/^b(["!]{1}).+\1$/.test(tag)) {
    try {
      tag = atob(tag.slice(2, -1));
    }
    catch (e) {}
  }
  return tag;
}

/**
 * This takes a label string which may contain base64 encoded tag pieces, and
 * decodes all of the base64 encoded pieces.
 */
export function decodeTagsInLabel(label: string): string {
  const matches = label.match(/b\"[^"]+\"/g);
  matches?.forEach((match) => {
    const decoded = decodeTag(match);
    label = label.replace(match, decoded);
  });
  return label;
}

/**
 * This looks at a canonical metric name and determines whether it is a statsd 
 * counter metric.
 */
export function isStatsdCounter(name: string): boolean {
    const rawTags = taglessNameAndTags(name)[1];
    const tagSet = splitTags(rawTags);
    
    return tagSet['statsd_type']?.includes('count');
}

/**
 * This takes a string and escapes it to prepare it for being encoded as a
 * base64 encoded regular expression tag match (in metric tag queries).
 */
export function escapeStringForRegExp(regexpString = '') {
    return String(regexpString).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * This takes a string and prepares it for being turned into a 
 * Regular Expression.
 */
export function prepStringForRegExp(regexpString = ''): string {
  const specialChars = '[]{}()*?.,';
  let fixedRegExp = [];

  for (let i = 0; i < regexpString.length; ++i) {
      const c = regexpString.charAt(i);
      switch (c) {
          case '?':
              fixedRegExp.push('.');
              break;

          case '*':
              fixedRegExp.push('.*?');
              break;

          default:
              if (specialChars.indexOf(c) >= 0) {
                  fixedRegExp.push('\\');
              }
              fixedRegExp.push(c);
      }
  }

  return fixedRegExp.join('');
}

/**
 * This removes tags from an array of data object names. Graphite-style finding
 * results in names like this (if they have tags): 
 * 2ff643a7-c9de-4c24-9f59-3fdb3baa6a38.automation.example-service...refresh;collector=statsd;source=circonus-agent;statsd_type=timing
 * and it won't work if the tags are on there.
 */
export function stripGraphiteTags(data: any[]): any[] {
  data.forEach(function (obj, i) {
    if (obj.leaf) {
      const name_pcs = (obj.leaf_data?.name || '').split('|ST');
      obj.name = name_pcs[0];
    }
  });

  return data;
}

/**
 * This returns a Grafana time field object.
 */
export function getTimeField(name: string = TIME_SERIES_TIME_FIELD_NAME): MutableField {
  return {
    name: name,
    type: FieldType.time,
    config: {},
    values: new ArrayVector<number>(),
  };
}

/**
 * This returns a Grafana number field object.
 */
export function getNumberField(name: string = TIME_SERIES_VALUE_FIELD_NAME): MutableField {
  return {
    name: name,
    type: FieldType.number,
    config: {},
    values: new ArrayVector<number>(),
  };
}

/**
 * This returns a Grafana text field object.
 */
export function getTextField(name: string): MutableField {
  return {
    name: name,
    type: FieldType.string,
    config: {},
    values: new ArrayVector<string>(),
  };
}

/**
 * This returns a Grafana miscellaneous field object.
 */
export function getOtherField(name: string): MutableField {
  return {
    name: name,
    type: FieldType.other,
    config: {},
    values: new ArrayVector(),
  };
}

export const DEFAULT_CACHE_ENTRIES = 128;

export const DEFAULT_CACHE_TIME_MS = 60000;

/**
 * This sets up a request cache.
 */
export function setupCache(useCaching = false, backendSrv: any, datasourceInstance: DataSource) {
  if (!useCaching) {
    return _doRequest;
  }

  const cacheOpts = {
    max: DEFAULT_CACHE_ENTRIES,
    maxAge: DEFAULT_CACHE_TIME_MS,
    promise: true,
    normalizer: (args: any) => {
      const requestOptions = args[0];
      const cacheKey = _requestCacheKey(requestOptions);
      return cacheKey;
    },
  };

  return memoize((options: any) => _doRequest(options), cacheOpts);

  function _doRequest(options: any) {
    if (!datasourceInstance.dataSourceOptions.disableUsageStatistics) {
      const urlHasParams = !!~options.url.indexOf('?');
      options.url += (urlHasParams ? '&' : '?') + 'u=' + datasourceInstance.userHash;
    }
    return backendSrv.datasourceRequest(options);
  }

  function _requestCacheKey(requestOptions: any) {
    const httpMethod = requestOptions.method;
    if (httpMethod === 'GET') {
      return _stripActivityWindow(requestOptions.url);
    }
    else if (httpMethod === 'POST') {
      return JSON.stringify(requestOptions.data);
    }
    else {
      throw new Error(`Unsupported HTTP method type: ${httpMethod || '?'}`);
    }

    function _stripActivityWindow(url: string) {
      return _.split(url, '&')
        .map((p) => p.split('='))
        .filter((p) => !p[0].startsWith('activity_'))
        .map((p) => p.join('='))
        .join('&');
    }
  }
}

/*
 * http://www.myersdaily.org/joseph/javascript/md5-text.html
 */
export const md5 = (function (global) {
  const hex_chr = '0123456789abcdef'.split('');
  let use_alternate_add32 = false;
  
  /* Some IEs are the only ones I know of that need the alternate function */
  if (md5('hello') !== '5d41402abc4b2a76b9719d911017c592') {
      use_alternate_add32 = true;
  }
  
  return md5;
  
  
  function md5(s: any) {
      return hex(md51(s));
  }
  
  
  function md5cycle(x: any, k: any) {
      let a = x[0],
          b = x[1],
          c = x[2],
          d = x[3];

      a = ff(a, b, c, d, k[0], 7, -680876936);
      d = ff(d, a, b, c, k[1], 12, -389564586);
      c = ff(c, d, a, b, k[2], 17, 606105819);
      b = ff(b, c, d, a, k[3], 22, -1044525330);
      a = ff(a, b, c, d, k[4], 7, -176418897);
      d = ff(d, a, b, c, k[5], 12, 1200080426);
      c = ff(c, d, a, b, k[6], 17, -1473231341);
      b = ff(b, c, d, a, k[7], 22, -45705983);
      a = ff(a, b, c, d, k[8], 7, 1770035416);
      d = ff(d, a, b, c, k[9], 12, -1958414417);
      c = ff(c, d, a, b, k[10], 17, -42063);
      b = ff(b, c, d, a, k[11], 22, -1990404162);
      a = ff(a, b, c, d, k[12], 7, 1804603682);
      d = ff(d, a, b, c, k[13], 12, -40341101);
      c = ff(c, d, a, b, k[14], 17, -1502002290);
      b = ff(b, c, d, a, k[15], 22, 1236535329);

      a = gg(a, b, c, d, k[1], 5, -165796510);
      d = gg(d, a, b, c, k[6], 9, -1069501632);
      c = gg(c, d, a, b, k[11], 14, 643717713);
      b = gg(b, c, d, a, k[0], 20, -373897302);
      a = gg(a, b, c, d, k[5], 5, -701558691);
      d = gg(d, a, b, c, k[10], 9, 38016083);
      c = gg(c, d, a, b, k[15], 14, -660478335);
      b = gg(b, c, d, a, k[4], 20, -405537848);
      a = gg(a, b, c, d, k[9], 5, 568446438);
      d = gg(d, a, b, c, k[14], 9, -1019803690);
      c = gg(c, d, a, b, k[3], 14, -187363961);
      b = gg(b, c, d, a, k[8], 20, 1163531501);
      a = gg(a, b, c, d, k[13], 5, -1444681467);
      d = gg(d, a, b, c, k[2], 9, -51403784);
      c = gg(c, d, a, b, k[7], 14, 1735328473);
      b = gg(b, c, d, a, k[12], 20, -1926607734);

      a = hh(a, b, c, d, k[5], 4, -378558);
      d = hh(d, a, b, c, k[8], 11, -2022574463);
      c = hh(c, d, a, b, k[11], 16, 1839030562);
      b = hh(b, c, d, a, k[14], 23, -35309556);
      a = hh(a, b, c, d, k[1], 4, -1530992060);
      d = hh(d, a, b, c, k[4], 11, 1272893353);
      c = hh(c, d, a, b, k[7], 16, -155497632);
      b = hh(b, c, d, a, k[10], 23, -1094730640);
      a = hh(a, b, c, d, k[13], 4, 681279174);
      d = hh(d, a, b, c, k[0], 11, -358537222);
      c = hh(c, d, a, b, k[3], 16, -722521979);
      b = hh(b, c, d, a, k[6], 23, 76029189);
      a = hh(a, b, c, d, k[9], 4, -640364487);
      d = hh(d, a, b, c, k[12], 11, -421815835);
      c = hh(c, d, a, b, k[15], 16, 530742520);
      b = hh(b, c, d, a, k[2], 23, -995338651);

      a = ii(a, b, c, d, k[0], 6, -198630844);
      d = ii(d, a, b, c, k[7], 10, 1126891415);
      c = ii(c, d, a, b, k[14], 15, -1416354905);
      b = ii(b, c, d, a, k[5], 21, -57434055);
      a = ii(a, b, c, d, k[12], 6, 1700485571);
      d = ii(d, a, b, c, k[3], 10, -1894986606);
      c = ii(c, d, a, b, k[10], 15, -1051523);
      b = ii(b, c, d, a, k[1], 21, -2054922799);
      a = ii(a, b, c, d, k[8], 6, 1873313359);
      d = ii(d, a, b, c, k[15], 10, -30611744);
      c = ii(c, d, a, b, k[6], 15, -1560198380);
      b = ii(b, c, d, a, k[13], 21, 1309151649);
      a = ii(a, b, c, d, k[4], 6, -145523070);
      d = ii(d, a, b, c, k[11], 10, -1120210379);
      c = ii(c, d, a, b, k[2], 15, 718787259);
      b = ii(b, c, d, a, k[9], 21, -343485551);

      x[0] = add32(a, x[0]);
      x[1] = add32(b, x[1]);
      x[2] = add32(c, x[2]);
      x[3] = add32(d, x[3]);
  }
  
  
  function cmn(q: any, a: any, b: any, x: any, s: any, t: any) {
      a = add32(add32(a, q), add32(x, t));
      return add32((a << s) | (a >>> (32 - s)), b);
  }
  
  
  function ff(a: any, b: any, c: any, d: any, x: any, s: any, t: any) {
      return cmn((b & c) | ((~b) & d), a, b, x, s, t);
  }
  
  
  function gg(a: any, b: any, c: any, d: any, x: any, s: any, t: any) {
      return cmn((b & d) | (c & (~d)), a, b, x, s, t);
  }
  
  
  function hh(a: any, b: any, c: any, d: any, x: any, s: any, t: any) {
      return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  
  
  function ii(a: any, b: any, c: any, d: any, x: any, s: any, t: any) {
      return cmn(c ^ (b | (~d)), a, b, x, s, t);
  }
  
  
  function md51(s: any) {
      let n     = s.length,
          state = [1732584193, -271733879, -1732584194, 271733878],
          i;
     
      for (i = 64; i <= s.length; i += 64) {
          md5cycle(state, md5blk(s.substring(i - 64, i)));
      }
      s = s.substring(i - 64);
      let tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (i = 0; i < s.length; i++) {
          tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
      }
      tail[i >> 2] |= 0x80 << ((i % 4) << 3);
      if (i > 55) {
          md5cycle(state, tail);
          for (i = 0; i < 16; i++) {
              tail[i] = 0;
          }
      }
      tail[14] = n * 8;
      md5cycle(state, tail);
      
      return state;
  }

  /* there needs to be support for Unicode here,
   * unless we pretend that we can redefine the MD-5
   * algorithm for multi-byte characters (perhaps
   * by adding every four 16-bit characters and
   * shortening the sum to 32 bits). Otherwise
   * I suggest performing MD-5 as if every character
   * was two bytes--e.g., 0040 0025 = @%--but then
   * how will an ordinary MD-5 sum be matched?
   * There is no way to standardize text to something
   * like UTF-8 before transformation; speed cost is
   * utterly prohibitive. The JavaScript standard
   * itself needs to look at this: it should start
   * providing access to strings as preformed UTF-8
   * 8-bit unsigned value arrays.
   */
  function md5blk(s: any) { /* I figured global was faster.   */
      let md5blks = [],
          i; /* Andy King said do it this way. */
     
      for (i = 0; i < 64; i += 4) {
          md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
      }
      
      return md5blks;
  }
  
  
  function rhex(n: any) {
      let s = '',
          j = 0;
      
      for (; j < 4; j++) {
          s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
      }
      
      return s;
  }
  

  function hex(x: any) {
      for (let i = 0; i < x.length; i++) {
          x[i] = rhex(x[i]);
      }
      
      return x.join('');
  }
  

  /* the standard function is much faster, so if possible, use it. */
  function add32(a: any, b: any) {
      return (use_alternate_add32 ? alternate : standard)();
      
      function standard() {
          return (a + b) & 0xFFFFFFFF;
      }
      
      function alternate() {
          let lsw = (a & 0xFFFF) + (b & 0xFFFF),
              msw = (a >> 16) + (b >> 16) + (lsw >> 16);
          return (msw << 16) | (lsw & 0xFFFF);
      }
  }
})(window);
