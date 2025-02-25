import { type Architecture, ARCHITECTURES } from '@eighty4/install-template'
import css from './ArchitectureSelect.css?inline'
import html from './ArchitectureSelect.html?raw'
import { createArchitectureUpdate } from './ArchitectureUpdate.ts'

export default class ArchitectureSelect extends HTMLElement {
    private static readonly TEMPLATE_ID = 'tmpl-architecture-select'

    static templateHTML(): string {
        return `<template id="${this.TEMPLATE_ID}"><style>${css}</style>${html}</template>`
    }

    readonly #select: HTMLSelectElement

    constructor() {
        super()
        this.#select = document.createElement('select')!
        this.#select.classList.add('arch')
    }

    connectedCallback() {
        this.#select.innerHTML =
            '<option value=""></option>' +
            ARCHITECTURES.map(arch => `<option>${arch}</option>`).join('')
        this.#select.addEventListener('input', this.#onArchUpdate)
        this.appendChild(this.#select)
    }

    disconnectedCallback() {
        this.#select.removeEventListener('input', this.#onArchUpdate)
        this.#select.remove()
    }

    #onArchUpdate = () => {
        this.#select.querySelector('option[value=""]')?.remove()
        const arch = this.#select.value as Architecture
        this.dispatchEvent(
            createArchitectureUpdate(arch, this.getAttribute('data-filename')!),
        )
    }
}
