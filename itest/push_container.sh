#! /bin/sh

set -e

ITEST=$(cd $(dirname "${BASH_SOURCE[0]:-$0}") && pwd | sed -e s/\\/$//g)

docker build --platform linux/amd64 -t ghcr.io/redhat-plumbers-in-action/bugzilla-test:latest "${ITEST}/container"
docker push ghcr.io/redhat-plumbers-in-action/bugzilla-test:latest
