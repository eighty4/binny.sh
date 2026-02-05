import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { generateBothScripts } from '../lib_js/Template.js'
import type { GenerateScriptOptions } from '../lib_types/Template.ts'

export const TESTS: Record<string, GenerateScriptOptions> = {
    maestro: {
        repository: {
            owner: 'eighty4',
            name: 'maestro',
        },
        installName: 'maestro',
        distributions: {
            Linux: {
                aarch64: 'maestro-linux-arm64',
                arm: 'maestro-linux-arm',
                x86_64: 'maestro-linux-amd64',
            },
            MacOS: {
                aarch64: 'maestro-darwin-arm64',
                x86_64: 'maestro-darwin-amd64',
            },
            Windows: {
                aarch64: 'maestro-windows-arm64',
                x86_64: 'maestro-darwin-amd64',
            },
        },
    },
} as const

if (import.meta.main) {
    for (const [goldFile, options] of Object.entries(TESTS)) {
        const goldPs1Path = join(
            import.meta.dirname,
            'scripts',
            `${goldFile}.ps1`,
        )
        const goldShPath = join(
            import.meta.dirname,
            'scripts',
            `${goldFile}.sh`,
        )
        const { ps1, sh } = generateBothScripts(options)
        await Promise.all([
            writeFile(goldPs1Path, ps1),
            writeFile(goldShPath, sh),
        ])
        console.log('wrote', join('scripts', `${goldFile}.ps1`))
        console.log('wrote', join('scripts', `${goldFile}.sh`))
    }
}
