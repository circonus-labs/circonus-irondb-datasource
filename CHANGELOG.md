# Changelog

## 0.9.28

* Adjusted frequency of autocomplete requests to improve performance.

## 0.9.27

* Added anonymized usage statistics so we can prioritize development time based
on feature usage.

## 0.9.26

 * A new variable query type is available: "Last Metric Value" which will 
 support text metric values. This allows you to show text metric values in
 text panel widgets.

## 0.9.25

 * Now when histogram streams are found by Graphite-style searches, their data
 is displayed, even on line graphs which aren't set to heatmap rendering.

## 0.9.24

 * Eliminates the need for a call to the graphite_translate IRONdb extension
 in the alerting backend for Graphite style queries.
 * Ensures that all CAQL queries issued via the API /caql endpoint by the
 alerting backend contain a #min_period prefix if a min_period value has been
 defined for the Grafana query object.
 * Adds handling for the possibility of null or non-numeric data values being
 returned to the alerting backend by its calls to the API /caql endpoint.

## 0.9.23

 * Fix base64 encoding of variable values when used inside other variable
 queries.

## 0.9.22

 * When substituting CAQL queries inside other CAQL queries, remove directives
 from sub-queries.

## 0.9.21

 * Now when CAQL warnings are returned, they're thrown as UI errors by default;
 there's a datasource configuration setting to hide these errors.

## 0.9.20

 * Fix Graphite-style autocomplete results when an empty leaf is returned.

## 0.9.19

 * Updates dependencies to latest versions.
 * Fixed a bug where the API client used by the datasource could retry on
 response errors multiple times, potentially causing a large number of
 API requests to be generated.

## 0.9.16

 * Fixed a bug where values of zero weren't being plotted from CAQL data.

## 0.9.15

 * re-synchronizing package metadata

## 0.9.11

 * The alerting backend will now process queries in parallel.
 * Update plugin.json to use newer grafanaDependency setting.

## 0.9.10

 * Update release build actions.

## 0.9.9

## 0.9.8

 * Implements support for graphite type queries in the alerting backend.

## 0.9.7

## 0.9.6

 * Corrects an issue caused by grafana not including the URL for the data source
 in the configuration JSON.
 * Improves the logging performed by the IRONdb alerting back end. Errors
 parsing JSON passed to the back end will now log better descriptions of the
 problem along with the erroneous JSON.

## 0.9.5

 * Fixes the alerting backend so that the min_period value for generated CAQL
 queries is correctly using the setting or default from the UI.

## 0.9.4

 * Fix labels for untagged metrics

## 0.9.3

 * Support histogram transforms for graphs

## 0.9.2

 * Expand time range start and end by one interval each
 * Fix subsecond queries with interval below 10ms

## 0.9.1

 * Support custom rollup resolution
 * Support for IRONdb activity tracking
 * Add client-side caching of requests
 * Upgrade to new Grafana plugin TypeScript SDK
 * Use IRONdb /fetch API
 * Handle Base64 encoded metrics correctly
 * Native histogram support
 * Support for custom metric labels and CAQL label interpolation syntax

## 0.9.0

 * New version of plugin that is fully IRONdb native without using Graphite APIs.

## 0.8.7

 * Use Grafana dropdown control rather than `select` element
 * 0.8.7 is the last version of the datasource designed for use with our graphite endpoints and with graphite-centric design

## 0.8.6

 * Allow flip back and forth between CAQL mode.
 * Allow override of egress of searched datapoints.

## 0.8.5

 * Fix graphite series pulls for tagged metrics.

## 0.8.4

 * Switch to DF4 from CAQL
 * Support CAQL named streams
 * Auto-detect histograms in CAQL output, simplify code.
 * Improve period selection for CAQL queries.
 * Improve histogram coalescing and conversion performance.
 * Avoid making blank CAQL queries
 * Add dev notes to README.md
 * Provider a docker-up script to help development and testing.

## 0.8.3

 * Started a changelog.
 * Fixed error messages to be more expressive for bad CAQL expressions.
 * Pass X-Circonus-Account header in standalone mode.
