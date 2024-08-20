// import type {GeneratedScript, GeneratedScriptRequest} from '@eighty4/install-contract'

// saveTemplateVersion({
//     repository: {
//         owner: options.repository.owner,
//         name: options.repository.name,
//     },
//     templateVersion: import.meta.env.VITE_SCRIPT_TEMPLATE_VERSION,
// }).then()

// async function saveTemplateVersion(generatedScript: GeneratedScript): Promise<void> {
//     const request: GeneratedScriptRequest = {generatedScript}
//     const response = await fetch('/api/project/script', {
//         headers: {
//             'content-type': 'application/json',
//         },
//         method: 'post',
//         body: JSON.stringify(request)
//     })
//     if (response.status === 200) {
//         return
//     } else if (response.status === 401) {
//         // todo redirect to login
//         document.body.style.background = 'orangered'
//         console.error('login access token has expired')
//     } else {
//         document.body.style.background = 'orangered'
//         console.error(`/api/project/script returned an unexpected ${response.status} status`)
//     }
//     throw new Error('/api/projects ' + response.status)
// }
