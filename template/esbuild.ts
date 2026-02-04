#!/usr/bin/env node
import { join } from 'node:path'
import esbuild from 'esbuild'

await esbuild.build({
    logLevel: 'info',
    allowOverwrite: true,
    absWorkingDir: join(import.meta.dirname, 'lib'),
    outdir: '../lib_js',
    entryPoints: ['Generate.ts'],
    treeShaking: true,
    target: 'ES2022',
    bundle: true,
    minify: false,
    format: 'esm',
    platform: 'browser',
    loader: {
        '.ps1': 'text',
        '.sh': 'text',
    },
})
