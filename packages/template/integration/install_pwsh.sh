#!/usr/bin/env sh

_version="$PWSH_VERSION"

case $(uname -m) in
    armv6l | armv7l)      _arch="arm32" ;;
    aarch64 | arm64)      _arch="arm64" ;;
    x86_64 | amd64 | x64) _arch="x64"   ;;
esac

if [ -z "$_arch" ]; then
    echo "could not resolve powershell cpu arch distribution"
    exit 1
fi

echo "installing powershell $_version for $_arch"

apt-get update && apt-get install -y wget

_filename="powershell-$_version-linux-$_arch.tar.gz"
_url="https://github.com/PowerShell/PowerShell/releases/download/v$_version/$_filename"

_dist_dir=$(mktemp -d)
wget -P "$_dist_dir" "$_url"

mkdir -p /opt/microsoft/powershell/7
tar -xzvf "$_dist_dir/$_filename" -C /opt/microsoft/powershell/7
chmod +x /opt/microsoft/powershell/7/pwsh
ln -s /opt/microsoft/powershell/7/pwsh /usr/local/bin/pwsh
