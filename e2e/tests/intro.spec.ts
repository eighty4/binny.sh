import { expect, test } from '@playwright/test'

// all other tests fast forward animation sequence
// here we test the app starts after animation completes normally
test.skip('animation completes and shows login button', async ({ page }) => {
    await page.goto('/?intro=1')
    await expect(page.locator('#login')).toBeVisible({
        timeout: 1000 * 15,
    })
})
