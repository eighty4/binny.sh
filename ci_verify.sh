#!/bin/sh
set -e

# run through all the checks done for ci

cd backend
echo '\n*** backend ***'
pnpm build
pnpm test
cd ..

cd frontend
echo '\n*** frontend ***'
pnpm build
cd ..

cd template
echo '\n*** template ***'
pnpm build
pnpm test
cd ..
