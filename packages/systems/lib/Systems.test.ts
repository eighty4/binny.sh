import assert from 'node:assert/strict'
import { test } from 'node:test'
import { resolveDistribution } from './Systems.ts'

test('resolveDistribution for Linux', () => {
    assert.deepEqual(
        resolveDistribution('maestro-linux-386', 'application/x-executable'),
        { arch: undefined, os: 'Linux' },
    )
    assert.deepEqual(
        resolveDistribution('maestro-linux-amd64', 'application/x-executable'),
        { arch: 'x86_64', os: 'Linux' },
    )
    assert.deepEqual(
        resolveDistribution('maestro-linux-arm', 'application/x-executable'),
        { arch: 'arm', os: 'Linux' },
    )
    assert.deepEqual(
        resolveDistribution('maestro-linux-arm64', 'application/x-executable'),
        { arch: 'aarch64', os: 'Linux' },
    )
})

test('resolveDistribution for MacOS', () => {
    assert.deepEqual(
        resolveDistribution(
            'maestro-darwin-amd64',
            'application/x-mach-binary',
        ),
        { arch: 'x86_64', os: 'MacOS' },
    )
    assert.deepEqual(
        resolveDistribution(
            'maestro-darwin-arm64',
            'application/x-mach-binary',
        ),
        { arch: 'aarch64', os: 'MacOS' },
    )
})

test('resolveDistribution for Windows', () => {
    assert.deepEqual(
        resolveDistribution('maestro-windows-amd64', 'application/x-dosexec'),
        { arch: 'x86_64', os: 'Windows' },
    )
    assert.deepEqual(
        resolveDistribution('maestro-windows-arm', 'application/x-dosexec'),
        { arch: 'arm', os: 'Windows' },
    )
    assert.deepEqual(
        resolveDistribution('maestro-windows-arm64', 'application/x-dosexec'),
        { arch: 'aarch64', os: 'Windows' },
    )
})
