import { expect, test, type Page } from '@playwright/test'
import * as graphData from './responses/graphData.ts'
import { RouteResponses } from './responses/RouteResponses.ts'

test.describe('/search to /configure/{owner}/{name}', () => {
    test('with click on .repo', async ({ page }) => {
        await setupRouteResponses(page, {
            withRelease: [
                {
                    repo: 'repo',
                    languages: ['C'],
                    support: {
                        Linux: 'partial',
                    },
                },
            ],
        })

        await page.goto('/')
        await page.click('#login-link')
        await page.waitForSelector('#found-repos .repo.cursor')
        await page.click('#found-repos .repo')
        await page.waitForURL('/configure/eighty4/repo')
    })

    test('with enter key', async ({ page }) => {
        const repos: Array<graphData.RepoWithReleaseSpec> = []
        for (let i = 0; i < 4; i++) {
            repos.push({
                repo: 'repo' + i,
                languages: ['C'],
                support: {
                    Linux: 'partial',
                },
            })
        }
        await setupRouteResponses(page, { withRelease: repos })

        await page.goto('/')
        await page.click('#login-link')
        await page.waitForSelector('#found-repos .repo.cursor')
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('Enter')
        await page.waitForURL('/configure/eighty4/repo2')
    })
})

test.describe('selection cursor', () => {
    test.describe('stays on .repo.cursor', () => {
        // expect #cursor-x and #cursor-y are within bounds of .repo.cursor
        async function expectCursorBounds(page: Page, repo: string) {
            const repoCard = await page
                .locator(`.repo.cursor[data-name="${repo}"]`)
                .boundingBox()
            const cursorY = await page.locator('#cursor-y').boundingBox()
            expect(cursorY!.y > repoCard!.y).toBeTruthy()
            expect(cursorY!.y < repoCard!.y + repoCard!.height).toBeTruthy()
            const cursorX = await page.locator('#cursor-x').boundingBox()
            expect(cursorX!.x > repoCard!.x).toBeTruthy()
            expect(cursorX!.x < repoCard!.x + repoCard!.width).toBeTruthy()
        }

        test('mouse hover moves cursor', async ({ page }) => {
            await setupRouteResponses(page, {
                withRelease: [0, 1].map(i => ({
                    repo: 'repo' + i,
                    languages: ['C'],
                })),
            })

            await page.goto('/')
            await page.click('#login-link')
            await page.waitForSelector('#found-repos .repo.cursor')

            await expect(page.locator('.repo.cursor .name')).toHaveText('repo0')
            await page.locator('.repo:nth-of-type(2)').hover()
            await expect(page.locator('.repo.cursor .name')).toHaveText('repo1')
            await expectCursorBounds(page, 'repo1')
        })

        test.skip('across sections', async ({ page }) => {
            await setupRouteResponses(page, {
                withRelease: [
                    {
                        repo: 'with-bins',
                        languages: ['C'],
                        support: {
                            Linux: 'partial',
                        },
                    },
                    {
                        repo: 'without-bins',
                        languages: ['C'],
                        assets: [
                            {
                                name: 'doodles',
                                contentType: 'image/webp',
                            },
                        ],
                    },
                    {
                        repo: 'without-assets',
                        languages: ['C'],
                    },
                ],
                withoutRelease: [
                    {
                        repo: 'without-release',
                        languages: ['C'],
                    },
                ],
            })
            await page.goto('/')
            await page.click('#login-link')
            await page.waitForSelector('#found-repos .repo.cursor')

            const order = [
                'with-bins',
                'without-bins',
                'without-assets',
                'without-release',
            ]

            for (let i = 0; i < 4; i++) {
                await expectCursorBounds(page, order[i])
                await page.keyboard.press('ArrowDown')
            }
        })

        test.skip('scroll on a real long repo list (good for you, superdev!)', async ({
            page,
        }) => {
            const repos: Array<graphData.RepoWithReleaseSpec> = []
            for (let i = 0; i < 20; i++) {
                repos.push({
                    repo: 'repo' + String(i).padStart(2, '0'),
                    languages: ['C'],
                    support: {
                        Linux: 'partial',
                    },
                })
            }
            await setupRouteResponses(page, {
                withRelease: repos,
            })
            await page.goto('/')
            await page.click('#login-link')
            await page.waitForSelector('#found-repos .repo.cursor')
            await page.evaluate(() => (window.scrollY = 500))

            for (let i = 0; i < 8; i++) {
                await expectCursorBounds(
                    page,
                    `repo${String(i * 2).padStart(2, '0')}`,
                )
                await page.keyboard.press('ArrowDown')
            }
        })
    })
})

