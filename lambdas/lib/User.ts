// const client_id = process.env.GITHUB_CLIENT_ID
// const client_secret = process.env.GITHUB_CLIENT_SECRET
//
// export interface GitHubUser {
//     userId: number
//     login: string
//     accessToken: string
// }
//
// export async function fetchAccessToken(code: string): Promise<string> {
//     const response = await fetch('https://github.com/login/oauth/access_token', {
//         method: 'post',
//         body: JSON.stringify({client_id, client_secret, code}),
//         headers: {
//             'Content-Type': 'application/json',
//         },
//     })
//     const formData = await response.formData()
//     const accessToken = formData.get('access_token') as string | null
//     if (accessToken) {
//         return accessToken
//     } else {
//         throw new Error('wtf happened?')
//     }
// }
//
// export async function fetchEmail(accessToken: string): Promise<string> {
//     const response = await fetch('https://api.github.com/user/public_emails', {
//         headers: {
//             'Authorization': 'Bearer ' + accessToken,
//             'X-GitHub-Api-Version': '2022-11-28',
//         },
//     })
//     return (await response.json()).find((email: any) => email.primary).email
// }
//
// export async function fetchUserId(accessToken: string): Promise<number> {
//     const response = await fetch('https://api.github.com/user', {
//         headers: {
//             'Authorization': 'Bearer ' + accessToken,
//             'X-GitHub-Api-Version': '2022-11-28',
//         },
//     })
//     return (await response.json()).id
// }
//
// export async function verifyAccessToken(accessToken: string): Promise<GitHubUser | false> {
//     if (!accessToken || !accessToken.length) {
//         return false
//     }
//     const response = await fetch(`https://api.github.com/applications/${client_id}/token`, {
//         method: 'POST',
//         headers: {
//             'Authorization': `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
//             'X-GitHub-Api-Version': '2022-11-28',
//         },
//         body: JSON.stringify({access_token: accessToken}),
//     })
//     if (response.status !== 200) {
//         return false
//     }
//     const payload = await response.json()
//     return {
//         userId: payload.user.id,
//         login: payload.user.login,
//         accessToken,
//     }
// }
