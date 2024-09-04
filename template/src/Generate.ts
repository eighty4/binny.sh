import type {Architecture, Distribution, OperatingSystem} from './Distrubtions.js'
import {getTemplateVersion} from './getTemplateVersion.js'

export interface Repository {
    owner: string
    name: string
}

// Installation of a binary performed by generated script and the GitHub release's binaries to install from
export interface BinaryInstall {
    installAs: string
    binaries: Array<string>
}

// Options container for generating a script
export interface GenerateScriptOptions {
    binaryInstalls: Array<BinaryInstall>
    explicitArchitectures: Record<string, Architecture>
    repository: {
        owner: string
        name: string
    }
    resolvedDistributions: Record<string, Distribution>
}

// User customizations for generated script
export interface GeneratedScriptSpec {
    binaryInstalls: Array<BinaryInstall>
    explicitArchitectures: Record<string, Architecture>
}

// Generated script output and inputs used to create script
export interface GeneratedScript {
    repository: Repository
    script: string
    spec: GeneratedScriptSpec
    templateVersion: string
}

function validateOptions(options: GenerateScriptOptions) {
    if (!options) {
        throw new Error('options param is required')
    } else if (!options.repository) {
        throw new Error('options.repository param is required')
    } else if (!options.repository.owner || !options.repository.owner.length) {
        throw new Error('options.repository.owner param is required')
    } else if (!options.repository.name || !options.repository.name.length) {
        throw new Error('options.repository.name param is required')
    } else if (!options.binaryInstalls || !options.binaryInstalls.length) {
        throw new Error('options.binaryInstalls param is required')
    } else if (options.binaryInstalls.length !== 1) {
        throw new Error('options.binaryInstalls only supports one binary install with an install script')
    } else {
        options.binaryInstalls.forEach((binaryInstall, i) => {
            if (!binaryInstall.installAs || !binaryInstall.installAs.length) {
                throw new Error(`options.binaryInstallInstalls[${i}].installAs param is required`)
            } else if (!binaryInstall.binaries || !Object.keys(binaryInstall.binaries).length) {
                throw new Error(`options.binaryInstalls[${i}].binaries param is required`)
            }
        })
    }
}

interface DistributionSupport {
    architectures: Array<Architecture>
    oses: Array<OperatingSystem>
}

function collectDistributionSupport(options: GenerateScriptOptions): DistributionSupport {
    const resolvedDistributions = Object.values(options.resolvedDistributions)
    const explicitArchitectures = Object.values(options.explicitArchitectures)
    const architectures: Array<Architecture> = []
    const oses: Array<OperatingSystem> = []
    for (const distribution of resolvedDistributions) {
        if (distribution.arch) {
            if (!architectures.includes(distribution.arch)) {
                architectures.push(distribution.arch)
            }
        }
        if (!oses.includes(distribution.os)) {
            oses.push(distribution.os)
        }
    }
    for (const architecture of explicitArchitectures) {
        if (!architectures.includes(architecture)) {
            architectures.push(architecture)
        }
    }
    return {architectures, oses}
}

function collectBinaryDistributions(options: GenerateScriptOptions): Record<string, Distribution> {
    const {binaryInstalls, explicitArchitectures, resolvedDistributions} = options
    const result: Record<string, Distribution> = {}
    for (const binaryInstall of binaryInstalls) {
        for (const binary of binaryInstall.binaries) {
            const resolvedDistribution = resolvedDistributions[binary]
            if (resolvedDistribution.os !== 'Windows') {
                if (resolvedDistribution.arch) {
                    result[binary] = resolvedDistribution
                } else {
                    const explicitArchitecture = explicitArchitectures[binary]
                    if (!explicitArchitecture) {
                        throw new Error(`binary ${binary} does not have a resolved or explicit architecture`)
                    }
                    result[binary] = {
                        arch: explicitArchitecture,
                        os: resolvedDistribution.os,
                    }
                }
            }
        }
    }
    return result
}

