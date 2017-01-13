#!/usr/bin/env bash
set -e

echo "node version $(node -v) running"
echo "npm version $(npm -v) running"

npm config set unsafe-perm true
echo "{\"allow_root\": true}" > ~/.bowerrc

cd git-repo
npm install
npm install -g bower
npm install gulp
bower install

cp -r * ../pcfsizer
ls -lah ../pcfsizer
