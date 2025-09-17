import packageJson from '../package.json' with { type: 'json' }

export function getTemplateVersion(): string {
    return packageJson.version
}
