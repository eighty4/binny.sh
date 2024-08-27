import {generateScript, type GenerateScriptOptions} from '@eighty4/install-template'

export function downloadScript(options: GenerateScriptOptions) {
    try {
        downloadBlob(generateScript(options).script)
    } catch (e: any) {
        // todo observability
        document.body.style.background = 'orangered'
        console.error('script template error', e.message)
    }
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
