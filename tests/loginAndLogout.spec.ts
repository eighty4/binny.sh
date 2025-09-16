import { expect, test } from '@playwright/test'
import { ApiResponses } from './ApiResponses.js'

test('cancel login', async ({ page }) => {
    await page.goto('/')
    await page.click('#login')
    await page.waitForSelector('#login-cancel')
    await page.click('#login-cancel')
    expect(await page.locator('html.out').count()).toBe(0)
})

test('login to #search route', async ({ page }) => {
    await new ApiResponses('continue')
        .POST({
            json: {
                data: {
                    viewer: {
                        login: 'eighty4',
                        email: '',
                        avatarUrl:
                            'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=',
                        id: '1234',
                    },
                },
            },
        })
        .POST({
            json: {
                data: {
                    viewer: {
                        login: 'eighty4',
                        email: '',
                        avatarUrl:
                            'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=',
                        id: '1234',
                    },
                },
            },
        })
        .POST({
            json: {
                data: {
                    viewer: {
                        repositories: {
                            nodes: [
                                {
                                    name: 'maestro',
                                    owner: {
                                        login: 'eighty4',
                                    },
                                    languages: {
                                        nodes: [
                                            {
                                                name: 'Go',
                                            },
                                        ],
                                    },
                                    releases: {
                                        nodes: [
                                            {
                                                createdAt: '2024-01-01',
                                                updatedAt: '2024-02-01',
                                                url: 'https://github.com/eighty4/maestro',
                                                tagCommit: {
                                                    abbreviatedOid: 'bbb3b25',
                                                },
                                                tagName: '1.0.1',
                                                releaseAssets: {
                                                    nodes: [
                                                        {
                                                            contentType:
                                                                'application/x-executable',
                                                            name: 'maestro-linux-arm64',
                                                        },
                                                        {
                                                            contentType:
                                                                'application/x-executable',
                                                            name: 'maestro-linux-amd64',
                                                        },
                                                        {
                                                            contentType:
                                                                'application/x-mach-binary',
                                                            name: 'maestro-darwin-amd64',
                                                        },
                                                        {
                                                            contentType:
                                                                'application/x-mach-binary',
                                                            name: 'maestro-darwin-arm64',
                                                        },
                                                        {
                                                            contentType:
                                                                'application/x-dosexec',
                                                            name: 'maestro-windows-amd64.exe',
                                                        },
                                                        {
                                                            contentType:
                                                                'text/plain',
                                                            name: 'README.md',
                                                        },
                                                    ],
                                                    pageInfo: {
                                                        hasNextPage: false,
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                                {
                                    name: 'unresolved',
                                    owner: {
                                        login: 'eighty4',
                                    },
                                    languages: {
                                        nodes: [
                                            {
                                                name: 'C',
                                            },
                                            {
                                                name: 'C++',
                                            },
                                        ],
                                    },
                                    releases: {
                                        nodes: [
                                            {
                                                createdAt: '2024-01-01',
                                                updatedAt: '2024-02-01',
                                                url: 'https://github.com/eighty4/maestro',
                                                tagCommit: {
                                                    abbreviatedOid: 'bbb3b25',
                                                },
                                                tagName: '1.0.1',
                                                releaseAssets: {
                                                    nodes: [
                                                        {
                                                            contentType:
                                                                'application/x-executable',
                                                            name: 'maestro-linux',
                                                        },
                                                    ],
                                                    pageInfo: {
                                                        hasNextPage: false,
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                            pageInfo: {
                                endCursor: 'asdf',
                                hasNextPage: false,
                            },
                        },
                    },
                },
            },
        })
        .configure(page, 'https://api.github.com/graphql')

    await page.goto('/')
    await page.click('#login')
    await page.waitForSelector('#login-redirect')
    await page.click('#login-redirect')
    await page.waitForSelector('#graph-paper')
    await page.waitForSelector('.repos')
})

test('logout navigates to /', async ({ page }) => {
    await new ApiResponses('continue')
        .POST({
            json: {
                data: {
                    viewer: {
                        login: 'eighty4',
                        email: '',
                        avatarUrl:
                            'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=',
                        id: '1234',
                    },
                },
            },
        })
        .POST({
            json: {
                data: {
                    viewer: {
                        login: 'eighty4',
                        email: '',
                        avatarUrl:
                            'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=',
                        id: '1234',
                    },
                },
            },
        })
        .POST({
            json: {
                data: {
                    viewer: {
                        repositories: {
                            nodes: [
                                {
                                    name: 'maestro',
                                    owner: {
                                        login: 'eighty4',
                                    },
                                    languages: {
                                        nodes: [
                                            {
                                                name: 'Go',
                                            },
                                        ],
                                    },
                                    releases: {
                                        nodes: [
                                            {
                                                createdAt: '2024-01-01',
                                                updatedAt: '2024-02-01',
                                                url: 'https://github.com/eighty4/maestro',
                                                tagCommit: {
                                                    abbreviatedOid: 'bbb3b25',
                                                },
                                                tagName: '1.0.1',
                                                releaseAssets: {
                                                    nodes: [
                                                        {
                                                            contentType:
                                                                'application/x-executable',
                                                            name: 'maestro-linux-arm64',
                                                        },
                                                        {
                                                            contentType:
                                                                'application/x-executable',
                                                            name: 'maestro-linux-amd64',
                                                        },
                                                        {
                                                            contentType:
                                                                'application/x-mach-binary',
                                                            name: 'maestro-darwin-amd64',
                                                        },
                                                        {
                                                            contentType:
                                                                'application/x-mach-binary',
                                                            name: 'maestro-darwin-arm64',
                                                        },
                                                        {
                                                            contentType:
                                                                'application/x-dosexec',
                                                            name: 'maestro-windows-amd64.exe',
                                                        },
                                                        {
                                                            contentType:
                                                                'text/plain',
                                                            name: 'README.md',
                                                        },
                                                    ],
                                                    pageInfo: {
                                                        hasNextPage: false,
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                                {
                                    name: 'unresolved',
                                    owner: {
                                        login: 'eighty4',
                                    },
                                    languages: {
                                        nodes: [
                                            {
                                                name: 'C',
                                            },
                                            {
                                                name: 'C++',
                                            },
                                        ],
                                    },
                                    releases: {
                                        nodes: [
                                            {
                                                createdAt: '2024-01-01',
                                                updatedAt: '2024-02-01',
                                                url: 'https://github.com/eighty4/maestro',
                                                tagCommit: {
                                                    abbreviatedOid: 'bbb3b25',
                                                },
                                                tagName: '1.0.1',
                                                releaseAssets: {
                                                    nodes: [
                                                        {
                                                            contentType:
                                                                'application/x-executable',
                                                            name: 'maestro-linux',
                                                        },
                                                    ],
                                                    pageInfo: {
                                                        hasNextPage: false,
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                            pageInfo: {
                                endCursor: 'asdf',
                                hasNextPage: false,
                            },
                        },
                    },
                },
            },
        })
        .configure(page, 'https://api.github.com/graphql')

    await page.goto('/')
    await page.click('#login')
    await page.waitForSelector('#login-redirect')
    await page.click('#login-redirect')
    await page.waitForSelector('#graph-paper')
    await page.waitForSelector('.repos')

    await page.click('#logout')
    await page.waitForURL('/')
    await page.waitForSelector('#login')
})
