#!/usr/bin/env sh
set -e

_profile=""
case $SHELL in
*bash) _profile=".bash_profile" ;;
*fish) _profile=".config/fish/config.fish" ;;
 *zsh) _profile=".zprofile" ;;
    *) _profile=".profile" ;;
esac

touch "$HOME/$_profile"

case $SCRIPT in
*.ps1) pwsh -f "/gold/scripts/$SCRIPT" ;;
 *.sh) /gold/scripts/"$SCRIPT" ;;
esac

echo "sourcing $HOME/$_profile"
. "$HOME/$_profile"

if command -v $BINARY >/dev/null 2>&1; then
    echo "$BINARY found on PATH"
else
    echo "$BINARY not found on PATH"
    exit 1
fi
