#!/bin/sh

rm -rf ./node_modules \
  ./*/node_modules \
  ./*/tsconfig.tsbuildinfo \
  cli/zig-cache \
  contract/lib \
  e2e/playwright-report \
  e2e/test-results \
  frontend/dist \
  github/lib \
  offline/lib \
  template/lib
