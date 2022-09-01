#!/bin/bash

set -e

CMD=build

if [ "$1" == "develop" ] || [ "$1" == "dev" ]; then
  CMD=start
fi

if [ ! -e website-docs/.git ]; then
  git clone https://github.com/pingcap/website-docs
fi

if [ ! -e website-docs/docs/markdown-pages ]; then
  ln -s ../../markdown-pages website-docs/docs/markdown-pages
fi

(
  cd website-docs && yarn && yarn "$CMD"
)