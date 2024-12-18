import {Unauthorized} from '@eighty4/install-github'
import {generateScript, OPERATING_SYSTEMS} from '@eighty4/install-template'
import {ARCHITECTURE_UPDATE_EVENT_TYPE, type ArchitectureUpdateEvent} from './ArchitectureUpdate.ts'
import ConfigureBinaryFile from './ConfigureBinaryFile.ts'
import css from './ConfigureScript.css?inline'
import html from './ConfigureScript.html?raw'
import {downloadScript} from './download.ts'
import DownloadPanel, {DOWNLOAD_SCRIPT_EVENT_TYPE, type DownloadScriptEvent} from './DownloadPanel.ts'
import ScriptConfiguration from './ScriptConfiguration.ts'
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

    readonly #configuration: ScriptConfiguration

    readonly #downloadPanel: DownloadPanel

    readonly #repo: RepositoryWithScript

    readonly #shadow: ShadowRoot

    constructor(repo: RepositoryWithScript) {
        super()
        this.#configuration = new ScriptConfiguration(this.#repo = repo)
        this.#shadow = this.attachShadow({mode: 'open'})
        this.#shadow.appendChild(cloneTemplate(ConfigureScript.TEMPLATE_ID))
        this.#shadow.append(this.#downloadPanel = new DownloadPanel())
    }

    connectedCallback() {
        this.#downloadPanel.addEventListener(DOWNLOAD_SCRIPT_EVENT_TYPE, this.#onDownloadButtonClick as EventListener)
        this.#downloadPanel.update(this.#configuration)
        this.#shadow.querySelector('.commit')!.textContent = this.#repo.latestRelease?.commitHash || ''
        this.#shadow.querySelector<HTMLElement>('.header')!.style.viewTransitionName = `repo-${this.#repo.owner}-${this.#repo.name}`
        this.#shadow.querySelector('.name')!.textContent = `${this.#repo.owner}/${this.#repo.name}`
        this.#shadow.querySelector('.version')!.textContent = this.#repo.latestRelease?.tag || ''
        const assets = this.#configuration.buildAssetsView()
        for (const os of OPERATING_SYSTEMS) {
            const container = this.#shadow.querySelector(`.bins-by-os.${os.toLowerCase()} .bins`)!
            if (assets.binaries[os].length) {
                for (const bin of assets.binaries[os]) {
                    container.appendChild(new ConfigureBinaryFile(bin, this.#repo.script?.spec.explicitArchitectures[bin.filename]))
                        .addEventListener(ARCHITECTURE_UPDATE_EVENT_TYPE, this.#onArchUpdate as EventListener)
                }
            } else {
                const p = document.createElement('p')
                p.classList.add('text')
                p.textContent = `Release does not include binaries for ${os}.`
                container.replaceWith(p)
            }
            // todo nice to have render non binary file assets
        }
    }

    disconnectedCallback() {
        this.#downloadPanel.removeEventListener('download-script', this.#onDownloadButtonClick as EventListener)
        for (const configureBinaries of this.#shadow.querySelectorAll('configure-binary')) {
            configureBinaries.removeEventListener(ARCHITECTURE_UPDATE_EVENT_TYPE, this.#onArchUpdate as EventListener)
        }
        removeChildNodes(this.#shadow)
    }

    #onArchUpdate = ({detail: {arch, filename}}: ArchitectureUpdateEvent) => {
        if (this.#configuration.resolveArchitecture(filename, arch)) {
            this.#downloadPanel.update(this.#configuration)
        }
    }

    // todo script filename needs a ui input to override default
    #onDownloadButtonClick = (e: DownloadScriptEvent) => {
        // todo support windows
        if (e.detail === 'Windows') {
            throw new Error()
        }
        const generatedScript = generateScript(this.#configuration.buildGenerateScriptOptions())
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
}
