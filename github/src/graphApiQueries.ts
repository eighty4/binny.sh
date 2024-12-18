/**
 * GraphQL API Explorer
 * https://docs.github.com/en/graphql/overview/explorer
 */

export const queryAuthedUser = `
query {
  viewer {
    login
    id
    avatarUrl
  }
}`

export const queryRepositoryReleases = (owner: string, name: string, releaseCount: number) => `
query {
  repository(owner: "${owner}", name: "${name}") {
    releases(first: ${releaseCount}, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes {
        isLatest
        isDraft
        isPrerelease
        name
        createdAt
        tagCommit {
          abbreviatedOid
        }
        tagName
        updatedAt
        url
        releaseAssets(first: 99) {
          nodes {
            name
            contentType
          }
        }
      }
    }
  }
}`

export const queryLatestRelease = (owner: string, name: string) => `
query {
  repository(owner: "${owner}", name: "${name}") {
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

export const queryUserRepositories = (reposPerPage: number, cursor?: string) => `
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
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}`
