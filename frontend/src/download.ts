import type {GeneratedScript, GeneratedScriptRequest} from '@eighty4/install-contract'
import {generateScript, type GenerateScriptOptions} from '@eighty4/install-template'

export function downloadScript(options: GenerateScriptOptions) {
    try {
        downloadBlob(generateScript(options))
    } catch (e: any) {
        // todo observability
        document.body.style.background = 'orangered'
        console.error('script template error', e.message)
        return
    }
    saveTemplateVersion({
        repository: {
            owner: options.repository.owner,
            name: options.repository.name,
        },
        templateVersion: import.meta.env.VITE_SCRIPT_TEMPLATE_VERSION,
    }).then()
}

function downloadBlob(text: string) {
    downloadFile('install.sh', URL.createObjectURL(new Blob([text], {type: 'text/plain'})))
}

// todo evaluate downloadBlob vs downloadText methods
// function downloadText(text: string) {
//     downloadFile('install.sh', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
// }

function downloadFile(filename: string, href: string) {
    const link = document.createElement('a') as HTMLAnchorElement
    link.download = filename
    link.href = href
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

async function saveTemplateVersion(generatedScript: GeneratedScript): Promise<void> {
    const request: GeneratedScriptRequest = {generatedScript}
    const response = await fetch('/api/project/script', {
        headers: {
            'content-type': 'application/json',
        },
        method: 'post',
        body: JSON.stringify(request)
    })
    if (response.status === 200) {
        return
    } else if (response.status === 401) {
        // todo redirect to login
        document.body.style.background = 'orangered'
        console.error('login access token has expired')
    } else {
        document.body.style.background = 'orangered'
        console.error(`/api/project/script returned an unexpected ${response.status} status`)
    }
    throw new Error('/api/projects ' + response.status)
}
