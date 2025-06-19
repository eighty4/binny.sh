#!/bin/sh
set -e

install_git_hook() {
    local _hook=".git/hooks/$1"
    if [ -e "$_hook" ]; then
      echo "$_hook already exists"
      exit 1
    fi
    ln -s $(realpath ci_verify.sh) $_hook
    echo "linked ci_verify.sh to $_hook"
    exit 0
}

for arg in "$@"; do
  case $arg in
    "--on-git-commit")
      install_git_hook pre-commit;;
    "--on-git-push")
      install_git_hook pre-push;;
  esac
done

if ! command -v "pnpm" &> /dev/null; then
  _url="https://pnpm.io/installation"
  echo "\033[31merror:\033[0m pnpm is required for contributing\n\n  $_url\n"
fi

# validate local github workflow changes on commit or ./ci_verify.sh

validate_gh_wf_if_changed() {
    _changes=$(git status)
    if echo "$_changes" | grep -Eq "\.github/workflows/.*?\.ya?ml"; then
        model-t .
    fi
}

if [ "$0" = ".git/hooks/pre-commit" ]; then
    validate_gh_wf_if_changed
fi

if echo "$0" | grep -q "ci_verify\.sh$"; then
    validate_gh_wf_if_changed
fi

# validate committed github workflow changes on push

if [ "$0" = ".git/hooks/pre-push" ]; then
    read -a _input
    _changes=$(git diff --name-only ${_input[1]} ${_input[3]})
    if echo "$_changes" | grep -Eq "^\.github/workflows/.*?\.ya?ml$"; then
        model-t .
    fi
fi

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

