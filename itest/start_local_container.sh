#! /bin/bash

set -e

ITEST=$(cd $(dirname "${BASH_SOURCE[0]:-$0}") && pwd | sed -e s/\\/$//g)
${ITEST}/stop_container.sh

rm -rf "${ITEST}/db"
mkdir -p "${ITEST}/db"
docker build -t ghcr.io/redhat-plumbers-in-action/bugzilla-test:latest "${ITEST}/container"
docker run --rm -d -p 8088:80 --name bugzilla-ts-test ghcr.io/redhat-plumbers-in-action/bugzilla-test:latest >/dev/null

echo "Waiting for http service to start..."
while ! curl http://localhost:8088/ >/dev/null 2>/dev/null
do
  sleep 1
done
