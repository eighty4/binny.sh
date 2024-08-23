#!/bin/bash

pushd ../frontend
  pnpm build:tsc
popd

pushd ../offline
  pnpm start &
  offline_pid=$!
popd

pushd ../frontend
  pnpm dev:offline &
  frontend_pid=$!
popd

function cleanup()
{
  kill $frontend_pid
  kill $offline_pid
}

sleep 1000000000

trap cleanup EXIT
