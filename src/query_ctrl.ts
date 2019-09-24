import _ from 'lodash';
import Log from './log';
import IrondbQuery from './irondb_query';
import { SegmentType, taglessName, decodeTag, encodeTag } from './irondb_query';
import { QueryCtrl } from 'grafana/app/plugins/sdk';
import './css/query_editor.css';

const log = Log('IrondbQueryCtrl');

function escapeRegExp(regexp) {
  return String(regexp).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
}

export class IrondbQueryCtrl extends QueryCtrl {
  static templateUrl = 'partials/query.editor.html';

  defaults = {};
  queryModel: IrondbQuery;
  labelTypeOptions = [
    { value: 'default', text: 'name and tags' },
    { value: 'name', text: 'name only' },
    { value: 'cardinality', text: 'high cardinality tags' },
    { value: 'custom', text: 'custom' },
  ];
  egressTypeOptions = [
    { value: 'count', text: 'number of data points (count)' },
    { value: 'average', text: 'average value (gauge)' },
    { value: 'average_stddev', text: 'standard deviation a.k.a. σ (stddev)' },
    { value: 'derive', text: 'rate of change (derive)' },
    { value: 'derive_stddev', text: 'rate of change σ (derive_stddev)' },
    { value: 'counter', text: 'rate of positive change (counter)' },
    { value: 'counter_stddev', text: 'rate of positive change σ (counter_stddev)' },
  ];
  caqlFindFunctions = {
    count: 'count',
    average: 'average',
    average_stddev: 'stddev',
    derive: 'derivative',
    derive_stddev: 'derivative_stddev',
    counter: 'counter',
    counter_stddev: 'counter_stddev',
  };
  segments: any[];

  /** @ngInject */
  constructor($scope, $injector, private uiSegmentSrv, private templateSrv) {
    super($scope, $injector);

    _.defaultsDeep(this.target, this.defaults);
    this.target.isCaql = this.target.isCaql || false;
    this.target.egressoverride = this.target.egressoverride || 'average';
    this.target.metriclabel = this.target.metriclabel || '';
    this.target.labeltype = this.target.labeltype || 'default';
    this.target.query = this.target.query || '';
    this.target.segments = this.target.segments || [];
    this.target.paneltype = this.panelCtrl.pluginName;
    this.queryModel = new IrondbQuery(this.datasource, this.target, templateSrv);
    this.buildSegments();
    this.updateMetricLabelValue(false);
  }

  toggleEditorMode() {
    log(() => 'toggleEditorMode()');
    this.target.isCaql = !this.target.isCaql;
    this.typeValueChanged();
  }

  typeValueChanged() {
    if (this.target.isCaql) {
      const caqlQuery = this.segmentsToCaqlFind();
      this.target.query = caqlQuery;
      log(() => 'typeValueChanged() caqlQuery = ' + caqlQuery);
    } else {
      this.target.query = '';
      this.target.egressoverride = 'average';
      this.target.labeltype = 'default';
      this.emptySegments();
      this.parseTarget();
      log(() => 'typeValueChanged() target reset');
    }
    this.error = null;
    this.panelCtrl.refresh();
  }

  labelTypeValueChanged() {
    if (this.target.labeltype === 'custom') {
      setTimeout(() => {
        document.getElementById('metriclabel').focus();
      }, 50);
    }
    this.panelCtrl.refresh();
  }

  metricLabelKeyUp(event) {
    const self = this;
    const element = event.currentTarget;
    if (event.keyCode === 13) {
      setTimeout(() => {
        self.target.metriclabel = element.value;
        self.updateMetricLabelValue();
      }, 0);
    }
  }

  updateMetricLabelValue(refresh = true) {
    if (this.target.metriclabel === '' && this.target.labeltype === 'custom') {
      this.target.labeltype = 'default';
    }
    if (refresh) {
      this.panelCtrl.refresh();
    }
  }

  egressValueChanged() {
    this.panelCtrl.refresh();
  }

  onChangeInternal() {
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }

  getCollapsedText() {
    if (this.target.isCaql) {
      return this.target.query;
    } else {
      return this.segmentsToCaqlFind();
    }
  }

