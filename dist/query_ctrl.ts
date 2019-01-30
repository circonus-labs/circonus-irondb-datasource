///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import _ from 'lodash';
import IrondbQuery from './irondb_query';
import {QueryCtrl} from 'app/plugins/sdk';
import './css/query_editor.css!';

export class IrondbQueryCtrl extends QueryCtrl {
  static templateUrl = 'partials/query.editor.html';

  defaults = {
  };
  queryModel: IrondbQuery;
  pointTypeOptions = [ { id: "Metric", name: "Metric" }, { id: "CAQL", name: "CAQL" } ];
  egressTypeOptions = [ { id: "default", name: "default" },
                        { id: "avg", name: "average" },
                        { id: "sum", name: "sum" },
                        { id: "count", name: "count" },
                        { id: "stddev", name: "\u03C3" },
                        { id: "derivative", name: "derivative" },
                        { id: "d_stddev", name: "\u03C3 derivative" },
                        { id: "counter", name: "counter" },
                        { id: "c_stddev", name: "\u03C3 counter" } ];
  segments: any[];

  /** @ngInject **/
  constructor($scope, $injector, private uiSegmentSrv, private templateSrv) {
    super($scope, $injector);

    _.defaultsDeep(this.target, this.defaults);
    this.target.isCaql = this.target.isCaql || false;
    this.target.egressoverride = this.target.egressoverride || "default";
    this.target.pointtype = this.target.isCaql ? "CAQL" : "Metric";
    this.target.query = this.target.query || '';
    this.target.segments = this.target.segments || [];
    this.queryModel = new IrondbQuery(this.datasource, this.target, templateSrv);
    this.buildSegments();
  }

  typeValueChanged() {
    this.target.isCaql = (this.target.pointtype == "CAQL");
    this.error = null;
    this.panelCtrl.refresh();
  }

  egressValueChanged() {
    this.panelCtrl.refresh();
  }

  onChangeInternal() {
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }

  getCollapsedText() {
    return this.target.query;
  }

  getSegments(index, prefix) {
    var query = prefix && prefix.length > 0 ? prefix : '';

//console.log(`index (getSegments): ${JSON.stringify(index, null, 2)}`);
//console.log(`prefix (getSegments): ${JSON.stringify(prefix, null, 2)}`);
    if (index > 0) {
      query = this.queryModel.getSegmentPathUpTo(index) + query;
    }
//console.log(`query (getSegments): ${JSON.stringify(query, null, 2)}`);

    return this.datasource
      .metricFindQuery( query + '*' )
      .then( segments => {
//console.log(`segments (getSegments): ${JSON.stringify(segments, null, 2)}`);
        var allSegments = _.map(segments.data, segment => {
//console.log(`segment (getSegments): ${JSON.stringify(segment, null, 2)}`);
//console.log(`escapeRegExp(query) (getSegments): ${JSON.stringify(this.escapeRegExp(query), null, 2)}`);
          var queryRegExp = new RegExp(this.escapeRegExp(query), 'i');
//console.log(`queryRegExp (getSegments): ${JSON.stringify(queryRegExp, null, 2)}`);

          return this.uiSegmentSrv.newSegment({
            value: segment.name.replace(queryRegExp,''),
            expandable: !segment.leaf,
          });
        });
//console.log(`allSegments (getSegments): ${JSON.stringify(allSegments, null, 2)}`);

        if (index > 0 && allSegments.length === 0) {
          return allSegments;
        }

        // add query references
        if (index === 0) {
          _.eachRight(this.panelCtrl.panel.targets, target => {
//console.log(`panelCtrl.target (getSegments): ${JSON.stringify(target, null, 2)}`);
            if (target.refId === this.queryModel.target.refId) {
              return;
            }
//console.log(`target.refId no match! (getSegments)`);
//console.log(`allSegments (getSegments): ${JSON.stringify(allSegments, null, 2)}`);
          });
        }

        // de-dupe segments
//console.log(`allSegments pre-uniq (getSegments): ${JSON.stringify(allSegments, null, 2)}`);
        allSegments = _.uniqBy(allSegments, 'value');
//console.log(`allSegments post-uniq (getSegments): ${JSON.stringify(allSegments, null, 2)}`);
        // add wildcard option
        allSegments.unshift(this.uiSegmentSrv.newSegment('*'));
        return allSegments;
      })
      .catch(err => {
        return [];
      });
  }

  parseTarget() {
    this.queryModel.parseTarget();
    this.buildSegments();
  }

  buildSegments() {
    this.segments = _.map(this.queryModel.segments, segment => {
      return this.uiSegmentSrv.newSegment(segment);
    });

//console.log(`this.segments (buildSegments): ${JSON.stringify(this.segments, null, 2)}`);
    let checkOtherSegmentsIndex = this.queryModel.checkOtherSegmentsIndex || 0;
//console.log(`checkOtherSegmentsIndex (buildSegments): ${JSON.stringify(checkOtherSegmentsIndex, null, 2)}`);
    this.checkOtherSegments(checkOtherSegmentsIndex);
  }

  addSelectMetricSegment() {
    this.queryModel.addSelectMetricSegment();
    this.segments.push(this.uiSegmentSrv.newSelectMetric());
//console.log(`this.segments (addSelectMetricSegment): ${JSON.stringify(this.segments, null, 2)}`);
  }

