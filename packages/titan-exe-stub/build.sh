#!/usr/bin/env bash

if [[ "$OSTYPE" != "msys" ]]; then
  echo "Skipping build for non-windows platform"
  exit
fi


echo "Building stub titan.exe for windows platform"
g++ titan.cpp -o titan.exe


SCRIPT_DIR=$(dirname "${BASH_SOURCE[0]}")
UP_ONE="$SCRIPT_DIR/.."
ROOT_DIR="$SCRIPT_DIR/../.."
FIND_TITAN_FIXTURES_DIR="${ROOT_DIR}/titanrepo-tests/integration/fixtures/find_titan"

echo "PWD: $PWD"
echo "ROOT_DIR: $ROOT_DIR"
echo "UP_ONE: $UP_ONE"
echo "FIND_TITAN_FIXTURES_DIR: ${FIND_TITAN_FIXTURES_DIR}"

cp titan.exe "${FIND_TITAN_FIXTURES_DIR}/hoisted/node_modules/titan-windows-64/bin/"
cp titan.exe "${FIND_TITAN_FIXTURES_DIR}/hoisted/node_modules/titan-windows-arm64/bin/"

cp titan.exe "${FIND_TITAN_FIXTURES_DIR}/linked/node_modules/.pnpm/titan-windows-64@1.0.0/node_modules/titan-windows-64/bin/"
cp titan.exe "${FIND_TITAN_FIXTURES_DIR}/linked/node_modules/.pnpm/titan-windows-arm64@1.0.0/node_modules/titan-windows-arm64/bin/"

cp titan.exe "${FIND_TITAN_FIXTURES_DIR}/nested/node_modules/titan/node_modules/titan-windows-64/bin/"
cp titan.exe "${FIND_TITAN_FIXTURES_DIR}/nested/node_modules/titan/node_modules/titan-windows-arm64/bin/"

cp titan.exe "${FIND_TITAN_FIXTURES_DIR}/self/node_modules/titan-windows-64/bin/"
cp titan.exe "${FIND_TITAN_FIXTURES_DIR}/self/node_modules/titan-windows-arm64/bin/"

cp titan.exe "${FIND_TITAN_FIXTURES_DIR}/unplugged/.yarn/unplugged/titan-windows-64-npm-1.0.0-520925a700/node_modules/titan-windows-64/bin/"
cp titan.exe "${FIND_TITAN_FIXTURES_DIR}/unplugged/.yarn/unplugged/titan-windows-arm64-npm-1.0.0-520925a700/node_modules/titan-windows-arm64/bin/"

cp titan.exe "${FIND_TITAN_FIXTURES_DIR}/unplugged_env_moved/.moved/unplugged/titan-windows-64-npm-1.0.0-520925a700/node_modules/titan-windows-64/bin/"
cp titan.exe "${FIND_TITAN_FIXTURES_DIR}/unplugged_env_moved/.moved/unplugged/titan-windows-arm64-npm-1.0.0-520925a700/node_modules/titan-windows-arm64/bin/"

cp titan.exe "${FIND_TITAN_FIXTURES_DIR}/unplugged_moved/.moved/unplugged/titan-windows-64-npm-1.0.0-520925a700/node_modules/titan-windows-64/bin/"
cp titan.exe "${FIND_TITAN_FIXTURES_DIR}/unplugged_moved/.moved/unplugged/titan-windows-arm64-npm-1.0.0-520925a700/node_modules/titan-windows-arm64/bin/"
