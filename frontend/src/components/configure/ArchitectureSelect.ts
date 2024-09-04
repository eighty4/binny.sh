import type {Architecture} from '@eighty4/install-template'
import css from './ArchitectureSelect.css?inline'
import html from './ArchitectureSelect.html?raw'
import {cloneTemplate} from '../../dom.ts'

export default class ArchitectureSelect extends HTMLElement {

    private static readonly TEMPLATE_ID = 'tmpl-architecture-select'

    static templateHTML(): string {
        return `<template id="${this.TEMPLATE_ID}"><style>${css}</style>${html}</template>`
    }

    readonly #label: HTMLElement

    readonly #menu: HTMLElement

    readonly #shadow: ShadowRoot

    constructor(menuAnchorName: string) {
        super()
        this.#shadow = this.attachShadow({mode: 'open'})
        this.#shadow.appendChild(cloneTemplate(ArchitectureSelect.TEMPLATE_ID))
        this.#label = this.#shadow.querySelector('.label') as HTMLElement
        this.#label.style.setProperty('--anchor-name', menuAnchorName)
        this.#menu = this.#shadow.querySelector('.menu') as HTMLElement
        this.#menu.style.setProperty('--anchor-name', menuAnchorName)
    }

    connectedCallback() {
        this.update()
        this.#label.addEventListener('click', this.openMenu)
        for (const menuItem of this.#menu.querySelectorAll('.item')) {
            menuItem.addEventListener('click', this.selectArchitecture)
        }
    }

    disconnectedCallback() {
        this.#label.removeEventListener('click', this.openMenu)
        for (const menuItem of this.#menu.querySelectorAll('.item')) {
            menuItem.removeEventListener('click', this.selectArchitecture)
        }
    }

    attributeChangedCallback(name: string, _oldValue: string, _newValue: string) {
        if (name === 'value') {
            this.update()
        }
    }

    get value(): Architecture | null {
        return this.getAttribute('value') as Architecture | null
    }

    set value(architecture: Architecture) {
        this.setAttribute('value', architecture)
    }

    update() {
        const arch = this.value
        this.#label.textContent = arch ?? 'Select a CPU arch'
    }

    openMenu = () => {
        this.#menu.classList.toggle('open')
        // document.addEventListener('click', () => {
        //     console.log('wooooo')
        // }, {once: true})
    }

    selectArchitecture = () => {

    }
}
