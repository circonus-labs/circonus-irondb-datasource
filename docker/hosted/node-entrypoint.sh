#!/usr/bin/env sh
echo "set up"
git config --global url."https://".insteadOf ssh:// # This fixes github public key errors
rm -rf /.cache/src
cp -r /src /.cache/src
cd /.cache/src
echo "begin install"
npm install
echo "begin build"
yarn build || echo "build failed"
echo "Copying dist out of container"
cp -r  /.cache/src/dist /src/
echo "end"