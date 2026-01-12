import { queryGraphApi } from './_doGraphQuery.ts'

const q = `query UserId($login:String!){user(login:$login){databaseId avatarUrl}}`

type UserIdVars = {
    login: string
}

type UserIdGraph = {
    user: {
        databaseId: number
    }
}

export async function getUserId(
    ghToken: string,
    login: string,
): Promise<number> {
    const result = await queryGraphApi<UserIdVars, UserIdGraph>(ghToken, q, {
        login,
    })
    return result.data.user.databaseId
}
