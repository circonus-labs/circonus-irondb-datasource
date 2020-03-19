
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
