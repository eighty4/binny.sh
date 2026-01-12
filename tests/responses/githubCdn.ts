import { readFile } from 'node:fs/promises'

let readingAvatar = readFile('tests/responses/dexter.png')

export async function userAvatar() {
    return {
        body: await readingAvatar,
        contentType: 'image/png',
    }
}