export function generateScript(options: GenerateScriptOptions): GeneratedScript {
    validateOptions(options)
    return {
        repository: options.repository,
        templateVersion: getTemplateVersion(),
        script: scriptTemplateFn(options),
        spec: {
            binaryInstalls: options.binaryInstalls,
            explicitArchitectures: options.explicitArchitectures,
        }
    }
}

function scriptTemplateFn(options: GenerateScriptOptions): string {
    const binaryInstall = options.binaryInstalls[0]
    const {architectures, oses} = collectDistributionSupport(options)
    const binaryDistributions = collectBinaryDistributions(options)
    return `#!/usr/bin/env sh
set -e

# Created by npm package @eighty4/install-template@${getTemplateVersion()} for https://github.com/${options.repository.owner}/${options.repository.name}

binary_name="${binaryInstall.installAs}"
repository_name="${options.repository.owner}/${options.repository.name}"

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
    armv6l | armv7l)   ${assignOrAbandon(architectures.includes('arm'), '_cpu', 'arm', '32-bit arm')} ;;
    x86_64 | amd64)    ${assignOrAbandon(architectures.includes('x86_64'), '_cpu', 'x86_64')} ;;
    aarch64 | arm64)   ${assignOrAbandon(architectures.includes('aarch64'), '_cpu', 'aarch64')} ;;
    *)                 abandon_ship "cpu architecture $_cpu is unsupported. visit https://github.com/eighty4/install/issues to submit a PR." ;;
  esac
  echo "$_cpu"
}

resolve_os() {
  _os=""
  case $(uname -o) in
    Darwin)            ${assignOrAbandon(oses.includes('MacOS'), '_os', 'MacOS')} ;;
    GNU/Linux)         ${assignOrAbandon(oses.includes('Linux'), '_os', 'Linux')} ;;
    *)                 abandon_ship "operating system $_os is unsupported. visit https://github.com/eighty4/install/issues to submit a PR." ;;
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
  _version=$(echo "$_json" | grep \\"tag_name\\": | cut -d : -f 2 | cut -d \\" -f 2)
  if test -z "$_version"; then
    _version="latest"
  fi
  echo "$_version"
}

check_cmd() {
  _cmd="$1"
  if ! command -v "$_cmd" >/dev/null 2>&1; then
    abandon_ship "unable to locate dependency program \\\`$_cmd\\\` on your machine."
  fi
}

${resolveFilenameFunction(binaryDistributions)}

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
    echo "# added by https://install.eighty4.tech";
    echo "PATH=\\"\\$PATH:$install_dir"\\" >> "$HOME/$shell_profile";
  } >> "$HOME/$shell_profile"
fi

checkmark="\\033[1;38;5;41m\\0342\\0234\\0224\\033[m"
echo "$checkmark binary installed at \\033[1m~/$install_path\\033[m"
echo "$checkmark \\033[1m~/$shell_profile\\033[m now adds $binary_name to PATH"
echo ""
echo "run these commands to verify install:"
echo "  source ~/$shell_profile"
echo "  $binary_name"
`
}

function assignOrAbandon(check: boolean, variable: string, assignment: string, label?: string) {
    if (check) {
        return `${variable}="${assignment}"`
    } else {
        return `abandon_ship "no prebuilt binary for ${label || assignment}."`
    }
}

function resolveFilenameFunction(files: Record<string, Distribution>) {
    const filenames = Object.keys(files)
    const chunks: Array<string> = []
    chunks.push(`  if ${renderCheckDistribution(files[filenames[0]])}; then`)
    chunks.push(`    _filename="${filenames[0]}"`)
    if (filenames.length > 1) {
        for (const filename of filenames.splice(1)) {
            chunks.push(`  elif ${renderCheckDistribution(files[filename])}; then`)
            chunks.push(`    _filename="${filename}"`)
        }
    }
    chunks.push('  else')
    chunks.push('    abandon_ship "no prebuilt $_cpu binary for $_os"')
    chunks.push('  fi')
    return `resolve_filename() {
  _cpu="$1"
  _os="$2"
  _filename=""
${chunks.join('\n')}
  echo "$_filename"
}`
}

function renderCheckDistribution({arch, os}: Distribution): string {
    return `test "$_cpu" = "${arch}" && test "$_os" = "${os}"`
}
