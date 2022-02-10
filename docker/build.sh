#!/usr/bin/env bash

# taken from https://betterdev.blog/minimal-safe-bash-script-template/

set -Eeuo pipefail
trap cleanup SIGINT SIGTERM ERR EXIT

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd -P)
parent_dir=$(dirname $script_dir)

cleanup() {
  trap - SIGINT SIGTERM ERR EXIT
  # script cleanup here
  msg "${BLUE}Shutting down containers${NOFORMAT}"
  docker compose down
}

setup_colors() {
  if [[ -t 2 ]] && [[ -z "${NO_COLOR-}" ]] && [[ "${TERM-}" != "dumb" ]]; then
    NOFORMAT='\033[0m' RED='\033[0;31m' GREEN='\033[0;32m' ORANGE='\033[0;33m' BLUE='\033[0;34m' PURPLE='\033[0;35m' CYAN='\033[0;36m' YELLOW='\033[1;33m'
  else
    NOFORMAT='' RED='' GREEN='' ORANGE='' BLUE='' PURPLE='' CYAN='' YELLOW=''
  fi
}

msg() {
  echo >&2 -e "${1-}"
}

die() {
  local msg=$1
  local code=${2-1} # default exit status 1
  msg "$msg"
  cleanup
  exit "$code"
}

setup_colors


# script logic here

msg "${BLUE}Beginning build process${NOFORMAT}"
export COMPOSE_PROJECT_NAME=CIRCONUS-IRONDB-DATASOURCE-BUILDSYSTEM

msg "${BLUE}Removing prvious build artifacts if they exist${NOFORMAT}"
[ -d $parent_dir/dist ] && rm -r $parent_dir/dist
[ -d $parent_dir/node_modules ] && rm -rf $parent_dir/node_modules

## Build PLugin ##
msg "${BLUE}Starting build${NOFORMAT}"
docker compose up || die "docker compose failed" # compile go

## Sign Plugin ##
msg "${BLUE}Signing plugin${NOFORMAT}"
docker-compose run node node /.cache/src/node_modules/@grafana/toolkit/bin/grafana-toolkit.js plugin:sign --rootUrls http://localhost:3000/

cleanup