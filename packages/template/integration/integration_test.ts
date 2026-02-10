import { readdir } from 'node:fs/promises'
import { type as getOsType } from 'node:os'
import { join, extname } from 'node:path'
import SpawnProcess from './SpawnProcess.ts'

const PWSH_VERSION = process.env.PWSH_VERSION || '7.5.4'

const green = (s: string): string => `\u001b[32m${s}\u001b[0m`
const red = (s: string): string => `\u001b[31m${s}\u001b[0m`

const ONLY_BUILD = process.argv.includes('--only-build')
const SKIP_BUILD = process.argv.includes('--skip-build')
const USE_VOLUMES = process.argv.includes('--use-volumes')

const SCRIPT_BINS: Record<string, string> = {
    'l3.ps1': 'l3',
    'l3.sh': 'l3',
}

const HTTP_CLIENTS = ['curl', 'wget'] as const
type HttpClient = (typeof HTTP_CLIENTS)[number]

const SHELLS = ['bash', 'fish', 'zsh'] as const
type Shell = (typeof SHELLS)[number]

const isWindows = /windows/.test(getOsType().toLowerCase())

function printResult(p: SpawnProcess) {
    if (p.errored) {
        console.log(red('error:'), `${p.label}\n\n${p.command}\n\n${p.output}`)
        process.exit(1)
    } else {
        console.log(green('✓'), 'finished', p.label)
    }
}

if (isWindows) {
    await runPowerShellTests()
} else {
    await runDockerTests()
}

async function readScripts(ext?: '.ps1' | '.sh') {
    const goldScripts = await readdir(
        join(import.meta.dirname, '../gold/scripts'),
    )
    if (ext) {
        return goldScripts.filter(filename => extname(filename) === ext)
    } else {
        return goldScripts
    }
}

async function runPowerShellTests() {
    for (const goldScript of await readScripts('.ps1')) {
        const pwsh = new SpawnProcess(
            goldScript,
            'pwsh',
            ['-f', join(import.meta.dirname, 'test.ps1')],
            {
                BINARY: SCRIPT_BINS[goldScript],
                SCRIPT: join(
                    import.meta.dirname,
                    '../gold/scripts',
                    goldScript,
                ),
            },
        )
        await pwsh.done
        printResult(pwsh)
    }
}

async function runDockerTests() {
    if (!SKIP_BUILD) {
        await buildImages()
    }
    if (ONLY_BUILD) {
        process.exit()
    }
    const goldScripts = await readdir(
        join(import.meta.dirname, '../gold/scripts'),
    )
    const tests = collectTests(goldScripts)
    console.log('running', tests.length, 'tests')

    await Promise.all(
        tests.map(async t => {
            await t.done
            printResult(t)
        }),
    )
}

async function buildImages(): Promise<void> {
    const dockerBuilds: Array<{
        label: string
        args: Array<string>
    }> = []
    for (const shell of SHELLS) {
        const OS = 'debian'
        for (const httpClient of HTTP_CLIENTS) {
            const image = nixImageName(OS, shell, httpClient)
            dockerBuilds.push({
                label: `building ${image}`,
                args: [
                    'build',
                    '--build-arg',
                    `HTTP_CLIENT=${httpClient}`,
                    '-t',
                    image,
                    '-f',
                    join(import.meta.dirname, `${OS}.${shell}.Dockerfile`),
                    join(import.meta.dirname, '..'),
                ],
            })
        }
        const image = nixPwshImageName(OS, shell)
        dockerBuilds.push({
            label: `building ${image}`,
            args: [
                'build',
                '--build-arg',
                `SHELL=${shell}`,
                '--build-arg',
                `PWSH_VERSION=${PWSH_VERSION}`,
                '-t',
                image,
                '-f',
                join(import.meta.dirname, `${OS}.pwsh.Dockerfile`),
                join(import.meta.dirname, '..'),
            ],
        })
    }
    console.log('starting build of', dockerBuilds.length, 'images')
    for (const { label, args } of dockerBuilds) {
        const build = new SpawnProcess(label, 'docker', args)
        await build.done
        printResult(build)
    }
}

function nixImageName(os: 'debian', shell: Shell, httpClient: HttpClient) {
    return `binny.test.${os}.${shell}.${httpClient}`
}

function nixPwshImageName(os: 'debian', shell: Shell) {
    return `binny.test.${os}.pwsh.${shell}`
}

function collectTests(goldScripts: Array<string>): Array<SpawnProcess> {
    const tests: Array<SpawnProcess> = []
    for (const shell of SHELLS) {
        const OS = 'debian'
        for (const httpClient of HTTP_CLIENTS) {
            for (const goldScript of goldScripts) {
                if (!SCRIPT_BINS[goldScript])
                    throw Error('missing bin name for ' + goldScript)
                const image =
                    extname(goldScript) === '.sh'
                        ? nixImageName(OS, shell, httpClient)
                        : nixPwshImageName(OS, shell)
                tests.push(
                    new SpawnProcess(`${goldScript} on ${image}`, 'docker', [
                        'run',
                        '--rm',
                        '-e',
                        'SCRIPT=' + goldScript,
                        '-e',
                        'BINARY=' + SCRIPT_BINS[goldScript],
                        ...(USE_VOLUMES
                            ? [
                                  '-v',
                                  `${join(import.meta.dirname, '../gold/scripts')}:/gold/scripts`,
                                  '-v',
                                  `${join(import.meta.dirname, './test.sh')}:/gold/test.sh`,
                              ]
                            : []),
                        image,
                        '/gold/test.sh',
                    ]),
                )
            }
        }
    }
    return tests
}
