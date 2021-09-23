import _ from 'lodash';
import Log from './log';
import IrondbQuery from './irondb_query';
/* eslint-disable-next-line no-duplicate-imports */
import { SegmentType, taglessName, decodeTag, encodeTag } from './irondb_query';
import { QueryCtrl } from 'grafana/app/plugins/sdk';
import appEvents from 'grafana/app/core/app_events';
import './css/query_editor.css';

const log = Log('IrondbQueryCtrl');

function escapeRegExp(regexp) {
  return String(regexp).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
}

export class IrondbQueryCtrl extends QueryCtrl {
  static templateUrl = 'partials/query.editor.html';

  defaults = {};
  queryModel: IrondbQuery;
  alertStateOptions = [
    { value: 'active', text: 'Active' },
    { value: 'inactive', text: 'Inactive' },
  ];
  queryTypeOptions = [
    { value: 'caql', text: 'CAQL' },
    { value: 'basic', text: 'Standard' },
    { value: 'graphite', text: 'Graphite Style' },
    { value: 'alerts', text: 'Alerts' },
    { value: 'alert_counts', text: 'Alert Counts' },
  ];
  localFilterMatchOptions = [
    { value: 'all', text: 'ALL' },
    { value: 'any', text: 'ANY' },
  ];
  alertCountQueryTypeOptions = [
    { value: 'instant', text: 'instant' },
    { value: 'range', text: 'range' },
  ];
  labelTypeOptions = [
    { value: 'default', text: 'name and tags' },
    { value: 'name', text: 'name only' },
    { value: 'cardinality', text: 'high cardinality tags' },
    { value: 'custom', text: 'custom' },
  ];
  egressTypeOptions = [
    { value: 'automatic', text: 'automatic' },
    { value: 'count', text: 'number of data points (count)' },
    { value: 'average', text: 'average value (gauge)' },
    { value: 'stddev', text: 'standard deviation a.k.a. σ (stddev)' },
    { value: 'derive', text: 'rate of change (derive)' },
    { value: 'derive_stddev', text: 'rate of change σ (derive_stddev)' },
    { value: 'counter', text: 'rate of positive change (counter)' },
    { value: 'counter_stddev', text: 'rate of positive change σ (counter_stddev)' },
  ];
  rollupTypeOptions = [
    { value: 'automatic', text: 'automatic' },
    { value: 'minimum', text: 'minimum' },
    { value: 'exact', text: 'exact' },
  ];
  formatOptions = [
    { value: 'ts', text: 'Time Series' },
    { value: 'table', text: 'Table' },
    { value: 'heatmap', text: 'Heatmap' },
  ];
  caqlFindFunctions = {
    count: 'count',
    average: 'average',
    stddev: 'stddev',
    derive: 'derivative',
    derive_stddev: 'derivative_stddev',
    counter: 'counter',
    counter_stddev: 'counter_stddev',
  };
  // prettier-ignore
  histogramTransforms = {
    count:          ' | histogram:count()',
    average:        ' | histogram:mean()',
    stddev:         ' | histogram:stddev()',
    derive:         ' | histogram:rate()',
    derive_stddev:  '', // FIXME
    counter:        ' | histogram:rate()',
    counter_stddev: '', // FIXME
  };
  segments: any[];
  gSegments: any[];

