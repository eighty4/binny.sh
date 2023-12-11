import {expect, test} from 'vitest'
import {resolveDistribution} from './Resolution'

test('resolveDistribution for Linux', () => {
    expect(resolveDistribution('maestro-linux-386', 'application/x-executable'))
        .toStrictEqual({arch: undefined, os: 'Linux'})
    expect(resolveDistribution('maestro-linux-amd64', 'application/x-executable'))
        .toStrictEqual({arch: 'x86_64', os: 'Linux'})
    expect(resolveDistribution('maestro-linux-arm', 'application/x-executable'))
        .toStrictEqual({arch: 'arm', os: 'Linux'})
    expect(resolveDistribution('maestro-linux-arm64', 'application/x-executable'))
        .toStrictEqual({arch: 'aarch64', os: 'Linux'})
})

test('resolveDistribution for MacOS', () => {
    expect(resolveDistribution('maestro-darwin-amd64', 'application/x-mach-binary'))
        .toStrictEqual({arch: 'x86_64', os: 'MacOS'})
    expect(resolveDistribution('maestro-darwin-arm64', 'application/x-mach-binary'))
        .toStrictEqual({arch: 'aarch64', os: 'MacOS'})
})

test('resolveDistribution for Windows', () => {
    expect(resolveDistribution('maestro-windows-amd64', 'application/x-dosexec'))
        .toStrictEqual({arch: 'x86_64', os: 'Windows'})
    expect(resolveDistribution('maestro-windows-arm', 'application/x-dosexec'))
        .toStrictEqual({arch: 'arm', os: 'Windows'})
    expect(resolveDistribution('maestro-windows-arm64', 'application/x-dosexec'))
        .toStrictEqual({arch: 'aarch64', os: 'Windows'})
})
