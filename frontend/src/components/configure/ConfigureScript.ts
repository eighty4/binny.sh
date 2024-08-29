import {type Binary, Unauthorized} from '@eighty4/install-github'
import type {Architecture, Distribution, GenerateScriptOptions, OperatingSystem} from '@eighty4/install-template'
import {generateScript, OPERATING_SYSTEMS} from '@eighty4/install-template'
import {ARCHITECTURE_UPDATE_EVENT_TYPE, type ArchitectureUpdateEvent} from './ArchitectureUpdate.ts'
import ConfigureBinaryFile from './ConfigureBinaryFile.ts'
import css from './ConfigureScript.css?inline'
import html from './ConfigureScript.html?raw'
import {downloadScript} from './download.ts'
import {saveGeneratedScript} from '../../api.ts'
import {cloneTemplate, removeChildNodes} from '../../dom.ts'
import {logout} from '../../logout.ts'
import type {RepositoryWithScript} from '../../routes/searchData.ts'

// todo links to gh commit, repo and release pages
// todo release date
// todo repo languages
export default class ConfigureScript extends HTMLElement {

    private static readonly TEMPLATE_ID = 'tmpl-configure-script'

    static templateHTML(): string {
        return `<template id="${this.TEMPLATE_ID}"><style>${css}</style>${html}</template>`
    }

    readonly #architectureResolved: Record<string, Architecture> = {}

    readonly #architectureUnresolved: Record<string, OperatingSystem> = {}

