#!/usr/bin/env sh
echo "checking if mage cached"
[ ! -d /.cache/mage ] && cd /.cache && git clone https://github.com/magefile/mage 
echo "running mage bootstrap"
cd /.cache/mage && go run bootstrap.go
echo "beginning backend build"
cd /src && mage -v # adding build:Backend will allow you to only build for the current platform. 
echo "finished"