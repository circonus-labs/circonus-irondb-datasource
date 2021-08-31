# Alerts & Plugin Signing

To activate Grafana's Alerting features, a "backend" plugin is required. Since v7.0, "Grafana now [requires backend plugins to be signed](https://grafana.com/docs/grafana/latest/installation/upgrading/#backend-plugins)." Or you can [turn off signature checks](https://grafana.com/docs/grafana/latest/plugins/plugin-signatures/#allow-unsigned-plugins). If you aren't sure which option is right for you, ask your security department. If you think you don't have one of those, congratulations, *you* are the security department. Read through the information linked above and choose the relevant section below.

## Quick Start

These instructions will build and run a Docker container with a Grafana instance on port 3000. There will be a pre-configured data source connected to the hosted Circonus API with a graph and alert.

1. [Install Docker](https://docs.docker.com/get-docker/)
2. [Obtain Circonus API Token](https://docs.circonus.com/circonus/integrations/api/api-tokens/), needed to connect to the hosted Circonus API.
3. [Obtain a Grafana Cloud API Key](https://grafana.com/docs/grafana-cloud/reference/create-api-key/),  needed to sign the plugin.
4. From your OS shell using a privileged account:
   >Note for macOS users: By default the /Users, /Volume, /private, /tmp and /var/folders directory are shared. If your project is outside this directory then it must be added to the list. Otherwise you may get Mounts denied or cannot start service errors at runtime. See the File Sharing section of https://docs.docker.com/desktop/mac/ for more details.
   ```shell
   export CIRCONUS_API_KEY=<From step 2>
   export GRAFANA_API_KEY=<From step 3>
   git clone https://github.com/circonus-labs/circonus-irondb-datasource/ --single-branch --single-branch
   cd circonus-irondb-datasource/
   docker/build-local.sh
   docker/run-local.sh
   ```

5. Login to the Grafana UI at <http://localhost:3000/> to validate functionality.

## Build and Sign Plugin
Follow these instructions to build and sign the backend IRONdb plug-in for use with an existing Grafana install.
   ```shell
   cd /var/lib/grafana/plugins # or the location of your Grafana plugins directory
   git clone https://github.com/circonus-labs/circonus-irondb-datasource/ --single-branch
   cd circonus-irondb-datasource
   npm install --global yarn
   yarn install
   yarn build
   export GRAFANA_API_KEY=<From step 3 of quick start guide>
   export GRAFANA_TOOLKIT=$(find . -type f -iname "grafana-toolkit.js")
   node $GRAFANA_TOOLKIT plugin:sign --rootUrls http://localhost:3000/ # Change to match the URL of your Grafana install
   sudo systemctl start grafana-server # restart if already running
   ```
   
