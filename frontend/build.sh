#!/usr/bin/env bash
set -e

pnpm build:tsc
pnpm build:vite

if [ "$1" == "--minify" ]; then
    mv dist/index.html dist/original.html

    pnpm exec minify-html \
      --minify-css \
      --allow-noncompliant-unquoted-attribute-values \
      --allow-removing-spaces-between-attributes \
      --output dist/index.html \
      dist/original.html

    rm dist/original.html
fi


(cd dist && zip -qr ../dist.zip .)
