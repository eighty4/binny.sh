import { defineConfig } from '@eighty4/dank'

export default defineConfig({
    pages: {
        '/': './landing/Landing.html',
        '/configure': {
            pattern:
                /^\/configure\/[a-z\d][a-z\d-_]{0,37}[a-z\d]?\/[a-z\d._][a-z\d-._]{0,38}[a-z\d._]?$/,
            webpage: './configure/Configure.html',
        },
        '/guide': './guide/Guide.html',
        '/search': './search/Search.html',
    },
    esbuild: {
        loaders: {
            '.html': 'text',
            '.woff': 'file',
            '.woff2': 'file',
        },
    },
    port: 5711,
    previewPort: 5741,
    services: [
        {
            command: 'pnpm dev',
            cwd: 'lambdas',
            http: {
                port: 7411,
            },
        },
    ],
})
