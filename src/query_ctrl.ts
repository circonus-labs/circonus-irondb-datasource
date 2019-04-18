///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import _ from 'lodash';
import IrondbQuery from './irondb_query';
import {QueryCtrl} from 'app/plugins/sdk';
import './css/query_editor.css!';

function tagless_name(name) {
  var tag_start = name.indexOf("ST[");
  if (tag_start != -1) {
    name = name.substring(0, tag_start - 1);
  }
  return name;
}

export class IrondbQueryCtrl extends QueryCtrl {
  static templateUrl = 'partials/query.editor.html';

  defaults = {
  };
  queryModel: IrondbQuery;
  pointTypeOptions = [ { value: "Metric", text: "Metric" }, { value: "CAQL", text: "CAQL" } ];
  egressTypeOptions = [ { value: "default", text: "default" },
                        { value: "count", text: "count" },
                        { value: "average", text: "average" },
                        { value: "average_stddev", text: "average_stddev" },
                        { value: "derive", text: "derive" },
                        { value: "derive_stddev", text: "derive_stddev" },
                        { value: "counter", text: "counter" },
                        { value: "counter_stddev", text: "counter_stddev" },
                        { value: "derive2", text: "derive2" },
                        { value: "derive2_stddev", text: "derive2_stddev" },
                        { value: "counter2", text: "counter2" },
                        { value: "counter2_stddev", text: "counter2_stddev" } ];
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
    console.log("getSegments() " + index + " " + prefix);
    var query = prefix && prefix.length > 0 ? prefix : '';

    if (index > 0) {
      query = this.queryModel.getSegmentPathUpTo(index) + query;
    }

    return this.datasource
      .metricFindQuery( query + '*' )
      .then( results => {
        var metricnames = _.map(results.data, result => {
          return tagless_name(result.metric_name);
        });
        metricnames = _.uniq(metricnames);
        console.log(JSON.stringify(metricnames));

        var allSegments = _.map(metricnames, segment => {
          //var queryRegExp = new RegExp(this.escapeRegExp(query), 'i');

          return this.uiSegmentSrv.newSegment({
            value: segment, //.replace(queryRegExp,''),
            expandable: false//!segment.leaf,
          });
        });

        if (index > 0 && allSegments.length === 0) {
          return allSegments;
        }

        // add query references
        if (index === 0) {
          _.eachRight(this.panelCtrl.panel.targets, target => {
            if (target.refId === this.queryModel.target.refId) {
              return;
            }
          });
        }

        // de-dupe segments
        allSegments = _.uniqBy(allSegments, 'value');
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

    let checkOtherSegmentsIndex = this.queryModel.checkOtherSegmentsIndex || 0;
    this.checkOtherSegments(checkOtherSegmentsIndex);
  }

  addSelectMetricSegment() {
    this.queryModel.addSelectMetricSegment();
    this.segments.push(this.uiSegmentSrv.newSelectMetric());
  }

  checkOtherSegments(fromIndex) {
    console.log("checkOtherSegments()");
    if (fromIndex === 0) {
      //this.addSelectMetricSegment();
      return;
    }

    var path = this.queryModel.getSegmentPathUpTo(fromIndex + 1);
    if (path === '') {
      return Promise.resolve();
    }

    return this.datasource
      .metricFindQuery( path + '*' )
      .then(segments => {
        if (segments.data.length === 0) {
          if (path !== '') {
            this.queryModel.segments = this.queryModel.segments.splice(0, fromIndex + 1);
            this.segments = this.segments.splice(0, fromIndex + 1);
          }
        } else {
          _.map(segments.data, segment => {
            var pathRegExp = new RegExp(this.escapeRegExp(path), 'i');
            var segmentName = segment.name.replace(pathRegExp,'');
            segment.name = segmentName;
          });
          if (this.segments.length === fromIndex) {
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
    this.segments = this.segments.splice(0, index);
    this.queryModel.segments = this.queryModel.segments.splice(0, index);
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
