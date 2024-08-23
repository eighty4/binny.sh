import {resolveDistribution} from '@eighty4/install-template'
import type {Asset, Binary, Language, Release} from './Model.js'

const compileBinaryLanguages = Object.freeze(['C', 'C++', 'Go', 'Rust', 'Zig'])

export interface ViewerUserGraph {
    viewer: {
        login: string
        email: string
        id: string
        avatarUrl: string
    }
}

export interface RepositoryReleasesGraph {
    repository: {
        languages: {
            nodes: Array<LanguageNode>
        }
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
    languages: {
        nodes: Array<LanguageNode>
    }
    releases: {
        nodes: Array<ReleaseNode>
    }
}

export interface LanguageNode {
    name: string
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

export function mapLanguageNodes(nodes: Array<LanguageNode>): Array<Language> {
    return nodes
        .map(languageNode => languageNode.name)
        .filter(language => compileBinaryLanguages.includes(language)) as Array<Language>
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
