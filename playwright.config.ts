import {
    defineConfig,
    devices,
    type PlaywrightTestConfig,
} from '@playwright/test'

// https://playwright.dev/docs/test-configuration

const isCI = process.env.CI === 'true'

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: isCI,
    retries: isCI ? 2 : 0,
    workers: isCI ? 1 : undefined,
    reporter: 'html',
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
    webServer: createWebServerConfig(),
})

function createWebServerConfig(): PlaywrightTestConfig['webServer'] {
    return [
        {
            name: 'frontend',
            command: 'pnpm dev',
            cwd: 'frontend',
            port: 5711,
            reuseExistingServer: !isCI,
        },
        {
            name: 'lambdas',
            command: 'pnpm dev',
            cwd: 'lambdas',
            port: 7411,
            reuseExistingServer: !isCI,
        },
    ]
}
