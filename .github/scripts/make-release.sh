#!/usr/bin/env bash

set -e

name=$1

case $name in
    preview|v*)
        echo "Making $name release"
        ;;
    *)
        echo "Error: release name missing or unexpected: ($name)"
        exit 1
        ;;
esac

mydir=$(dirname $0)
topdir=$mydir/../../
pushd $topdir >/dev/null

if [[ $name == "preview" ]]; then
    commit_sha=$(git log -1  --format=format:%h)
    commit_date=$(git log -1  --format=format:%as_%at)
    release_name="cid-preview-${commit_date}-${commit_sha}"
else
    release_name="cid-$name"
fi

mkdir circonus-irondb-datasource 
mv dist circonus-irondb-datasource/
tar -czf ${release_name}.tar.gz ./circonus-irondb-datasource
echo "Created ${release_name}.tar.gz"
