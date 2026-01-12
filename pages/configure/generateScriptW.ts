import { generateScript, type GenerateScriptOptions } from '@binny.sh/template'

declare const self: DedicatedWorkerGlobalScope

self.onmessage = (e: MessageEvent<GenerateScriptOptions>) => {
    try {
        const result = generateScript(e.data)
        postMessage({ result })
    } catch (error) {
        postMessage({ error })
    }
}
