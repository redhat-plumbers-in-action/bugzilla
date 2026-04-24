#! /bin/bash

if command -v docker &>/dev/null; then
  CONTAINER_ENGINE=docker
elif command -v podman &>/dev/null; then
  CONTAINER_ENGINE=podman
else
  echo "Error: neither docker nor podman found" >&2
  exit 1
fi

CONTAINER=$(${CONTAINER_ENGINE} ps -aq -f name=^integration$)
if [ ! "${CONTAINER}" ]; then
  echo "Container not running."
  exit 0
fi

${CONTAINER_ENGINE} rm -f integration >/dev/null
