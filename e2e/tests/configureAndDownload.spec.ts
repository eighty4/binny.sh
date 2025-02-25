import { readFileSync } from 'node:fs'
import { type Download, expect, test } from '@playwright/test'

test('#configure/eighty4/maestro download script ', async ({ page }) => {
    await page.goto('/')
    await page.click('#login')
    await page.waitForSelector('#login-redirect')
    await page.click('#login-redirect')
    await page.waitForSelector('#graph-paper')
    await page.waitForSelector('.repos')
    await page.getByText('eighty4/maestro').click()

    await expect(page.getByText('MacOS & Linux')).toBeVisible()
    await expect(page.getByText('MacOS & Linux')).toBeEnabled()

    await new Promise((res, rej) => {
        page.on('download', download =>
            verifyScript(download, 'install_maestro.sh').then(res).catch(rej),
        )
        page.getByText('MacOS & Linux').click().then().catch(rej)
    })

    // todo verify #search shows download scripts as its own feature test
    await page.goto('/#search')
    await expect(page.getByText('Your release scripts')).toBeVisible()
})

async function verifyScript(download: Download, filename: string) {
    expect(download.suggestedFilename()).toBe(filename)
    expect(
        readFileSync(await download.path())
            .toString()
            .startsWith(SCRIPT_HEADER),
    ).toBe(true)
}

const SCRIPT_HEADER = `#!/usr/bin/env sh
set -e

# Created by npm package @eighty4/install-template@`
