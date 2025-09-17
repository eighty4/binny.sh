import { Unauthorized } from '@eighty4/binny-github'
import type { GeneratedScript } from '@eighty4/binny-template'
import { gitHubTokenCache } from './session/sessionCache.ts'

const GEN_SCRIPTS_URL =
    import.meta.env.VITE_BINNY_API_BASE_URL + '/generated-scripts'

export async function saveGeneratedScript(
    generatedScript: GeneratedScript,
): Promise<void> {
    const authToken = gitHubTokenCache.read()
    const response = await fetch(GEN_SCRIPTS_URL, {
        method: 'POST',
        headers: {
            authorization: 'Bearer ' + authToken,
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            repository: {
                owner: generatedScript.repository.owner,
                name: generatedScript.repository.name,
            },
            spec: generatedScript.spec,
            templateVersion: generatedScript.templateVersion,
        }),
    })
    if (response.status !== 201) {
        switch (response.status) {
            case 401:
                throw new Unauthorized()
            default:
                throw new Error('blah blah blah')
        }
    }
}

export async function fetchGeneratedScripts(): Promise<Array<GeneratedScript>> {
    const authToken = gitHubTokenCache.read()
    const response = await fetch(GEN_SCRIPTS_URL, {
        method: 'GET',
        headers: {
            authorization: 'Bearer ' + authToken,
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

export async function fetchGeneratedScriptsKeyedByRepo(): Promise<
    Record<string, GeneratedScript>
> {
    const generatedScripts = await fetchGeneratedScripts()
    const result: Record<string, GeneratedScript> = {}
    for (const generatedScript of generatedScripts) {
        result[
            `${generatedScript.repository.owner}/${generatedScript.repository.name}`
        ] = generatedScript
    }
    return result
}
