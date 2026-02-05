import { queryGraphApi } from './_doGraphQuery.ts'
import type { ViewerUserGraph } from './_graphApiTypes.ts'
import type { User } from '../model.ts'

const q = `query{viewer{login id avatarUrl}}`

export async function getViewerData(ghToken: string): Promise<User> {
    const result = await queryGraphApi<null, ViewerUserGraph>(ghToken, q)
    return {
        login: result.data.viewer.login,
        id: result.data.viewer.id,
        avatarUrl: result.data.viewer.avatarUrl,
    }
}
