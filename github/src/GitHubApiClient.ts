import type {Repository} from './Model.js'
import {mapReleaseNode, RepositoryReleasesGraph, ViewerRepositoriesWithLatestReleaseGraph} from './graphApiTypes.js'

export * from './Model.js'

export type PageUserRepositoriesCallback = (repos: Array<Repository>, complete: boolean) => void

interface QueryUserRepositoriesResponse {
    repositories: Array<Repository>
    endCursor: string
    hasNextPage: boolean
}

export class GitHubApiClient {
    constructor(private readonly ghAccessToken: string,
                private readonly ghGraphApiUrl: string = 'https://api.github.com/graphql') {
    }

    async collectUserRepositories(): Promise<Array<Repository>> {
        const result: Array<Repository> = []
        let hasNextPage = true
        let nextCursor: string | undefined = undefined
        do {
            const response = await this.internalQueryUserRepositories(40, nextCursor)
            hasNextPage = response.hasNextPage
            nextCursor = response.endCursor
            result.push(...response.repositories)
        } while (hasNextPage)
        result.sort((a, b) => {
            if (!!a.latestRelease) {
                return -1
            } else {
                return 1
            }
        })
        return result
    }

    async queryLatestRelease(repoOwner: string, repoName: string): Promise<Repository> {
        const result = await this.internalDoGraphApiQuery<RepositoryReleasesGraph>(`
query {
  repository(owner: "${repoOwner}", name: "${repoName}") {
    releases(first: 1, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes {
        createdAt
        tagCommit {
          abbreviatedOid
        }
        tagName
        updatedAt
        url
        releaseAssets(first: 100) {
          nodes {
            name
            contentType
          }
        }
      }
    }
  }
}`)
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
            latestRelease: mapReleaseNode(releases.nodes[0]),
        }
    }

    pageUserRepositories(reposPerPage: number, callback: PageUserRepositoriesCallback): void {
        this.internalPageUserRepositories(reposPerPage, callback).then().catch(console.error)
    }

    private async internalPageUserRepositories(reposPerPage: number, callback: PageUserRepositoriesCallback): Promise<void> {
        let hasNextPage = true
        let nextCursor: string | undefined = undefined
        do {
            const response = await this.internalQueryUserRepositories(reposPerPage, nextCursor)
            hasNextPage = response.hasNextPage
            nextCursor = response.endCursor
            callback(response.repositories, !hasNextPage)
        } while (hasNextPage)
    }

    private async internalQueryUserRepositories(reposPerPage: number, cursor?: string): Promise<QueryUserRepositoriesResponse> {
        const result = await this.internalDoGraphApiQuery<ViewerRepositoriesWithLatestReleaseGraph>(`
{
  viewer {
    repositories(
      first: ${reposPerPage}, after: ${cursor ? `"${cursor}"` : 'null'},
      affiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER]
    ) {
      nodes {
        ... on Repository {
          name
          owner {
            login
          }
          releases(first: 1, orderBy: {field: CREATED_AT, direction: DESC}) {
            nodes {
              createdAt
              tagCommit {
                abbreviatedOid
              }
              tagName
              updatedAt
              url
              releaseAssets(first: 100) {
                nodes {
                  name
                  contentType
                }
              }
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}`)
        const repositories: Array<Repository> = []
        for (const repo of result.data.viewer.repositories.nodes) {
            repositories.push({
                owner: repo.owner.login,
                name: repo.name,
                latestRelease: repo.releases.nodes.length ? mapReleaseNode(repo.releases.nodes[0]) : undefined,
            })
        }
        const {endCursor, hasNextPage} = result.data.viewer.repositories.pageInfo
        return {repositories, hasNextPage, endCursor}
    }

    private async internalDoGraphApiQuery<T>(query: string): Promise<{ data: T }> {
        const response = await fetch(this.ghGraphApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + this.ghAccessToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({query}),
        })
        if (response.status !== 200) {
            throw new Error('internalDoGraphApiQuery status code ' + response.status)
        }
        const result = await response.json()
        if (!result.data) {
            console.error('internalDoGraphApiQuery response', JSON.stringify(result, null, 4))
            throw new Error('internalDoGraphApiQuery wtf')
        }
        console.log('internalDoGraphApiQuery', result)
        return result
    }
}
