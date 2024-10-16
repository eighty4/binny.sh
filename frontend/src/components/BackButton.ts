import css from './BackButton.css?inline'
import html from './BackButton.html?raw'
import {cloneTemplate} from '../dom.ts'

export default class BackButton extends HTMLElement {

    private static readonly TEMPLATE_ID = 'tmpl-back-button'

    static templateHTML(): string {
        return `<template id="${this.TEMPLATE_ID}"><style>${css}</style>${html}</template>`
    }

    static readonly SIZE = 30

    static observedAttributes = ['label']

    readonly #shadow: ShadowRoot

    constructor() {
        super()
        this.#shadow = this.attachShadow({mode: 'open'})
        this.#shadow.appendChild(cloneTemplate(BackButton.TEMPLATE_ID))
    }

    connectedCallback() {
        const label = this.getAttribute('label')
        if (label) {
            this.#setLabel(label)
        }

        this.addEventListener('click', this.#onClick)
    }

    disconnectedCallback() {
        this.removeEventListener('click', this.#onClick)
    }

    attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
        if (name === 'label') {
            this.#setLabel(newValue)
        }
    }

    #onClick = () => {
        history.back()
    }

    #setLabel(label: string) {
        console.log(label)
    }
}
