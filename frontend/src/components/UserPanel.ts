import css from './UserPanel.css?inline'
import html from './UserPanel.html?raw'
import {cloneTemplate} from '../dom.ts'
import {logout} from '../session/logout.ts'

export default class UserPanel extends HTMLElement {

    private static readonly TEMPLATE_ID = 'tmpl-user-panel'

    static templateHTML(): string {
        return `<template id="${this.TEMPLATE_ID}"><style>${css}</style>${html}</template>`
    }

    readonly #shadow: ShadowRoot

    constructor() {
        super()
        this.#shadow = this.attachShadow({mode: 'open'})
        this.#shadow.appendChild(cloneTemplate(UserPanel.TEMPLATE_ID))
    }

    connectedCallback() {
        this.#getAvatarImage().src = this.getAttribute('avatar')!
        this.#getUsernameElement().textContent = this.getAttribute('username')
        this.#getLogoutButton().addEventListener('click', logout)
    }

    #getAvatarImage(): HTMLImageElement {
        return this.#shadow.querySelector('#avatar')! as HTMLImageElement
    }

    #getUsernameElement(): HTMLElement {
        return this.#shadow.querySelector('#username')!
    }

    #getLogoutButton(): HTMLElement {
        return this.#shadow.querySelector('#logout')!
    }
}
