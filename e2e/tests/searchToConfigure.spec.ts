import { expect, test } from '@playwright/test'

test('#search to #configure/eighty4/maestro', async ({ page }) => {
    await page.goto('/')
    await page.click('#login')
    await page.waitForSelector('#login-redirect')
    await page.click('#login-redirect')
    await page.waitForSelector('#graph-paper')
    await page.waitForSelector('.repos')
    await page.getByText('eighty4/maestro').click()
    await expect(page.getByText('MacOS & Linux')).toBeVisible()
    await expect(page.getByText('MacOS & Linux')).toBeEnabled()
})