  getSegments(index, prefix) {
    log(() => 'getSegments() ' + index + ' prefix = ' + prefix);
    let query = prefix && prefix.length > 0 ? prefix : '';

    const segmentType = this.segments[index]._type;
    log(() => 'getSegments() ' + index + ' SegmentType = ' + SegmentType[segmentType]);
    if (segmentType === SegmentType.MetricName) {
      if (encodeTag(SegmentType.MetricName, query) !== query) {
        query = 'b/' + btoa(escapeRegExp(query)) + '/';
      } else {
        query += '*';
      }
      return this.datasource
        .metricTagsQuery('and(__name:' + query + ')', true)
        .then(results => {
          let metricnames = _.map(results.data, result => {
            return taglessName(result.metric_name);
          });
          metricnames = _.uniq(metricnames);
          log(() => 'getSegments() metricnames = ' + JSON.stringify(metricnames));

          const allSegments = _.map(metricnames, segment => {
            return this.newSegment(SegmentType.MetricName, {
              value: segment,
              expandable: true,
            });
          });
          return allSegments;
        })
        .catch(err => {
          log(() => 'getSegments() err = ' + err.toString());
          return [];
        });
    } else if (segmentType === SegmentType.TagCat || segmentType === SegmentType.TagPlus) {
      const metricName = encodeTag(SegmentType.MetricName, this.segments[0].value);
      log(() => 'getSegments() tags for ' + metricName);
      return this.datasource
        .metricTagCatsQuery(metricName)
        .then(segments => {
          if (segments.data && segments.data.length > 0) {
            const tagCats = segments.data;
            const tagSegments = [];
            for (const tagCat of tagCats) {
              tagSegments.push(
                this.newSegment(SegmentType.TagCat, {
                  value: decodeTag(tagCat),
                  expandable: true,
                })
              );
            }
            if (segmentType === SegmentType.TagPlus) {
              // For Plus, we want to allow new operators, so put those on the front
              tagSegments.unshift(this.newSegment(SegmentType.TagOp, { value: 'and(' }));
              tagSegments.unshift(this.newSegment(SegmentType.TagOp, { value: 'not(' }));
              tagSegments.unshift(this.newSegment(SegmentType.TagOp, { value: 'or(' }));
            }
            return tagSegments;
          }
        })
        .catch(err => {
          log(() => 'getSegments() err = ' + err);
          return [];
        });
    } else if (segmentType === SegmentType.TagOp) {
      const tagSegments = [
        this.newSegment(SegmentType.TagOp, { value: 'REMOVE' }),
        this.newSegment(SegmentType.TagOp, { value: 'and(' }),
        this.newSegment(SegmentType.TagOp, { value: 'not(' }),
        this.newSegment(SegmentType.TagOp, { value: 'or(' }),
      ];
      return Promise.resolve(tagSegments);
    } else if (segmentType === SegmentType.TagVal) {
      const metricName = encodeTag(SegmentType.MetricName, this.segments[0].value);
      const tagCat = this.segments[index - 2].value;
      if (tagCat === 'select tag') {
        return Promise.resolve([]);
      }
      log(() => 'getSegments() tag vals for ' + metricName + ', ' + tagCat);
      return this.datasource
        .metricTagValsQuery(metricName, encodeTag(SegmentType.TagCat, tagCat, false))
        .then(segments => {
          if (segments.data && segments.data.length > 0) {
            const tagVals = segments.data;
            const tagSegments = [];
            tagSegments.push(
              this.newSegment(SegmentType.TagVal, {
                value: '*',
                expandable: true,
              })
            );
            _.eachRight(this.templateSrv.variables, variable => {
              tagSegments.push(
                this.newSegment(SegmentType.TagVal, {
                  type: 'template',
                  value: '$' + variable.name,
                  expandable: true,
                })
              );
            });
            for (const tagVal of tagVals) {
              tagSegments.push(
                this.newSegment(SegmentType.TagVal, {
                  value: decodeTag(tagVal),
                  expandable: true,
                })
              );
            }
            return tagSegments;
          }
        })
        .catch(err => {
          log(() => 'getSegments() err = ' + err);
          return [];
        });
    }
    return Promise.resolve([]);
  }

  parseTarget() {
    this.queryModel.parseTarget();
    this.buildSegments();
  }

  setSegmentType(segment: any, type: SegmentType) {
    segment._type = type;
    segment._typeName = SegmentType[type];
    return segment;
  }

  newSegment(type: SegmentType, options: any) {
    const segment = this.uiSegmentSrv.newSegment(options);
    return this.setSegmentType(segment, type);
  }

  mapSegment(segment) {
    let uiSegment;
    if (segment.type === SegmentType.TagOp) {
      uiSegment = this.uiSegmentSrv.newOperator(segment.value);
    } else if (segment.type === SegmentType.TagEnd) {
      uiSegment = this.uiSegmentSrv.newOperator(')');
    } else if (segment.type === SegmentType.TagPair) {
      uiSegment = this.uiSegmentSrv.newCondition(':');
    } else if (segment.type === SegmentType.TagSep) {
      uiSegment = this.uiSegmentSrv.newCondition(',');
    } else if (segment.type === SegmentType.TagPlus) {
      uiSegment = this.buildSelectTagPlusSegment();
    } else {
      uiSegment = this.uiSegmentSrv.newSegment(segment);
    }
    return this.setSegmentType(uiSegment, segment.type);
  }

