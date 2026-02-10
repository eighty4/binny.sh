$binaryName = $env:BINARY
$script = $env:SCRIPT

pwsh -f $script

$installDir = "${env:LOCALAPPDATA}\Programs\${binaryName}"
$binaryPath = Join-Path $installDir "$binaryName.exe"

if (!(Test-Path -Path $binaryPath -PathType Leaf)) {
    Write-Output "binary was not found at $binaryPath"
    Exit 1
}

function Check-Path($sourceLabel, $pathStr) {
    if ($pathStr.split(';') -notcontains $installDir) {
        Write-Output "install dir was not found in $sourceLabel PATH"
        Exit 1
    }
}

$pathStr = Get-ItemPropertyValue -LiteralPath 'registry::HKEY_CURRENT_USER\Environment' -Name 'Path'
Check-Path 'registry' $pathStr