test.describe('repo cards', () => {
    test.describe('categorizing', () => {
        test('sections of native language and release asset categories', async ({
            page,
        }) => {
            const withRelease: Array<graphData.RepoWithReleaseSpec> = [
                {
                    repo: 'with-bins',
                    languages: ['C'],
                    support: {
                        Windows: 'partial',
                    },
                },
                {
                    repo: 'without-bins',
                    languages: ['C'],
                    assets: [
                        {
                            name: 'misconfigured',
                            contentType: 'application/octet-stream',
                        },
                    ],
                },
                {
                    repo: 'without-assets',
                    languages: ['C'],
                },
                {
                    repo: 'without-native-released',
                    assets: [
                        {
                            name: 'misconfigured',
                            contentType: 'application/octet-stream',
                        },
                    ],
                },
            ]
            const withoutRelease: Array<graphData.RepoSpec> = [
                {
                    repo: 'without-release',
                    languages: ['C'],
                },
                {
                    repo: 'without-native',
                },
            ]
            await setupRouteResponses(page, { withRelease, withoutRelease })

            await page.goto('/')
            await page.click('#login-link')
            await page.waitForSelector('#found-repos .repo.cursor')

            const firstSection = page.locator(
                '#found-repos .section:nth-of-type(1)',
            )
            await expect(firstSection.locator('.title')).toHaveText(
                'With released binaries',
            )
            await expect(firstSection.locator('.repo')).toHaveCount(1)
            await expect(firstSection.locator('.repo .name')).toHaveText(
                'with-bins',
            )

            const secondSection = page.locator(
                '#found-repos .section:nth-of-type(2)',
            )
            await expect(secondSection.locator('.title')).toHaveText(
                'Without released binaries',
            )
            await expect(secondSection.locator('.repo')).toHaveCount(1)
            await expect(secondSection.locator('.repo .name')).toHaveText(
                'without-bins',
            )

            const thirdSection = page.locator(
                '#found-repos .section:nth-of-type(3)',
            )
            await expect(thirdSection.locator('.title')).toHaveText(
                'Without any release assets',
            )
            await expect(thirdSection.locator('.repo')).toHaveCount(1)
            await expect(thirdSection.locator('.repo .name')).toHaveText(
                'without-assets',
            )

            const fourthSection = page.locator(
                '#found-repos .section:nth-of-type(4)',
            )
            await expect(fourthSection.locator('.title')).toHaveText(
                'Unreleased',
            )
            await expect(fourthSection.locator('.repo')).toHaveCount(1)
            await expect(fourthSection.locator('.repo .name')).toHaveText(
                'without-release',
            )

            await expect(page.getByText('without-native')).not.toBeVisible()
            await expect(
                page.getByText('without-native-released'),
            ).not.toBeVisible()
        })
    })

    test('show cross platform support', async ({ page }) => {
        const repos: Array<graphData.RepoWithReleaseSpec> = [
            {
                repo: 'cquill',
                languages: ['C'],
                support: {
                    Linux: 'mia',
                    MacOS: 'partial',
                    Windows: 'full',
                },
            },
            {
                repo: 'l3',
                languages: ['C'],
                support: {
                    Linux: 'full',
                    MacOS: 'mia',
                    Windows: 'partial',
                },
            },
            {
                repo: 'maestro',
                languages: ['C'],
                support: {
                    Linux: 'partial',
                    MacOS: 'full',
                    Windows: 'mia',
                },
            },
        ]
        await setupRouteResponses(page, { withRelease: repos })

        await page.goto('/')
        await page.click('#login-link')
        await page.waitForSelector('#found-repos .repo.cursor')

        for (const { repo, support: osSupport } of repos) {
            if (osSupport) {
                for (const [os, support] of Object.entries(osSupport)) {
                    await expect(
                        page.locator(
                            `[data-name="${repo}"] .${os} + .indicator`,
                        ),
                    ).toContainClass(support)
                }
            }
        }
    })

    test.describe('key navigation', () => {
        const KEYS = {
            arrows: {
                left: 'ArrowLeft',
                up: 'ArrowUp',
                down: 'ArrowDown',
                right: 'ArrowRight',
            },
            vim: {
                left: 'H',
                up: 'K',
                down: 'J',
                right: 'L',
            },
        }

        // press a cursor nav key with either arrow or vim keys
        async function pressNavKey(
            page: Page,
            method: 'arrows' | 'vim',
            dir: 'left' | 'up' | 'down' | 'right',
        ) {
            await page.keyboard.press(KEYS[method][dir])
        }

        test.describe('within repo grid', () => {
            test('scrolls repo to center', async ({ page }) => {
                const repos: Array<graphData.RepoWithReleaseSpec> = []
                for (let i = 0; i < 20; i++) {
                    repos.push({
                        repo: 'repo' + String(i).padStart(2, '0'),
                        languages: ['C'],
                        support: {
                            Linux: 'partial',
                        },
                    })
                }
                await setupRouteResponses(page, {
                    withRelease: repos,
                })
                await page.goto('/')
                await page.click('#login-link')
                await page.waitForSelector('#found-repos .repo.cursor')

                await expect(
                    page.locator('.repo:nth-of-type(18)'),
                ).not.toBeInViewport()
                for (let i = 0; i < 8; i++) {
                    await page.keyboard.press('ArrowDown')
                }
                await expect(
                    page.locator('.repo:nth-of-type(1)'),
                ).not.toBeInViewport()
                await expect(
                    page.locator('.repo:nth-of-type(18)'),
                ).toBeInViewport()
            })

            test.describe('left to', () => {
                test('previous in current row', async ({ page }) => {
                    for (const method of ['arrows', 'vim'] as const) {
                        const withRelease: Array<graphData.RepoWithReleaseSpec> =
                            []
                        for (let i = 0; i < 4; i++) {
                            withRelease.push({
                                repo: 'repo' + i,
                                languages: ['C'],
                                support: {
                                    Linux: 'partial',
                                },
                            })
                        }
                        await setupRouteResponses(page, {
                            withRelease,
                        })

                        await page.goto('/')
                        await page.click('#login-link')
                        await page.waitForSelector('#found-repos .repo.cursor')

                        await pressNavKey(page, method, 'right')
                        await expect(
                            page.locator('.repo.cursor .name'),
                        ).toHaveText('repo1')
                        await pressNavKey(page, method, 'left')
                        await expect(
                            page.locator('.repo.cursor .name'),
                        ).toHaveText('repo0')
                    }
                })

                test('last of previous row', async ({ page }) => {
                    for (const method of ['arrows', 'vim'] as const) {
                        const withRelease: Array<graphData.RepoWithReleaseSpec> =
                            []
                        for (let i = 0; i < 4; i++) {
                            withRelease.push({
                                repo: 'repo' + i,
                                languages: ['C'],
                                support: {
                                    Linux: 'partial',
                                },
                            })
                        }
                        await setupRouteResponses(page, {
                            withRelease,
                        })

                        await page.goto('/')
                        await page.click('#login-link')
                        await page.waitForSelector('#found-repos .repo.cursor')

                        await pressNavKey(page, method, 'down')
                        await expect(
                            page.locator('.repo.cursor .name'),
                        ).toHaveText('repo2')
                        await pressNavKey(page, method, 'left')
                        await expect(
                            page.locator('.repo.cursor .name'),
                        ).toHaveText('repo1')
                    }
                })
            })

            test.describe('up to', () => {
                test('above in previous row', async ({ page }) => {
                    for (const method of ['arrows', 'vim'] as const) {
                        const withRelease: Array<graphData.RepoWithReleaseSpec> =
                            []
                        for (let i = 0; i < 4; i++) {
                            withRelease.push({
                                repo: 'repo' + i,
                                languages: ['C'],
                                support: {
                                    Linux: 'partial',
                                },
                            })
                        }
                        await setupRouteResponses(page, {
                            withRelease,
                        })

                        await page.goto('/')
                        await page.click('#login-link')
                        await page.waitForSelector('#found-repos .repo.cursor')

                        await pressNavKey(page, method, 'down')
                        await expect(
                            page.locator('.repo.cursor .name'),
                        ).toHaveText('repo2')
                        await pressNavKey(page, method, 'up')
                        await expect(
                            page.locator('.repo.cursor .name'),
                        ).toHaveText('repo0')
                    }
                })

                test('last of previous row', async ({ page }) => {
                    for (const method of ['arrows', 'vim'] as const) {
                        const withRelease: Array<graphData.RepoWithReleaseSpec> =
                            [
                                {
                                    repo: 'repo0',
                                    languages: ['C'],
                                    support: {
                                        Linux: 'partial',
                                    },
                                },
                            ]
                        for (let i = 1; i < 3; i++) {
                            withRelease.push({
                                repo: 'repo' + i,
                                languages: ['C'],
                            })
                        }
                        await setupRouteResponses(page, {
                            withRelease,
                        })

                        await page.goto('/')
                        await page.click('#login-link')
                        await page.waitForSelector('#found-repos .repo.cursor')

                        await pressNavKey(page, method, 'down')
                        await expect(
                            page.locator('.repo.cursor .name'),
                        ).toHaveText('repo1')
                        await pressNavKey(page, method, 'right')
                        await expect(
                            page.locator('.repo.cursor .name'),
                        ).toHaveText('repo2')
                        await pressNavKey(page, method, 'up')
                        await expect(
                            page.locator('.repo.cursor .name'),
                        ).toHaveText('repo0')
                    }
                })
            })

            test.describe('right to', () => {
                test('next in current row', async ({ page }) => {
                    for (const method of ['arrows', 'vim'] as const) {
                        const withRelease: Array<graphData.RepoWithReleaseSpec> =
                            []
                        for (let i = 0; i < 4; i++) {
                            withRelease.push({
                                repo: 'repo' + i,
                                languages: ['C'],
                                support: {
                                    Linux: 'partial',
                                },
                            })
                        }
                        await setupRouteResponses(page, {
                            withRelease,
                        })

                        await page.goto('/')
                        await page.click('#login-link')
                        await page.waitForSelector('#found-repos .repo.cursor')

                        await pressNavKey(page, method, 'right')
                        await expect(
                            page.locator('.repo.cursor .name'),
                        ).toHaveText('repo1')
                    }
                })

                test('first of next row', async ({ page }) => {
                    for (const method of ['arrows', 'vim'] as const) {
                        const withRelease: Array<graphData.RepoWithReleaseSpec> =
                            []
                        for (let i = 0; i < 4; i++) {
                            withRelease.push({
                                repo: 'repo' + i,
                                languages: ['C'],
                                support: {
                                    Linux: 'partial',
                                },
                            })
                        }
                        await setupRouteResponses(page, {
                            withRelease,
                        })

                        await page.goto('/')
                        await page.click('#login-link')
                        await page.waitForSelector('#found-repos .repo.cursor')

                        await pressNavKey(page, method, 'right')
                        await expect(
                            page.locator('.repo.cursor .name'),
                        ).toHaveText('repo1')
                        await pressNavKey(page, method, 'right')
                        await expect(
                            page.locator('.repo.cursor .name'),
                        ).toHaveText('repo2')
                    }
                })
            })

            test.describe('down to', () => {
                test('below in next row', async ({ page }) => {
                    for (const method of ['arrows', 'vim'] as const) {
                        const withRelease: Array<graphData.RepoWithReleaseSpec> =
                            []
                        for (let i = 0; i < 3; i++) {
                            withRelease.push({
                                repo: 'repo' + i,
                                languages: ['C'],
                                support: {
                                    Linux: 'partial',
                                },
                            })
                        }
                        await setupRouteResponses(page, {
                            withRelease,
                        })

                        await page.goto('/')
                        await page.click('#login-link')
                        await page.waitForSelector('#found-repos .repo.cursor')

                        await pressNavKey(page, method, 'down')
                        await expect(
                            page.locator('.repo.cursor .name'),
                        ).toHaveText('repo2')
                    }
                })

                test.describe('shorter next row', () => {
                    test('moves to last of next row', async ({ page }) => {
                        for (const method of ['arrows', 'vim'] as const) {
                            const withRelease: Array<graphData.RepoWithReleaseSpec> =
                                []
                            for (let i = 0; i < 3; i++) {
                                withRelease.push({
                                    repo: 'repo' + i,
                                    languages: ['C'],
                                    support: {
                                        Linux: 'partial',
                                    },
                                })
                            }
                            await setupRouteResponses(page, {
                                withRelease,
                            })

                            await page.goto('/')
                            await page.click('#login-link')
                            await page.waitForSelector(
                                '#found-repos .repo.cursor',
                            )

                            await pressNavKey(page, method, 'right')
                            await expect(
                                page.locator('.repo.cursor .name'),
                            ).toHaveText('repo1')
                            await pressNavKey(page, method, 'down')
                            await expect(
                                page.locator('.repo.cursor .name'),
                            ).toHaveText('repo2')
                        }
                    })
                })
            })
        })
    })
})

