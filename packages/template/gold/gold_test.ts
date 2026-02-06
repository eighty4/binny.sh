import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { generateBothScripts } from '../lib_js/Template.js'
import { TESTS } from './gold_update.ts'

async function goldTest(goldFile: keyof typeof TESTS) {
    const goldPs1Path = join(import.meta.dirname, 'scripts', `${goldFile}.ps1`)
    const goldShPath = join(import.meta.dirname, 'scripts', `${goldFile}.sh`)
    const result = generateBothScripts(TESTS[goldFile])
    const [ps1, sh] = await Promise.all([
        readFile(goldPs1Path, 'utf8'),
        readFile(goldShPath, 'utf8'),
    ])
    assert.equal(result.ps1, ps1)
    assert.equal(result.sh, sh)
}

test('gold l3.ps1 and l3.sh', () => goldTest('l3'))
