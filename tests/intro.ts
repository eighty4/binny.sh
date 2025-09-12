import type { Page } from '@playwright/test'

export async function skipAnimation(page: Page) {
    await page.locator('#skip-animation').click()
}
