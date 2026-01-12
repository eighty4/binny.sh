import {
    defineConfig,
    devices,
    type PlaywrightTestConfig,
} from '@playwright/test'

// https://playwright.dev/docs/test-configuration

const isCI = process.env.CI === 'true'

export default defineConfig({
    outputDir: '.playwright/test-results',
    reporter: [['html', { outputFolder: '.playwright/report' }]],
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: isCI,
    retries: isCI ? 2 : 0,
    workers: isCI ? 1 : undefined,
    use: {
        baseURL: 'http://localhost:5711',
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
    ],
    webServer: {
        name: 'website',
        command: 'pnpm dev',
        port: 5711,
        reuseExistingServer: !isCI,
    },
})
