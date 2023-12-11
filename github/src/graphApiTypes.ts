import {resolveDistribution} from '@eighty4/install-template'
import type {Asset, Binary, Release} from './Model.js'

export interface RepositoryReleasesGraph {
    repository: {
        releases: {
            nodes: Array<ReleaseNode>
        }
    }
}

export interface ViewerRepositoriesWithLatestReleaseGraph {
    viewer: {
        repositories: {
            nodes: Array<RepositoryNode>
            pageInfo: {
                endCursor: string
                hasNextPage: boolean
            }
        }
    }
}

export interface RepositoryNode {
    name: string
    owner: {
        login: string
    }
    releases: {
        nodes: Array<ReleaseNode>
    }
}

export interface ReleaseNode {
    createdAt: string
    tagCommit: {
        abbreviatedOid: string
    }
    tagName: string
    updatedAt: string
    url: string
    releaseAssets: {
        nodes: Array<ReleaseAssetNode>
    }
}

export interface ReleaseAssetNode {
    name: string
    contentType: string
}

export function mapReleaseNode(release: ReleaseNode): Release {
    const binaries: Array<Binary> = []
    const otherAssets: Array<Asset> = []
    for (const {name: filename, contentType} of release.releaseAssets.nodes) {
        const distribution = resolveDistribution(filename, contentType)
        if (distribution) {
            binaries.push({
                filename,
                contentType,
                arch: distribution.arch,
                os: distribution.os,
            })
        } else {
            otherAssets.push({filename, contentType})
        }
    }
    const {createdAt, updatedAt, url} = release
    return {
        commitHash: release.tagCommit.abbreviatedOid,
        tag: release.tagName,
        createdAt,
        url,
        updatedAt,
        binaries,
        otherAssets,
    }
}
