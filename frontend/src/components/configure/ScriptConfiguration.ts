import type {Architecture, Distribution, GenerateScriptOptions, OperatingSystem} from '@eighty4/install-template'
import type {Asset, Binary} from '@eighty4/install-github'
import type {RepositoryWithScript} from '../../routes/searchData.ts'

export default class ScriptConfiguration {
    readonly #repo: RepositoryWithScript
    readonly #resolved: Record<string, Architecture> = {}
    readonly #unresolved: Record<string, OperatingSystem> = {}

    constructor(repo: RepositoryWithScript) {
        this.#repo = repo
        if (repo.latestRelease?.binaries) {
            for (const binary of repo.latestRelease.binaries!) {
                if (!binary.arch) {
                    this.#unresolved[binary.filename] = binary.os
                }
            }
        }
        if (repo.script?.spec.explicitArchitectures) {
            for (const filename of Object.keys(repo.script.spec.explicitArchitectures)) {
                this.resolveArchitecture(filename, repo.script.spec.explicitArchitectures[filename])
            }
        }
    }

    resolveArchitecture(filename: string, arch: Architecture): boolean {
        this.#resolved[filename] = arch
        const previouslyUnresolved = !!this.#unresolved[filename]
        if (previouslyUnresolved) {
            delete this.#unresolved[filename]
        }
        return previouslyUnresolved
    }

    areOsBinariesResolved(os: OperatingSystem): boolean {
        if (os === 'Windows') {
            return false
        } else {
            for (const filename of Object.keys(this.#unresolved)) {
                if (this.#unresolved[filename] !== 'Windows') {
                    return false
                }
            }
            return true
        }
    }

    buildAssetsView(): { binaries: Record<OperatingSystem, Array<Binary>>, additionalAssets: Array<Asset> } {
        const binaries: Record<OperatingSystem, Array<Binary>> = {
            Linux: [],
            MacOS: [],
            Windows: [],
        }
        if (this.#repo.latestRelease) {
            for (const binary of this.#repo.latestRelease.binaries) {
                binaries[binary.os].push(binary)
            }
        }
        return {
            binaries,
            additionalAssets: this.#repo.latestRelease?.otherAssets || [],
        }
    }

    buildGenerateScriptOptions(): GenerateScriptOptions {
        return {
            binaryInstalls: [{
                installAs: this.#repo.name,
                binaries: this.#repo.latestRelease!.binaries.map(binary => binary.filename),
            }],
            explicitArchitectures: this.#resolved,
            repository: this.#repo,
            resolvedDistributions: this.#collectResolvedDistributions(),
        }
    }

    #collectResolvedDistributions(): Record<string, Distribution> {
        const files: Record<string, Distribution> = {}
        for (const binary of this.#repo.latestRelease!.binaries) {
            files[binary.filename] = {
                arch: binary.arch,
                os: binary.os,
            }
        }
        return files
    }

    // #findOsForBinaryFilename(filename: string): OperatingSystem {
    //     for (const os of Object.keys(this.#binaries)) {
    //         for (const binary of this.#binaries[os as OperatingSystem]) {
    //             if (binary.filename === filename) {
    //                 return os as OperatingSystem
    //             }
    //         }
    //     }
    //     throw new Error()
    // }
}
