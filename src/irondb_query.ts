import _ from 'lodash';
import { Parser } from './parser';

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

console.log(`this.target (parseTarget): ${JSON.stringify(this.target, null, 2)}`);

    if (this.target.rawQuery) {
      return;
    }

    var parser = new Parser(this.target.query);
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
    } catch (err) {
      console.log('error parsing target:', err.message);
      this.error = err.message;
      this.target.rawQuery = true;
    }

    this.checkOtherSegmentsIndex = this.segments.length - 1;
  }

  getSegmentPathUpTo(index) {
    var arr = this.segments.slice(0, index);
console.log(`arr (getSegmentPathUpTo): ${JSON.stringify(arr, null, 2)}`);

    return _.reduce(
      arr,
      function(result, segment) {
console.log(`segment (getSegmentPathUpTo): ${JSON.stringify(segment, null, 2)}`);
console.log(`result (getSegmentPathUpTo): ${JSON.stringify(result, null, 2)}`);
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
    this.segments[index].value = segment.value;
  }

  addSelectMetricSegment() {
    this.segments.push({ value: 'select metric' });
  }

  updateModelTarget(targets) {
    // render query
console.log(`this.segments.length (updateModelTarget): ${JSON.stringify(this.segments.length, null, 2)}`);
console.log(`this.target.query (updateModelTarget): ${JSON.stringify(this.target.query, null, 2)}`);
    this.target.query = this.getSegmentPathUpTo(this.segments.length).replace(/\.select metric.$/, '');
console.log(`this.target.query (updateModelTarget): ${JSON.stringify(this.target.query, null, 2)}`);
    this.target.query = this.target.query.replace(/\.$/, '');
console.log(`this.target.query (updateModelTarget): ${JSON.stringify(this.target.query, null, 2)}`);

    this.updateRenderedTarget(this.target, targets);

    // loop through other queries and update targetFull as needed
    for (const target of targets || []) {
      if (target.refId !== this.target.refId) {
        this.updateRenderedTarget(target, targets);
      }
    }
  }

  updateRenderedTarget(target, targets) {
console.log(`target (updateRenderedTarget): ${JSON.stringify(target, null, 2)}`);
console.log(`targets (updateRenderedTarget): ${JSON.stringify(targets, null, 2)}`);
    // render nested query
    var targetsByRefId = _.keyBy(targets, 'refId');
console.log(`targetsByRefId (updateRenderedTarget): ${JSON.stringify(targetsByRefId, null, 2)}`);

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
console.log(`t (updateRenderedTarget): ${JSON.stringify(t, null, 2)}`);
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
