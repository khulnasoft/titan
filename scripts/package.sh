#!/usr/bin/env bash

SCHEMATICS_VERSION=$1
TITAN_VERSION=$2

./scripts/build.sh

cd build/packages
sed -i "" "s|exports.titanVersion = '\*';|exports.titanVersion = '$TITAN_VERSION';|g" schematics/src/utility/lib-versions.js
sed -i "" "s|exports.schematicsVersion = '\*';|exports.schematicsVersion = '$SCHEMATICS_VERSION';|g" schematics/src/utility/lib-versions.js


tar -czf bazel.tgz bazel
tar -czf titan.tgz titan
tar -czf schematics.tgz schematics
