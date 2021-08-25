#!/bin/bash
# This build script is intended to be run inside the
# grafana docker image, which runs alpine. This exists
# so that local build tools don't result in odd errors.

GRAFANA_TOOLKIT=$(find $(npm root -g) -type f -iname "grafana-toolkit.js")

# host volume containing plugin
cd irondb-plugin-build
# download and install dependencies
yarn install
# build the typescript bits
yarn build
# build the backend plugin
mage -v
# sign the plugin for local use
node $GRAFANA_TOOLKIT plugin:sign --rootUrls http://localhost:3000/
