import { resolveDistribution } from '@binny.sh/template'
import type { Asset, Binary, Language, Release } from '../model.ts'

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
            totalCount: number
            nodes: Array<RepositoryNodeWithLatestRelease>
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
}

export interface RepositoryNodeWithLatestRelease extends RepositoryNode {
    latestRelease: ReleaseNode | null
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
        totalCount: number
        nodes: Array<ReleaseAssetNode>
        pageInfo: {
            hasNextPage: boolean
        }
    }
}

export interface ReleaseAssetNode {
    name: string
    contentType: string
}

export function mapLanguageNodes(nodes: Array<LanguageNode>): Array<Language> {
    return nodes
        .map(languageNode => languageNode.name)
        .filter(language =>
            compileBinaryLanguages.includes(language),
        ) as Array<Language>
}

export function mapReleaseNode(release: ReleaseNode): Release {
    if (release.releaseAssets.pageInfo?.hasNextPage) {
        console.warn(
            `release ${release.tagName} has more than 100 release assets and exceeding amount will not be processed bc paging is not yet supported`,
        )
    }
    const binaries: Array<Binary> = []
    const otherAssets: Array<Asset> = []
    for (const { name: filename, contentType } of release.releaseAssets.nodes) {
        const distribution = resolveDistribution(filename, contentType)
        if (distribution) {
            binaries.push({
                filename,
                contentType,
                arch: distribution.arch,
                os: distribution.os,
            })
        } else {
            otherAssets.push({ filename, contentType })
        }
    }
    const { createdAt, updatedAt, url } = release
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
