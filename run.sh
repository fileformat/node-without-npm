#!/usr/bin/env bash
#
# run server locally
#

set -o errexit
set -o pipefail
set -o nounset

ENVFILE="./.env"

if [ ! -f "${ENVFILE}" ]
then
    echo "ERROR: no .env file '${ENVFILE}'!"
    exit 1
fi

export $(grep "^[^#]" "${ENVFILE}")
echo "INFO: starting with ${ENVFILE}"

node server.mjs
