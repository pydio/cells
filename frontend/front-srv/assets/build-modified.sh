#!/usr/bin/env bash

export NODE_ENV="production"

for dir in $(git status --porcelain */ | sed "s# M frontend/front-srv/assets/##" | cut -d'/' -f1 | grep -v 'gui.ajax' | uniq); do
  echo "### Compiling $dir"
  cd $dir
  pnpm run build
  cd -
done