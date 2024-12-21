import {expect, test} from '@playwright/test'

test('cancel login', async ({page}) => {
    await page.goto('/')
    await page.click('#login')
    await page.waitForSelector('#login-cancel')
    await page.click('#login-cancel')
    expect(await page.locator('html.out').count()).toBe(0)
})

test('login to #search route', async ({page}) => {
    await page.goto('/')
    await page.click('#login')
    await page.waitForSelector('#login-redirect')
    await page.click('#login-redirect')
    await page.waitForSelector('#graph-paper')
    await page.waitForSelector('.repos')
})

test('logout navigates to /', async ({page}) => {
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