  /** @ngInject */
  constructor($scope, $injector, private uiSegmentSrv, private templateSrv) {
    super($scope, $injector);

    _.defaultsDeep(this.target, this.defaults);
    this.target.egressoverride = this.target.egressoverride || 'average';
    this.target.metriclabel = this.target.metriclabel || '';
    this.target.labeltype = this.target.labeltype || 'default';
    this.target.rolluptype = this.target.rolluptype || 'automatic';
    this.target.query = this.target.query || '';
    this.target.segments = this.target.segments || [];
    this.target.gSegments = this.target.gSegments || [];
    this.target.format = this.target.format || 'ts';
    let querytype = this.target.querytype;
    if (
      this.queryTypeOptions.some(function (cfg) {
        return cfg.value === querytype;
      })
    ) {
      this.target.querytype = querytype;
    } else if (this.target.isCaql !== null) {
      this.target.querytype = this.target.isCaql ? 'caql' : 'basic';
    } else {
      this.target.querytype = 'basic';
    }
    this.target.lastQueryType = this.target.lastQueryType || this.target.querytype;
    this.target.local_filter = this.target.local_filter || '';
    this.target.local_filter_match = this.target.local_filter_match || 'all';
    this.target.alert_count_query_type = this.target.alert_count_query_type || 'instant';
    this.target.alert_id = this.target.alert_id || '';
    this.target.min_period = this.target.min_period || (this.hasCAQLMinPeriod() ? this.datasource.caqlMinPeriod : '');
    this.queryModel = new IrondbQuery(this.datasource, this.target, templateSrv);
    this.buildSegments();
    this.updateMetricLabelValue(false);
  }

  resetQueryTarget() {
    log(() => 'resetQueryTarget()');
    this.target.query = '';
    this.target.egressoverride = 'average';
    this.target.labeltype = 'default';
    this.target.rolluptype = 'automatic';
    this.target.format = 'ts';
    this.target.local_filter = '';
    this.target.local_filter_match = 'all';
    this.target.alert_id = '';
    this.emptySegments();
    this.queryModel.parseTarget();
    this.buildSegments();
    this.panelCtrl.refresh();
  }

  // This changes the query type between CAQL/Standard/Graphite
  toggleEditorMode() {
    // CAQL -> Standard
    if (this.target.lastQueryType === 'caql' && this.target.querytype === 'basic') {
      // TODO: currently no good way to convert backwards to standard
      // CAQL -> Graphite
    } else if (this.target.lastQueryType === 'caql' && this.target.querytype === 'graphite') {
      // TODO: currently no good way to convert backwards to graphite
      // Standard -> CAQL
    } else if (this.target.lastQueryType === 'basic' && this.target.querytype === 'caql') {
      this.target.query = this.buildCAQLFromStandard();
      // Standard -> Graphite
    } else if (this.target.lastQueryType === 'basic' && this.target.querytype === 'graphite') {
      this.convertStandardToGraphite();
      // Graphite -> CAQL
    } else if (this.target.lastQueryType === 'graphite' && this.target.querytype === 'caql') {
      this.target.query = this.buildCAQLFromGraphite();
      // Graphite -> Standard
    } else if (this.target.lastQueryType === 'graphite' && this.target.querytype === 'basic') {
      this.convertGraphiteToStandard();
      // Alerts
    } else if (this.target.querytype === 'alerts' || this.target.queryType === 'alert_counts') {
      this.target.query = '';
    }
    this.panelCtrl.refresh();
    this.target.lastQueryType = this.target.querytype;
  }

  alertStateValueChanged() {
    this.panelCtrl.refresh();
  }

  updateAlertQuery() {
    this.panelCtrl.refresh();
  }

  updateAlertId() {
    this.target.query = '';
    this.panelCtrl.refresh();
  }

  updateAlertLocalFilter() {
    this.panelCtrl.refresh();
  }

  localFilterMatchValueChanged() {
    this.panelCtrl.refresh();
  }

  alertCountQueryTypeValueChanged() {
    this.panelCtrl.refresh();
  }

