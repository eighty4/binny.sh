// https://en.wikipedia.org/wiki/Uname#Examples
export type Architecture = 'aarch64' | 'arm' | 'x86_64'

export const ARCHITECTURES: Readonly<Array<Architecture>> = Object.freeze(['aarch64', 'arm', 'x86_64'])

export type OperatingSystem = 'Linux' | 'MacOS' | 'Windows'

export const OPERATING_SYSTEMS: Readonly<Array<OperatingSystem>> = Object.freeze(['Linux', 'MacOS', 'Windows'])

export function operatingSystemLabel(os: OperatingSystem): string {
    switch (os) {
        case 'Linux':
            return 'Linux'
        case 'MacOS':
            return 'MacOS'
        case 'Windows':
            return 'Windows'
    }
}

export interface Distribution {
    arch?: Architecture
    os: OperatingSystem
}
