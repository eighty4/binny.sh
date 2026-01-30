// import { type Download, expect, test } from '@playwright/test'
// import { readFileSync } from 'node:fs'
// import * as binnyApi from './responses/binnyApi.js'
// import * as graphData from './responses/graphData.js'
// import { RouteResponses } from './responses/RouteResponses.js'

// test('#configure/eighty4/maestro download script ', async ({ page }) => {
//     await new RouteResponses()
//         .POST({
//             fulfill: {
//                 json: graphData.user(),
//             },
//         })
//         .POST({
//             fulfill: {
//                 json: graphData.user(),
//             },
//         })
//         .POST({
//             fulfill: {
//                 json: graphData.repositories(),
//             },
//         })
//         .POST({
//             fulfill: {
//                 json: graphData.repositories(),
//             },
//         })
//         .configure(page, 'https://api.github.com/graphql')
//     await new RouteResponses()
//         .GET({
//             fulfill: {
//                 status: 302,
//                 headers: {
//                     Location: 'http://localhost:5711?login',
//                     'Set-Cookie': 'ght=ght; Secure; SameSite=Strict; Path=/',
//                 },
//             },
//         })
//         .configure(page, 'http://localhost:5711/api/login/github/redirect')
//     await new RouteResponses()
//         .GET({
//             fulfill: {
//                 json: [],
//             },
//         })
//         .POST({
//             fulfill: {
//                 status: 201,
//             },
//             predicate: req => {
//                 expect(req.postDataJSON().repository).toEqual({
//                     owner: 'eighty4',
//                     name: 'l3',
//                 })
//             },
//         })
//         .GET({
//             fulfill: {
//                 json: binnyApi.generatedScripts(),
//             },
//         })
//         .configure(page, 'http://localhost:5711/generated-scripts')

//     await page.goto('/')
//     await page.click('#login-link')
//     await page.waitForSelector('#login-redirect')
//     await page.click('#login-redirect')
//     await page.waitForSelector('#graph-paper')
//     await page.waitForSelector('.repos')
//     await page.getByText('eighty4/l3').click()

//     await expect(page.getByText('MacOS & Linux')).toBeVisible()
//     await expect(page.getByText('MacOS & Linux')).toBeEnabled()

//     await new Promise((res, rej) => {
//         page.on('download', download =>
//             verifyScript(download, 'install_l3.sh').then(res).catch(rej),
//         )
//         page.getByText('MacOS & Linux').click().then().catch(rej)
//     })

//     // todo verify #search shows download scripts as its own feature test
//     await page.goto('/#search')
//     await expect(page.getByText('Your release scripts')).toBeVisible()
// })

// async function verifyScript(download: Download, filename: string) {
//     expect(download.suggestedFilename()).toBe(filename)
//     expect(
//         readFileSync(await download.path())
//             .toString()
//             .startsWith(SCRIPT_HEADER),
//     ).toBe(true)
// }

// const SCRIPT_HEADER = `#!/usr/bin/env sh
// set -e

// # Created by npm package @binny.sh/template@`
