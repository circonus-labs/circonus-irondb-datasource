import { DataQuery, DataSourceJsonData, ScopedVars } from '@grafana/data';

/**
 * These are the configuration options for individual queries.
 */
export interface CirconusQuery extends DataQuery {
  queryType: 'caql' | 'basic' | 'graphite' | 'alerts' | 'alert_counts';
  labelType?: 'default' | 'name' | 'cardinality' | 'custom';
  metricLabel?: string;
  egressOverride?: 'automatic' | 'count' | 'average' | 'stddev' | 'derive' | 'derive_stddev' | 'counter' | 'counter_stddev';
  rollupType?: 'automatic' | 'minimum' | 'exact';
  metricRollup?: string;
  minPeriod?: string;
  format?: string;
  queryDisplay?: string;
  query?: string;
  alertId?: number;
  localFilterMatch?: 'all' | 'any';
  localFilter?: string;
  alertCountQueryType?: string;
  // properties used when processing queries...not persistent metadata
  targetFull?: string;
  refCount?: number;
  tagFilter?: string;
  histTransform?: 'default' | 'statsd_counter';
  paneltype?: string;
  isCaql?: boolean;
  //
  //
  expr: string;
  instant?: boolean;
  range?: boolean;
  hinting?: boolean;
  interval?: string;
  intervalFactor?: number;
  legendFormat?: string;
  valueWithRefId?: boolean;
  requestId?: string;
  showingGraph?: boolean;
  showingTable?: boolean;
}

/**
 * These are the configuration options for variable queries.
 */
export interface CirconusVariableQuery {
  queryType: string;
  metricFindQuery: string;
  tagCategory: string;
  resultsLimit: number;
}

/**
 * These are configuration options for each DataSource instance.
 */
export interface CirconusDataSourceOptions extends DataSourceJsonData {
  path?: string;
  accountId?: number;
  apiToken?: string;
  irondbType: string; // 'standalone' | 'hosted' -- specifies whether a standalone or hosted IRONdb instance is the target of this datasource
  resultsLimit: string; // Any limit on the number of search results items that are fetched
  caqlMinPeriod: string; // DO NOT USE HERE: this is only for query editing
  truncateNow?: boolean; // Whether to truncate the last value when viewing a time range ending in 'now'
  minTruncation?: string; // When paired with truncateNow, this is the minimum truncation performed (in seconds); it's useful when viewing high-resolution data
  useCaching?: boolean; // Whether to use client-side caching of database requests
  activityTracking?: boolean; // Whether to use IRONdb metric activity tracking when making requests
  allowGraphite: boolean; // Whether to show UI elements to allow the use of graphite-style queries
  hideCAQLWarnings: boolean; // Whether to hide CAQL warnings and show the data, instead of throwing errors to show the warnings
  queryPrefix: string; // When using graphite-style queries, this is any pre-set query prefix needed for the IRONdb setup in use
  disableUsageStatistics: boolean; // Whether to disable anonymized usage statistics
}

/**
 * This is the structure used when prepping items for the main data request(s).
 */
export interface LeafItem {
  leaf_name: string;
  leaf_data: any;
}
export interface DataRequestItems {
  refId: string;
  scopedVars?: ScopedVars;
  meta?: any;
  maxDataPoints?: number;
  intervalMs: number;
  std: {
    start: number,
    end: number,
    names: LeafItem[]
  };
  caql: {
    start: number,
    end: number,
    names: LeafItem[]
  };
  alert: {
    start: number,
    end: number,
    names: string[],
    localFilters: string[],
    localFilterMatches: string[],
    labels: string[],
    countsOnly: boolean,
    queryType: string,
    target: any
  };
}

/**
 * These are the types of segments available in the query editor.
 */
export enum SegmentType {
  MetricName,
  TagCat,
  TagVal,
  TagPair,
  TagSep,
  TagEnd,
  TagOp,
  TagPlus,
}

/**
 * This is a TagSet which is a collection of tag vals organized by tag cat.
 */
export interface TagSet {
  [tagCat: string]: string[];
}

/**
 * This is a segment object which is used to set up the query editors.
 */
export interface Segment {
  type: SegmentType;
  value?: string;
}

/**
 * These are the available histogram transforms.
 */
export enum HistogramTransforms {
  count          = 'count',
  average        = 'average',
  stddev         = 'stddev',
  derive         = 'rate',
  derive_stddev  = 'derive_stddev',
  counter        = 'rate',
  counter_stddev = 'counter_stddev',
  histogram      = 'none',
}

/**
 * These are the available histogram transforms for CAQL queries.
 */
export enum CaqlHistogramTransforms {
  count =          ' | histogram:count()',
  average =        ' | histogram:mean()',
  stddev =         ' | histogram:stddev()',
  derive =         ' | histogram:rate()',
  derive_stddev =  '', // FIXME
  counter =        ' | histogram:rate()',
  counter_stddev = '', // FIXME
}

/**
 * These are the available find functions for CAQL queries.
 */
export enum CaqlFindFunctions {
  count =          'count',
  average =        'average',
  stddev =         'stddev',
  derive =         'derivative',
  derive_stddev =  'derivative_stddev',
  counter =        'counter',
  counter_stddev = 'counter_stddev',
}
