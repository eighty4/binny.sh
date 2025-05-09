import { type Asset, type Binary, Unauthorized } from '@eighty4/binny-github'
import {
    generateScript,
    OPERATING_SYSTEMS,
    type OperatingSystem,
} from '@eighty4/binny-template'
import {
    ARCHITECTURE_UPDATE_EVENT_TYPE,
    type ArchitectureUpdateEvent,
} from './ArchitectureUpdate.ts'
import css from './ConfigureScript.css?inline'
import html from './ConfigureScript.html?raw'
import { downloadScript } from './download.ts'
import DownloadPanel, {
    DOWNLOAD_SCRIPT_EVENT_TYPE,
    type DownloadScriptEvent,
} from './DownloadPanel.ts'
import ScriptConfiguration from './ScriptConfiguration.ts'
import { saveGeneratedScript } from '../../api.ts'
import { cloneTemplate, removeChildNodes } from '../../dom.ts'
import type { RepositoryWithScript } from '../../routes/searchData.ts'
import { logout } from '../../session/logout.ts'

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
        this.#configuration = new ScriptConfiguration((this.#repo = repo))
        this.#shadow = this.attachShadow({ mode: 'open' })
        this.#shadow.appendChild(cloneTemplate(ConfigureScript.TEMPLATE_ID))
        this.#shadow.append((this.#downloadPanel = new DownloadPanel()))
    }

    connectedCallback() {
        this.#downloadPanel.addEventListener(
            DOWNLOAD_SCRIPT_EVENT_TYPE,
            this.#onDownloadButtonClick as EventListener,
        )
        this.#downloadPanel.update(this.#configuration)
        this.#shadow.querySelector('#commit')!.textContent =
            this.#repo.latestRelease?.commitHash || ''
        this.#shadow.querySelector('#name')!.textContent =
            `${this.#repo.owner}/${this.#repo.name}`
        this.#shadow.querySelector('#version')!.textContent =
            this.#repo.latestRelease?.tag || ''
        const { binaries, additionalAssets } =
            this.#configuration.buildAssetsView()
        this.#renderBinariesTable(binaries)
        this.#renderAssetsTable(additionalAssets)
    }

    disconnectedCallback() {
        this.#downloadPanel.removeEventListener(
            'download-script',
            this.#onDownloadButtonClick as EventListener,
        )
        for (const configureBinaries of this.#shadow.querySelectorAll(
            'architecture-select',
        )) {
            configureBinaries.removeEventListener(
                ARCHITECTURE_UPDATE_EVENT_TYPE,
                this.#onArchUpdate as EventListener,
            )
        }
        removeChildNodes(this.#shadow)
    }

    #renderBinariesTable(binaries: Record<OperatingSystem, Array<Binary>>) {
        let tableHtml = ''
        tableHtml += `<thead><tr><th>Binaries</th></tr></thead>`
        for (const os of OPERATING_SYSTEMS) {
            tableHtml += `<tr class="os"><th>${os}</th></tr>`
            if (binaries[os].length) {
                for (const bin of binaries[os]) {
                    const arch = bin.arch
                        ? bin.arch
                        : `<architecture-select data-filename="${bin.filename}"></architecture-select>`
                    tableHtml += `<tr class="file"><td>${bin.filename}</td><td>${arch}</td></tr>`
                }
            } else {
                tableHtml += `<tr class="empty"><td>&nbsp;</td></tr>`
            }
        }
        const table = document.createElement('table')
        table.id = 'binaries'
        table.innerHTML = tableHtml
        for (const archSelect of table.querySelectorAll(
            'architecture-select',
        )) {
            archSelect.addEventListener(
                ARCHITECTURE_UPDATE_EVENT_TYPE,
                this.#onArchUpdate as EventListener,
            )
        }
        this.#shadow.appendChild(table)
    }

    // todo accordian
    #renderAssetsTable(assets: Array<Asset>) {
        let tableHtml = ''
        tableHtml += `<thead><tr><th>Other release assets</th></tr></thead>`
        for (const asset of assets) {
            tableHtml += `<tr class="file"><td>${asset.filename}</td><td>${asset.contentType}</td></tr>`
        }
        const table = document.createElement('table')
        table.id = 'assets'
        table.innerHTML = tableHtml
        this.#shadow.appendChild(table)
    }

    #onArchUpdate = ({
        detail: { arch, filename },
    }: ArchitectureUpdateEvent) => {
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
        const generatedScript = generateScript(
            this.#configuration.buildGenerateScriptOptions(),
        )
        downloadScript(`install_${this.#repo.name}.sh`, generatedScript.script)
        saveGeneratedScript(generatedScript)
            .then()
            .catch(e => {
                if (e instanceof Unauthorized) {
                    logout()
                } else {
                    console.error(e)
                    alert(
                        "The clouds are broken. We'll redirect you to the homepage.",
                    )
                    window.location.replace('/')
                }
            })
    }
}
