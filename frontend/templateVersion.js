import { readFileSync } from 'node:fs'

try {
    let packageJson = import.meta.resolve(
        './node_modules/@eighty4/binny-template/package.json',
    )
    if (packageJson.startsWith('file:///')) {
        packageJson = packageJson.substring(7)
    }
    const version = JSON.parse(readFileSync(packageJson).toString()).version
    console.log(version)
} catch (e) {
    throw new Error(
        'failed resolving version of @eighty4/binny-template: ' + e.message,
    )
}
