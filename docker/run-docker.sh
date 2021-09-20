#!/bin/bash

args=("$@")

if [[ -z $GRAFANA_API_KEY ]] ; then
  >&2 echo "FATAL: GRAFANA_API_KEY not set in environment"
  exit 1
fi

docker build . -t circonus-irondb-datasource \
 --build-arg CIRCONUS_API_KEY=$CIRCONUS_API_KEY \
 --build-arg GRAFANA_API_KEY=$GRAFANA_API_KEY \
 && echo "Build Complete: attempting to start the container."

if [ ${args[0]} == "--build" ]
then
    docker run \
        --rm \
        -p 3000:3000 \
        -v $(dirname $(readlink -f $0)):/dist \
        --name circonus-irondb-datasource \
        circonus-irondb-datasource \
        ${args[0]}
    [ -d "../dist" ] && rm -rf /dist/dist
    mv $(dirname $(readlink -f $0))/dist ../dist
    echo "circonus-irondb-datasource Grafana plugin can be found at $(dirname $(dirname $(readlink -f $0)))/dist/circonus-irondb-datasource. Please copy the folder to your Grafana plugins directory and (re)start Grafana."
else
    if [[ -z $CIRCONUS_API_KEY ]] ; then
    >&2 echo "FATAL: CIRCONUS_API_KEY not set in environment"
    exit 1
    fi

    docker run \
        -d \
        --rm \
        -p 3000:3000 \
        -v $(dirname $(readlink -f $0)):/dist \
        --name circonus-irondb-datasource \
        circonus-irondb-datasource
        echo "Access the example Grafana instance at http://localhost:3000/"
        echo "Run ./stop-docker.sh to stop this container"
fi