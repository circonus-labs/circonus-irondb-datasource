#!/bin/sh

NAME="grafana"
VERSION=":latest"
IMAGE_NAME="grafana/grafana"
ID=$(docker ps -q -f name=$NAME)
EXISTING=$(docker container ls -a -f name=grafana --format '{{.Image}}')

if [ "$EXISTING" != "" -a  "$IMAGE_NAME" != "$EXISTING" ]; then
    echo "Old version, removing and upgrading"
fi

if [ "$EXISTING" != "$IMAGE_NAME" ]; then
    echo "Upgrading $NAME container"
    docker rm $NAME
    docker run -p 3000:3000 -d -e GF_LOG_LEVEL=debug --name=$NAME $IMAGE_NAME
    ID=$(docker ps -q -f name=$NAME)
else
    ID=$(docker ps -q -f name=$NAME)
    HASH=$(echo $ID | egrep -e '[a-f0-9]{12}')
    if [ -z "$HASH" ]; then
        echo "Starting existing container: $EXISTING"
        docker start $NAME
        ID=$(docker ps -q -f name=$NAME)
    fi
fi
RUNNING=$(docker ps --filter name=grafana --format '{{.Image}}')
IMAGE_ID=$(docker image ls $IMAGE_NAME -q)

echo "Copying local checkout into container"
docker exec --user=root -it $ID rm -rf /var/lib/grafana/plugins/circonus-irondb-datasource
docker exec --user=root -it $ID mkdir /var/lib/grafana/plugins/circonus-irondb-datasource
docker cp ./package.json ${ID}:/var/lib/grafana/plugins/circonus-irondb-datasource/package.json
docker cp ./dist/ ${ID}:/var/lib/grafana/plugins/circonus-irondb-datasource/dist/
docker cp ./docker/dev.ini ${ID}:/usr/share/grafana/conf/defaults.ini
docker exec --user=root -it $ID rm -rf /var/lib/grafana/plugins/circonus-irondb-datasource/node_modules
echo "Restarting"
docker restart $ID
