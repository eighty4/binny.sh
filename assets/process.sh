#!/bin/sh
set -e

program_check() {
    local _prog="$1"
    local _url="$2"
    if ! command -v "$_prog" &> /dev/null; then
        echo "\033[31merror:\033[0m $_prog is required\n\n  $_url\n"
        exit 1
    fi
}

program_check "inkscape" "https://inkscape.org/release"
program_check "svgo" "npm -i g svgo"

success() {
    echo "\033[32m✔\033[0m $1"
}

transform_png() {
    local _size="$1"
    local _out="$2"
    local _bg="$3"
    local _scale="$4"
    inkscape --actions="select-all; fit-canvas-to-selection; transform-scale:$_scale; select-all; object-align:hcenter page; object-align:vcenter page" -w "$_size" -h "$_size" --export-background "$_bg" -o "$_out" logo.svg
    success "$_out"
}

export_png() {
    local _size="$1"
    local _out="$2"
    inkscape -w "$_size" -h "$_size" -o "$_out" 
    success "$_out"
}

export_svg() {
    local _in="$1"
    local _out="$2"
    svgo -q -o "$_out" -i "$_in"
    success "$_out"
}

export_svg graphics/cloud.svg public/cloud.svg
export_svg graphics/coffee.svg public/coffee.svg
export_svg graphics/logo.svg public/logo.svg
