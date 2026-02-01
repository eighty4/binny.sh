#!/bin/sh
set -e

# image processing from assets to public dir

program_check() {
    local _prog="$1"
    local _url="$2"
    if ! command -v "$_prog" &> /dev/null; then
        echo "\033[31merror:\033[0m $_prog is required\n\n  $_url\n"
        exit 1
    fi
}

program_check "inkscape" "https://inkscape.org/release"
program_check "svgo" "npm i -g svgo"

success() {
    echo "\033[32m✔\033[0m $1"
}

export_svg() {
    local _in="$1"
    local _out="$2"
    svgo -q -o "$_out" -i "$_in"
    success "$_out"
}

export_svg assets/svgs/checkmark.svg public/checkmark.svg
export_svg assets/svgs/x.svg public/x.svg
