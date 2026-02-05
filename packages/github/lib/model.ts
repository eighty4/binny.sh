import type { Architecture, OperatingSystem } from '@binny.sh/systems'

export type Language = 'C++' | 'C' | 'Go' | 'Rust' | 'Zig'

export interface User {
    login: string
    // email?: string
    id: string
    avatarUrl: string
}

export type RepositoryId = {
    owner: string
    name: string
}

export type Repository = RepositoryId & {
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
