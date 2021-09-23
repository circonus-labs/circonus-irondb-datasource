# circonus-irondb-datasource Docker Image

This docker container is based:
* CentOS 7
* Node v14.17.6
* golang 1.17.1
* Grafana Enterprise 7.5.3

## Instructions
>Note for macOS users: By default the /Users, /Volume, /private, /tmp and /var/folders directory are shared. If your project is outside this directory then it must be added to the list. Otherwise you may get Mounts denied or cannot start service errors at runtime. See the File Sharing section of https://docs.docker.com/desktop/mac/ for more details.

### Build and Install Plugin
These instructions will create a production ready copy of the circonus-irondb-datasource Grafana plugin:
1. [Install Docker](https://docs.docker.com/get-docker/)
2. [Obtain a Grafana Cloud API Key](https://grafana.com/docs/grafana-cloud/reference/create-api-key/),  needed to sign the plugin.
4. export GRAFANA_API_KEY=<From step 2>
3. Execute run-docker.sh --build
4. Copy the circonus-irondb-datasource folder to your Grafana plugins directory.
5. (re)start Grafana

### Launch demontration Grafana instance
These instructions will build and run a Docker container with a Grafana instance on port 3000. There will be a pre-configured data source connected to the hosted Circonus API with a graph and alert.

1. [Install Docker](https://docs.docker.com/get-docker/)
2. [Obtain a Grafana Cloud API Key](https://grafana.com/docs/grafana-cloud/reference/create-api-key/),  needed to sign the plugin.
3. [Obtain Circonus API Token](https://docs.circonus.com/circonus/integrations/api/api-tokens/), needed to connect to the hosted Circonus API.
4. export GRAFANA_API_KEY=<From step 2>
5. export CIRCONUS_API_KEY=<From step 3>
6. Execute run-docker.sh
7. Navigate to http://localhost:3000/ to access.