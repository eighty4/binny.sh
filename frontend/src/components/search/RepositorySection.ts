import RepositoryLink from './RepositoryLink.ts'
import css from './RepositorySection.css?inline'
import {cloneTemplate, removeChildNodes} from '../../dom.ts'
import type {RepositoryWithScript} from '../../routes/searchData.ts'

export type RepoSectionType = 'generated' | 'released' | 'compatible' | 'incompatible'

function repoSectionHeader(type: RepoSectionType): string {
    switch (type) {
        case 'generated':
            return 'Your release scripts'
        case 'released':
            return 'With released binaries'
        case 'compatible':
            return 'Uses compiled languages'
        case 'incompatible':
            return 'All your JavaScript, Python and Ruby repositories (that create excessive carbon footprints and are bad for the environment)'
    }
}

export default class RepositorySection extends HTMLElement {

    private static readonly TEMPLATE_ID = 'tmpl-repo-section'

    static templateHTML(): string {
        return `
            <template id="${RepositorySection.TEMPLATE_ID}">
                <style>${css}</style>
                <h3></h3>
                <div class="repos"></div>
            </template>`
    }

    #repos: Array<RepositoryWithScript> = []

    readonly #reposDiv: HTMLDivElement

    readonly #shadow: ShadowRoot

    constructor(type: RepoSectionType, repos: Array<RepositoryWithScript>) {
        super()
        this.#shadow = this.attachShadow({mode: 'open'})
        this.#shadow.appendChild(cloneTemplate(RepositorySection.TEMPLATE_ID))
        this.#shadow.querySelector('h3')!.innerText = repoSectionHeader(type)
        this.#reposDiv = this.#shadow.querySelector('.repos')!
        this.repos = repos
    }

    set repos(repos: Array<RepositoryWithScript>) {
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
