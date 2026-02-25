import {
    Unauthorized,
    type Release,
    type Repository,
    type RepositoryId,
} from '@binny.sh/github'
import { getLatestRepoReleaseData } from '@binny.sh/github/queries/latestRelease'
import {
    calculateSystemSupportMatrix,
    type SystemSupportMatrix,
} from '@binny.sh/github/release/systemMatrix'
import { exec } from 'node:child_process'

const GH_TOKEN = process.env.GH_TOKEN

// todo fallback to REST API without GH_TOKEN
if (!GH_TOKEN) {
    exitNoGitHubToken()
}

const repoId = await lookupLocalRepoGitHub()

if (!repoId) {
    exitNotGitHubRepo()
}

let repository: Repository
try {
    repository = await getLatestRepoReleaseData(GH_TOKEN, repoId)
} catch (e: any) {
    if (e instanceof Unauthorized) {
        exitRejectedGitHubToken()
    } else {
        exitUnexpectedError(e)
    }
}

if (!repository.latestRelease) {
    exitNoGitHubRelease(repoId)
} else if (!repository.latestRelease.binaries.length) {
    exitNoReleaseBinaries(repoId, repository.latestRelease)
}

console.log(
    `repository ${bold(`${repoId.owner}/${repoId.name}`)} has ${repository.latestRelease.binaries.length} binaries`,
)
const matrix: SystemSupportMatrix = calculateSystemSupportMatrix(
    repository.latestRelease,
)
let complete = true
for (const [os, cpus] of Object.entries(matrix)) {
    if (Object.values(cpus).every(support => !support)) {
        complete = false
        console.log(redBooBoo(), `missing all ${os} systems support`)
    } else if (Object.values(cpus).every(support => support)) {
        console.log(greenCheckMark(), `supports all ${os} systems`)
    } else {
        for (const [cpu, support] of Object.entries(cpus)) {
            if (!support) {
                complete = false
                console.log(redBooBoo(), `missing ${os} ${cpu} support`)
            }
        }
    }
}

if (!complete) printMisconfiguedContentTypeGuidance(repository.latestRelease)

process.exit(complete ? 0 : 1)

async function lookupLocalRepoGitHub(): Promise<RepositoryId | null> {
    const repoPath = await lookupLocalRepoOriginGitHubPath()
    if (repoPath === null) {
        return null
    }
    const [owner, name] = repoPath.split('/', 2)
    return { owner, name }
}

// returns null if origin is not a GitHub repo
async function lookupLocalRepoOriginGitHubPath(): Promise<string | null> {
    const PATTERNS = [
        /^git@github\.com:(?<repo>.*\/.*?)(\.git)?$/,
        /^https:\/\/(www\.)?github\.com\/(?<repo>.*)$/,
    ]
    return await new Promise<string | null>(res => {
        exec(
            'git remote get-url origin',
            { cwd: '/Users/adam/work/eighty4/cquill' },
            (err, stdout) => {
                if (err) {
                    exitUnexpectedError(err)
                } else {
                    const url = stdout.trim()
                    for (const pattern of PATTERNS) {
                        const match = pattern.exec(url)
                        if (match) {
                            res(match.groups!.repo)
                            return
                        }
                    }
                    res(null)
                }
            },
        )
    })
}

function bold(s: string): string {
    return `\u001b[1m${s}\u001b[0m`
}

function greenCheckMark(): string {
    return '\u001b[32m✔\u001b[0m'
}

function redBooBoo(): string {
    return '\u001b[31m✗\u001b[0m'
}

function exitNoGitHubToken(): never {
    console.log(redBooBoo(), 'env var GH_TOKEN is required')
    process.exit(1)
}

function exitNotGitHubRepo(): never {
    console.log(
        redBooBoo(),
        'please run from a local GitHub repository with a remote named `origin` and a valid GitHub repository URL',
    )
    process.exit(1)
}

function exitNoReleaseBinaries(repoId: RepositoryId, release: Release): never {
    console.log(
        redBooBoo(),
        `repository ${repoId.owner}/${repoId.name} latest release ${release.tag} does not have any release binaries`,
    )
    printMisconfiguedContentTypeGuidance(release)
    process.exit(1)
}

function exitRejectedGitHubToken(): never {
    console.log(redBooBoo(), 'env var GH_TOKEN is expired or invalid')
    process.exit(1)
}

function exitNoGitHubRelease(repoId: RepositoryId): never {
    console.log(
        redBooBoo(),
        `repository ${repoId.owner}/${repoId.name} does not have a GitHub release`,
    )
    process.exit(1)
}

function exitUnexpectedError(e: Error): never {
    console.error(e)
    process.exit(1)
}

function printMisconfiguedContentTypeGuidance(release: Release) {
    const octetStreamCount = release.otherAssets.filter(
        asset => asset.contentType === 'application/octet-stream',
    ).length
    if (octetStreamCount) {
        console.log()
        console.log(
            `  there are ${octetStreamCount} release assets with \`application/octet-stream\` that may be binaries`,
        )
        console.log(
            '  use the GitHub REST API to provide binaries with a proper binary content type such as \`application/x-pie-executable\`, \`application/x-mach-binary\` or \`application/x-dosexec\`',
        )
        console.log()
        console.log(
            '     https://docs.github.com/en/rest/releases/assets#update-a-release-asset',
        )
    }
}
