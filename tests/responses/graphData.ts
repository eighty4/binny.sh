export function user() {
    return {
        data: {
            viewer: {
                login: 'eighty4',
                email: '',
                avatarUrl:
                    'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=',
                id: '1234',
            },
        },
    }
}

export function repositories() {
    return {
        data: {
            viewer: {
                repositories: {
                    nodes: [
                        {
                            name: 'l3',
                            owner: {
                                login: 'eighty4',
                            },
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
                                                    contentType:
                                                        'application/x-dosexec',
                                                },
                                                {
                                                    name: 'l3-windows-x86_64.exe',
                                                    contentType:
                                                        'application/x-dosexec',
                                                },
                                            ],
                                            pageInfo: {
                                                endCursor:
                                                    'Y3Vyc29yOnYyOpHODPXlCA==',
                                                hasNextPage: false,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                    pageInfo: {
                        endCursor: 'Y3Vyc29yOnYyOpHOOhjqlA==',
                        hasNextPage: false,
                    },
                },
            },
        },
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
