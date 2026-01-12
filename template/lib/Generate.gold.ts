import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { generateScript, type GenerateScriptOptions } from './Generate.ts'

function generateScriptTest(goldFile: string, options: GenerateScriptOptions) {
    const goldPath = join('gold', 'scripts', goldFile)
    const result = generateScript(options)
    if (process.env.UPDATE_GOLD === '1') {
        writeFileSync(goldPath, result.content)
    } else {
        assert.equal(result.content, readFileSync(goldPath).toString())
    }
}

test('generate maestro.sh', () =>
    generateScriptTest('maestro.sh', {
        binaryInstalls: [
            {
                installAs: 'maestro',
                binaries: [
                    'maestro-linux-amd64',
                    'maestro-linux-arm64',
                    'maestro-darwin-amd64',
                    'maestro-darwin-arm64',
                    'maestro-arm64.exe',
                ],
            },
        ],
        explicitArchitectures: {},
        repository: {
            owner: 'eighty4',
            name: 'maestro',
        },
        resolvedDistributions: {
            'maestro-linux-amd64': {
                arch: 'x86_64',
                os: 'Linux',
            },
            'maestro-linux-arm64': {
                arch: 'aarch64',
                os: 'Linux',
            },
            'maestro-darwin-amd64': {
                arch: 'x86_64',
                os: 'MacOS',
            },
            'maestro-darwin-arm64': {
                arch: 'aarch64',
                os: 'MacOS',
            },
            'maestro-arm64.exe': {
                arch: 'aarch64',
                os: 'Windows',
            },
        },
    }))
