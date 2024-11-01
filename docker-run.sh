#!/bin/bash
#
# run server in docker

set -o errexit
set -o pipefail
set -o nounset

APP_NAME=node-without-npm
ENVFILE=.env

DOCKER_BUILDKIT=1 docker buildx build \
    --build-arg BUILD_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ) \
    --build-arg BUILD_ID=local@$(git rev-parse --short HEAD) \
    --progress=plain \
    --tag "${APP_NAME}" \
    .
    
export $(grep -v ^# "${ENVFILE}")

docker run \
    --env-file ${ENVFILE} \
    --name "${APP_NAME}" \
    --publish ${PORT}:${PORT} \
    --rm \
    "${APP_NAME}"
