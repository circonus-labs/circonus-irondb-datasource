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

function isEven(x) {
  return x % 2 == 0;
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
  loadSegments: boolean;

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
    this.loadSegments = false;
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

    if (index === 0) {
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
              expandable: true//!segment.leaf,
            });
          });

          /*if (index > 0 && allSegments.length === 0) {
            return allSegments;
          }*/

          // add query references
          if (index === 0) {
            _.eachRight(this.panelCtrl.panel.targets, target => {
              if (target.refId === this.queryModel.target.refId) {
                return;
              }
            });
          }

          return allSegments;
        })
        .catch(err => {
          console.log("getSegments() " + err.toString());
          return [];
        });
    }
    else if (!isEven(index)) {
      var metricName = this.segments[0].value;
      console.log("getSegments() tags for " + metricName);
      return this.datasource
        .metricTagCatsQuery(metricName)
        .then(segments => {
          if (segments.data && segments.data.length > 0) {
            var tagCats = segments.data;
            var tagSegments = [];
            for(var tagCat of tagCats) {
              tagSegments.push(this.uiSegmentSrv.newSegment({
                value: "tag: " + tagCat,
                expandable: true
              }));
            }
            return tagSegments;
          }
        })
        .catch(err => {
          console.log(err);
          return [];
        });
    }
    else if (isEven(index)) {
      var metricName = this.segments[0].value;
      var tagCat = this.segments[index - 1].value;
      tagCat = tagCat.slice(5);
      console.log("getSegments() tag vals for " + metricName + ", " + tagCat);
      return this.datasource
        .metricTagValsQuery(metricName, tagCat)
        .then(segments => {
          if (segments.data && segments.data.length > 0) {
            var tagVals = segments.data;
            var tagSegments = [];
            tagSegments.push(this.uiSegmentSrv.newSegment({
              value: '*',
              expandable: true
            }));
            for(var tagVal of tagVals) {
              tagSegments.push(this.uiSegmentSrv.newSegment({
                value: tagVal,
                expandable: true
              }));
            }
            return tagSegments;
          }
        })
        .catch(err => {
          console.log(err);
          return [];
        });
    }
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

  addSelectTagCatSegment() {
    //this.queryModel.addSelectMetricSegment();
    var tagCatSegment = this.uiSegmentSrv.newPlusButton();
    tagCatSegment.html += ' tag';
    this.segments.push(tagCatSegment);
  }

  addSelectTagValSegment() {
    //this.queryModel.addSelectMetricSegment();
    var tagValSegment = this.uiSegmentSrv.newKeyValue("*");
    this.segments.push(tagValSegment);
  }

  checkOtherSegments(fromIndex) {
    console.log("checkOtherSegments() " + fromIndex + " " + this.segments.length);
    if (fromIndex === 0) {
      //this.addSelectMetricSegment();
      if (!this.loadSegments) {
        if (this.target.query !== '') {
          this.addSelectTagCatSegment();
        }
        this.loadSegments = true;
      }
      return;
    }
    else if(fromIndex === 1) {
      this.addSelectTagCatSegment();
    }
    else if(isEven(fromIndex)) {
      this.addSelectTagValSegment();
    }
    else if(!isEven(fromIndex)) {
      var segments = this.segments.slice();
      var metricName = segments.shift().value;
      for (var i = 0; i < segments.length; i += 2) {
        var tagCat = segments[i].value;
        var tagVal = segments[i + 1].value;
        tagCat = tagCat.slice(5);
        metricName += "," + tagCat + ":" + tagVal;
      }
      console.log("checkOtherSegments() " + metricName);
      this.target.query = metricName;
    }
    return Promise.resolve();
    /*var path = this.queryModel.getSegmentPathUpTo(fromIndex + 1);
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
      });*/
  }

  setSegmentFocus(segmentIndex) {
    _.each(this.segments, (segment, index) => {
      segment.focus = segmentIndex === index;
    });
  }

  segmentValueChanged(segment, segmentIndex) {
    console.log("segmentValueChanged()");
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
    console.log("updateModelTarget()");
    if (this.segments.length < 3) {
      this.queryModel.updateModelTarget(this.panelCtrl.panel.targets);
    }
  }

  targetChanged() {
    console.log("targetChanged()");
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
