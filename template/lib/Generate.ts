import type { Architecture, OperatingSystem } from './Distrubtions.ts'
import { getTemplateVersion } from './getTemplateVersion.ts'
import ps1TemplateString from './generate.ps1'
import shTemplateString from './generate.sh'

export type BinaryDistributions = Partial<
    Record<OperatingSystem, Partial<Record<Architecture, string>>>
>

export type GenerateScriptOptions = {
    repository: {
        owner: string
        name: string
    }
    installName: string
    distributions: BinaryDistributions
}

function validateOptions(options: GenerateScriptOptions) {
    if (!options) {
        throw new Error('options param is required')
    } else if (!options.repository) {
        throw new Error('options.repository is required')
    } else if (!options.repository.owner || !options.repository.owner.length) {
        throw new Error('options.repository.owner is required')
    } else if (!options.repository.name || !options.repository.name.length) {
        throw new Error('options.repository.name is required')
    } else if (!options.distributions) {
        throw new Error('options.distributions is required')
    }
}

export type GeneratedNixShellScript = {
    sh: string
    templateVersion: string
}

export type GeneratedPowerShellScript = {
    ps1: string
    templateVersion: string
}

export function generateNixShell(
    options: GenerateScriptOptions,
): GeneratedNixShellScript {
    validateOptions(options)
    const replacements = buildTemplateReplacements(options)
    return {
        sh: templateNixShell(replacements),
        templateVersion: getTemplateVersion(),
    }
}

export function generatePowerShell(
    options: GenerateScriptOptions,
): GeneratedPowerShellScript {
    validateOptions(options)
    const replacements = buildTemplateReplacements(options)
    return {
        ps1: templatePowerShell(replacements),
        templateVersion: getTemplateVersion(),
    }
}

export function generateBothScripts(
    options: GenerateScriptOptions,
): GeneratedNixShellScript & GeneratedPowerShellScript {
    validateOptions(options)
    const replacements = buildTemplateReplacements(options)
    return {
        ps1: templatePowerShell(replacements),
        sh: templateNixShell(replacements),
        templateVersion: getTemplateVersion(),
    }
}

function templatePowerShell(replacements: TemplateReplacements): string {
    return executeTemplate(ps1TemplateString, replacements)
}

function templateNixShell(replacements: TemplateReplacements): string {
    return executeTemplate(shTemplateString, replacements)
}

const TEMPLATE_REGEX = /\*\*\*(?<placeholder>.+?)\*\*\*/g

function executeTemplate(
    template: string,
    replacements: TemplateReplacements,
): string {
    let output = template
    let offset = 0
    for (const match of template.matchAll(TEMPLATE_REGEX)) {
        const placeholder: string = match.groups!.placeholder
        if (placeholder in replacements) {
            const replacement: string = replacements[placeholder] || ''
            output =
                output.substring(0, match.index + offset) +
                replacement +
                output.substring(match.index + match[0].length + offset)
            offset += replacement.length - match[0].length
        } else {
            throw Error(placeholder + ' is not supported')
        }
    }
    return output
}

type TemplateReplacements = {
    [k: string]: string | undefined
    BIN_NAME: string
    BIN_Linux_aarch64?: string
    BIN_Linux_arm?: string
    BIN_Linux_x86_64?: string
    BIN_MacOS_aarch64?: string
    BIN_MacOS_x86_64?: string
    BIN_Windows_aarch64?: string
    BIN_Windows_x86_64?: string
    REPO_NAME: string
    TEMPLATE_VERSION: string
}

function buildTemplateReplacements(
    options: GenerateScriptOptions,
): TemplateReplacements {
    return Object.freeze({
        BIN_NAME: options.installName,
        BIN_Linux_aarch64: options.distributions.Linux?.aarch64,
        BIN_Linux_arm: options.distributions.Linux?.arm,
        BIN_Linux_x86_64: options.distributions.Linux?.x86_64,
        BIN_MacOS_aarch64: options.distributions.MacOS?.aarch64,
        BIN_MacOS_x86_64: options.distributions.Linux?.x86_64,
        BIN_Windows_aarch64: options.distributions.Linux?.aarch64,
        BIN_Windows_x86_64: options.distributions.Linux?.x86_64,
        REPO_NAME: `${options.repository.owner}/${options.repository.name}`,
        TEMPLATE_VERSION: getTemplateVersion(),
    })
}
