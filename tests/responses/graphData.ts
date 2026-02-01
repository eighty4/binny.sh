import type { Architecture, OperatingSystem } from '@binny.sh/template'
import type { Language } from 'Binny.sh/github/model'
import type {
    ReleaseAssetNode,
    ReleaseNode,
    RepositoryNodeWithLatestRelease,
    ViewerRepositoriesWithLatestReleaseGraph,
    ViewerUserGraph,
} from 'Binny.sh/github/queries/_graphApiTypes'

export function user(): { data: ViewerUserGraph } {
    return {
        data: {
            viewer: {
                login: 'eighty4',
                email: '',
                avatarUrl:
                    'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=',
                id: '50251875',
            },
        },
    }
}

export function userId() {
    return {
        data: {
            user: {
                databaseId: '50251875',
            },
        },
    }
}

export type ViewerReposSpec = {
    withRelease?: Array<RepoWithReleaseSpec>
    withoutRelease?: Array<RepoSpec>
}

export type RepoSpec = {
    repo: string
    languages?: Array<Language>
}

export type RepoWithReleaseSpec = RepoSpec & {
    // creates binary assets matching cross platform support criteria
    support?: Partial<Record<OperatingSystem, 'mia' | 'partial' | 'full'>>
    // supplement with additional assets
    assets?: Array<{
        name: string
        contentType: string | 'application/octet-stream'
    }>
}

export function repositories(spec: ViewerReposSpec): {
    data: ViewerRepositoriesWithLatestReleaseGraph
} {
    const repos: Array<RepositoryNodeWithLatestRelease> = []
    if (spec.withRelease) {
        repos.push(...spec.withRelease.map(repoWithRelease))
    }
    if (spec.withoutRelease) {
        repos.push(...spec.withoutRelease.map(repoWithoutRelease))
    }
    return {
        data: {
            viewer: {
                repositories: {
                    totalCount: repos.length,
                    pageInfo: {
                        hasNextPage: false,
                        endCursor:
                            'A Taoist, Rabbi and the Pope walk into a bar',
                    },
                    nodes: repos,
                },
            },
        },
    }
}

function repoWithoutRelease(spec: RepoSpec): RepositoryNodeWithLatestRelease {
    return {
        name: spec.repo,
        owner: {
            login: 'eighty4',
        },
        languages: {
            nodes: spec.languages?.map(language => ({ name: language })) || [],
        },
        latestRelease: null,
    }
}

function repoWithRelease(
    spec: RepoWithReleaseSpec,
): RepositoryNodeWithLatestRelease {
    return {
        ...repoWithoutRelease(spec),
        latestRelease: release(spec),
    }
}

function release(spec: RepoWithReleaseSpec): ReleaseNode {
    const assets = []
    if (spec.support) assets.push(...binaries(spec.repo, spec.support))
    if (spec.assets) assets.push(...spec.assets)
    return {
        createdAt: '2025-01-02T17:49:46Z',
        tagCommit: {
            abbreviatedOid: '2bea69c',
        },
        tagName: 'l3_cli-v0.0.4',
        updatedAt: '2025-02-11T18:04:30Z',
        url: 'https://github.com/eighty4/l3/releases/tag/l3_cli-v0.0.4',
        releaseAssets: {
            totalCount: assets.length,
            nodes: assets,
            pageInfo: {
                hasNextPage: false,
            },
        },
    }
}

function binaries(
    repo: string,
    osSupport: RepoWithReleaseSpec['support'],
): Array<ReleaseAssetNode> {
    if (!osSupport) {
        return []
    }
    return Object.entries(osSupport).flatMap(([os, support]) => {
        switch (os) {
            case 'Linux':
                switch (support) {
                    case 'mia':
                        return []
                    case 'partial':
                        return [asset(repo, os, 'aarch64')]
                    case 'full':
                        return [
                            asset(repo, os, 'arm'),
                            asset(repo, os, 'aarch64'),
                            asset(repo, os, 'x86_64'),
                        ]
                }
            case 'MacOS':
                switch (support) {
                    case 'mia':
                        return []
                    case 'partial':
                        return [asset(repo, os, 'aarch64')]
                    case 'full':
                        return [
                            asset(repo, os, 'aarch64'),
                            asset(repo, os, 'x86_64'),
                        ]
                }
            case 'Windows':
                switch (support) {
                    case 'mia':
                        return []
                    case 'partial':
                        return [asset(repo, os, 'aarch64')]
                    case 'full':
                        return [
                            asset(repo, os, 'aarch64'),
                            asset(repo, os, 'x86_64'),
                        ]
                }
            default:
                throw Error()
        }
    })
}

function asset(
    program: string,
    os: OperatingSystem,
    arch: Architecture,
): ReleaseAssetNode {
    return {
        name: `${program}-${os.toLowerCase()}-${arch.toLowerCase()}`,
        contentType: contentType(os),
    }
}

function contentType(os: OperatingSystem) {
    switch (os) {
        case 'Linux':
            return 'application/x-pie-executable'
        case 'MacOS':
            return 'application/x-mach-binary'
        case 'Windows':
            return 'application/x-dosexec'
    }
}

export function latestRelease() {
    return {
        data: {
            repository: {
                languages: {
                    nodes: [
                        {
                            name: 'Rust',
                        },
                        {
                            name: 'JavaScript',
                        },
                        {
                            name: 'Shell',
                        },
                        {
                            name: 'Python',
                        },
                    ],
                },
                releases: {
                    nodes: [
                        {
                            createdAt: '2025-01-02T17:49:46Z',
                            tagCommit: {
                                abbreviatedOid: '2bea69c',
                            },
                            tagName: 'l3_cli-v0.0.4',
                            updatedAt: '2025-02-11T18:04:30Z',
                            url: 'https://github.com/eighty4/l3/releases/tag/l3_cli-v0.0.4',
                            releaseAssets: {
                                nodes: [
                                    {
                                        name: 'l3-macos-x86_64',
                                        contentType:
                                            'application/x-mach-binary',
                                    },
                                    {
                                        name: 'l3-macos-aarch64',
                                        contentType:
                                            'application/x-mach-binary',
                                    },
                                    {
                                        name: 'l3-linux-x86_64',
                                        contentType:
                                            'application/x-pie-executable',
                                    },
                                    {
                                        name: 'l3-linux-aarch64',
                                        contentType:
                                            'application/x-pie-executable',
                                    },
                                    {
                                        name: 'l3-windows-aarch64.exe',
                                        contentType: 'application/x-dosexec',
                                    },
                                    {
                                        name: 'l3-windows-x86_64.exe',
                                        contentType: 'application/x-dosexec',
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        },
    }
}
