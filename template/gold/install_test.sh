#!/usr/bin/env sh
set -e

# runs in install.template.test.$os.$shell.$downloader containers to verify gold test scripts
# todo check expected MIME type

script="$1"
binary="$2"
profile="$3"

/gold/scripts/"$script"
. ~/"$profile"
command -v "$binary"
