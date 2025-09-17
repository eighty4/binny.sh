import type { ConfigEnv } from 'vitest/config'

export default (configEnv: ConfigEnv) => {
    return {
        test: {
            include: resolveTestInclude(configEnv),
        },
    }
}

function resolveTestInclude(configEnv: ConfigEnv) {
    switch (configEnv.mode) {
        case 'test':
            return 'src/**/*.test.ts'
        case 'gold':
            return 'src/**/*.gold.ts'
        default:
            console.error(
                'Run Vitest with an appropriate `--mode=test` or `--mode=gold` setting.',
            )
            process.exit(1)
    }
}
