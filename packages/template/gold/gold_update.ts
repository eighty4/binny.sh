import { chmod, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { generateBothScripts } from '../lib_js/Template.js'
import type { GenerateScriptOptions } from '../lib_types/Template.ts'

export const TESTS: Record<string, GenerateScriptOptions> = {
    l3: {
        repository: {
            owner: 'eighty4',
            name: 'l3',
        },
        installName: 'l3',
        distributions: {
            Linux: {
                aarch64: 'l3-linux-aarch64',
                // arm: 'l3-linux-arm',
                x86_64: 'l3-linux-x86_64',
            },
            MacOS: {
                aarch64: 'l3-macos-aarch64',
                x86_64: 'l3-macos-x86_64',
            },
            Windows: {
                aarch64: 'l3-windows-aarch64.exe',
                x86_64: 'l3-windows-x86_64.exe',
            },
        },
    },
} as const

if (import.meta.main) {
    const green = (s: string): string => `\u001b[32m${s}\u001b[0m`
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
        await Promise.all([chmod(goldShPath, 0o755)])
        console.log(green('✓'), 'wrote', join('scripts', `${goldFile}.ps1`))
        console.log(green('✓'), 'wrote', join('scripts', `${goldFile}.sh`))
    }
}
