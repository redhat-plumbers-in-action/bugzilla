#! /bin/bash

set -e

if command -v docker &>/dev/null; then
  CONTAINER_ENGINE=docker
elif command -v podman &>/dev/null; then
  CONTAINER_ENGINE=podman
else
  echo "Error: neither docker nor podman found" >&2
  exit 1
fi

CONTAINER=$(${CONTAINER_ENGINE} ps -aq -f name=^integration$)
if [ "${CONTAINER}" ]; then
  echo "Container already started."
  exit 0
fi

ITEST=$(cd $(dirname "${BASH_SOURCE[0]:-$0}") && pwd | sed -e s/\\/$//g)
rm -rf "${ITEST}/db"
mkdir -p "${ITEST}/db"
${CONTAINER_ENGINE} run --rm -d -p 8088:80 --name integration ghcr.io/redhat-plumbers-in-action/bugzilla/integration:latest >/dev/null

echo "Waiting for http service to start..."
while ! curl http://localhost:8088/ >/dev/null 2>/dev/null
do
  sleep 1
done
