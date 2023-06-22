import React, { ChangeEvent, FocusEvent } from 'react';
import { defaults } from 'lodash';
import { DataSourceHttpSettings, InlineField, InlineSwitch, Input, Select } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps, SelectableValue } from '@grafana/data';
import { CirconusDataSourceOptions } from '../types';
import { DEFAULT_OPTIONS } from '../common';

interface Props extends DataSourcePluginOptionsEditorProps<CirconusDataSourceOptions> {}

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;
  const { jsonData } = options;
  defaults(jsonData, DEFAULT_OPTIONS);
  const { irondbType, apiToken, accountId } = jsonData;
  const { queryPrefix, caqlMinPeriod, resultsLimit } = jsonData;
  const { truncateNow, minTruncation, useCaching } = jsonData;
  const { activityTracking, allowGraphite } = jsonData;
  const { hideCAQLWarnings, disableUsageStatistics } = jsonData;

  /**
   * This updates an option value when the field changes.
   * @param {string} field
   * @param {any} value 
   */
  const updateField = (field: string, value: any) => {
    const jsonData = {
      ...options.jsonData,
      [field]: value,
    };
    onOptionsChange({ ...options, jsonData, });
  };

  return (
    <>
      <DataSourceHttpSettings
        defaultUrl="https://api.circonus.com"
        dataSourceConfig={options}
        showAccessOptions={true}
        onChange={onOptionsChange}
      />
      <h3 className="page-heading">Access Config</h3>
      <div className="gf-form-group">
        <InlineField label="Access Type" labelWidth={26} tooltip="This option determines whether standard Circonus API access or standalone IRONdb access is the source of data ('standalone' means you're accessing an IRONdb cluster directly; 'hosted' means you're using standard Circonus API access).">
          <Select
            options={[{ label:'Hosted', value:'hosted' },{ label:'Standalone', value:'standalone' }]}
            value={irondbType}
            width={40}
            onChange={(obj: SelectableValue<string>) => {
              updateField('irondbType', obj.value);
            }}
          />
        </InlineField>
        {
          (irondbType === 'standalone')
          ? <InlineField label="Account ID" labelWidth={26} tooltip="The Account ID associated with the account to pull metrics from. If you need help locating this, please contact customer support at customer.success@circonus.com.">
              <Input
                value={accountId}
                width={40}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  updateField('accountId', event.target.value.trim());
                }}
              />
            </InlineField>
          : <InlineField label="API Token" labelWidth={26} tooltip="An API Token associated with the account you want to pull metrics from. If you need help locating this, please contact customer support at customer.success@circonus.com.">
              <Input
                value={apiToken}
                width={40}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  updateField('apiToken', event.target.value.trim());
                }}
              />
            </InlineField>
        }
        <InlineField label="Graphite Query Prefix" labelWidth={26} tooltip="Prefix to be added to all graphite-style queries sent to IRONdb. For standalone installations, this defaults to 'graphite.'; for hosted installations, this defaults to 'reconnoiter.'; for access to any metric in the system, enter '*.' as your prefix.">
          <Input
            placeholder="*."
            value={queryPrefix}
            width={40}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              updateField('queryPrefix', event.target.value);
            }}
            onBlur={(event: FocusEvent<HTMLInputElement>) => {
              const value = event.target.value.trim();
              if (value && !/\.$/.test(value)) {
                updateField('queryPrefix', value +'.');
              }
            }}
          />
        </InlineField>
        <InlineField label="CAQL Min Periods" labelWidth={26} tooltip="By default CAQL works on 60 second data (lower resolution data may be used, as dictated by the size of the view window). Most queries do not need a min_period directive, but some queries may need a custom min_period for performance on large window ranges, or on data which has a high-resolution ingestion rate. Additional min_period options can be added here to make them available for use in the panel dropdown. Enter the desired additional periods in seconds, separated by commas. A minimum period can also be manually specified by prefixing queries with the #min_period directive. For more info, see https://docs.circonus.com/caql/reference/#directives">
          <Input
            value={caqlMinPeriod}
            width={40}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              updateField('caqlMinPeriod', event.target.value);
            }}
            onBlur={(event: FocusEvent<HTMLInputElement>) => {
              const value = event.target.value.trim();
              if (value) {
                updateField('caqlMinPeriod', value.replace(/[^\d,smhd]/g, ''));
              }
            }}
          />
        </InlineField>
        <InlineField label="Results Limit" labelWidth={26} tooltip="This limits the number of metric streams that are fetched. Set it to -1 to remove the limit.">
          <Input
            value={resultsLimit}
            width={13}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              updateField('resultsLimit', event.target.value);
            }}
            onBlur={(event: FocusEvent<HTMLInputElement>) => {
              const value = event.target.value.trim();
              if (value) {
                updateField('resultsLimit', value.replace(/[^\d-]/g, ''));
              }
            }}
          />
        </InlineField>
        <InlineField label="Truncate 'Now' Values" labelWidth={26} tooltip="When viewing a time range ending in 'now,' truncate the last value (or the last 30s if viewing high-resolution data...this minimum truncation duration is configurable below). Also, alerting queries will be time-shifted back by one minute to allow for aggregation windows to close before being alerted upon.">
          <InlineSwitch
            value={truncateNow}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              updateField('truncateNow', event.target.checked);
            }}
          />
        </InlineField>
        <InlineField label="Min Truncation Duration" labelWidth={26} tooltip="When viewing a time range ending in 'now,' with 'Truncate Now Values' enabled above, this is the minimum truncation performed (in seconds). It's useful when viewing high-resolution data.">
          <Input
            value={minTruncation}
            width={13}
            suffix="seconds"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              updateField('minTruncation', event.target.value.trim());
            }}
            onBlur={(event: FocusEvent<HTMLInputElement>) => {
              const value = event.target.value.trim();
              if (value) {
                updateField('minTruncation', value.replace(/[^\d]/g, ''));
              }
            }}
          />
        </InlineField>
        <InlineField label="Cache Results" labelWidth={26} tooltip="Use client-side caching of requests. Cache size defaults to one minute and 128 entries.">
          <InlineSwitch
            value={useCaching}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              updateField('useCaching', event.target.checked);
            }}
          />
        </InlineField>
        <InlineField label="Activity Tracking" labelWidth={26} tooltip="IRONdb supports tracking of metric activity without the expense of reading all known time series data to find active ranges.">
          <InlineSwitch
            value={activityTracking}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              updateField('activityTracking', event.target.checked);
            }}
          />
        </InlineField>
        <InlineField label="Allow Graphite Queries" labelWidth={26} tooltip="IRONdb supports graphite-style queries, albeit without any tag support.">
          <InlineSwitch
            value={allowGraphite}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              updateField('allowGraphite', event.target.checked);
            }}
          />
        </InlineField>
        <InlineField label="Hide CAQL Warnings" labelWidth={26} tooltip="In some cases CAQL will return data along with a warning that the data may be incomplete, due to limits or data unavailability. Grafana does not expose a way to surface these warnings, so we treat it like an error which does not show the incomplete data. Enable this setting to display the data and silently discard the warning.">
          <InlineSwitch
            value={hideCAQLWarnings}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              updateField('hideCAQLWarnings', event.target.checked);
            }}
          />
        </InlineField>
      </div>
      <h3 className="page-heading">Options</h3>
      <div className="gf-form-group">
        <InlineField label="Disable Usage Statistics" labelWidth={26} tooltip="By default, Circonus collects anonymized usage statistics to help prioritize our development efforts.">
          <InlineSwitch
            value={disableUsageStatistics}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              updateField('disableUsageStatistics', event.target.checked);
            }}
          />
        </InlineField>
      </div>
    </>
  );
}
