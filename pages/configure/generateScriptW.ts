import {
    generateBothScripts,
    type GeneratedNixShellScript,
    type GeneratedPowerShellScript,
    type GenerateScriptOptions,
} from '@binny.sh/template'

export type ConfiguredScriptsResult = {
    result: GeneratedNixShellScript & GeneratedPowerShellScript
    error: Error
}

declare const self: DedicatedWorkerGlobalScope

self.onmessage = (e: MessageEvent<GenerateScriptOptions>) => {
    try {
        const result = generateBothScripts(e.data)
        postMessage({ result })
    } catch (error) {
        postMessage({ error })
    }
}
