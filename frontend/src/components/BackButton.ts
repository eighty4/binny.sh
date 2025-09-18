import cloneTemplate from '@eighty4/binny-dom/cloneTemplate'
import css from './BackButton.css?inline'
import html from './BackButton.html?raw'

export default class BackButton extends HTMLElement {
    private static readonly TEMPLATE_ID = 'tmpl-back-button'

    static templateHTML(): string {
        return `<template id="${this.TEMPLATE_ID}"><style>${css}</style>${html}</template>`
    }

    #div: HTMLDivElement

    #enabled: boolean = false

    #mouseMoveTimeout: any

    #mouseMoveRest: any

    #navCounter: number = 0

    #poppedBackNav: boolean = false

    readonly #shadow: ShadowRoot

    constructor() {
        super()
        this.#shadow = this.attachShadow({ mode: 'open' })
        this.#shadow.appendChild(cloneTemplate(BackButton.TEMPLATE_ID))
        this.#div = this.#shadow.querySelector('div')!
    }

    connectedCallback() {
        this.addEventListener('click', this.#onClick)
        window.addEventListener('hashchange', this.#onHashchange)
        window.addEventListener('popstate', this.#onPopstate)
    }

    disconnectedCallback() {
        this.removeEventListener('click', this.#onClick)
        window.removeEventListener('hashchange', this.#onHashchange)
        window.removeEventListener('popstate', this.#onPopstate)
        window.removeEventListener('mousemove', this.#onGlobalMouseMove)
    }

    #onHashchange = () => {
        if (this.#poppedBackNav) {
            if (!--this.#navCounter) {
                this.#enable(false)
            }
        } else {
            this.#navCounter++
            this.#enable(true)
        }
    }

    // todo Safari? Firefox?
    #onPopstate = (e: PopStateEvent) => {
        this.#poppedBackNav = !!e.state
    }

    #onGlobalMouseMove = () => {
        if (this.#mouseMoveRest) {
            return
        }
        if (this.#mouseMoveTimeout) {
            clearTimeout(this.#mouseMoveTimeout)
        } else {
            this.#div.classList.add('hint')
        }
        this.#mouseMoveTimeout = setTimeout(() => {
            this.#div.classList.remove('hint')
            this.#mouseMoveTimeout = null
            this.#mouseMoveRest = setTimeout(() => {
                this.#mouseMoveRest = null
            }, 500)
        }, 300)
    }

    #onClick = () => history.back()

    #enable(enable: boolean) {
        if (this.#enabled !== enable) {
            if (enable) {
                window.addEventListener('mousemove', this.#onGlobalMouseMove)
                this.#div.classList.add('enabled')
            } else {
                this.#div.classList.remove('enabled')
                window.removeEventListener('mousemove', this.#onGlobalMouseMove)
                clearTimeout(this.#mouseMoveTimeout)
                this.#div.classList.remove('hint')
            }
            this.#enabled = enable
        }
    }
}
