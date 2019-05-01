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


    if (this.target.rawQuery) {
      return;
    }

    console.log("parseTarget() " + JSON.stringify(this.target));
    var metricName = this.target.query || '*';
    var tags = metricName.split(',');
    metricName = tags.shift();
    this.segments.push({ type: 'segment', value: metricName });

    for(var tag of tags) {
      tag = tag.split(':');
      var tagCat = 'tag: ' + tag[0];
      var tagVal = tag[1];
      this.segments.push({ type: 'segment', value: tagCat });
      this.segments.push({ type: 'segment', value: tagVal });
    }

    console.log("parseTarget() " + JSON.stringify(this.segments));
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
    console.log("updateSegmentValue() " + index + " " + JSON.stringify(segment));
    if (this.segments[index] !== undefined) {
      this.segments[index].value = segment.value;
    }
  }

  addSelectMetricSegment() {
    this.segments.push({ value: 'select metric' });
  }

  updateModelTarget(targets) {
    // render query
    this.target.query = this.getSegmentPathUpTo(this.segments.length).replace(/\.select metric.$/, '');
    this.target.query = this.target.query.replace(/\.$/, '');

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
