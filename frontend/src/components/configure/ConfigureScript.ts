import type {Binary, Repository} from '@eighty4/install-github'
import type {Distribution, GenerateScriptOptions, OperatingSystem} from '@eighty4/install-template'
import ConfigureBinaries from './ConfigureBinaries.ts'
import css from './ConfigureScript.css?inline'
import {cloneTemplate} from '../../dom.ts'
import {downloadScript} from '../../download.ts'

export default class ConfigureScript extends HTMLElement {

    private static readonly TEMPLATE_ID = 'tmpl-configure-script'

    static templateHTML(): string {
        return `
            <template id="${this.TEMPLATE_ID}">
                <style>${css}</style>
                <div class="header">
                    <div class="row">
                        <profile-picture></profile-picture>
                        <span class="name"></span>
                        <span class="version"></span>
                    </div>
                    <div class="row">
                        <span style="flex: 1"></span>
                        <span class="commit"></span>
                    </div>
                </div>
                <div class="buttons">
                </div>
                <div class="files">
                </div>
            </template>
        `
    }

    readonly #binaries: Record<OperatingSystem, Array<Binary>> = {
        Linux: [],
        MacOS: [],
        Windows: [],
    }

    readonly #downloadButtons: Partial<Record<OperatingSystem, HTMLButtonElement>> = {}

    readonly #repo: Repository

    readonly #shadow: ShadowRoot

    constructor(repo: Repository) {
        super()
        if (repo.latestRelease?.binaries) {
            for (const binary of repo.latestRelease.binaries!) {
                this.#binaries[binary.os].push(binary)
            }
        }
        this.#repo = repo
        this.#shadow = this.attachShadow({mode: 'open'})
        this.#shadow.appendChild(cloneTemplate(ConfigureScript.TEMPLATE_ID))
        this.#shadow.querySelector('profile-picture')!.setAttribute('owner', repo.owner)
        if (this.#binaries['Linux'].length || this.#binaries['MacOS'].length) {
            this.#downloadButtons['Linux'] = this.#downloadButtons['MacOS'] = this.#shadow.querySelector('.buttons')!
                .appendChild(this.#createDownloadButton('Linux'))
        }
        if (this.#binaries['Windows']) {
            this.#downloadButtons['Windows'] = this.#shadow.querySelector('.buttons')!
                .appendChild(this.#createDownloadButton('Windows'))
        }
        this.update()
    }

    disconnectedCallback() {
        for (const os of Object.keys(this.#downloadButtons)) {
            this.#downloadButtons[os as OperatingSystem]!.removeEventListener('click', this.#onDownloadButtonClick)
        }
    }

    update() {
        this.#shadow.querySelector('.commit')!.textContent = this.#repo.latestRelease?.commitHash || ''
        this.#shadow.querySelector<HTMLElement>('.header')!.style.viewTransitionName = `repo-${this.#repo.owner}-${this.#repo.name}`
        this.#shadow.querySelector('.name')!.textContent = `${this.#repo.owner}/${this.#repo.name}`
        this.#shadow.querySelector('.version')!.textContent = this.#repo.latestRelease?.tag || ''
        const binariesContainer = this.#shadow.querySelector('.files') as HTMLElement
        if (this.#repo.latestRelease?.binaries.length) {
            if (this.#binaries['Linux'].length) {
                binariesContainer.appendChild(new ConfigureBinaries(this.#binaries['Linux'], 'Linux'))
            }
            if (this.#binaries['MacOS'].length) {
                binariesContainer.appendChild(new ConfigureBinaries(this.#binaries['MacOS'], 'MacOS'))
            }
            if (this.#binaries['Windows'].length) {
                binariesContainer.appendChild(new ConfigureBinaries(this.#binaries['Windows'], 'Windows'))
            }
        }
        console.log('ConfigureScript', this.#repo.latestRelease?.binaries)
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
        downloadButton.setAttribute('data-os', os)
        if (os === 'Windows') {
            downloadButton.disabled = true
        }
        return downloadButton
    }

    #onDownloadButtonClick = (/*e: MouseEvent*/) => {
        // (e.target as HTMLButtonElement).getAttribute('data-os')
        downloadScript(this.#buildGenerateScriptOptions())
    }

    // todo binaryName needs a ui input to override default of repo name
    #buildGenerateScriptOptions(): GenerateScriptOptions {
        const files: Record<string, Distribution> = {}
        for (const os of Object.keys(this.#binaries)) {
            for (const binary of this.#binaries[os as OperatingSystem]) {
                if (binary.arch) {
                    files[binary.filename] = {
                        arch: binary.arch,
                        os: binary.os,
                    }
                }
            }
        }
        return {
            repository: {
                owner: this.#repo.owner,
                name: this.#repo.name,
            },
            binaryName: this.#repo.name,
            files,
        }
    }
}
