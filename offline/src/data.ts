import type {Release, Repository} from '@eighty4/install-github'
import type {
    ReleaseAssetNode,
    ReleaseNode,
    RepositoryNode,
    RepositoryReleasesGraph,
    ViewerRepositoriesWithLatestReleaseGraph,
    ViewerUserGraph,
} from '@eighty4/install-github/lib/graphApiTypes.js'

const fns: Array<(query: string) => any | undefined> = [
    lookupViewerUserGraph,
    lookupViewerRepositoriesWithLatestReleaseGraph,
    lookupRepositoryReleasesGraph,
]

export function handleGraphQuery(query: string): any | never {
    for (const fn of fns) {
        const maybe = fn(query)
        if (maybe) {
            return maybe
        }
    }
    throw new Error()
}

function lookupViewerUserGraph(query: string): ViewerUserGraph | undefined {
    if (/^\s*query\s*{\s*viewer\s*{\s*login/.test(query)) {
        return {
            viewer: {
                login: 'eighty4',
                email: '',
                avatarUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=',
                id: '1234',
            },
        }
    }
}

function lookupRepositoryReleasesGraph(query: string): RepositoryReleasesGraph | undefined {
    const matches = /repository\(owner:\s"(?<owner>[a-z0-9-]+)",\sname:\s"(?<name>[a-z0-9-]+)"\)/.exec(query)
    if (matches && matches.groups) {
        const {owner, name} = matches.groups
        const repoKey = `${owner}/${name}`
        if (repositories[repoKey]) {
            return {
                repository: mapRepository(repositories[repoKey]),
            }
        }
    }
}

function lookupViewerRepositoriesWithLatestReleaseGraph(query: string): ViewerRepositoriesWithLatestReleaseGraph | undefined {
    if (/^\s*{\s*viewer\s*{\s*repositories\(/.test(query)) {
        return {
            viewer: {
                repositories: {
                    nodes: Object.keys(repositories).map(repoName => repositories[repoName]).map(mapRepository),
                    pageInfo: {
                        endCursor: 'asdf',
                        hasNextPage: false,
                    },
                },
            },
        }
    }
}

function mapRepository(repository: Repository): RepositoryNode {
    return {
        name: repository.name,
        owner: {
            login: repository.owner,
        },
        languages: {
            nodes: repository.languages.map(name => ({name})),
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
                pageInfo: {
                    hasNextPage: false,
                },
            },
        }]
    }
}

export const repositories: Record<string, Repository> = {
    'eighty4/maestro': {
        owner: 'eighty4',
        name: 'maestro',
        languages: ['Go'],
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
        languages: ['C', 'C++'],
        latestRelease: {
            commitHash: 'bbb3b25',
            createdAt: '2024-01-01',
            binaries: [{
                contentType: 'application/x-executable',
                filename: 'maestro-linux',
                os: 'Linux',
            }],
            otherAssets: [],
            tag: '1.0.1',
            updatedAt: '2024-02-01',
            url: 'https://github.com/eighty4/maestro',
        },
    },
}
