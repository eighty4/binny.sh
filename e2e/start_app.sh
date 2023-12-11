#!/bin/bash

pushd ..
  pnpm -r build
popd

pushd ../frontend
#  pnpm preview:offline &
  pnpm dev:offline &
  frontend_pid=$!
popd

pushd ../offline
  pnpm dev &
  offline_pid=$!
popd

function cleanup()
{
  kill $frontend_pid
  kill $offline_pid
}

sleep 1000000000

trap cleanup EXIT
