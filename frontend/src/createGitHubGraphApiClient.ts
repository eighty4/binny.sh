import {GitHubApiClient} from '@eighty4/install-github'

export default function (): GitHubApiClient {
    const accessToken = sessionStorage.getItem('ght') as string
    const maybeUrl = import.meta.env.VITE_GITHUB_GRAPH_ADDRESS
    const url = maybeUrl.length ? maybeUrl : undefined
    return new GitHubApiClient(accessToken, url)
}