  buildSegments() {
    this.segments = _.map(this.queryModel.segments, s => this.mapSegment(s));
    log(() => 'buildSegments()');

    const checkOtherSegmentsIndex = this.queryModel.checkOtherSegmentsIndex || 0;
    this.checkOtherSegments(checkOtherSegmentsIndex);
  }

  addSelectMetricSegment() {
    this.queryModel.addSelectMetricSegment();
    const segment = this.uiSegmentSrv.newSelectMetric();
    this.setSegmentType(segment, SegmentType.MetricName);
    this.segments.push(segment);
  }

  buildSelectTagPlusSegment() {
    const tagCatSegment = this.uiSegmentSrv.newPlusButton();
    this.setSegmentType(tagCatSegment, SegmentType.TagPlus);
    return tagCatSegment;
  }

  addSelectTagPlusSegment() {
    this.segments.push(this.buildSelectTagPlusSegment());
  }

  newSelectTagValSegment() {
    const tagValSegment = this.uiSegmentSrv.newKeyValue('*');
    this.setSegmentType(tagValSegment, SegmentType.TagVal);
    return tagValSegment;
  }

  checkOtherSegments(fromIndex) {
    if (fromIndex === this.segments.length) {
      const segmentType = this.segments[fromIndex - 1]._type;
      log(() => 'checkOtherSegments() ' + (fromIndex - 1) + ' SegmentType = ' + SegmentType[segmentType]);
      if (segmentType === SegmentType.MetricName) {
        this.addSelectTagPlusSegment();
      }
    }
    return Promise.resolve();
  }

  setSegmentFocus(segmentIndex) {
    _.each(this.segments, (segment, index) => {
      segment.focus = segmentIndex === index;
    });
  }

