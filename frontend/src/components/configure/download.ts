export function downloadScript(filename: string, content: string) {
    try {
        downloadBlob(filename, content)
    } catch (e: any) {
        // todo observability
        document.body.style.background = 'orangered'
        console.error('script template error', e.message)
    }
}

function downloadBlob(filename: string, content: string) {
    downloadFile(filename, URL.createObjectURL(new Blob([content], {type: 'text/plain'})))
}

// todo evaluate downloadBlob vs downloadText methods
// function downloadText(filename: string, content: string) {
//     downloadFile(filename, 'data:text/plain;charset=utf-8,' + encodeURIComponent(content))
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
