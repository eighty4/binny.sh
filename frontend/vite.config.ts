import * as fs from 'node:fs'
import { type ConfigEnv, defineConfig, loadEnv, type ProxyOptions } from 'vite'
import inlining from 'vite-plugin-html-inline-sources'

export default defineConfig((env: ConfigEnv) => {
    checkEnvVarsAreSet(env)
    return {
        build: {
            emptyOutDir: true,
            manifest: false,
            outDir: 'dist',
            rollupOptions: {
                input: {
                    binny: 'index.html',
                    launch: 'launch/init.ts',
                    app: 'src/app.ts',
                },
            },
        },
        esbuild: {
            supported: {
                'top-level-await': true,
            },
        },
        plugins: [inlining()],
        server: {
            port: 5711,
            proxy: buildProxyConfig(env.mode),
        },
    }
})

function checkEnvVarsAreSet(env: ConfigEnv): undefined | never {
    if (env.mode === 'offline' || env.isPreview) {
        return
    }
    const { VITE_GITHUB_CLIENT_ID } = loadEnv(env.mode, process.cwd())
    if (!VITE_GITHUB_CLIENT_ID?.length) {
        console.error(
            'Binny.sh requires a `VITE_GITHUB_CLIENT_ID` environment variable for running Vite in dev or build modes.',
        )
        console.error(
            `Try \`VITE_GITHUB_CLIENT_ID=my_client_id pnpm build\` or creating a \`.env.${env.mode}\` file.`,
        )
        process.exit(1)
    }
}

function buildProxyConfig(
    mode: string,
): Record<string, string | ProxyOptions> | undefined {
    switch (mode) {
        case 'production':
            return
        case 'offline':
            return {
                '/offline': 'http://localhost:7411',
            }
        default:
            return {
                '/login': `https://${getApiGatewayApiId()}.execute-api.us-east-2.amazonaws.com/development`,
            }
    }
}

function getApiGatewayApiId(): string | never {
    try {
        return fs.readFileSync('../lambdas/.l3/aws/api').toString().trim()
    } catch (e) {
        console.error(
            'Unable to read Amazon Gateway API id from `//lambdas/.l3/aws/api`.',
        )
        console.error(
            `Run \`l3 sync\` from \`//lambdas\` before running the Binny.sh frontend development Vite server.`,
        )
        console.error(
            'There is more information about local development in `//README.md`.',
        )
        process.exit(1)
    }
}
