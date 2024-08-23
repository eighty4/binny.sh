import css from './RepositorySection.css?inline'
import {cloneTemplate, removeChildNodes} from '../../dom.ts'
import type {Repository} from '@eighty4/install-github'
import RepositoryLink from './RepositoryLink.ts'

export default class RepositorySection extends HTMLElement {

    static observedAttributes = ['header']

    private static readonly TEMPLATE_ID = 'tmpl-repo-section'

    static templateHTML(): string {
        return `
            <template id="${RepositorySection.TEMPLATE_ID}">
                <style>${css}</style>
                <h3></h3>
                <div class="repos"></div>
            </template>`
    }

    #repos: Array<Repository> = []

    readonly #reposDiv: HTMLDivElement

    readonly #shadow: ShadowRoot

    constructor() {
        super()
        this.#shadow = this.attachShadow({mode: 'open'})
        this.#shadow.appendChild(cloneTemplate(RepositorySection.TEMPLATE_ID))
        this.#reposDiv = this.#shadow.querySelector('.repos')!
    }

    attributeChangedCallback(name: any, _oldValue: string, newValue: string) {
        if (name === 'header') {
            this.#shadow.querySelector('h3')!.innerText = newValue
        }
    }

    set repos(repos: Array<Repository>) {
        // todo sort repos
        this.#repos = repos
        this.#update()
    }

    #update() {
        this.#clear()
        for (const repo of this.#repos) {
            this.#reposDiv.appendChild(new RepositoryLink(repo))
        }
    }

    #clear() {
        removeChildNodes(this.#reposDiv)
    }
}