  checkOtherSegments(fromIndex) {
//console.log(`fromIndex (checkOtherSegments): ${JSON.stringify(fromIndex, null, 2)}`);
//console.log(`this.segments (checkOtherSegments): ${JSON.stringify(this.segments, null, 2)}`);
//console.log(`this.queryModel.segments (checkOtherSegments): ${JSON.stringify(this.queryModel.segments, null, 2)}`);
    if (fromIndex === 0) {
//console.log(`Adding Select Metric Segment (checkOtherSegments)`);
      this.addSelectMetricSegment();
      return;
    }

    var path = this.queryModel.getSegmentPathUpTo(fromIndex + 1);
//console.log(`path (checkOtherSegments): ${JSON.stringify(path, null, 2)}`);
    if (path === '') {
      return Promise.resolve();
    }

    return this.datasource
      .metricFindQuery( path + '*' )
      .then(segments => {
//console.log(`segments (checkOtherSegments): ${JSON.stringify(segments, null, 2)}`);
//console.log(`segments.data.length (checkOtherSegments): ${JSON.stringify(segments.data.length, null, 2)}`);
        if (segments.data.length === 0) {
          if (path !== '') {
            this.queryModel.segments = this.queryModel.segments.splice(0, fromIndex + 1);
//console.log(`this.queryModel.segments (checkOtherSegments): ${JSON.stringify(this.queryModel.segments, null, 2)}`);
            this.segments = this.segments.splice(0, fromIndex + 1);
//console.log(`this.segments (checkOtherSegments): ${JSON.stringify(this.segments, null, 2)}`);
          }
        } else {
          _.map(segments.data, segment => {
//console.log(`path (checkOtherSegments): ${JSON.stringify(path, null, 2)}`);
//console.log(`segment (checkOtherSegments): ${JSON.stringify(segment, null, 2)}`);
//console.log(`escapeRegExp(path) (checkOtherSegments): ${JSON.stringify(this.escapeRegExp(path), null, 2)}`);
            var pathRegExp = new RegExp(this.escapeRegExp(path), 'i');
//console.log(`pathRegExp (checkOtherSegments): ${JSON.stringify(pathRegExp, null, 2)}`);
            var segmentName = segment.name.replace(pathRegExp,'');
//console.log(`segmentName (checkOtherSegments): ${JSON.stringify(segmentName, null, 2)}`);
            segment.name = segmentName;
//            this.uiSegmentSrv.newSegment({
//              value: segmentName,
//              expandable: !segment.leaf,
//            });
//console.log(`segment (checkOtherSegments): ${JSON.stringify(segment, null, 2)}`);
          });
//console.log(`this.segments (checkOtherSegments): ${JSON.stringify(this.segments, null, 2)}`);
//console.log(`this.segments.length (checkOtherSegments): ${JSON.stringify(this.segments.length, null, 2)}`);
          if (this.segments.length === fromIndex) {
//console.log(`Adding Select Metric Segment (checkOtherSegments)`);
            this.addSelectMetricSegment();
          } else {
            return this.checkOtherSegments(fromIndex + 1);
          }
        }
      })
      .catch(err => {
      });
  }

  setSegmentFocus(segmentIndex) {
    _.each(this.segments, (segment, index) => {
      segment.focus = segmentIndex === index;
    });
  }

  segmentValueChanged(segment, segmentIndex) {
    this.error = null;
    this.queryModel.updateSegmentValue(segment, segmentIndex);

//console.log(`segment (segmentValueChanged): ${JSON.stringify(segment, null, 2)}`);
//console.log(`segmentIndex (segmentValueChanged): ${JSON.stringify(segmentIndex, null, 2)}`);
    this.spliceSegments(segmentIndex + 1);
    if (segment.expandable) {
      return this.checkOtherSegments(segmentIndex + 1).then(() => {
        this.setSegmentFocus(segmentIndex + 1);
        this.targetChanged();
      });
    } else {
      this.spliceSegments(segmentIndex + 1);
    }

    this.setSegmentFocus(segmentIndex + 1);
    this.targetChanged();
  }

  spliceSegments(index) {
//console.log(`splicing at index (spliceSegments): ${JSON.stringify(index, null, 2)}`);
    this.segments = this.segments.splice(0, index);
    this.queryModel.segments = this.queryModel.segments.splice(0, index);
//console.log(`segments (spliceSegments): ${JSON.stringify(this.segments, null, 2)}`);
//console.log(`queryModel.segments (spliceSegments): ${JSON.stringify(this.queryModel.segments, null, 2)}`);
  }

  emptySegments() {
    this.queryModel.segments = [];
    this.segments = [];
  }

  updateModelTarget() {
    this.queryModel.updateModelTarget(this.panelCtrl.panel.targets);
  }

  targetChanged() {
    if (this.queryModel.error) {
      return;
    }

    var oldTarget = this.queryModel.target.query;
    this.updateModelTarget();

    if (this.queryModel.target !== oldTarget) {
      this.panelCtrl.refresh();
    }
  }

  showDelimiter(index) {
    return index !== this.segments.length - 1;
  }

  escapeRegExp(regexp) {
    var specialChars = "[]{}()*?.,";
    var fixedRegExp = [];
    for (var i = 0; i < regexp.length; ++i) {
      var c = regexp.charAt(i);
      switch (c) {
        case '?':
          fixedRegExp.push(".");
          break;
        case '*':
          fixedRegExp.push(".*?");
          break;
        default:
          if (specialChars.indexOf(c) >= 0) {
            fixedRegExp.push("\\");
          }
          fixedRegExp.push(c);
      }
    }
    return fixedRegExp.join('');
  }
}

function mapToDropdownOptions(results) {
  return _.map(results, value => {
    return { text: value, value: value };
  });
}
