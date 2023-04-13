#!/usr/bin/env bash

export NODE_ENV="production"

for dir in $(git status --porcelain */ | grep -v 'gui.ajax' | sed "s# M frontend/front-srv/assets/##" | cut -d'/' -f1 | uniq); do
  if [ -f "$dir/webpack.config.js" ]; then
    echo "### Compiling $dir"
    cd $dir
    pnpm run build
    cd -
  fi
done