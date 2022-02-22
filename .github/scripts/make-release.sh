#!/usr/bin/env bash

set -e

type=$1

case $type in
    preview|v*)
        echo "Making $type release"
        ;;
    *)
        echo "Error: release type missing or unexpected: ($type)"
        ;;
esac

mydir=$(dirname $0)
topdir=$mydir/../../
pushd $topdir >/dev/null

if [[ $type == "preview" ]]; then
    commit_sha=$(git log -1  --format=format:%h)
    commit_ts=$(git log -1  --format=format:%at)
    release_name="preview-${commit_ts}-${commit_sha}"
else
    release_name="$type"
fi

mv dist circonus-irondb-datasource
tar -czf ${release_name}.tar.gz circonus-irondb-datasource
