import * as fs from 'node:fs'
import {type ConfigEnv, defineConfig, loadEnv, type ProxyOptions} from 'vite'

export default defineConfig((env: ConfigEnv) => {
    checkEnvVarsAreSet(env.mode)
    return {
        build: {
            emptyOutDir: true,
            manifest: false,
            outDir: 'dist',
        },
        server: {
            port: 5711,
            proxy: buildProxyConfig(env.mode),
        },
    }
})

function checkEnvVarsAreSet(mode: string): undefined | never {
    if (mode === 'offline') {
        return
    }
    const {VITE_GITHUB_CLIENT_ID} = loadEnv(mode, process.cwd())
    if (!VITE_GITHUB_CLIENT_ID || !VITE_GITHUB_CLIENT_ID.length) {
        console.error('Install.sh requires a `VITE_GITHUB_CLIENT_ID` environment variable for running Vite in dev or build modes.')
        console.error('Try `VITE_GITHUB_CLIENT_ID=my_client_id pnpm build` or creating a `.env.development` file.')
        process.exit(1)
    }
}

function buildProxyConfig(mode: string): Record<string, string | ProxyOptions> | undefined {
    switch (mode) {
        case 'production':
            return
        case 'offline':
            return {
                '/api': 'http://localhost:7411',
                '/login': 'http://localhost:7411',
                '/offline': 'http://localhost:7411',
            }
        default:
            return {
                // '/api': 'http://localhost:5741',
                '/login': `https://${getApiGatewayApiId()}.execute-api.us-east-2.amazonaws.com/development`,
            }
    }
}

function getApiGatewayApiId(): string | never {
    try {
        return fs.readFileSync('../lambdas/.l3/aws/api').toString().trim()
    } catch (e) {
        console.error('Unable to read Amazon Gateway API id from `//lambdas/.l3/aws/api`.')
        console.error(`Run \`l3 sync\` from \`//lambdas\` before running the Install.sh frontend development Vite server.`)
        console.error('There is more information about local development in `//README.md`.')
        process.exit(1)
    }
}
