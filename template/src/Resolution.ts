import type {Architecture, Distribution, OperatingSystem} from './Distrubtions.js'

const OS_BINARY_CONTENT_TYPES: Record<string, OperatingSystem> = {
    'application/x-executable': 'Linux',
    'application/x-pie-executable': 'Linux',
    'application/x-mach-binary': 'MacOS',
    'application/x-dosexec': 'Windows',
}

const ARCH_LABELS: Record<Architecture, Array<string>> = {
    'aarch64': ['arm64', 'aarch64'],
    'arm': ['arm'],
    'x86_64': ['amd64', 'x64', 'x86_64'],
}

const OS_ARCHITECTURES: Record<OperatingSystem, Array<Architecture>> = {
    'Linux': ['x86_64', 'aarch64', 'arm'],
    'MacOS': ['x86_64', 'aarch64'],
    'Windows': ['x86_64', 'aarch64', 'arm'],
}

export function resolveDistribution(filename: string, contentType: string): Distribution | undefined {
    const os = resolveOperatingSystem(contentType)
    if (os) {
        const arch = resolveArchitecture(os, filename)
        return {arch, os}
    }
}

function resolveArchitecture(os: OperatingSystem, filename: string): Architecture | undefined {
    const lowercaseFilename = filename.toLowerCase()
    for (const arch of OS_ARCHITECTURES[os]) {
        for (const archLabel of ARCH_LABELS[arch]) {
            if (lowercaseFilename.includes(archLabel)) {
                return arch
            }
        }
    }
}

function resolveOperatingSystem(contentType: string): OperatingSystem | undefined {
    return OS_BINARY_CONTENT_TYPES[contentType]
}
