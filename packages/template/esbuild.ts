#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import esbuild from 'esbuild'

await esbuild.build({
    logLevel: 'info',
    allowOverwrite: true,
    absWorkingDir: join(import.meta.dirname, 'lib'),
    outdir: '../lib_js',
    entryPoints: ['Template.ts'],
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
    plugins: [
        {
            name: 'npm-version',
            setup(build) {
                build.onResolve({ filter: /npm:version/ }, () => {
                    return { path: join(import.meta.dirname, 'package.json') }
                })
                build.onLoad(
                    { filter: /package\.json$/, namespace: 'file' },
                    async args => {
                        const { version: contents } = JSON.parse(
                            await readFile(args.path, 'utf8'),
                        )
                        return { contents, loader: 'text' }
                    },
                )
            },
        },
    ],
})
