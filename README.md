# IRONdb Datasource

This is the plugin for IRONdb 0.11.9 and newer. It is evolving and we continue to track its API.

Read more about IRONdb here:

[https://www.circonus.com/irondb/](https://www.circonus.com/irondb/)

## Installation
* The default location for the plugins directory is `/var/lib/grafana/plugins`, though the location may be different in your installation, see [http://docs.grafana.org/plugins/installation/](http://docs.grafana.org/plugins/installation/) for more plugin information.

### From Releases
1. Download [https://github.com/circonus-labs/circonus-irondb-datasource/archive/v0.8.6.tar.gz](https://github.com/circonus-labs/circonus-irondb-datasource/archive/v0.8.6.tar.gz)

2. Unzip into plugins directory.

3. Restart Grafana.

### From GitHub
1. `git clone https://github.com/circonus-labs/circonus-irondb-datasource.git` into plugins directory.

2. Restart Grafana.

## Configuration

1. Create a new datasource and select IRONdb from the `Type` drop down.

1. Change the IRONdb configuration options at the bottom of the datasource configuration page.
![](img/irondb-datasource-configuration.png)

### IRONdb Type
* Standalone: An IRONdb cluster accessible directly, requires entry of Account ID.
* Hosted: An IRONdb instance hosted by Circonus, requires entry of API token.
 
### Account ID
The Account ID associated with the account to pull metrics from. For standalone installations, this is the account_id setting as configured in the "Graphite Listener" section of the */opt/circonus/etc/irondb.conf* file.

### API Token
The API Token associated with the account to pull metrics from. This can be found on your API Tokens page after logging in at [https://www.circonus.com/](https://www.circonus.com/) in the "User Profile" section.

### Query Prefix
Prefix to be added to all queries sent to IRONdb.
* For standalone installations, this defaults to "**graphite.**".
* For hosted installations, this defaults to "**reconnoiter.**".
 
## Usage

1. Create a new panel and set the datasource to name selected in the IRONdb datasource configuration.

### Normal Queries
For normal queries, use the metric browser to navigate the metric hierarchy of your IRONdb instance or type queries manually using the *Toggle Edit Mode* menu item to the right. The query prefix configured for the selected datasource is prepended to all queries against the IRONdb instance.
![](img/irondb-graph-metric-browser.png)

### CAQL Queries
[CAQL queries](https://login.circonus.com/resources/docs/user/CAQL.html) must be entered manually by selecting the *CAQL* checkbox or switching manually to the editor mode.
![](img/irondb-graph-caql-editor.png)

### Histograms
Histograms currently require a special checkbox to be selected in order for the returned data to be processed correctly.
![](img/irondb-graph-metric-browser.png)
Once selected, histogram data processing will be utilized for any returned data related to the specific metric.

### Heatmaps
Using the histogram checkbox to process returned data allows for histograms to be displayed on the heatmap panel type.

![](img/irondb-heatmap-sample.png)

For this processed data to be displayed on the heatmap panel as the sample above, select *Time Series Buckets* as the Data Format to be used on the Heatmap panel.

![](img/irondb-heatmap-tsbuckets.png)

# Development

The build process requires node, npm, typescrypt, and tslint

On Cent7 setup:

```
# One time setup
sudo yum install node bzip2
sudo npm install -g typescript tslint
npm install .
npm install grunt
npm install load-grunt-tasks

# Build
./node_modules/grunt/bin/grunt

# Test
./docker-up
```