  queryTypeValueChanged() {
    this.toggleEditorMode();
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

  rollupTypeValueChanged() {
    let refresh = true;
    if (this.target.rolluptype !== 'automatic') {
      if (_.isEmpty(this.target.metricrollup)) {
        refresh = false;
      }
      setTimeout(() => {
        document.getElementById('metricrollup').focus();
      }, 50);
    }
    if (refresh) {
      this.panelCtrl.refresh();
    }
  }

  metricRollupKeyUp(event) {
    const self = this;
    const element = event.currentTarget;
    if (event.keyCode === 13) {
      setTimeout(() => {
        self.target.metricrollup = element.value;
        self.updateMetricRollupValue();
      }, 0);
    }
  }

  updateMetricRollupValue(refresh = true) {
    if (this.target.metricrollup === '' && this.target.rolluptype !== 'automatic') {
      this.target.rolluptype = 'automatic';
    }
    if (refresh) {
      this.panelCtrl.refresh();
    }
  }

  minPeriodKeyUp(event) {
    const self = this;
    const element = event.currentTarget;
    if (event.keyCode === 13) {
      setTimeout(() => {
        self.target.min_period = element.value;
        self.updateMinPeriodValue(event);
      }, 0);
    }
  }

  updateMinPeriodValue(event) {
    const element = event.currentTarget;
    if (this.target.min_period === '' || isNaN(parseInt(this.target.min_period, 10))) {
      element.value = this.target.min_period = this.datasource.caqlMinPeriod;
    }
    this.panelCtrl.refresh();
  }

  hasCAQLMinPeriod() {
    return _.isString(this.datasource.caqlMinPeriod) && !isNaN(parseInt(this.datasource.caqlMinPeriod, 10));
  }

  egressValueChanged() {
    this.panelCtrl.refresh();
  }

  onChangeInternal() {
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }

  getSegments(index, prefix) {
    //log(() => 'getSegments() ' + index + ' prefix = ' + prefix);
    let query = prefix && prefix.length > 0 ? prefix : '';
    let isGraphite = 'graphite' === this.target.querytype;

    const segmentType = (this[isGraphite ? 'gSegments' : 'segments'][index] || {})._type;
    if (segmentType === SegmentType.MetricName) {
      if (encodeTag(SegmentType.MetricName, query) !== query) {
        query = 'b/' + btoa(escapeRegExp(query)) + '/';
      } else {
        query += '*';
      }
      return this.datasource
        .metricTagsQuery('and(__name:' + query + ')', true)
        .then((results) => {
          let metricnames = _.map(results.data, (result) => {
            return taglessName(result.metric_name);
          });
          metricnames = _.uniq(metricnames);

          const allSegments = _.map(metricnames, (segment) => {
            return this.newSegment(SegmentType.MetricName, {
              value: segment,
              expandable: true,
            });
          });
          return allSegments;
        })
        .catch((err) => {
          log(() => 'getSegments() err = ' + err.toString());
          return [];
        });
    } else if (segmentType === SegmentType.TagCat || segmentType === SegmentType.TagPlus) {
      const metricName = encodeTag(
        SegmentType.MetricName,
        (this[isGraphite ? 'gSegments' : 'segments'][0] || {}).value
      );
      return this.datasource
        .metricTagCatsQuery(metricName)
        .then((segments) => {
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
        .catch((err) => {
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
      const metricName = encodeTag(
        SegmentType.MetricName,
        (this[isGraphite ? 'gSegments' : 'segments'][0] || {}).value
      );
      const tagCat = (this[isGraphite ? 'gSegments' : 'segments'][index - 2] || {}).value;
      if (tagCat === 'select tag') {
        return Promise.resolve([]);
      }
      return this.datasource
        .metricTagValsQuery(metricName, encodeTag(SegmentType.TagCat, tagCat, false))
        .then((segments) => {
          if (segments.data && segments.data.length > 0) {
            const tagVals = segments.data;
            const tagSegments = [];
            tagSegments.push(
              this.newSegment(SegmentType.TagVal, {
                value: '*',
                expandable: true,
              })
            );

            _.eachRight(this.templateSrv.variables, (variable) => {
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
        .catch((err) => {
          log(() => 'getSegments() err = ' + err);
          return [];
        });
    }
    return Promise.resolve([]);
  }

  getGraphiteSegments(index, prefix) {
    var query = prefix && prefix.length > 0 ? prefix : '';

    if (index > 0) {
      query = this.queryModel.getGraphiteSegmentPathUpTo(index) + query;
    }

    return this.datasource
      .metricGraphiteQuery(query + '*', true)
      .then((segments) => {
        var allSegments = _.map(segments.data, (segment) => {
          var queryRegExp = new RegExp(this.escapeRegExp(query), 'i');

          return this.uiSegmentSrv.newSegment({
            value: segment.name.replace(queryRegExp, ''),
            expandable: !segment.leaf,
          });
        });

        if (index > 0 && allSegments.length === 0) {
          return allSegments;
        }

        // add query references
        if (index === 0) {
          _.eachRight(this.panelCtrl.panel.targets, (target) => {
            if (target.refId === this.target.refId) {
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
      .catch((err) => {
        return [];
      });
  }

  setSegmentType(segment: any, type: SegmentType) {
    segment._type = type;
    segment._typeName = typeof SegmentType[type];
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
    // always rebuild both
    this.gSegments = _.map(this.queryModel.gSegments, (segment) => {
      return this.uiSegmentSrv.newSegment(segment);
    });
    this.segments = _.map(this.queryModel.segments, (s) => this.mapSegment(s));
    // only check other segments per actual type
    if ('graphite' === this.target.querytype) {
      this.checkOtherGraphiteSegments(this.queryModel.checkOtherGSegmentsIndex || 0);
    } else {
      this.checkOtherSegments(this.queryModel.checkOtherSegmentsIndex || 0);
    }
  }

  addSelectMetricSegment() {
    let isGraphite = 'graphite' === this.target.querytype;
    this.queryModel.addSelectMetricSegment();
    const segment = this.uiSegmentSrv.newSelectMetric();
    this.setSegmentType(segment, SegmentType.MetricName);
    this[isGraphite ? 'gSegments' : 'segments'].push(segment);
  }

  buildSelectTagPlusSegment() {
    const tagCatSegment = this.uiSegmentSrv.newPlusButton();
    this.setSegmentType(tagCatSegment, SegmentType.TagPlus);
    return tagCatSegment;
  }

  addSelectTagPlusSegment() {
    let isGraphite = 'graphite' === this.target.querytype;
    this[isGraphite ? 'gSegments' : 'segments'].push(this.buildSelectTagPlusSegment());
  }

  newSelectTagValSegment() {
    const tagValSegment = this.uiSegmentSrv.newKeyValue('*');
    this.setSegmentType(tagValSegment, SegmentType.TagVal);
    return tagValSegment;
  }

  //
  checkOtherSegments(fromIndex) {
    let isGraphite = 'graphite' === this.target.querytype;
    if (fromIndex === this[isGraphite ? 'gSegments' : 'segments'].length) {
      const segmentType = this[isGraphite ? 'gSegments' : 'segments'][fromIndex - 1]._type;
      if (segmentType === SegmentType.MetricName) {
        this.addSelectTagPlusSegment();
      }
    }
    return Promise.resolve();
  }

  //
  checkOtherGraphiteSegments(fromIndex) {
    if (fromIndex === 0) {
      this.addSelectMetricSegment();
      return;
    }
    const path = this.queryModel.getGraphiteSegmentPathUpTo(fromIndex + 1);
    if (path === '') {
      return Promise.resolve();
    }
    return this.datasource
      .metricGraphiteQuery(path + '*')
      .then((segments) => {
        if (segments.data.length === 0) {
          if (path !== '') {
            this.queryModel.removeSegments(fromIndex + 1);
            this.gSegments = this.gSegments.splice(0, fromIndex + 1);
          }
        } else {
          _.map(segments.data, (segment) => {
            var pathRegExp = new RegExp(this.escapeRegExp(path), 'i');
            var segmentName = segment.name.replace(pathRegExp, '');
            segment.name = segmentName;
          });
          if (this.gSegments.length === fromIndex) {
            this.addSelectMetricSegment();
          } else {
            return this.checkOtherGraphiteSegments(fromIndex + 1);
          }
        }
      })
      .catch((err) => {});
  }

  // this sets segment focus for both standard & graphite segments
  setSegmentFocus(segmentIndex) {
    let isGraphite = 'graphite' === this.target.querytype;
    _.each(this[isGraphite ? 'gSegments' : 'segments'], (segment, index) => {
      segment.focus = segmentIndex === index;
    });
  }

  // this is called whenever a CAQL query field is changed
  caqlValueChanged() {
    this.targetChanged();
    this.panelCtrl.refresh();
  }

  // this is called whenever a standard segment value changes
  // NOTE: if we're adding or removing segments, do those operations on the
  // queryModel and then build those changes back into queryCtrl with buildSegments()
  segmentValueChanged(segment, segmentIndex) {
    this.error = null;
    this.queryModel.updateSegmentValue(segment, segmentIndex);

    // If we changed the start metric, all the filters are invalid, so remove them
    if (segmentIndex === 0) {
      this.removeSegments(segmentIndex + 1);
      // we're removing or changing an operator ('and(', 'or(', 'not(')
    } else if (segment._type === SegmentType.TagOp) {
      // We need to remove the entire operator (including every other segment) until our TagEnd.
      if (segment.value === 'REMOVE') {
        this.queryModel.removeStandardOperator(segmentIndex);
      }
      // else changing an Operator doesn't need to affect any other segments
      this.buildSegments();
      this.targetChanged();
      this.panelCtrl.refresh();
      return;
      // we're adding something, either an operator or a tag
    } else if (segment._type === SegmentType.TagPlus) {
      if (segment.value === 'and(' || segment.value === 'not(' || segment.value === 'or(') {
        this.queryModel.addStandardOperator(segmentIndex, segment.value);
        this.buildSegments();
        this.setSegmentFocus(segmentIndex + 3);
        return; // Do not trigger targetChanged(); we do not have a valid category yet, so set focus on the category segment
      } else {
        this.queryModel.addStandardTag(segmentIndex, segment.value);
        // Fall through so targetChanged() gets called below.
      }
    }
    // if we didn't remove or change an operator, we need to rebuild
    this.buildSegments();
    if (segment.expandable) {
      return this.checkOtherSegments(segmentIndex + 1).then(() => {
        this.setSegmentFocus(segmentIndex + 1);
        this.targetChanged();
        this.panelCtrl.refresh();
      });
    } else {
      this.setSegmentFocus(segmentIndex + 1);
      this.targetChanged();
      this.panelCtrl.refresh();
    }
  }

  // this is called whenever a graphite segment value changes
  graphiteSegmentValueChanged(segment, segmentIndex) {
    this.error = null;
    this.queryModel.updateSegmentValue(segment, segmentIndex);

    this.removeSegments(segmentIndex + 1);
    if (segment.expandable) {
      return this.checkOtherGraphiteSegments(segmentIndex + 1).then(() => {
        this.setSegmentFocus(segmentIndex + 1);
        this.targetChanged();
        this.panelCtrl.refresh();
      });
    } else {
      this.setSegmentFocus(segmentIndex + 1);
      this.targetChanged();
      this.panelCtrl.refresh();
    }
  }

  // this takes an index and removes that segment and all following segments
  removeSegments(index) {
    let isGraphite = 'graphite' === this.target.querytype;
    this[isGraphite ? 'gSegments' : 'segments'] = this[isGraphite ? 'gSegments' : 'segments'].splice(0, index);
    this.queryModel.removeSegments(index);
  }

  emptySegments() {
    let isGraphite = 'graphite' === this.target.querytype;
    this[isGraphite ? 'gSegments' : 'segments'] = [];
    this.queryModel.emptySegments();
  }

  queryFunctionToCaqlFind() {
    if (this.target.paneltype === 'Heatmap' || this.target.hist_transform !== undefined) {
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

  buildHistogramTransform() {
    if (this.target.hist_transform !== undefined) {
      let egressOverride = this.target.egressoverride;
      if (egressOverride === 'automatic') {
        if (this.target.hist_transform === 'statsd_counter') {
          egressOverride = 'counter';
        } else {
          egressOverride = 'average';
        }
      }
      return this.histogramTransforms[egressOverride];
    } else {
      return '';
    }
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

  // this builds a CAQL find() query out of standard query segments
  buildCAQLFromStandard() {
    const segments = this.segments.slice();
    // First element is always metric name
    const metricName = segments.shift().value;
    const tagless = segments.length === 1 && segments[0]._type === SegmentType.TagPlus;
    if (metricName === '*' && tagless) {
      return '';
    }
    let query = this.queryFunctionToCaqlFind() + "('" + metricName + "'";
    if (tagless) {
      query += ')' + this.buildHistogramTransform() + this.buildCaqlLabel();
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
      if (
        type === SegmentType.TagOp ||
        type === SegmentType.TagPair ||
        type === SegmentType.TagCat ||
        type === SegmentType.TagSep
      ) {
        noComma = true;
      } else {
        noComma = false;
      }

      query += encodeTag(type, segment.value);
    }
    query += "')" + this.buildHistogramTransform() + this.buildCaqlLabel();
    return query;
  }

  // this builds a CAQL find() query out of graphite-style query segments
  buildCAQLFromGraphite() {
    const graphiteName = this.queryModel
      .getGraphiteSegmentPathUpTo(this.gSegments.length)
      .replace(/\.select metric.$/, '.*')
      .replace(/\.$/, '');
    const matches = graphiteName.match(/^(\w{8}-\w{4}-\w{4}-\w{4}-\w{12})?\.?(.*)$/) || [null, '', ''];
    const hasUUID = !!matches[1];
    if (graphiteName === '*' && !hasUUID) {
      return '';
    }
    let query = this.queryFunctionToCaqlFind() + "('" + matches[2] + "'";
    if (hasUUID) {
      query += ', "and(__check_uuid:' + matches[1] + ')"';
    }
    query += ')' + this.buildHistogramTransform() + this.buildCaqlLabel();
    return query;
  }

  // this converts standard segments to graphite segments
  convertStandardToGraphite() {
    this.queryModel.convertStandardToGraphite();
    this.buildSegments();
    this.buildGraphiteQuery();
  }

  // this converts graphite segments to standard segments
  convertGraphiteToStandard() {
    this.queryModel.convertGraphiteToStandard();
    this.buildSegments();
    this.buildStandardQuery();
  }

  // this builds a graphite-style query out of the segments
  buildGraphiteQuery() {
    this.target.query = this.queryModel
      .getGraphiteSegmentPathUpTo(this.gSegments.length)
      .replace(/\.select metric.$/, '')
      .replace(/\.$/, '');
  }

  // this builds a standard query out of the segments
  buildStandardQuery() {
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
      if (
        type === SegmentType.TagOp ||
        type === SegmentType.TagPair ||
        type === SegmentType.TagCat ||
        type === SegmentType.TagSep
      ) {
        noComma = true;
      } else {
        noComma = false;
      }
      query += encodeTag(type, segment.value);
    }
    query += ')';
    this.target.query = query;
  }

  targetChanged() {
    if (this.queryModel.error) {
      return;
    }
    this.queryModel.updateModelTarget(this.panelCtrl.panel.targets);
    if ('graphite' === this.target.querytype) {
      this.buildGraphiteQuery();
    } else if ('basic' === this.target.querytype) {
      this.buildStandardQuery();
    }
  }

  escapeRegExp(regexp) {
    var specialChars = '[]{}()*?.,';
    var fixedRegExp = [];
    for (var i = 0; i < regexp.length; ++i) {
      var c = regexp.charAt(i);
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
}
