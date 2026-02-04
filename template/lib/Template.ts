export type {
    Architecture,
    Distribution,
    OperatingSystem,
} from './Distrubtions.ts'
export {
    ARCHITECTURES,
    OPERATING_SYSTEMS,
    operatingSystemLabel,
} from './Distrubtions.ts'
export {
    generateBothScripts,
    generateNixShell,
    generatePowerShell,
} from './Generate.ts'
export type {
    BinaryDistributions,
    GeneratedNixShellScript,
    GeneratedPowerShellScript,
    GenerateScriptOptions,
} from './Generate.ts'
export { getTemplateVersion } from './getTemplateVersion.ts'
export { resolveDistribution } from './Resolution.ts'
