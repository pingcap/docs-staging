#!/bin/bash

set -e

FIND=$(which gfind || which find)
SED=$(which gsed || which sed)

replace_image_path() {

( cd markdown-pages
  $FIND . -maxdepth 3 -mindepth 3 | while IFS= read -r DIR; do
    DIR="${DIR#./}"
    PREFIX="$(dirname "$DIR")"
    $FIND "$DIR" -name '*.md' | while IFS= read -r FILE; do
      $SED -r -i "s~]\(/media(/$PREFIX)?~](/media/$PREFIX~g" "$FILE"
    done
  done
)

}

move_images() {

( cd markdown-pages
  $FIND . -maxdepth 3 -mindepth 3 | while IFS= read -r DIR; do
    PREFIX="$(dirname "$DIR")"
    if [ -d "$PREFIX/master/media" ]; then
      mkdir -p "../website-docs/public/media/$PREFIX"
      cp -r "$PREFIX/master/media/." "../website-docs/public/media/$PREFIX"
    fi
  done
)

}

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

cp docs.json website-docs/docs/docs.json

if [ "$CMD" == "start" ]; then
  (cd website-docs && yarn && yarn start)
fi

if [ "$CMD" == "build" ]; then
  replace_image_path
  (cd website-docs && yarn && yarn build)
  move_images
fi
