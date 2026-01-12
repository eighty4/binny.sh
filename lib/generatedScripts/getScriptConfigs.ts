import type { GeneratedScript } from '@binny.sh/template'
import { Unauthorized } from 'Binny.sh/github/responses'

export async function fetchGeneratedScripts(
    ghToken: string,
): Promise<Array<GeneratedScript>> {
    const response = await fetch('/generated-scripts', {
        method: 'GET',
        headers: {
            authorization: 'Bearer ' + ghToken,
        },
    })
    if (response.status !== 200) {
        switch (response.status) {
            case 401:
                throw new Unauthorized()
            default:
                throw new Error('blah blah blah')
        }
    }
    return response.json()
}
