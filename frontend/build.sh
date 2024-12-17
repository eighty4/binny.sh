#!/usr/bin/env sh
set -e

pnpm build:tsc
pnpm build:vite

mv dist/index.html dist/original.html

pnpm exec minify-html \
  --minify-css \
  --minify-js \
  --do-not-minify-doctype \
  --ensure-spec-compliant-unquoted-attribute-values \
  --keep-spaces-between-attributes \
  --output dist/index.html \
  dist/original.html

rm dist/original.html

(cd dist && zip -qr ../dist.zip .)
