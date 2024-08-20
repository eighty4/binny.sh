import {readFileSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {expect, test} from 'vitest'
import {generateScript, type GenerateScriptOptions} from './Generate'

function generateScriptTest(goldFile: string, options: GenerateScriptOptions) {
    const goldPath = join('gold', 'scripts', goldFile)
    const result = generateScript(options)
    if (process.env.UPDATE_GOLD === '1') {
        writeFileSync(goldPath, result)
    } else {
        expect(result).toBe(readFileSync(goldPath).toString())
    }
}

test('generate maestro.sh', () => generateScriptTest('maestro.sh', {
    binaryName: 'maestro',
    files: {
        'maestro-darwin-amd64': {
            arch: 'x86_64',
            os: 'MacOS',
        },
        'maestro-darwin-arm64': {
            arch: 'aarch64',
            os: 'MacOS',
        },
        'maestro-linux-amd64': {
            arch: 'x86_64',
            os: 'Linux',
        },
        'maestro-linux-arm64': {
            arch: 'aarch64',
            os: 'Linux'
        },
    },
    repository: {
        owner: 'eighty4',
        name: 'maestro',
    },
}))
