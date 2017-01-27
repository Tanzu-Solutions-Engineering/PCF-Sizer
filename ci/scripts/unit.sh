#!/usr/bin/env bash
set -e

echo "node version $(node -v) running"
echo "npm version $(npm -v) running"

npm config set unsafe-perm true
echo "{\"allow_root\": true}" > ~/.bowerrc

cd git-repo
npm install
#npm install -g bower
npm install -g karma
npm install -g karma-jasmine --save-dev
npm install -g karma-phantomjs-launcher
#npm install gulp
#bower install

npm test
