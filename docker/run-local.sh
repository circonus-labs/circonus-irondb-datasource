#!/bin/sh

if [[ -z $CIRCONUS_API_KEY ]] ; then
  >&2 echo "FATAL: CIRCONUS_API_KEY not set in environment"
  exit 1
fi

export CIRC_CHECKOUT="$(cd $(dirname $0)/..; pwd)"
(cd $CIRC_CHECKOUT;
perl -pi -e 's/\@\@CIRCONUS_API_KEY\@\@/$ENV{CIRCONUS_API_KEY}/' docker/provisioning/datasources/irondb.yaml;
docker run --rm --publish 3000:3000 \
    -e "GF_AUTH_BASIC_ENABLED=false" \
    -e "GF_AUTH_ANONYMOUS_ENABLED=true" \
    -e "GF_AUTH_ANONYMOUS_ORG_ROLE=Admin" \
    -v $PWD/docker/dashboards:/var/lib/grafana/dashboards:z \
    -v $PWD:/var/lib/grafana/plugins/circonus-irondb-datasource:z \
    -v $PWD/docker/provisioning:/var/lib/grafana/provisioning:z \
    -v $PWD/docker/etc:/etc/grafana:z \
    -e "GF_PATHS_PROVISIONING=/var/lib/grafana/provisioning" \
    -e "GF_SECURITY_ADMIN_PASSWORD=admin" \
    --name grafana-plugin \
    grafana/grafana:7.3.7;
perl -pi -e 's/$ENV{CIRCONUS_API_KEY}/\@\@CIRCONUS_API_KEY\@\@/' docker/provisioning/datasources/irondb.yaml
)
