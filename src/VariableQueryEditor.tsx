import React, { PureComponent } from 'react';
import { SelectableValue } from '@grafana/data';
import { Select } from '@grafana/ui';
import { IronDBVariableQuery } from './types';

const QUERY_TYPE_OPTIONS: Array<SelectableValue<string>> = [
    {
        value: 'metric names',
        label: 'Metric Names',
    },
    {
        value: 'tag categories',
        label: 'Tag Categories',
    },
    {
        value: 'tag values',
        label: 'Tag Values',
    },
    {
        value: 'graphite style',
        label: 'Graphite-Style Metric Names',
    },
];

const RESULTS_LIMIT_OPTIONS: Array<SelectableValue<number>> = [
    {
        value: 100,
        label: '100',
    },
    {
        value: 500,
        label: '500',
    },
    {
        value: 1000,
        label: '1000',
    },
    {
        value: 2000,
        label: '2000',
    },
    {
        value: 5000,
        label: '5000',
    },
];

interface VariableQueryProps {
    query: IronDBVariableQuery;
    onChange: (query: IronDBVariableQuery, definition: string) => void;
}

interface State {
    queryTypeOption: SelectableValue<string>;
    metricFindQuery: string;
    tagCategory: string;
    resultsLimitOption: SelectableValue<number>;
}

export class VariableQueryEditor extends PureComponent<VariableQueryProps, State> {
    query: IronDBVariableQuery;

    constructor(props: VariableQueryProps) {
        super(props);

        // Use default query to prevent undefined input values
        let defaultQuery: IronDBVariableQuery = {
            queryType: QUERY_TYPE_OPTIONS[0].value,
            metricFindQuery: '',
            tagCategory: '',
            resultsLimit: RESULTS_LIMIT_OPTIONS[0].value,
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
            isTagCatsType = 'tag categories' === this.query.queryType,
            isTagValsType = 'tag values' === this.query.queryType || (!this.query.queryType && this.query.tagCategory),
            isGraphiteType = 'graphite style' === this.query.queryType;

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
            this.query.queryType = option.value;
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
            this.query.resultsLimit = option.value;
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
                </div>
                <div className="gf-form">
                    {isMetricNamesType && <span className="gf-form-label width-10">Metric Search Query</span>}
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
                        isSearchable={false}
                        options={RESULTS_LIMIT_OPTIONS}
                        onChange={updateResultsLimit}
                        value={resultsLimitOption}
                    />
                </div>
            </div>
        );
    }
}
