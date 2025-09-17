import { expect, test } from '@playwright/test'
import * as graphData from './responses/graphData.js'
import { RouteResponses } from './responses/RouteResponses.js'

test('#search to #configure/eighty4/maestro', async ({ page }) => {
    await new RouteResponses()
        .POST({
            fulfill: {
                json: graphData.user(),
            },
        })
        .POST({
            fulfill: {
                json: graphData.user(),
            },
        })
        .POST({
            fulfill: {
                json: graphData.repositories(),
            },
        })
        .configure(page, 'https://api.github.com/graphql')
    await new RouteResponses()
        .GET({
            fulfill: {
                status: 301,
                headers: {
                    Location: 'http://localhost:5711?login',
                    'Set-Cookie': 'ght=ght; Secure; SameSite=Strict; Path=/',
                },
            },
        })
        .configure(page, 'http://localhost:5711/api/login/github/redirect')
    await new RouteResponses()
        .GET({
            fulfill: {
                json: [],
            },
        })
        .configure(page, 'http://localhost:5711/api/generated-scripts')

    await page.goto('/')
    await page.click('#login')
    await page.waitForSelector('#login-redirect')
    await page.click('#login-redirect')
    await page.waitForSelector('#graph-paper')
    await page.waitForSelector('.repos')
    await page.getByText('eighty4/l3').click()
    await expect(page.getByText('MacOS & Linux')).toBeVisible()
    await expect(page.getByText('MacOS & Linux')).toBeEnabled()
})
