import { Unauthorized } from '../responses.ts'

export async function queryGraphApi<V, R>(
    ghToken: string,
    query: string,
    variables?: V | null,
    signal?: AbortSignal,
): Promise<{ data: R }> {
    const body = JSON.stringify(variables ? { query, variables } : { query })
    const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + ghToken,
            'Content-Type': 'application/json',
        },
        body,
        signal,
    })
    if (response.status !== 200) {
        switch (response.status) {
            case 401:
                throw new Unauthorized()
            default:
                throw Error(
                    `unexpected gh graphql error status: ${response.status}`,
                )
        }
    }
    const result = await response.json()
    if (!result.data) {
        throw Error(
            `unexpected gh graphql error response: ${JSON.stringify(result, null, 4)}`,
        )
    }
    return result
}
