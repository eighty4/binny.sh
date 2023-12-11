import {readFileSync} from 'node:fs'

export function resolveTemplateRuntimeVersion() {
    try {
        let packageJson = import.meta.resolve('../node_modules/@eighty4/install-template/package.json')
        if (packageJson.startsWith('file:///')) {
            packageJson = packageJson.substring(7)
        }
        return JSON.parse(readFileSync(packageJson).toString()).version
    } catch (e) {
        throw new Error('failed resolving version of @eighty4/install-template')
    }
}
