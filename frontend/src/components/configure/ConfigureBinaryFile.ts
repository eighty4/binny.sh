import type {Binary} from '@eighty4/install-github'
import {type Architecture, ARCHITECTURES} from '@eighty4/install-template'
import {ARCHITECTURE_UPDATE_EVENT_TYPE, createArchitectureUpdate} from './ArchitectureUpdate.ts'
import css from './ConfigureBinaryFile.css?inline'
import html from './ConfigureBinaryFile.html?raw'
import {cloneTemplate} from '../../dom.ts'

export default class ConfigureBinaryFile extends HTMLElement {

    private static readonly TEMPLATE_ID = 'tmpl-configure-binary-file'

    static templateHTML(): string {
        return `<template id="${this.TEMPLATE_ID}"><style>${css}</style>${html}</template>`
    }

    readonly #bin: Binary

    readonly #explicitArchitecture?: Architecture

    readonly #shadow: ShadowRoot

    constructor(bin: Binary, explicitArchitecture?: Architecture) {
        super()
        this.#bin = bin
        this.#explicitArchitecture = explicitArchitecture
        this.#shadow = this.attachShadow({mode: 'open'})
        this.#shadow.appendChild(cloneTemplate(ConfigureBinaryFile.TEMPLATE_ID))
    }

    connectedCallback() {
        this.#shadow.querySelector('.filename')!.textContent = this.#bin.filename
        const archContainer = this.#shadow.querySelector('.arch')!
        if (this.#bin.arch) {
            archContainer.textContent = this.#bin.arch
        } else {
            archContainer.replaceWith(this.#createNativeArchSelect())
        }
    }

    disconnectedCallback() {
        this.#shadow.querySelector('select')?.removeEventListener('input', this.#onNativeArchUpdate)
        this.#shadow.querySelector('architecture-select')?.removeEventListener(ARCHITECTURE_UPDATE_EVENT_TYPE, this.#onNativeArchUpdate)
    }

    #createNativeArchSelect(): HTMLSelectElement {
        const archSelect = document.createElement('select')
        archSelect.classList.add('arch')
        let optionsHtml = ARCHITECTURES.map(arch => `<option>${arch}</option>`).join('')
        archSelect.innerHTML = this.#explicitArchitecture ? optionsHtml : '<option value=""></option>' + optionsHtml
        archSelect.addEventListener('input', this.#onNativeArchUpdate)
        if (this.#explicitArchitecture) {
            archSelect.value = this.#explicitArchitecture
        }
        return archSelect
    }

    #onNativeArchUpdate = () => {
        this.#shadow.querySelector('option[value=""]')?.remove()
        const arch = this.#shadow.querySelector('select')!.value as Architecture
        this.dispatchEvent(createArchitectureUpdate(arch, this.#bin.filename))
    }

    // #createArchSelect(): ArchitectureSelect {
    //     console.log(this.#explicitArchitecture)
    //     const archSelect = new ArchitectureSelect(this.#bin.filename)
    //     archSelect.classList.add('arch')
    //     archSelect.addEventListener(ARCHITECTURE_UPDATE_EVENT_TYPE, this.#onArchUpdate as EventListener)
    //     if (this.#explicitArchitecture) {
    //         archSelect.value = this.#explicitArchitecture
    //     }
    //     return archSelect
    // }
    //
    // #onArchUpdate = ({detail: arch}: CustomEvent<Architecture>) => {
    //     this.dispatchEvent(createArchitectureUpdate(arch, this.#bin.filename))
    // }
}