  segmentValueChanged(segment, segmentIndex) {
    log(() => 'segmentValueChanged()');
    this.error = null;
    this.queryModel.updateSegmentValue(segment, segmentIndex);

    if (segment._type === SegmentType.TagOp) {
      if (segment.value === 'REMOVE') {
        // We need to remove ourself, as well as every other segment until our TagEnd
        // For every TagOp we hit, we need to get one more TagEnd to remove any sub-ops
        let endIndex = segmentIndex + 1;
        let endsNeeded = 1;
        const lastIndex = this.segments.length;
        while (endsNeeded > 0 && endIndex < lastIndex) {
          const type = this.segments[endIndex]._type;
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
        let deleteStart = segmentIndex;
        let countDelete = endIndex - segmentIndex + 1;
        if (segmentIndex > 2) {
          // If I'm not the very first operator, then i have a comma in front of me that needs killing
          deleteStart--;
          countDelete++;
        }
        this.segments.splice(deleteStart, countDelete);
        if (lastIndex === endIndex + 1) {
          // If these match, we removed the outermost operator, so we need a new + button
          this.segments.push(this.buildSelectTagPlusSegment());
        }
      }
      // else Changing an Operator doesn't need to affect any other segments
      this.targetChanged();
      return;
    } else if (segment._type === SegmentType.TagPlus) {
      if (segment.value === 'and(' || segment.value === 'not(' || segment.value === 'or(') {
        // Remove myself
        this.segments.splice(segmentIndex, 1);
        if (segmentIndex > 2) {
          this.segments.splice(segmentIndex, 0, this.mapSegment({ type: SegmentType.TagSep }));
        }
        // and replace it with a TagOp + friends
        this.segments.splice(
          segmentIndex + 1,
          0,
          this.mapSegment({ type: SegmentType.TagOp, value: segment.value }),
          this.mapSegment({ type: SegmentType.TagCat, value: 'select tag', fake: true }),
          this.mapSegment({ type: SegmentType.TagPair }),
          this.newSelectTagValSegment(),
          this.buildSelectTagPlusSegment(),
          this.mapSegment({ type: SegmentType.TagEnd })
        );
        if (segmentIndex > 2) {
          this.segments.splice(segmentIndex + 7, 0, this.buildSelectTagPlusSegment());
        }
        // Do not trigger targetChanged().  We do not have a valid category, which we need, so set focus on it
        this.setSegmentFocus(segmentIndex + 3);
        return;
      } else {
        // Remove myself
        this.segments.splice(segmentIndex, 1);
        if (segmentIndex > 2) {
          this.segments.splice(segmentIndex, 0, this.mapSegment({ type: SegmentType.TagSep }));
        }
        // and replace it with a TagOp + friends
        this.segments.splice(
          segmentIndex + 1,
          0,
          this.mapSegment({ type: SegmentType.TagCat, value: segment.value }),
          this.mapSegment({ type: SegmentType.TagPair }),
          this.newSelectTagValSegment(),
          this.buildSelectTagPlusSegment()
        );

        if (segmentIndex === 1) {
          // if index is 1 (immediatley after metric name), it's the first add and we're a tagCat
          // so that means we need to add in the implicit and() in the front
          this.segments.splice(segmentIndex, 0, this.mapSegment({ type: SegmentType.TagOp, value: 'and(' }));
          this.segments.push(this.mapSegment({ type: SegmentType.TagEnd }));
        }
        // Fall through so targetChanged gets called
      }
    }

    if (segmentIndex === 0) {
      // If we changed the start metric, all the filters are invalid
      this.spliceSegments(segmentIndex + 1);
    }

    if (segment.expandable) {
      return this.checkOtherSegments(segmentIndex + 1).then(() => {
        this.setSegmentFocus(segmentIndex + 1);
        this.targetChanged();
      });
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

  segmentsToStreamTags() {
    const segments = this.segments.slice();
    // First element is always metric name
    const metricName = segments.shift().value;
    let query = 'and(__name:' + encodeTag(SegmentType.MetricName, metricName);
    let noComma = false; // because last was a tag:pair
    for (const segment of segments) {
      const type = segment._type;
      if (type === SegmentType.TagPlus) {
        continue;
      }
      if (!noComma && type !== SegmentType.TagEnd && type !== SegmentType.TagSep) {
        query += ',';
      }
      if (type === SegmentType.TagOp || type === SegmentType.TagPair || type === SegmentType.TagCat || type === SegmentType.TagSep) {
        noComma = true;
      } else {
        noComma = false;
      }

      query += encodeTag(type, segment.value);
    }
    query += ')';
    return query;
  }

  queryFunctionToCaqlFind() {
    if (this.target.paneltype === 'Heatmap') {
      return 'find:histogram';
    }
    let findFunction = 'find';
    let egressOverride = this.target.egressoverride;
    if (egressOverride !== 'average') {
      egressOverride = this.caqlFindFunctions[egressOverride];
      findFunction += ':' + egressOverride;
    }
    return findFunction;
  }

  buildCaqlLabel() {
    const labeltype = this.target.labeltype;
    let metriclabel = this.target.metriclabel;
    if (labeltype !== 'default') {
      if (labeltype === 'custom' && metriclabel !== '') {
        metriclabel = metriclabel.replace(/'/g, '"');
        return " | label('" + metriclabel + "')";
      } else if (labeltype === 'name') {
        return " | label('%n')";
      } else if (labeltype === 'cardinality') {
        return " | label('%n | %t-{*}')";
      }
    }
    // Always use label() for tag decoding
    return " | label('%cn')";
  }

  segmentsToCaqlFind() {
    const segments = this.segments.slice();
    // First element is always metric name
    const metricName = segments.shift().value;
    const tagless = segments.length === 1 && segments[0]._type === SegmentType.TagPlus;
    if (metricName === '*' && tagless) {
      return '';
    }
    let query = this.queryFunctionToCaqlFind() + "('" + metricName + "'";
    if (tagless) {
      query += ')' + this.buildCaqlLabel();
      return query;
    }
    let firstTag = true;
    let noComma = false; // because last was a tag:pair
    for (const segment of segments) {
      const type = segment._type;
      if (type === SegmentType.TagPlus) {
        continue;
      }
      if (!noComma && type !== SegmentType.TagEnd && type !== SegmentType.TagSep) {
        query += ',';
        if (firstTag) {
          query += " '";
          firstTag = false;
        }
      }
      if (type === SegmentType.TagOp || type === SegmentType.TagPair || type === SegmentType.TagCat || type === SegmentType.TagSep) {
        noComma = true;
      } else {
        noComma = false;
      }

      query += encodeTag(type, segment.value);
    }
    query += "')" + this.buildCaqlLabel();
    return query;
  }

  updateModelTarget() {
    const streamTags = this.segmentsToStreamTags();
    log(() => 'updateModelTarget() streamTags = ' + streamTags);
    this.queryModel.target.query = streamTags;
  }

  targetChanged() {
    log(() => 'targetChanged()');
    if (this.queryModel.error) {
      return;
    }

    const oldTarget = this.queryModel.target.query;
    this.updateModelTarget();

    if (this.queryModel.target !== oldTarget) {
      this.panelCtrl.refresh();
    }
  }
}
