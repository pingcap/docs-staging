#!/bin/bash

set -e

if [ ! -e website-docs/.git ]; then
  git clone https://github.com/pingcap/website-docs
fi

if [ ! -e website-docs/docs/markdown-pages ]; then
  ln -s ../../markdown-pages website-docs/docs/markdown-pages
fi

(
  cd website-docs && yarn && yarn build
)