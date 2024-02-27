#!/usr/bin/env bash

./scripts/build.sh

rm -rf node_modules/@khulnasoft
cp -r build/packages node_modules/@khulnasoft
