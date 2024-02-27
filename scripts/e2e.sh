#!/usr/bin/env bash

rm -rf node_modules/@khulnasoft
mkdir -p node_modules/@khulnasoft
cp -r build/src node_modules/@khulnasoft/titan
cp package.json node_modules/@khulnasoft/titan/package.json

rm -rf tmp
jest --maxWorkers=1 ./build/e2e
