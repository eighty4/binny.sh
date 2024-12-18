import {type OperatingSystem} from '@eighty4/install-template'
import css from './DownloadPanel.css?inline'
import html from './DownloadPanel.html?raw'
import {cloneTemplate, removeChildNodes} from '../../dom.ts'
import type ScriptConfiguration from './ScriptConfiguration.ts'

export const DOWNLOAD_SCRIPT_EVENT_TYPE = 'download-script'

export type DownloadScriptEvent = CustomEvent<OperatingSystem>

export default class DownloadPanel extends HTMLElement {

    private static readonly TEMPLATE_ID = 'tmpl-download-panel'

    static templateHTML(): string {
        return `<template id="${this.TEMPLATE_ID}"><style>${css}</style>${html}</template>`
    }

    readonly #downloadLinuxButton: HTMLButtonElement

    readonly #downloadWindowsButton: HTMLButtonElement

    readonly #shadow: ShadowRoot

    constructor() {
        super()
        this.#shadow = this.attachShadow({mode: 'open'})
        this.#shadow.appendChild(cloneTemplate(DownloadPanel.TEMPLATE_ID))
        this.#downloadLinuxButton = this.#shadow.querySelector('button[data-os="linux"]')!
        this.#downloadWindowsButton = this.#shadow.querySelector('button[data-os="windows"]')!
    }

    connectedCallback() {
        this.#downloadLinuxButton.addEventListener('click', this.#downloadLinux)
        this.#downloadWindowsButton.addEventListener('click', this.#downloadWindows)
    }

    disconnectedCallback() {
        this.#downloadLinuxButton.removeEventListener('click', this.#downloadLinux)
        this.#downloadWindowsButton.removeEventListener('click', this.#downloadWindows)
        removeChildNodes(this.#shadow)
    }

    // todo change download button text if script only includes Linux or MacOS binaries
    update(configuration: ScriptConfiguration) {
        this.#downloadLinuxButton.disabled = !(configuration.areOsBinariesResolved('Linux') && configuration.areOsBinariesResolved('MacOS'))
        this.#downloadWindowsButton.disabled = !configuration.areOsBinariesResolved('Windows')
    }

    #downloadLinux = () => this.#download('Linux')

    #downloadWindows = () => this.#download('Windows')

    #download(detail: OperatingSystem) {
        this.dispatchEvent(new CustomEvent<OperatingSystem>(DOWNLOAD_SCRIPT_EVENT_TYPE, {detail}))
    }
}
