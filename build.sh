#!/bin/bash
REPO=$(pwd)
git clone https://github.com/pingcap/website-docs /tmp/website-docs
cd /tmp/website-docs
rmdir docs
cp -a $REPO docs
yarn
yarn build
mv public $REPO/public