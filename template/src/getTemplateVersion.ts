import packageJson from '../package.json' assert { type: 'json' }

export function getTemplateVersion(): string {
    return packageJson.version
}
