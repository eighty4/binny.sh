#!/usr/bin/env pwsh

# Created by npm package @binny.sh/template@0.0.0 for https://github.com/eighty4/l3

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$binaryName = 'l3'
$repoName = 'eighty4/l3'

function Abandon-Ship($message) {
    Write-Output $message
    Write-Output "visit https://github.com/${repoName} for other setup methods"
    Exit 1
}

if ([System.Enum]::GetNames([System.Net.SecurityProtocolType]) -notcontains 'Tls12') {
    Abandon-Ship @"
installing from GitHub releases requires a newer version of PowerShell.
visit https://www.microsoft.com/net/download to upgrade.
"@
}

$os64bit = [System.Environment]::Is64BitOperatingSystem
$os = $null
switch -Wildcard ($PSVersionTable.OS) {
    '*Linux*'  { $os = 'Linux' }
    '*Ubuntu*' { $os = 'Linux' }
    'Darwin*'  { $os = 'MacOS' }
    Default    { $os = 'Windows' }
}

$rawArch = $null
$arch = $null
if ($os -eq 'Windows') {
    $rawArch = $env:PROCESSOR_ARCHITECTURE
    switch -Wildcard ($rawArch) {
        'AMD64'   { $arch = 'x86_64' }
        'x86'     {
            if ($os64bit) {
                $arch = 'x86_64'
            }
        }
        'ARM64'   { $arch = 'aarch64' }
        # 'ARM'   { $arch = 'arm' }
    }
} else {
    $rawArch = uname -m
    switch -Wildcard ($rawArch) {
        'amd64'   { $arch = 'x86_64' }
        'x86_64'  { $arch = 'x86_64' }
        'armv*'   { $arch = 'arm' }
        'aarch64' { $arch = 'aarch64' }
        'arm64'   { $arch = 'aarch64' }
    }
    if (($os64bit -eq $false) -and ($arch -eq 'aarch64')) {
        $arch = 'arm'
    }
}

if (-Not $arch) {
    Abandon-Ship "cpu architecture ${rawArch} is unsupported. visit https://github.com/eighty4/binny.sh/issues to submit a PR."
}

$filename = $Null
if ($os -eq 'Windows') {
    if ($arch -eq 'aarch64') {
        $filename = 'l3-linux-aarch64'
    } elseif ($arch -eq 'x86_64') {
        $filename = 'l3-linux-x86_64'
    }
} elseif ($os -eq 'Linux') {
    if ($arch -eq 'aarch64') {
        $filename = 'l3-linux-aarch64'
    } elseif ($arch -eq 'x86_64') {
        $filename = 'l3-linux-x86_64'
    } else {
        $filename = ''
    }
} elseif ($os -eq 'MacOS') {
    if ($arch -eq 'aarch64') {
        $filename = 'l3-macos-aarch64'
    } elseif ($arch -eq 'x86_64') {
        $filename = 'l3-linux-x86_64'
    }
}

if (-Not $filename) {
    Abandon-Ship "no prebuilt ${arch} binary for ${os}."
}

$ghReleaseJson = Invoke-RestMethod -Uri "https://api.github.com/repos/${repoName}/releases/latest"
$gitTag = $ghReleaseJson.tag_name
$binaryUrl = "https://github.com/${repoName}/releases/download/${gitTag}/${filename}"

function Windows-Install() {
    $installDir = "${env:LOCALAPPDATA}\Programs\${binaryName}"
    $filename = "$binaryName.exe"
    $null = New-Item -ItemType Directory -Path $installDir -Force
    Download-Binary $installDir $filename
    if (Windows-Path-Missing $installDir) {
        Windows-Add-Path $installDir
        Write-Output @"
run these commands to update `$env:PATH and verify install:
  `$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
  Get-Command ${filename}
"@
    } else {
        Write-Output @"
run this command to verify install:
  Get-Command ${filename}
"@
    }
}

function Windows-Add-Path($dir) {
    $path = [System.Environment]::GetEnvironmentVariable("Path", "User")
    [System.Environment]::SetEnvironmentVariable("Path", "$path;$dir", "User")
    Write-Task-Complete "added ${dir} to User PATH"
}

function Windows-Path-Missing($dir) {
    $pathStr = Get-ItemPropertyValue -LiteralPath 'registry::HKEY_CURRENT_USER\Environment' -Name 'Path'
    Path-Missing $pathStr ';' $dir
}

function Nix-Install() {
    $installDir = Nix-Install-Dir
    $null = New-Item -ItemType Directory -Path $installDir -Force
    Download-Binary $installDir $binaryName
    Nix-Make-Executable $installDir
    if (Nix-Path-Missing $installDir) {
        $profile = Nix-Profile
        Nix-Add-To-Path $installDir $profile
        Write-Output @"
run these commands to verify install:
  source ~/${profile}
  which ${binaryName}
"@
    } else {
        Write-Output @"
run this command to verify install:
  which ${binaryName}
"@
    }
}

function Nix-Make-Executable($installDir) {
    $p = Join-Path $installDir $binaryName
    chmod +x $p
}

function Nix-Install-Dir() {
    if ($env:XDG_BIN_HOME -ne $null) {
        return $env:XDG_BIN_HOME
    }
    if ($env:XDG_DATA_HOME -ne $null) {
        return Join-Path $env:XDG_DATA_HOME '../bin'
    }
    return Join-Path $env:HOME '.local/bin'
}

function Nix-Path-Missing($dir) {
    Path-Missing $env:PATH ':' $dir
}

function Nix-Profile() {
    $profile = $null
    switch -Wildcard ($env:SHELL) {
        '*/zsh'   { $profile = '.zprofile' }
        '*/bash'  { $profile = '.bash_profile' }
        '*/fish'  { $profile = '.config/fish/config.fish' }
        Default   { $profile = '.profile' }
    }
    $profile
}

function Nix-Add-To-Path($dir, $profile) {
    $profilePath = Join-Path $env:HOME $profile
    @"
# added by https://binny.sh
PATH="`$PATH:${dir}"
"@ >> $profilePath
    Write-Task-Complete "${profile} now adds ${binaryName} to PATH"
}

function Download-Binary($destDir, $filename) {
    $dest = Join-Path $installDir $filename
    if (Get-Module -Name BitsTransfer -ListAvailable) {
        Import-Module BitsTransfer
        Start-BitsTransfer -Source $binaryUrl -Destination $dest
    } else {
        $null = Invoke-WebRequest -Uri $binaryUrl -OutFile $dest
    }
    Write-Task-Complete "binary installed at ${destDir}"
}

function Path-Missing($pathStr, $pathDelim, $dir) {
    $pathStr.split($pathDelim) -notcontains $installDir
}

function Write-Task-Complete($message) {
    Write-Host ([char]0x2713) -ForegroundColor Green -NoNewline
    Write-Output " $message"
}

if ($os -eq 'Windows') {
    Windows-Install
} else {
    Nix-Install
}
