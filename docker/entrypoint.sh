#!/bin/sh

args=("$@")

if [ ${args[0]} == "--build" ]
then
    [ -d "/dist/dist/circonus-irondb-datasource" ] && rm -rf /dist/dist
    mkdir /dist/dist
    mv /usr/local/lib/grafana/data/plugins/circonus-irondb-datasource /dist/dist/circonus-irondb-datasource

else
    ./bin/grafana-server web cfg:app_mode=development
fi