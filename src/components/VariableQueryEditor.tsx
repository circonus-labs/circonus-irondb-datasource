import React, { PureComponent } from 'react';
import { SelectableValue } from '@grafana/data';
import { Select } from '@grafana/ui';
import { CirconusVariableQuery } from '../types';

const QUERY_TYPE_OPTIONS: Array<SelectableValue<string>> = [
  { value: 'metric names',   label: 'Metric Names', },
  { value: 'tag categories', label: 'Tag Categories', },
  { value: 'tag values',     label: 'Tag Values', },
  { value: 'graphite style', label: 'Graphite-Style Metric Names', },
  { value: 'last value',     label: 'Last Metric Value', },
];

const RESULTS_LIMIT_OPTIONS: Array<SelectableValue<number>> = [
  { value: 100, label: '100', },
  { value: 500, label: '500', },
  { value: 1000, label: '1000', },
  { value: 2000, label: '2000', },
  { value: 5000, label: '5000', },
];

interface VariableQueryProps {
  query: CirconusVariableQuery;
  onChange: (query: CirconusVariableQuery, definition: string) => void;
}

interface State {
  queryTypeOption: SelectableValue<string>;
  metricFindQuery: string;
  tagCategory: string;
  resultsLimitOption: SelectableValue<number>;
}

export class VariableQueryEditor extends PureComponent<VariableQueryProps, State> {
  query: CirconusVariableQuery;

  constructor(props: VariableQueryProps) {
    super(props);

    // Use default query to prevent undefined input values
    let defaultQuery: CirconusVariableQuery = {
      queryType: QUERY_TYPE_OPTIONS[0].value as string,
      metricFindQuery: '',
      tagCategory: '',
      resultsLimit: RESULTS_LIMIT_OPTIONS[0].value as number,
    };
    let query = Object.assign({}, defaultQuery, props.query);
    this.query = query;

    // set state
    let queryTypeOption =
      QUERY_TYPE_OPTIONS.find((option) => {
          return option.value === query.queryType;
      }) || (query.tagCategory ? QUERY_TYPE_OPTIONS[2] : QUERY_TYPE_OPTIONS[0]);
    let resultsLimitOption =
      RESULTS_LIMIT_OPTIONS.find((option) => {
          return option.value === query.resultsLimit;
      }) || RESULTS_LIMIT_OPTIONS[0];
    this.state = {
      queryTypeOption: queryTypeOption,
      metricFindQuery: query.metricFindQuery || '',
      tagCategory: query.tagCategory || '',
      resultsLimitOption: resultsLimitOption,
    };
  }

  render() {
    // don't use this query prop b/c sometimes it's initialized erroneously as
    // an empty string (e.g. when the datasource is changed, for some reason)
    let { query, onChange } = this.props;
    let { queryTypeOption, metricFindQuery, tagCategory, resultsLimitOption } = this.state;

    const isMetricNamesType =
            'metric names' === this.query.queryType || (!this.query.queryType && !this.query.tagCategory),
      isTagCatsType   = 'tag categories' === this.query.queryType,
      isTagValsType   = 'tag values' === this.query.queryType || (!this.query.queryType && this.query.tagCategory),
      isGraphiteType  = 'graphite style' === this.query.queryType,
      isLastValueType = 'last value' === this.query.queryType,
      limitIsLarge    = this.query.resultsLimit > 1000;

    const saveQuery = () => {
      let q = Object.assign({}, this.query);
      onChange(
        q,
        'tag values' === this.query.queryType
          ? `${this.query.metricFindQuery} (${this.query.queryType} of '${this.query.tagCategory}')`
          : `${this.query.metricFindQuery} (${this.query.queryType})`
      );
    };

    const updateQueryType = (option: SelectableValue<string>) => {
      this.query.queryType = option.value as string;
      this.setState({
        queryTypeOption: option,
      });
      saveQuery();
    };

    const updateMetricFindQuery = (event: React.FormEvent<HTMLInputElement>) => {
      this.query.metricFindQuery = event.currentTarget.value;
      this.setState({
        metricFindQuery: this.query.metricFindQuery,
      });
    };

    const updateTagCategory = (event: React.FormEvent<HTMLInputElement>) => {
      this.query.tagCategory = event.currentTarget.value;
      this.setState({
        tagCategory: this.query.tagCategory,
      });
    };

    const updateResultsLimit = (option: SelectableValue<number>) => {
      this.query.resultsLimit = option.value as number;
      this.setState({
        resultsLimitOption: option,
      });
      saveQuery();
    };

    // re-save it if it's initialized erroneously as an empty string
    // (e.g. when the datasource is changed, for some reason)
    if (!query && this.query.metricFindQuery) {
      saveQuery();
    }

    const customSelectStyle = {
      width: '364px',
    };
    const customSelectWarningStyle = {
      position: 'absolute' as 'absolute', // cast string to type 'absolute',
      top: '0.25rem',
      left: '375px',
      width: '300px',
      fontSize: '90%',
      lineHeight: '1',
      opacity: '0.5',
    };
    return (
      <div>
        <div className="gf-form" style={customSelectStyle}>
          <span className="gf-form-label width-10">Query Type</span>
          <Select
            aria-label="Select query type"
            isSearchable={false}
            options={QUERY_TYPE_OPTIONS}
            onChange={updateQueryType}
            value={queryTypeOption}
          />
          {isLastValueType && (
            <div style={customSelectWarningStyle}>
              Last Metric Value queries automatically exclude histogram metrics.
            </div>
          )}
        </div>
        <div className="gf-form">
          {(isMetricNamesType || isLastValueType) && (
            <span className="gf-form-label width-10">Metric Search Query</span>
          )}
          {(isTagCatsType || isTagValsType) && (
            <span className="gf-form-label width-10">Metric Search Filter</span>
          )}
          {isGraphiteType && <span className="gf-form-label width-10">Metric Name Search</span>}
          <input
            name="metricFindQuery"
            className="gf-form-input"
            onChange={updateMetricFindQuery}
            onBlur={saveQuery}
            value={metricFindQuery}
          />
        </div>
        {isTagValsType && (
          <div className="gf-form">
            <span className="gf-form-label width-10">Tag Category</span>
            <input
              name="tagCategory"
              className="gf-form-input"
              onChange={updateTagCategory}
              onBlur={saveQuery}
              value={tagCategory}
            />
          </div>
        )}
        <div className="gf-form" style={customSelectStyle}>
          <span className="gf-form-label width-10">Results Limit</span>
          <Select
            aria-label="Select results limit"
            className="width-15"
            isSearchable={false}
            options={RESULTS_LIMIT_OPTIONS}
            onChange={updateResultsLimit}
            value={resultsLimitOption}
          />
          {limitIsLarge && (
            <div style={customSelectWarningStyle}>
              Large variable lists can cause performance problems on dashboards. Use with care.
            </div>
          )}
        </div>
      </div>
    );
  }
}
