export const fetchUserQuery = `
query {
  viewer {
    login
    id
    avatarUrl
  }
}`

export const queryLatestReleaseQuery = (owner: string, name: string) => `
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

export const queryUserRepositoriesQuery = (
    reposPerPage: number,
    cursor?: string,
) => `
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
