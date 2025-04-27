#!/bin/sh
set -e

# run through all the checks done for ci

#if ! nc -z localhost 5432 2>/dev/null ; then
#  echo "\n\033[0;31mci verify error:\033[0m postgres is not running locally\n\n    run \`docker compose up -d --wait\`\n"
#  exit 1
#fi

cd frontend
echo '\n*** frontend ***'
VITE_GITHUB_CLIENT_ID=ci pnpm build
cd ..

cd template
echo '\n*** template ***'
pnpm build
pnpm test
cd ..

if ! curl -s http://localhost:5711 -o /dev/null ; then
  echo "\n\033[0;31mci verify error:\033[0m frontend is not running locally for e2e tests\n\n    run \`pnpm dev:offline\` from ./frontend\n"
  exit 1
fi

if ! curl -s http://localhost:7411 -o /dev/null ; then
  echo "\n\033[0;31mci verify error:\033[0m offline api stub is not running locally for e2e tests\n\n    run \`pnpm start\` from ./offline\n"
  exit 1
fi

cd e2e
echo '\n*** e2e ***'
pnpm test
cd ..

pnpm fmtcheck

