#!/bin/bash

if [[ -z $GRAFANA_API_KEY ]] ; then
  >&2 echo "FATAL: GRAFANA_API_KEY not set in environment, needed for 'public signing'"
  exit 1
fi

(cd docker; docker build -f Dockerfile.build --tag circonus-irondb-build .)
export CIRC_CHECKOUT="$(cd $(dirname $0)/..; pwd)"
docker run --rm -it --name plugin-build \
  --env "CIRCONUS_API_KEY=$CIRCONUS_API_KEY" \
  --env "GRAFANA_API_KEY=$GRAFANA_API_KEY" \
  --volume $CIRC_CHECKOUT:/usr/share/grafana/irondb-plugin-build \
  circonus-irondb-build

