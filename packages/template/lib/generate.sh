#!/usr/bin/env sh
set -e

# Created by npm package @binny.sh/template@***TEMPLATE_VERSION*** for https://github.com/***REPO_NAME***

binary_name="***BIN_NAME***"
repository_name="***REPO_NAME***"

abandon_ship() {
  if [ $# -gt 0 ]; then
    echo "$1" >&2
  fi
  echo "visit https://github.com/$repository_name for other setup methods." >&2
  exit 1
}

fetch_json() {
  _json_url="$1"
  _json=""
  if command -v curl >/dev/null 2>&1; then
    _json=$(curl -s "$_json_url")
  elif command -v wget >/dev/null 2>&1; then
    _json=$(wget -q -O - -o /dev/null "$_json_url")
  else
    abandon_ship "unable to download with curl or wget."
  fi
  echo "$_json"
}

download_binary() {
  _bin_url="$1"
  _bin_path="$2"
  if command -v curl >/dev/null 2>&1; then
    curl -Ls "$_bin_url" -o "$_bin_path"
  elif command -v wget >/dev/null 2>&1; then
    wget -q -O "$_bin_path" -o /dev/null "$_bin_url"
  else
    abandon_ship "unable to download with curl or wget."
  fi
}

resolve_cpu() {
  _cpu=""
  case $(uname -m) in
    armv6l | armv7l)   abandon_ship "no prebuilt binary for 32-bit arm." ;;
    x86_64 | amd64)    _cpu="x86_64" ;;
    aarch64 | arm64)   _cpu="aarch64" ;;
    *)                 abandon_ship "cpu architecture $_cpu is unsupported. visit https://github.com/eighty4/binny.sh/issues to submit a PR." ;;
  esac
  echo "$_cpu"
}

resolve_os() {
  _os=""
  case $(uname -o) in
    Darwin)            _os="MacOS" ;;
    GNU/Linux)         _os="Linux" ;;
    *)                 abandon_ship "operating system $_os is unsupported. visit https://github.com/eighty4/binny.sh/issues to submit a PR." ;;
  esac
  echo "$_os"
}

resolve_shell_profile() {
  _profile=""
  case $SHELL in
    */bash*)   _profile=".bash_profile" ;;
    */fish*)   _profile=".config/fish/config.fish" ;;
    */zsh*)    _profile=".zprofile" ;;
    *)         _profile=".profile" ;;
  esac
  echo "$_profile"
}

resolve_version() {
  _version=""
  _json=$(fetch_json "https://api.github.com/repos/$repository_name/releases/latest")
  _version=$(echo "$_json" | grep \"tag_name\": | cut -d : -f 2 | cut -d \" -f 2)
  if test -z "$_version"; then
    _version="latest"
  fi
  echo "$_version"
}

check_cmd() {
  _cmd="$1"
  if ! command -v "$_cmd" >/dev/null 2>&1; then
    abandon_ship "unable to locate dependency program \`$_cmd\` on your machine."
  fi
}

resolve_filename() {
  _cpu="$1"
  _os="$2"
  _filename=""
  if test "$_cpu" = "x86_64" && test "$_os" = "Linux"; then
    _filename="***BIN_Linux_x86_64***"
  elif test "$_cpu" = "aarch64" && test "$_os" = "Linux"; then
    _filename="***BIN_Linux_aarch64***"
  elif test "$_cpu" = "x86_64" && test "$_os" = "MacOS"; then
    _filename="***BIN_MacOS_x86_64***"
  elif test "$_cpu" = "aarch64" && test "$_os" = "MacOS"; then
    _filename="***BIN_MacOS_aarch64***"
  else
    abandon_ship "no prebuilt $_cpu binary for $_os"
  fi
  echo "$_filename"
}

check_cmd chmod
check_cmd cut
check_cmd echo
check_cmd grep
check_cmd mkdir
check_cmd uname
shell_profile=$(resolve_shell_profile)
arch=$(resolve_cpu)
os=$(resolve_os)
filename=$(resolve_filename "$arch" "$os")

latest_version=$(resolve_version)
echo "installing $binary_name@$latest_version"
echo ""

install_path=".$binary_name/bin"
if [ "$os" = "linux" ]; then
  install_path=".config/$install_path"
fi
install_dir="$HOME/$install_path"
mkdir -p "$install_dir"

download_binary "https://github.com/$repository_name/releases/download/$latest_version/$filename" "$install_dir/$binary_name"
chmod +x "$install_dir/$binary_name"

if ! grep .$binary_name/bin "$HOME/$shell_profile" >/dev/null 2>&1; then
  {
    echo "";
    echo "# added by https://binny.sh";
    echo "PATH=\"\$PATH:$install_dir"\" >> "$HOME/$shell_profile";
  } >> "$HOME/$shell_profile"
fi

checkmark="\033[1;38;5;41m\0342\0234\0224\033[m"
echo "$checkmark binary installed at \033[1m~/$install_path\033[m"
echo "$checkmark \033[1m~/$shell_profile\033[m now adds $binary_name to PATH"
echo ""
echo "run these commands to verify install:"
echo "  source ~/$shell_profile"
echo "  $binary_name"
