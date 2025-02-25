import {
    mapLanguageNodes,
    mapReleaseNode,
    type RepositoryReleasesGraph,
    type ViewerRepositoriesWithLatestReleaseGraph,
    type ViewerUserGraph,
} from './graphApiTypes.js'
import {
    fetchUserQuery,
    queryLatestReleaseQuery,
    queryUserRepositoriesQuery,
} from './graphApiQueries.js'
import type { Repository, User } from './Model.js'

export * from './Model.js'

interface QueryUserRepositoriesResponse {
    repositories: Array<Repository>
    endCursor: string
    hasNextPage: boolean
}

export class Unauthorized {}

export class GitHubApiClient {
    constructor(
        private readonly ghAccessToken: string,
        private readonly ghGraphApiUrl: string = 'https://api.github.com/graphql',
    ) {}

    async queryUser(): Promise<User> {
        const result =
            await this.internalDoGraphApiQuery<ViewerUserGraph>(fetchUserQuery)
        return {
            login: result.data.viewer.login,
            // email: result.data.viewer.email.length ? result.data.viewer.email : undefined,
            id: result.data.viewer.id,
            avatarUrl: result.data.viewer.avatarUrl,
        }
    }

    async collectUserRepositories(): Promise<Array<Repository>> {
        const result: Array<Repository> = []
        let hasNextPage = true
        let nextCursor: string | undefined = undefined
        do {
            const response = await this.internalQueryUserRepositories(
                40,
                nextCursor,
            )
            hasNextPage = response.hasNextPage
            nextCursor = response.endCursor
            result.push(...response.repositories)
        } while (hasNextPage)
        return result
    }

    async queryLatestRelease(
        repoOwner: string,
        repoName: string,
    ): Promise<Repository> {
        const result =
            await this.internalDoGraphApiQuery<RepositoryReleasesGraph>(
                queryLatestReleaseQuery(repoOwner, repoName),
            )
        if (result.data.repository === null) {
            throw new Error(`${repoOwner}/${repoName} not found`)
        }
        const releases = result.data.repository.releases
        if (releases.nodes.length === 0) {
            throw new Error(`${repoOwner}/${repoName} has no releases`)
        }
        return {
            owner: repoOwner,
            name: repoName,
            languages: mapLanguageNodes(result.data.repository.languages.nodes),
            latestRelease: mapReleaseNode(releases.nodes[0]),
        }
    }

    private async internalQueryUserRepositories(
        reposPerPage: number,
        cursor?: string,
    ): Promise<QueryUserRepositoriesResponse> {
        const result =
            await this.internalDoGraphApiQuery<ViewerRepositoriesWithLatestReleaseGraph>(
                queryUserRepositoriesQuery(reposPerPage, cursor),
            )
        const repositories: Array<Repository> = []
        for (const repo of result.data.viewer.repositories.nodes) {
            repositories.push({
                owner: repo.owner.login,
                name: repo.name,
                languages: mapLanguageNodes(repo.languages.nodes),
                latestRelease: repo.releases.nodes.length
                    ? mapReleaseNode(repo.releases.nodes[0])
                    : undefined,
            })
        }
        const { endCursor, hasNextPage } =
            result.data.viewer.repositories.pageInfo
        return { repositories, hasNextPage, endCursor }
    }

    private async internalDoGraphApiQuery<T>(
        query: string,
    ): Promise<{ data: T }> {
        const response = await fetch(this.ghGraphApiUrl, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + this.ghAccessToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        })
        if (response.status !== 200) {
            switch (response.status) {
                case 401:
                    throw new Unauthorized()
                default:
                    throw new Error(
                        'internalDoGraphApiQuery bad gh graphql status code: ' +
                            response.status,
                    )
            }
        }
        const result = await response.json()
        if (!result.data) {
            console.error(
                'internalDoGraphApiQuery response',
                JSON.stringify(result, null, 4),
            )
            throw new Error('internalDoGraphApiQuery bad gh graphql response')
        }
        console.log('internalDoGraphApiQuery', result)
        return result
    }
}