    readonly #binaries: Record<OperatingSystem, Array<Binary>> = {
        Linux: [],
        MacOS: [],
        Windows: [],
    }

    readonly #downloadButtons: Partial<Record<OperatingSystem, HTMLButtonElement>> = {}

    readonly #repo: RepositoryWithScript

    readonly #shadow: ShadowRoot

    constructor(readonly repo: RepositoryWithScript) {
        super()
        if (repo.latestRelease?.binaries) {
            for (const binary of repo.latestRelease.binaries!) {
                this.#binaries[binary.os].push(binary)
                if (!binary.arch) {
                    this.#architectureUnresolved[binary.filename] = binary.os
                }
            }
        }
        if (repo.script?.spec.explicitArchitectures) {
            for (const filename of Object.keys(repo.script.spec.explicitArchitectures)) {
                this.#resolveArchitecture(filename, repo.script.spec.explicitArchitectures[filename])
            }
        }
        this.#repo = repo
        this.#shadow = this.attachShadow({mode: 'open'})
        this.#shadow.appendChild(cloneTemplate(ConfigureScript.TEMPLATE_ID))
        if (this.#binaries['Linux'].length || this.#binaries['MacOS'].length) {
            this.#downloadButtons['Linux'] = this.#downloadButtons['MacOS'] = this.#shadow.querySelector('.buttons')!
                .appendChild(this.#createDownloadButton('Linux'))
        }
        if (this.#binaries['Windows']) {
            this.#downloadButtons['Windows'] = this.#shadow.querySelector('.buttons')!
                .appendChild(this.#createDownloadButton('Windows'))
        }
        this.#render()
    }

    disconnectedCallback() {
        for (const os of Object.keys(this.#downloadButtons)) {
            this.#downloadButtons[os as OperatingSystem]!.removeEventListener('click', this.#onDownloadButtonClick)
        }
        for (const configureBinaries of this.#shadow.querySelectorAll('configure-binary')) {
            configureBinaries.removeEventListener(ARCHITECTURE_UPDATE_EVENT_TYPE, this.#onArchUpdate as EventListener)
        }
        removeChildNodes(this.#shadow)
    }

    #render() {
        this.#shadow.querySelector('.commit')!.textContent = this.#repo.latestRelease?.commitHash || ''
        this.#shadow.querySelector<HTMLElement>('.header')!.style.viewTransitionName = `repo-${this.#repo.owner}-${this.#repo.name}`
        this.#shadow.querySelector('.name')!.textContent = `${this.#repo.owner}/${this.#repo.name}`
        this.#shadow.querySelector('.version')!.textContent = this.#repo.latestRelease?.tag || ''
        if (this.#repo.latestRelease?.binaries.length) {
            for (const os of OPERATING_SYSTEMS) {
                this.#renderConfigureBinaryFiles(this.#shadow.querySelector(`.bins-by-os.${os.toLowerCase()} .bins`)!, os)
            }
        } else {
            // todo will somebody think of the lack of content for repos without binaries?
        }
        // todo nice to have render non binary file assets
    }

    #renderConfigureBinaryFiles(container: HTMLElement, os: OperatingSystem) {
        const bins = this.#binaries[os]
        if (bins.length) {
            for (const bin of bins) {
                container.appendChild(new ConfigureBinaryFile(bin, this.#repo.script?.spec.explicitArchitectures[bin.filename]))
                    .addEventListener(ARCHITECTURE_UPDATE_EVENT_TYPE, this.#onArchUpdate as EventListener)
            }
        } else {
            const p = document.createElement('p')
            p.classList.add('text')
            p.textContent = `Release does not include binaries for ${os}.`
            container.replaceWith(p)
        }
    }

    #createDownloadButton(os: OperatingSystem): HTMLButtonElement {
        const downloadButton = document.createElement('button')
        downloadButton.classList.add('download')
        downloadButton.innerHTML = `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M7.50005 1.04999C7.74858 1.04999 7.95005 1.25146 7.95005 1.49999V8.41359L10.1819 6.18179C10.3576 6.00605 10.6425 6.00605 10.8182 6.18179C10.994 6.35753 10.994 6.64245 10.8182 6.81819L7.81825 9.81819C7.64251 9.99392 7.35759 9.99392 7.18185 9.81819L4.18185 6.81819C4.00611 6.64245 4.00611 6.35753 4.18185 6.18179C4.35759 6.00605 4.64251 6.00605 4.81825 6.18179L7.05005 8.41359V1.49999C7.05005 1.25146 7.25152 1.04999 7.50005 1.04999ZM2.5 10C2.77614 10 3 10.2239 3 10.5V12C3 12.5539 3.44565 13 3.99635 13H11.0012C11.5529 13 12 12.5528 12 12V10.5C12 10.2239 12.2239 10 12.5 10C12.7761 10 13 10.2239 13 10.5V12C13 13.1041 12.1062 14 11.0012 14H3.99635C2.89019 14 2 13.103 2 12V10.5C2 10.2239 2.22386 10 2.5 10Z"
    fill="currentColor"
  />
</svg>`
        downloadButton.appendChild(document.createTextNode(`for ${os === 'Windows' ? 'Windows' : 'Linux and MacOS'}`))
        downloadButton.addEventListener('click', this.#onDownloadButtonClick)
        downloadButton.disabled = !this.#isDownloadButtonEnabled(os)
        return downloadButton
    }

    #isDownloadButtonEnabled(os: OperatingSystem): boolean {
        if (os === 'Windows') {
            return false
        } else {
            for (const filename of Object.keys(this.#architectureUnresolved)) {
                if (this.#architectureUnresolved[filename] !== 'Windows') {
                    return false
                }
            }
            return true
        }
    }

    #updateDownloadButtonEnabled(os: OperatingSystem) {
        this.#downloadButtons[os]!.disabled = !(os === 'Windows'
            ? this.#isDownloadButtonEnabled(os)
            : (['Linux', 'MacOS'] as Array<OperatingSystem>).every(os => this.#isDownloadButtonEnabled(os)))
    }

    #onArchUpdate = ({detail: {arch, filename}}: ArchitectureUpdateEvent) => {
        if (this.#resolveArchitecture(filename, arch)) {
            this.#updateDownloadButtonEnabled(this.#findOsForBinaryFilename(filename))
        }
    }

    #resolveArchitecture(filename: string, arch: Architecture): boolean {
        this.#architectureResolved[filename] = arch
        const previouslyUnresolved = !!this.#architectureUnresolved[filename]
        if (previouslyUnresolved) {
            delete this.#architectureUnresolved[filename]
        }
        return previouslyUnresolved
    }

    #findOsForBinaryFilename(filename: string): OperatingSystem {
        for (const os of Object.keys(this.#binaries)) {
            for (const binary of this.#binaries[os as OperatingSystem]) {
                if (binary.filename === filename) {
                    return os as OperatingSystem
                }
            }
        }
        throw new Error()
    }

    // todo script filename needs a ui input to override default
    #onDownloadButtonClick = () => {
        // todo support windows
        const generatedScript = generateScript(this.#buildGenerateScriptOptions())
        downloadScript(`install_${this.#repo.name}.sh`, generatedScript.script)
        saveGeneratedScript(generatedScript).then().catch((e) => {
            if (e instanceof Unauthorized) {
                logout()
            } else {
                console.error(e)
                alert('The clouds are broken. We\'ll redirect you to the homepage.')
                window.location.replace('/')
            }
        })
    }

    // todo binaryName needs a ui input to override default of repo name
    #buildGenerateScriptOptions(): GenerateScriptOptions {
        return {
            binaryInstalls: [{
                installAs: this.#repo.name,
                binaries: this.#repo.latestRelease!.binaries.map(binary => binary.filename),
            }],
            explicitArchitectures: this.#architectureResolved,
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
}
