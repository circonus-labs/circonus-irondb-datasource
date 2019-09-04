# IRONdb Datasource

This is the plugin for IRONdb 0.11.9 and newer. It is evolving and we continue to track its API.

Read more about IRONdb here:

[https://www.circonus.com/irondb/](https://www.circonus.com/irondb/)

## Installation
* The default location for the plugins directory is `/var/lib/grafana/plugins`, though the location may be different in your installation, see [http://docs.grafana.org/plugins/installation/](http://docs.grafana.org/plugins/installation/) for more plugin information.

### From Releases
1. Download the desired [release version](https://github.com/circonus-labs/circonus-irondb-datasource/releases).

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
The Account ID associated with the account to pull metrics from.

### API Token
The API Token associated with the account to pull metrics from. This can be found on your API Tokens page after logging in at [https://www.circonus.com/](https://www.circonus.com/) in the "User Profile" section.

## Usage

1. Create a new panel and set the datasource to name selected in the IRONdb datasource configuration.

### Normal Queries
For normal queries, use the metric browser to navigate the metric hierarchy of your IRONdb instance or type queries manually using the *Toggle Edit Mode* menu item to the right.
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

### Template Variables

**How to configure a template variable for IRONdb**

1. From a dashboard, click `Settings` in the top right.
  
1. On the left hand side, select the `Variables` section.
  
1. Click `+New` and choose a name for your new variable.
  
1. Select the proper data source: `IRONdb`.
  
1. Under `Query`, enter the metric you wish to use in this variable (without tags).
  
1. Enable `Include All Option` and enter `*` for `Custom all value`.
  
1. Click `Enabled` under `Value groups/tags` to enable tags support.
  
1. Enter the tag category you wish to use in your variable under `Tag values query`.
  
1. If you successfully completed the prior steps, `Preview of values` should now auto-complete the tag values.
  
1. Finish setup by clicking `Add` and then `Save`.
  
Your new template variable should now appear in the query builder!

# Development

The build process requires node, npm, yarn, typescrypt, and tslint

On Cent7 setup:

```
# One time setup
sudo yum install node bzip2
sudo npm install -g typescript tslint
yarn

# Build
yarn build

# Test
yarn test
```
