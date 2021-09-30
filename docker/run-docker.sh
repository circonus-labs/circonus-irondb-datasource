#!/usr/bin/env bash

# taken from https://betterdev.blog/minimal-safe-bash-script-template/

set -Eeuo pipefail
trap cleanup SIGINT SIGTERM ERR EXIT

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd -P)
parent_dir=$(dirname $script_dir)
tag="circonus-labs/circonus-irondb-datasource"

usage() {
  cat <<EOF
Usage: $(basename "${BASH_SOURCE[0]}") [-h] [-v] [-f] -p param_value arg1 [arg2...]

Script description here.

Available options:

-h, --help                       Print this help and exit
-b, --build-only file_path       Only build and sign plugin, then copy to destination file_path
-g, --gapi                       Grafana API Key needed to sign backend plugin
-c, --capi                       Circonus API Key needed for demonstration mode
-r, --root-url                   Grafana Root URL needed for signing. Defaults to http://localhost:3000

EOF
  exit
}

cleanup() {
  trap - SIGINT SIGTERM ERR EXIT
  # script cleanup here
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
  exit "$code"
}

parse_params() {
  # default values of variables set from params
  build=false
  dest=${script_dir}
  publish='-p 30000:3000'
  GRAFANA_API_KEY=''
  CIRCONUS_API_KEY=''
  GF_SERVER_ROOT_URL='http://localhost:3000/'

  while :; do
    case "${1-}" in
    -h | --help) usage ;;
    --no-color) NO_COLOR=1 ;;
    -b | --build-only) 
      dest="${2-}"
      build=true
      publish=''
      shift
      ;; 
    -g | --gapi)
      GRAFANA_API_KEY="${2-}"
      shift
      ;;
    -c | --capi)
      CIRCONUS_API_KEY="${2-}"
      shift
      ;;
    -r | --root-url)
      GF_SERVER_ROOT_URL="${2-}"
      shift
      ;;
    -?*) die "Unknown option: $1" ;;
    *) break ;;
    esac
    shift
  done

  args=("$@")

  # check required params and arguments
  [[ -z "${GRAFANA_API_KEY}" ]] && die "Grafana requires backend plugins to be signed. Please specify the key with --gapi"
  [[ ${build} = false ]] && [[ -z "${CIRCONUS_API_KEY}" ]] && die "Circonus API Key is required for demonstration mode. Please specify the key with --capi"
  [[ ! -z "${dest}" ]] && [[ ! -d $dest ]] && die "Provided output directory does not exist: $dest"
  [[ ! -z "${dest}" ]] && [[ ! -w $dest ]] && die "Provided output directory is not wriable: $dest"
  [[ ${#args[@]} -gt 0 ]] && die "Unexepected arguments."

  return 0
}

parse_params "$@"
setup_colors

# script logic here

msg "${BLUE}Parameters:${NOFORMAT}"
msg "- Grafana API Key: ${GRAFANA_API_KEY}"
msg "- Circonus API Key: ${CIRCONUS_API_KEY}"
msg "- Ouput Directory: ${dest}"
msg "- Build only: ${build}"
msg "- Grafana ROOT URL: $GF_SERVER_ROOT_URL"

msg "${BLUE}Stopping any instances of ${tag}${NOFORMAT}"
containers=$(docker container ps -f "ancestor=${tag}" | awk 'NR>1 {print $1}')

for CONTAINER in $containers
do
    msg "${RED}Stopping ${CONTAINER}${NOFORMAT}"
    docker stop $CONTAINER || die "Failed to check for stop container"
    msg "${RED}${CONTAINER} Stopped${NOFORMAT}"
done
msg "${GREEN}Done${NOFORMAT}"

msg "${BLUE}Building Docker Container...${NOFORMAT}"
docker build $script_dir -t ${tag}
msg "${GREEN}Done${NOFORMAT}"

msg "${BLUE}Running Docker Container...${NOFORMAT}"
docker run --rm $publish -v $dest:/dist \
    -v $parent_dir:/circonus-irondb-datasource \
    -e GRAFANA_API_KEY=${GRAFANA_API_KEY} \
    -e CIRCONUS_API_KEY=${CIRCONUS_API_KEY} \
    -e GF_SERVER_ROOT_URL=${GF_SERVER_ROOT_URL} \
    -e build=${build} \
    ${tag} || msg "${YELLOW}Container stopped.${NOFORMAT}"; true
msg "${GREEN}Done${NOFORMAT}"