import { queryGraphApi } from './_doGraphQuery.ts'
import {
    mapLanguageNodes,
    mapReleaseNode,
    type RepositoryReleasesGraph,
} from './_graphApiTypes.ts'
import type { RepositoryId } from '../model.ts'

export async function getLatestRepoReleaseData(
    ghToken: string,
    repo: RepositoryId,
    signal: AbortSignal,
) {
    const result = await queryGraphApi<RepositoryId, RepositoryReleasesGraph>(
        ghToken,
        q,
        repo,
        signal,
    )
    if (result.data.repository === null) {
        throw new Error(`${repo.owner}/${repo.name} not found`)
    }
    const releases = result.data.repository.releases
    if (releases.nodes.length === 0) {
        throw new Error(`${repo.owner}/${repo.name} has no releases`)
    }
    return {
        ...repo,
        languages: mapLanguageNodes(result.data.repository.languages.nodes),
        latestRelease: mapReleaseNode(releases.nodes[0]),
    }
}

const q = `\
query RepoLatestRelease($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    languages(first: 5) {
      nodes {
        name
      }
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
}`
