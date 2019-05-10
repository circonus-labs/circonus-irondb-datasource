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

    console.log("IrondbQuery.parseTarget() " + JSON.stringify(this.target));
    var metricName = this.target.query;
    // Strip 'and(__name:)' from metric name
    metricName = metricName.slice(11, -1) || '*';
    var tags = metricName.split(',');
    metricName = tags.shift();
    this.segments.push({ type: SegmentType.MetricName, value: metricName });

    var first = true;
    if (tags.length > 0) this.segments.push({ type: SegmentType.TagOp, value: "AND (" });
    for(var tag of tags) {
      if (first) {
        first = false;
      }
      else {
        this.segments.push({ type: SegmentType.TagSep });
      }
      tag = tag.split(':');
      var tagCat = tag[0];
      var tagVal = tag[1];
      this.segments.push({ type: SegmentType.TagCat, value: tagCat });
      this.segments.push({ type: SegmentType.TagPair });
      this.segments.push({ type: SegmentType.TagVal, value: tagVal });
    }
    if (tags.length > 0) this.segments.push({ type: SegmentType.TagEnd });

    console.log("IrondbQuery.parseTarget() " + JSON.stringify(this.segments));
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
    console.log("IrondbQuery.updateSegmentValue() " + index + " " + JSON.stringify(segment));
    console.log("IrondbQuery.updateSegmentValue() len " + this.segments.length);
    if (this.segments[index] !== undefined) {
      this.segments[index].value = segment.value;
    }
  }

  addSelectMetricSegment() {
    this.segments.push({ value: 'select metric' });
  }

  updateModelTarget(targets) {
    console.log("IrondbQuery.updateModelTarget() " + JSON.stringify(targets));
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
