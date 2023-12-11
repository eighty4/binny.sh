import type {Repository} from '@eighty4/install-github'

export interface GeneratedScript {
    repository: Repository
    templateVersion: string
}

// response of GET /api/projects
export interface GeneratedScriptsResponse {
    generatedScripts: Array<GeneratedScript>
    templateVersion: string
}

// request of POST /api/project/script
export interface GeneratedScriptRequest {
    generatedScript: GeneratedScript
}
