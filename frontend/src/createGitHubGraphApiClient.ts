import {GitHubApiClient} from '@eighty4/install-github'
import {gitHubTokenCache} from './session/sessionCache.ts'

export default function (): GitHubApiClient {
    const accessToken = gitHubTokenCache.read() as string
    const maybeUrl = import.meta.env.VITE_GITHUB_GRAPH_ADDRESS
    const url = maybeUrl.length ? maybeUrl : undefined
    return new GitHubApiClient(accessToken, url)
}
