import _ from 'lodash';
import Log from './log';
import IrondbQuery from './irondb_query';
/* eslint-disable-next-line no-duplicate-imports */
import { SegmentType, taglessName, decodeTag, encodeTag } from './irondb_query';
import { QueryCtrl } from 'grafana/app/plugins/sdk';
import appEvents from 'grafana/app/core/app_events';
import './css/query_editor.css';

const log = Log('IrondbQueryCtrl');

function _escapeRegExp(regexp) {
    return String(regexp).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
}

function _fixRegExp(regexp) {
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
        this.target.queryDisplay = this.target.queryDisplay || this.target.query || '';
        this.target.format = this.target.format || 'ts';
        let querytype = this.target.querytype;
        if (this.queryTypeOptions.some((cfg) => cfg.value === querytype)) {
            this.target.querytype = querytype;
        } else if (this.target.isCaql !== null) {
            this.target.querytype = this.target.isCaql ? 'caql' : this.datasource.allowGraphite ? 'graphite' : 'basic';
        } else {
            this.target.querytype = this.datasource.allowGraphite ? 'graphite' : 'basic';
        }
        this.target.lastQueryType = this.target.lastQueryType || this.target.querytype;
        this.target.local_filter = this.target.local_filter || '';
        this.target.local_filter_match = this.target.local_filter_match || 'all';
        this.target.alert_count_query_type = this.target.alert_count_query_type || 'instant';
        this.target.alert_id = this.target.alert_id || '';
        this.target.min_period =
            this.target.min_period || (this.hasCAQLMinPeriod() ? this.datasource.caqlMinPeriod : '');
        this.queryModel = new IrondbQuery(this.datasource, this.target, templateSrv);
        this.checkForPlusAndSelect();
        this.buildSegments();
        this.updateMetricLabelValue(false);
    }

    resetQueryTarget() {
        log(() => 'resetQueryTarget()');
        this.target.query = '';
        this.target.queryDisplay = '';
        this.target.egressoverride = 'average';
        this.target.labeltype = 'default';
        this.target.rolluptype = 'automatic';
        this.target.format = 'ts';
        this.target.local_filter = '';
        this.target.local_filter_match = 'all';
        this.target.alert_id = '';
        this.emptySegments();
        this.queryModel.parseTarget();
        this.checkForPlusAndSelect();
        this.buildSegments();
        this.panelCtrl.refresh();
    }

    // this returns the query type options (b/c graphite may be shown or hidden)
    getQueryTypeOptions() {
        const allowGraphite = this.datasource.allowGraphite;
        let options = [];
        _.each(this.queryTypeOptions, (obj, index) => {
            if (allowGraphite || 'graphite' !== obj.value) {
                options.push(obj);
            }
        });
        return options;
    }

    // This changes the query type between CAQL/Standard/Graphite
    toggleEditorMode() {
        if (this.target.lastQueryType === 'caql' && this.target.querytype === 'basic') {
            // CAQL -> Standard
            this.buildQueries();
        } else if (this.target.lastQueryType === 'caql' && this.target.querytype === 'graphite') {
            // CAQL -> Graphite
            this.buildQueries();
        } else if (this.target.lastQueryType === 'basic' && this.target.querytype === 'caql') {
            // Standard -> CAQL
            this.target.query = this.target.queryDisplay = this.buildCAQLFromStandard();
        } else if (this.target.lastQueryType === 'basic' && this.target.querytype === 'graphite') {
            // Standard -> Graphite
            this.convertStandardToGraphite();
            this.checkForPlusAndSelect();
            this.buildSegments();
            this.buildGraphiteQuery();
        } else if (this.target.lastQueryType === 'graphite' && this.target.querytype === 'caql') {
            // Graphite -> CAQL
            this.target.query = this.target.queryDisplay = this.buildCAQLFromGraphite();
        } else if (this.target.lastQueryType === 'graphite' && this.target.querytype === 'basic') {
            // Graphite -> Standard
            this.convertGraphiteToStandard();
            this.checkForPlusAndSelect();
            this.buildSegments();
            this.buildStandardQuery();
        } else if (this.target.querytype === 'alerts' || this.target.queryType === 'alert_counts') {
            // Alerts
            this.target.query = this.target.queryDisplay = '';
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
        this.target.query = this.target.queryDisplay = '';
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

    formatChanged() {
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

    // TagCat: this queries the tag cat endpoint with the current metric name to get an array of options for the next segment
    //   index: the index of this segment
    //   search: any search string the user has entered to filter the autocomplete
    getStandardCategoryOptions(index, search) {
        const segmentType = (this.segments[index] || {})._type;
        const metricName = encodeTag(SegmentType.MetricName, (this.segments[0] || {}).value);
        return this.datasource
            .metricTagCatsQuery('and(__name:' + metricName + ')')
            .then((values) => {
                if (values.data && values.data.length > 0) {
                    const tagCats = values.data;
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
                log(() => 'getOptionSegments() err = ' + err);
                return [];
            });
    }

    // TagVal: this queries the tag val endpoint with the current metric name and tag category to get an array of options for the next segment
    //   index: the index of this segment
    //   search: any search string the user has entered to filter the autocomplete
    getStandardValueOptions(index, search) {
        const metricName = encodeTag(SegmentType.MetricName, (this.segments[0] || {}).value);
        const tagCat = (this.segments[index - 2] || {}).value;
        if (tagCat === 'select tag') {
            return Promise.resolve([]);
        }
        return this.datasource
            .metricTagValsQuery('and(__name:' + metricName + ')', encodeTag(SegmentType.TagCat, tagCat, false))
            .then((values) => {
                const tagVals = values.data;
                const tagSegments = [];
                tagSegments.push(
                    this.newSegment(SegmentType.TagVal, {
                        value: '*',
                        expandable: true,
                    })
                );
                if (tagVals && tagVals.length) {
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
                }
                return tagSegments;
            })
            .catch((err) => {
                log(() => 'getOptionSegments() err = ' + err);
                return [];
            });
    }

    // TagPlus: this gets the standard category options here also
    getStandardPlusOptions(index, search) {
        return this.getStandardCategoryOptions(index, search);
    }

    // TagOp: this returns an array of operator options for the next segment
    //   index: the index of this segment
    //   search: any search string the user has entered to filter the autocomplete
    getStandardOperatorOptions(index, search) {
        const tagSegments = [
            this.newSegment(SegmentType.TagOp, { value: 'REMOVE' }),
            this.newSegment(SegmentType.TagOp, { value: 'and(' }),
            this.newSegment(SegmentType.TagOp, { value: 'not(' }),
            this.newSegment(SegmentType.TagOp, { value: 'or(' }),
        ];
        return Promise.resolve(tagSegments);
    }

    // this queries tag query endpoint with the current [incomplete] search to get an array of options for the next segment
    //   index: the index of this segment
    //   search: any search string the user has entered to filter the autocomplete
    getStandardDefaultOptions(index, search) {
        let query = search || '';

        const segmentType = (this.segments[index] || {})._type;
        if (segmentType === SegmentType.MetricName) {
            if (encodeTag(SegmentType.MetricName, query) !== query) {
                query = 'b/' + btoa(_escapeRegExp(query)) + '/';
            } else {
                query += '*';
            }
            return this.datasource
                .metricTagsQuery('and(__name:' + query + ')', true)
                .then((values) => {
                    let metricnames = _.map(values.data, (option) => {
                        return taglessName(option.metric_name);
                    });
                    metricnames = _.uniq(metricnames);

                    const allSegments = _.map(metricnames, (value) => {
                        return this.newSegment(SegmentType.MetricName, {
                            value: value,
                            expandable: true,
                        });
                    });
                    return allSegments;
                })
                .catch((err) => {
                    log(() => 'getOptionSegments() err = ' + err.toString());
                    return [];
                });
        }
        return Promise.resolve([]);
    }

    // TagCat: this queries the tag cat endpoint with the current metric name to get an array of options for the next segment
    //   index: the index of this segment
    //   search: any search string the user has entered to filter the autocomplete
    getGraphiteCategoryOptions(index, search) {
        const segmentType = (this.gSegments[index] || {})._type;
        const metricName = this.queryModel
            .getGraphiteSegmentPath()
            .replace(/\.select\smetric\.$/, '.*')
            .replace(/\.$/, '');
        return this.datasource
            .metricTagCatsQuery('and(__name:' + metricName + ')')
            .then((values) => {
                if (values.data && values.data.length > 0) {
                    const tagCats = values.data;
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
                log(() => 'getOptionSegments() err = ' + err);
                return [];
            });
    }

    // TagVal: this queries the tag val endpoint with the current metric name and tag category to get an array of options for the next segment
    //   index: the index of this segment
    //   search: any search string the user has entered to filter the autocomplete
    getGraphiteValueOptions(index, search) {
        const metricName = this.queryModel
            .getGraphiteSegmentPath()
            .replace(/\.select\smetric\.$/, '.*')
            .replace(/\.$/, '');
        const tagCat = (this.gSegments[index - 2] || {}).value;
        if (tagCat === 'select tag') {
            return Promise.resolve([]);
        }
        return this.datasource
            .metricTagValsQuery('and(__name:' + metricName + ')', encodeTag(SegmentType.TagCat, tagCat, false))
            .then((values) => {
                const tagVals = values.data;
                const tagSegments = [];
                tagSegments.push(
                    this.newSegment(SegmentType.TagVal, {
                        value: '*',
                        expandable: true,
                    })
                );
                if (tagVals && tagVals.length) {
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
                }
                return tagSegments;
            })
            .catch((err) => {
                log(() => 'getOptionSegments() err = ' + err);
                return [];
            });
    }

    // TagPlus: this gets the graphite category options here also
    getGraphitePlusOptions(index, search) {
        return this.getGraphiteCategoryOptions(index, search);
    }

    // TagOp: this returns an array of operator options for the next segment
    //   index: the index of this segment
    //   search: any search string the user has entered to filter the autocomplete
    getGraphiteOperatorOptions(index, search) {
        const tagSegments = [
            this.newSegment(SegmentType.TagOp, { value: 'REMOVE' }),
            this.newSegment(SegmentType.TagOp, { value: 'and(' }),
            this.newSegment(SegmentType.TagOp, { value: 'not(' }),
            this.newSegment(SegmentType.TagOp, { value: 'or(' }),
        ];
        return Promise.resolve(tagSegments);
    }

    // this queries the graphite endpoint with the current [incomplete] query path to get an array of options for the next segment
    //   index: the index of this segment
    //   search: any search string the user has entered to filter the autocomplete
    getGraphiteDefaultOptions(index, search) {
        const isFirstSegment = 0 === index;
        // if we're ignoring UUIDs, then we need to prepend our search with '*.' to skip the first segment (the UUID)
        const ignoreUUIDs = this.datasource.ignoreGraphiteUUIDs();
        // if this is not the first segment, we need to get the entire preceding path
        let query = isFirstSegment ? '' : this.queryModel.getGraphiteSegmentPathUpTo(index);

        return this.datasource
            .metricGraphiteQuery(query + (search || '') + '*', true)
            .then((values) => {
                // strip tags from the name
                values.data = this.datasource.stripTags(values.data);
                // convert values into segment objects
                let optionSegments = _.map(values.data, (option) => {
                    const uuidRegExp = /^(\w{8}-\w{4}-\w{4}-\w{4}-\w{12})./;
                    const queryRegExp = new RegExp(_fixRegExp(query), 'i');
                    if (ignoreUUIDs) {
                        option.name = option.name.replace(uuidRegExp, '');
                    }
                    return this.uiSegmentSrv.newSegment({
                        value: option.name.replace(queryRegExp, ''), // strip out the query path before this segment to only show this last segment value
                        expandable: !option.leaf,
                    });
                });
                // de-dupe options if there are any
                if (optionSegments.length) {
                    optionSegments = _.uniqBy(optionSegments, 'value');
                }
                // add wildcard option if there are other options or if this is the first segment
                if (isFirstSegment || optionSegments.length) {
                    optionSegments.unshift(this.uiSegmentSrv.newSegment('*'));
                }
                return optionSegments;
            })
            .catch((err) => {
                return [];
            });
    }

    // create a UI segment with a passed set of options, and set its type correctly
    newSegment(type: SegmentType, options: any) {
        const segment = this.uiSegmentSrv.newSegment(options);
        return this.setSegmentType(segment, type);
    }

    // set the correct type properties on a segment object
    setSegmentType(segment: any, type: SegmentType) {
        segment._type = type;
        segment._typeName = SegmentType[type];
        return segment;
    }

    // convert a segment config object (from the query model) into a bona fide UI segment
    convertSegment(segment) {
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
            uiSegment = this.uiSegmentSrv.newPlusButton();
        } else {
            uiSegment = this.uiSegmentSrv.newSegment(segment);
        }
        return this.setSegmentType(uiSegment, segment.type);
    }

    // this sets segment focus for both standard & graphite segments
    setSegmentFocus(index) {
        let isGraphite = 'graphite' === this.target.querytype;
        _.each(this[isGraphite ? 'gSegments' : 'segments'], (segment, this_index) => {
            segment.focus = index === this_index;
        });
    }

    // this is called whenever a CAQL query field is changed
    caqlValueChanged() {
        this.buildQueries();
        this.panelCtrl.refresh();
    }

    // TagCat: this updates a standard category segment value
    updateStandardCategorySegmentValue(index, segment) {
        return this.updateStandardDefaultSegmentValue(index, segment);
    }

    // TagVal: this updates a standard value segment value
    updateStandardValueSegmentValue(index, segment) {
        return this.updateStandardDefaultSegmentValue(index, segment);
    }

    // TagPlus: this updates a standard plus segment value
    // NOTE: if we're adding or removing segments, do those operations on the
    // queryModel and then build those changes back into queryCtrl with buildSegments()
    updateStandardPlusSegmentValue(index, segment) {
        this.error = null;
        this.queryModel.updateSegmentValue(segment, index);

        // we're adding something, either an operator or a tag
        if (segment.value === 'and(' || segment.value === 'not(' || segment.value === 'or(') {
            this.queryModel.addOperator(index, segment.value);
            //this.checkForPlusAndSelect();
            this.buildSegments();
            // Do not build queries or refresh the panel; we do not have a valid category yet, so set focus on the category segment
            this.setSegmentFocus(index + 3);
        } else {
            this.queryModel.addTag(index, segment.value);
            //this.checkForPlusAndSelect();
            this.buildSegments();
            this.setSegmentFocus(index + 1);
            this.buildQueries();
            this.panelCtrl.refresh();
        }
    }

    // TagOp: this updates a standard operator segment value
    // NOTE: if we're adding or removing segments, do those operations on the
    // queryModel and then build those changes back into queryCtrl with buildSegments()
    updateStandardOperatorSegmentValue(index, segment) {
        this.error = null;
        this.queryModel.updateSegmentValue(segment, index);

        // We need to remove the entire operator (including every other segment) until our TagEnd.
        if (segment.value === 'REMOVE') {
            this.queryModel.removeOperator(index);
        }
        // else changing an Operator doesn't need to affect any other segments
        this.checkForPlusAndSelect();
        this.buildSegments();
        this.buildQueries();
        this.panelCtrl.refresh();
    }

    // this updates a standard metric name (or tag category or tag value) segment value
    // NOTE: if we're adding or removing segments, do those operations on the
    // queryModel and then build those changes back into queryCtrl with buildSegments()
    updateStandardDefaultSegmentValue(index, segment) {
        this.error = null;
        this.queryModel.updateSegmentValue(segment, index);

        // we changed the start metric, so we remove all the filters b/c they're invalid
        if (0 === index) {
            this.removeSegments(index + 1);
            this.checkForPlusAndSelect();
            this.buildSegments();
            this.setSegmentFocus(index + 1);
        }
        this.buildQueries();
        this.panelCtrl.refresh();
    }

    // TagCat: this updates a graphite category segment value
    updateGraphiteCategorySegmentValue(index, segment) {
        return this.updateGraphiteDefaultSegmentValue(index, segment);
    }

    // TagVal: this updates a graphite value segment value
    updateGraphiteValueSegmentValue(index, segment) {
        return this.updateGraphiteDefaultSegmentValue(index, segment);
    }

    // TagPlus: this updates a graphite plus segment value
    updateGraphitePlusSegmentValue(index, segment) {
        this.error = null;
        this.queryModel.updateSegmentValue(segment, index);

        // we're adding something, either an operator or a tag
        if (segment.value === 'and(' || segment.value === 'not(' || segment.value === 'or(') {
            this.queryModel.addOperator(index, segment.value);
            //this.checkForPlusAndSelect();
            this.buildSegments();
            // Do not build queries or refresh the panel; we do not have a valid category yet, so set focus on the category segment
            this.setSegmentFocus(index + 3);
        } else {
            this.queryModel.addTag(index, segment.value);
            //this.checkForPlusAndSelect();
            this.buildSegments();
            this.setSegmentFocus(index + 1);
            this.buildQueries();
            this.panelCtrl.refresh();
        }
    }

    // TagOp: this updates a graphite operator segment value
    updateGraphiteOperatorSegmentValue(index, segment) {
        this.error = null;
        this.queryModel.updateSegmentValue(segment, index);

        // We need to remove the entire operator (including every other segment) until our TagEnd.
        if (segment.value === 'REMOVE') {
            this.queryModel.removeOperator(index);
        }
        // else changing an Operator doesn't need to affect any other segments
        this.checkForPlusAndSelect();
        this.buildSegments();
        this.buildQueries();
        this.panelCtrl.refresh();
    }

    // this updates a graphite metric name (or tag category or tag value) segment value
    updateGraphiteDefaultSegmentValue(index, segment) {
        const isMultiSegment = /\./.test(String(segment.value));

        this.error = null;
        this.queryModel.updateSegmentValue(segment, index);

        // we changed the first metric segment, so we remove all the filters b/c they're in a different namespace now
        if (0 === index) {
            this.removeSegments(index + 1);
        }
        // if they've entered multiple segments, we need to reconstruct the name segments by using the entire name entered so far
        if (isMultiSegment) {
            const graphiteName = this.queryModel.getGraphiteSegmentPath().replace(/\.$/, '');
            this.queryModel.convertStandardToGraphite(graphiteName);
        }
        // "expandable" means it's not the last segment, so there will be another segment dropdown to follow.
        if (segment.expandable && segment._type === SegmentType.MetricName) {
            this.queryModel.addSelectMetricSegment();
        }
        this.checkForPlusAndSelect();
        this.buildSegments();
        if (segment.expandable) {
            this.setSegmentFocus(index + 1);
        }
        this.buildQueries();
        this.panelCtrl.refresh();
    }

    // this takes the queryModel segment JSON and builds it into actual segment objects
    buildSegments() {
        this.gSegments = this.queryModel.gSegments.map((s) => this.convertSegment(s));
        this.segments = this.queryModel.segments.map((s) => this.convertSegment(s));
    }

    // check to see if we need a "select metric" or "plus" segment
    // NOTE: you must run this.buildSegments() after this function
    checkForPlusAndSelect() {
        let isGraphite = 'graphite' === this.target.querytype;
        if (isGraphite) {
            // check the metric name so far...if there isn't one, add a select-metric segment and be done
            const path = this.queryModel.getGraphiteSegmentPath();
            if (!path || '.' === path) {
                this.queryModel.addSelectMetricSegment();
            }
        }
        // always add a plus segment if there's not already one (the logic is in the model)
        this.queryModel.addPlusSegment();
    }

    // this takes an index and removes that segment and all following segments
    removeSegments(index) {
        let isGraphite = 'graphite' === this.target.querytype;
        this[isGraphite ? 'gSegments' : 'segments'] = this[isGraphite ? 'gSegments' : 'segments'].splice(0, index);
        this.queryModel.removeSegments(index);
    }

    // this empties an entire segments array
    emptySegments() {
        let isGraphite = 'graphite' === this.target.querytype;
        this[isGraphite ? 'gSegments' : 'segments'] = [];
        this.queryModel.emptySegments();
    }

    // this takes a standard query egress param and chooses the proper CAQL find() function
    getCAQLFindFunction() {
        if (this.target.paneltype === 'Heatmap' || this.target.hist_transform !== undefined) {
            return 'find:histogram';
        }
        let findFunction = 'find';
        let egressOverride = this.target.egressoverride;
        if ('average' !== egressOverride && 'automatic' !== egressOverride) {
            egressOverride = this.caqlFindFunctions[egressOverride];
            findFunction += ':' + egressOverride;
        }
        return findFunction;
    }

    getCAQLHistogramTransform() {
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

    getCAQLLabel() {
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
    /* params:
     *     metricPrefix (a string to be prepended to the metric name...used to prepend the `[graphite]` index specifier)
     */
    buildCAQLFromStandard(metricPrefix = '') {
        let metric = '*';
        let filterValues = [];
        this.queryModel.segments.forEach((segment) => {
            switch (segment.type) {
                case SegmentType.MetricName:
                    metric = segment.value;
                    break;

                case SegmentType.TagPair:
                    filterValues.push(':');
                    break;

                case SegmentType.TagSep:
                    filterValues.push(',');
                    break;

                case SegmentType.TagEnd:
                    filterValues.push(')');
                    break;

                case SegmentType.TagCat:
                case SegmentType.TagVal:
                case SegmentType.TagOp:
                    filterValues.push(segment.value);
                    break;
            }
        });
        let filter = filterValues.join('');
        let query = this.getCAQLFindFunction() + "('" + metricPrefix + metric + "'";
        if (filter) {
            query += ", '" + filter + "')" + this.getCAQLHistogramTransform() + this.getCAQLLabel();
        } else {
            query += ')' + this.getCAQLHistogramTransform() + this.getCAQLLabel();
        }
        return query;
    }

    // this builds a CAQL find() query out of graphite-style query segments
    buildCAQLFromGraphite() {
        this.convertGraphiteToStandard();
        this.buildSegments();
        return this.buildCAQLFromStandard('[graphite]');
    }

    // this converts standard segments to graphite segments
    convertStandardToGraphite() {
        this.queryModel.convertStandardToGraphite();
        this.checkForPlusAndSelect();
        this.buildSegments();
        this.buildGraphiteQuery();
    }

    // this converts graphite segments to standard segments
    convertGraphiteToStandard() {
        this.queryModel.convertGraphiteToStandard();
        this.checkForPlusAndSelect();
        this.buildSegments();
        this.buildStandardQuery();
    }

    // this builds a graphite-style query out of the segments
    buildGraphiteQuery() {
        // query
        this.target.query = this.target.queryDisplay = this.queryModel
            .getGraphiteSegmentPath()
            .replace(/\.select metric.$/, '')
            .replace(/\.$/, '');
        // tag filter
        let filterValues = [];
        this.queryModel.gSegments.forEach((segment) => {
            switch (segment.type) {
                case SegmentType.TagPair:
                    filterValues.push(':');
                    break;

                case SegmentType.TagSep:
                    filterValues.push(',');
                    break;

                case SegmentType.TagEnd:
                    filterValues.push(')');
                    break;

                case SegmentType.TagCat:
                case SegmentType.TagVal:
                case SegmentType.TagOp:
                    filterValues.push(segment.value);
                    break;
            }
        });
        this.target.tagFilter = filterValues.join('');
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
        this.target.query = this.target.queryDisplay = query;
    }

    // this rebuilds queries after segments have changed, or re-renders query replacements after CAQL has changed
    buildQueries() {
        if (this.queryModel.error) {
            return;
        }
        if ('graphite' === this.target.querytype) {
            this.buildGraphiteQuery();
        } else if ('basic' === this.target.querytype) {
            this.buildStandardQuery();
        }
        this.queryModel.renderQueries(this.panelCtrl.panel.targets);
    }
}
