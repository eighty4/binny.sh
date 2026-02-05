// import { Unauthorized } from '@binny.sh/github'
// import type { GeneratedScript } from '@binny.sh/template'

// export async function saveGeneratedScript(
//     ghToken: string,
//     generatedScript: GeneratedScript,
// ): Promise<void> {
//     const response = await fetch('/generated-scripts', {
//         method: 'POST',
//         headers: {
//             authorization: 'Bearer ' + ghToken,
//             'content-type': 'application/json',
//         },
//         body: JSON.stringify({
//             repository: {
//                 owner: generatedScript.repository.owner,
//                 name: generatedScript.repository.name,
//             },
//             spec: generatedScript.spec,
//             templateVersion: generatedScript.templateVersion,
//         }),
//     })
//     if (response.status !== 201) {
//         switch (response.status) {
//             case 401:
//                 throw new Unauthorized()
//             default:
//                 throw Error(
//                     'POST /generated-scripts response ' + response.status,
//                 )
//         }
//     }
// }
