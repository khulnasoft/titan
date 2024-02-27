#!/usr/bin/env bash

./scripts/build.sh


path=${PWD}
echo $path
sed -i "" "s|khulnasoft/bazel-build|file:$1/node_modules/@khulnasoft/bazel|g" build/packages/bazel/src/workspace/files/package.json__tmpl__
sed -i "" "s|khulnasoft/schematics-build|file:$1/node_modules/@khulnasoft/schematics|g" build/packages/bazel/src/workspace/files/package.json__tmpl__

rm -rf $1/node_modules/@khulnasoft
cp -r build/packages $1/node_modules/@khulnasoft
