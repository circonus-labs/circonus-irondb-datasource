# IRONdb Datasource

This is the plugin for IRONdb 0.11.9 and newer. It is evolving and we continue to track its API.

Read more about IRONdb here:

[https://www.circonus.com/irondb/](https://www.circonus.com/irondb/)

## Installation

1. Add the contents of the `dist` directory of this repository to your grafana plugins directory. The default location for the plugins directory is `/var/lib/grafana/plugins`, though the location may be different in your installation, see [http://docs.grafana.org/plugins/installation/](http://docs.grafana.org/plugins/installation/) for more plugin information.

1. Create a new datasource and select IRONdb from the `Type` drop down.

1. Create a new panel and set the datasource to name selected in the IRONdb datasource configuration.
