#!/bin/sh

rm -rf ./node_modules \
  ./*/node_modules \
  ./*/tsconfig.tsbuildinfo \
  cli/zig-cache \
  e2e/playwright-report \
  e2e/test-results \
  frontend/dist \
  github/lib \
  template/lib
