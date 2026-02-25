import type { Architecture, OperatingSystem } from '@binny.sh/systems'
import type { Release } from './model'

export type SystemSupportMatrix = Record<
    OperatingSystem,
    Partial<Record<Architecture, boolean>>
>

export function calculateSystemSupportMatrix(
    release: Release,
): SystemSupportMatrix {
    const matrix: SystemSupportMatrix = {
        Linux: {
            aarch64: false,
            arm: false,
            x86_64: false,
        },
        MacOS: {
            aarch64: false,
            x86_64: false,
        },
        Windows: {
            aarch64: false,
            x86_64: false,
        },
    }
    for (const bin of release.binaries) {
        if (bin.arch) {
            matrix[bin.os][bin.arch] = true
        }
    }
    return matrix
}
