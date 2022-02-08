#!/usr/bin/env bash

set -Eeuo pipefail
trap cleanup SIGINT SIGTERM ERR EXIT

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

error_msg () {
    msg "${RED}$1${NOFORMAT}"
    exit 1
}

cleanup() {
  trap - SIGINT SIGTERM ERR EXIT
  # script cleanup here
}

setup_colors

cd /circonus-irondb-datasource
yarn install --check-files --network-timeout 300000 || error_msg "yarn install failed"
yarn build || error_msg "yarn build failed"
mage -v || error_msg "mage failed"
node $(find . -type f -iname "grafana-toolkit.js") plugin:sign --rootUrls $GF_SERVER_ROOT_URL || error_msg "plugin signing failed"

cp -r "/circonus-irondb-datasource/dist" "${GF_PATHS_PLUGINS}" || error_msg "Failed to copy plugin to ${GF_PATHS_PLUGINS}"
mv "${GF_PATHS_PLUGINS}/dist" "${GF_PATHS_PLUGINS}/circonus-irondb-datasource" || error_msg "Failed to rename plugin."
cp -r "/circonus-irondb-datasource/docker/provisioning" "$(dirname ${GF_PATHS_PROVISIONING})" || error_msg "Failed to copy provisioning to ${GF_PATHS_PROVISIONING}"
cp -r "/circonus-irondb-datasource/docker/dashboards" "$(dirname ${GF_PATHS_PROVISIONING})" || error_msg "Failed to copy dashboards to /var/lib/grafana/dashboards"

if $build; then
  msg "${GREEN}SUCCESS${NOFORMAT}"
  msg "Moving plugin to \$GF_PATHS_PLUGINS"
  mv "/circonus-irondb-datasource/dist" "/dist/circonus-irondb-datasource" \
    && msg "${GREEN}SUCCESS${NOFORMAT}" \
    && msg "(re)start Grafana for changes to take effect." \
    || error_msg "Failed to move plugin into destination directory."
else
  sed -i "s/@@CIRCONUS_API_KEY@@/$CIRCONUS_API_KEY/g" ${GF_PATHS_PROVISIONING}/datasources/irondb.yaml || error_msg "Failed to update CIRCONUS_API_KEY in irondb.yaml"
  msg "${GREEN}SUCCESS${NOFORMAT}"
  msg "Access the example Grafana instance at ${BLUE}${GF_SERVER_ROOT_URL}${NOFORMAT}"
  msg "Run ${RED}./stop-docker.sh${NOFORMAT} to stop this container"
  cd /usr/local/lib/grafana
  ./bin/grafana-server web > /dev/null 2>&1
fi