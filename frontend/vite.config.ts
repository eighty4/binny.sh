import * as fs from 'node:fs'
import {type ConfigEnv, defineConfig, type ProxyOptions} from 'vite'

export default defineConfig((env: ConfigEnv) => {
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

function buildProxyConfig(mode: string): Record<string, string | ProxyOptions> {
    if (mode === 'offline') {
        return {
            '/api': 'http://localhost:7411',
            '/login': 'http://localhost:7411',
            '/offline': 'http://localhost:7411',
        }
    } else {
        return {
            // '/api': 'http://localhost:5741',
            '/login': `https://${getApiGatewayApiId()}.execute-api.us-east-2.amazonaws.com/development`,
        }
    }
}

function getApiGatewayApiId(): string {
    return fs.readFileSync('../lambdas/.l3/aws/api').toString().trim()
}
