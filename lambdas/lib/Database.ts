// import pg from 'pg'
// import type {GeneratedScript} from 'contract/src/Contract'
// import type {Repository} from 'github/src/GitHubApiClient'
//
// // https://node-postgres.com/features/connecting#environment-variables
// const connectionPool = new pg.Pool({
//     max: 20,
//     maxUses: 1000,
// })
//
// export async function saveUserLogin(userId: number, email: string, accessToken: string): Promise<boolean> {
//     const result = await connectionPool.query({
//         name: 'save-user',
//         text: `
//             insert into binny_sh.users (id, email, access_token)
//             values ($1, $2, $3)
//             on conflict (id) do update
//                 set email        = excluded.email,
//                     access_token = excluded.access_token,
//                     authed_when  = now()
//             returning (created_when = authed_when) as new_user
//         `,
//         values: [userId, email, accessToken],
//     })
//     return result.rows[0].new_user
// }
//
// export async function loadGeneratedScripts(userId: number): Promise<Array<GeneratedScript>> {
//     const result = await connectionPool.query({
//         name: 'select-scripts',
//         text: `
//             select *
//             from binny_sh.scripts
//             where user_id = $1
//             order by generated_when desc
//         `,
//         values: [userId],
//     })
//     const scripts: Array<GeneratedScript> = []
//     for (const row of result.rows) {
//         scripts.push({
//             repository: {
//                 owner: row.repo_owner,
//                 name: row.repo_name,
//             },
//             templateVersion: row.template_version,
//         })
//     }
//     return scripts
// }
//
// // todo add counter column
// // todo save release tag
// export async function saveTemplateVersion(userId: number, repository: Repository, templateVersion: string) {
//     await connectionPool.query({
//         name: 'save-template-version',
//         text: `
//             insert into binny_sh.scripts (user_id, repo_owner, repo_name, template_version)
//             values ($1, $2, $3, $4)
//             on conflict on constraint script_user_repo_key do update
//                 set template_version = excluded.template_version,
//                     generated_when   = now()
//         `,
//         values: [userId, repository.owner, repository.name, templateVersion],
//     })
// }
