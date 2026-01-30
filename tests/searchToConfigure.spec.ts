import { expect, test } from '@playwright/test'
import * as githubCdn from './responses/githubCdn.ts'
import * as graphData from './responses/graphData.ts'
import { RouteResponses } from './responses/RouteResponses.ts'

test('/search to /configure/{owner}/{name}', async ({ page }) => {
    await new RouteResponses()
        .POST({
            fulfill: {
                json: graphData.repositories(),
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
    await new RouteResponses()
        .GET({
            fulfill: {
                json: [],
            },
            predicate: () => true,
        })
        .configure(page, 'http://localhost:5711/generated-scripts')
    await new RouteResponses()
        .GET({
            fulfill: await githubCdn.userAvatar(),
            predicate: () => true,
        })
        .configure(page, 'https://avatars.githubusercontent.com/u/*?*')

    await page.goto('/')
    await page.click('#login-link')
    await page.waitForSelector('#found-repos')
    await page.getByText('eighty4/l3').click()
    await page.waitForURL('/configure/eighty4/l3')
    await expect(page.locator('release-header')).toHaveText('l3 / eighty4')
})
