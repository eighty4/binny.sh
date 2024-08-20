#!/bin/sh
set -e

# run through all the checks done for ci

cd frontend
echo '\n*** frontend ***'
pnpm build
cd ..

cd template
echo '\n*** template ***'
pnpm build
pnpm test
cd ..

cd e2e
echo '\n*** e2e ***'
pnpm test
cd ..
