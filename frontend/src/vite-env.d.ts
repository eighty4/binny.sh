/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GITHUB_CLIENT_ID: string
    readonly VITE_GITHUB_OAUTH_ADDRESS: string
    readonly VITE_BINNY_API_BASE_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