// setup all the api requests needed for search page
async function setupRouteResponses(
    page: Page,
    repos: graphData.ViewerReposSpec,
) {
    await new RouteResponses()
        .POST({
            fulfill: {
                json: graphData.repositories(repos),
            },
            predicate(req) {
                return req.postDataJSON().query.startsWith('query ViewerRepos(')
            },
        })
        .POST({
            fulfill: {
                json: graphData.latestRelease(),
            },
            predicate(req) {
                return req
                    .postDataJSON()
                    .query.startsWith('query RepoLatestRelease(')
            },
        })
        .POST({
            fulfill: {
                json: graphData.userId(),
            },
            predicate(req) {
                return req.postDataJSON().query.startsWith('query UserId(')
            },
        })
        .configure(page, 'https://api.github.com/graphql')
    await new RouteResponses()
        .GET({
            fulfill: {
                status: 302,
                headers: {
                    Location: 'http://localhost:5711/search',
                    'Set-Cookie': 'ght=ght; Secure; SameSite=Strict; Path=/',
                },
            },
            predicate: () => true,
        })
        .configure(page, 'http://localhost:5711/login/github/redirect')
    // await new RouteResponses()
    //     .GET({
    //         fulfill: await githubCdn.userAvatar(),
    //         predicate: () => true,
    //     })
    //     .configure(page, 'https://avatars.githubusercontent.com/u/*?*')
}
