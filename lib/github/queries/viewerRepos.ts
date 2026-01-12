import { queryGraphApi } from './_doGraphQuery.ts'
import {
    mapLanguageNodes,
    mapReleaseNode,
    type ViewerRepositoriesWithLatestReleaseGraph,
} from './_graphApiTypes.ts'
import type { Repository } from '../model.ts'

type QueryResponse = {
    repoTotalCount: number
    repositories: Array<Repository>
    endCursor: string
    hasNextPage: boolean
}

type QueryVariables = {
    after: string | null
    perPage: number
}

export async function collectViewerRepos(
    ghToken: string,
    opts?: {
        onPage?: (completed: number, total: number) => void
        signal?: AbortSignal
    },
): Promise<Array<Repository>> {
    const REPOS_PER_PAGE = 40
    const result: Array<Repository> = []
    let hasNextPage = true
    let nextCursor: string | null = null
    let completed = 0
    do {
        const response = await internalQueryUserRepositories(
            ghToken,
            REPOS_PER_PAGE,
            nextCursor,
            opts?.signal,
        )
        hasNextPage = response.hasNextPage
        nextCursor = response.endCursor
        result.push(...response.repositories)
        if (opts?.onPage) {
            opts.onPage(
                ++completed,
                Math.ceil(response.repoTotalCount / REPOS_PER_PAGE),
            )
        }
    } while (hasNextPage)
    return result
}

async function internalQueryUserRepositories(
    ghToken: string,
    reposPerPage: number,
    cursor: string | null,
    signal?: AbortSignal,
): Promise<QueryResponse> {
    const result = await queryGraphApi<
        QueryVariables,
        ViewerRepositoriesWithLatestReleaseGraph
    >(
        ghToken,
        q,
        {
            perPage: reposPerPage,
            after: cursor || null,
        },
        signal,
    )
    const repositories: Array<Repository> = []
    for (const repo of result.data.viewer.repositories.nodes) {
        repositories.push({
            owner: repo.owner.login,
            name: repo.name,
            languages: mapLanguageNodes(repo.languages.nodes),
            latestRelease: repo.latestRelease
                ? mapReleaseNode(repo.latestRelease)
                : undefined,
        })
    }
    const { endCursor, hasNextPage } = result.data.viewer.repositories.pageInfo
    return {
        repoTotalCount: result.data.viewer.repositories.totalCount,
        repositories,
        hasNextPage,
        endCursor,
    }
}

const q = `\
query ViewerRepos($after: String, $perPage: Int!) {
  viewer {
    repositories(
      after: $after,
      first: $perPage,
      affiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER]
    ) {
      totalCount
      nodes {
        ... on Repository {
          name
          owner {
            login
          }
          languages(first: 5) {
            nodes {
              name
            }
          }
          latestRelease {
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
              pageInfo {
                endCursor
                hasNextPage
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
}`
