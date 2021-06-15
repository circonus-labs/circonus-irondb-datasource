#!/bin/sh

if [[ -z $GRAFANA_API_KEY ]] ; then
  >&2 echo "FATAL: GRAFANA_API_KEY not set in environment, needed for 'public signing'"
  exit 1
fi

export CIRC_CHECKOUT="$(cd $(dirname $0)/..; pwd)"
export GRAFANA_TOOLKIT=$(find $(npm root -g) -type f -iname "grafana-toolkit.js")
(cd $CIRC_CHECKOUT;
  yarn build;
  mage -v;
  node $GRAFANA_TOOLKIT plugin:sign --rootUrls http://localhost:3000/
)
