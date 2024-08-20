import type {Architecture, OperatingSystem} from '@eighty4/install-template'

export interface Repository {
    owner: string
    name: string
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
