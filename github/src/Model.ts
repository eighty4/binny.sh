import type { Architecture, OperatingSystem } from '@eighty4/install-template'

export type Language = 'C++' | 'C' | 'Go' | 'Rust' | 'Zig'

export interface User {
    login: string
    // email?: string
    id: string
    avatarUrl: string
}

export interface Repository {
    owner: string
    name: string
    languages: Array<Language>
    latestRelease?: Release
}

export interface Asset {
    contentType: string
    filename: string
}

export interface Binary extends Asset {
    arch?: Architecture
    os: OperatingSystem
}

export interface Release {
    createdAt: string
    binaries: Array<Binary>
    otherAssets: Array<Asset>
    commitHash: string
    tag: string
    updatedAt: string
    url: string
}
