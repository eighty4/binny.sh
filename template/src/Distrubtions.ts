// https://en.wikipedia.org/wiki/Uname#Examples
export type Architecture = 'aarch64' | 'arm' | 'x86_64'

export type OperatingSystem = 'Linux' | 'MacOS' | 'Windows'

export interface Distribution {
    arch: Architecture
    os: OperatingSystem
}
