import type {Release, Repository} from '@eighty4/install-github'
import {
    ReleaseAssetNode,
    ReleaseNode,
    RepositoryNode,
    RepositoryReleasesGraph,
    ViewerRepositoriesWithLatestReleaseGraph,
} from '@eighty4/install-github/lib/graphApiTypes.js'

export function lookupRepositoryReleasesGraph(repository: Repository): { data: RepositoryReleasesGraph } | undefined {
    const repoKey = `${repository.owner}/${repository.name}`
    if (repositories[repoKey]) {
        return {
            data: {
                repository: mapRepository(repositories[repoKey]),
            },
        }
    }
}

export function lookupViewerRepositoriesWithLatestReleaseGraph(): { data: ViewerRepositoriesWithLatestReleaseGraph } {
    return {
        data: {
            viewer: {
                repositories: {
                    nodes: Object.keys(repositories).map(repoName => repositories[repoName]).map(mapRepository),
                    pageInfo: {
                        endCursor: 'asdf',
                        hasNextPage: false,
                    },
                },
            },
        },
    }
}

function mapRepository(repository: Repository): RepositoryNode {
    return {
        name: repository.name,
        owner: {
            login: repository.owner,
        },
        releases: {
            nodes: mapRelease(repository.latestRelease),
        },
    }
}

function mapRelease(release?: Release): Array<ReleaseNode> {
    if (!release) {
        return []
    } else {
        const assets: Array<ReleaseAssetNode> = []
        for (const binary of release.binaries) {
            assets.push({
                contentType: binary.contentType,
                name: binary.filename,
            })
        }
        for (const asset of release.otherAssets) {
            assets.push({
                contentType: asset.contentType,
                name: asset.filename,
            })
        }
        return [{
            createdAt: release.createdAt,
            updatedAt: release.updatedAt,
            url: release.url,
            tagCommit: {abbreviatedOid: 'bbb3b25'},
            tagName: release.tag,
            releaseAssets: {
                nodes: assets,
            },
        }]
    }
}

export const repositories: Record<string, Repository> = {
    'eighty4/maestro': {
        owner: 'eighty4',
        name: 'maestro',
        latestRelease: {
            commitHash: 'bbb3b25',
            createdAt: '2024-01-01',
            binaries: [{
                arch: 'aarch64',
                contentType: 'application/x-executable',
                filename: 'maestro-linux-arm64',
                os: 'Linux',
            }, {
                arch: 'x86_64',
                contentType: 'application/x-executable',
                filename: 'maestro-linux-amd64',
                os: 'Linux',
            }, {
                arch: 'x86_64',
                contentType: 'application/x-mach-binary',
                filename: 'maestro-darwin-amd64',
                os: 'MacOS',
            }, {
                arch: 'aarch64',
                contentType: 'application/x-mach-binary',
                filename: 'maestro-darwin-arm64',
                os: 'MacOS',
            }, {
                arch: 'x86_64',
                contentType: 'application/x-dosexec',
                filename: 'maestro-windows-amd64.exe',
                os: 'Windows',
            }],
            otherAssets: [{
                filename: 'README.md',
                contentType: 'text/plain',
            }],
            tag: '1.0.1',
            updatedAt: '2024-02-01',
            url: 'https://github.com/eighty4/maestro',
        },
    },
    'eighty4/unresolved': {
        owner: 'eighty4',
        name: 'unresolved',
        latestRelease: {
            commitHash: 'bbb3b25',
            createdAt: '2024-01-01',
            binaries: [{
                contentType: 'application/x-executable',
                filename: 'maestro-linux-amd64',
                os: 'Linux',
            }],
            otherAssets: [],
            tag: '1.0.1',
            updatedAt: '2024-02-01',
            url: 'https://github.com/eighty4/maestro',
        },
    },
}
