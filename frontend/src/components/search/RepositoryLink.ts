import type {Repository} from '@eighty4/install-github'
import css from './RepositoryLink.css?inline'
import SystemLogo from '../SystemLogo.ts'
import {configureRepoCache} from '../../sessionCache.ts'
import {cloneTemplate} from '../../dom.ts'
import {pushConfigureRoute} from '../../router.ts'

export default class RepositoryLink extends HTMLElement {

    private static readonly TEMPLATE_ID = 'tmpl-repo-link'

    static templateHTML(): string {
        return `
            <template id="${this.TEMPLATE_ID}">
                <style>${css}</style>
                <div class="link">
                    <div class="header">
                        <profile-picture></profile-picture>
                        <span class="name"></span>
                        <span class="version"></span>
                    </div>
                    <div class="deets">
                        <span class="os-logos"></span>
                        <span class="update"></span>
                    </div>
                </div>
            </template>`
    }

    readonly #repo: Repository

    readonly #shadow: ShadowRoot

    constructor(readonly repo: Repository) {
        super()
        this.#repo = repo
        this.#shadow = this.attachShadow({mode: 'open'})
        this.#shadow.appendChild(cloneTemplate(RepositoryLink.TEMPLATE_ID))
        this.#shadow.querySelector('profile-picture')!.setAttribute('owner', this.#repo.owner)
        this.update()
    }

    connectedCallback() {
        this.addEventListener('click', this.onClick)
    }

    disconnectedCallback() {
        this.removeEventListener('click', this.onClick)
    }

    private onClick = () => {
        configureRepoCache.write(this.#repo)
        this.style.viewTransitionName = `repo-${this.#repo.owner}-${this.#repo.name}`
        pushConfigureRoute(this.#repo)
    }

    private update() {
        this.#shadow.querySelector('.name')!.textContent = `${this.#repo.owner}/${this.#repo.name}`
        this.#shadow.querySelector('.update')!.textContent = this.#repo.latestRelease?.commitHash || ''
        this.#shadow.querySelector('.version')!.textContent = this.#repo.latestRelease?.tag || ''
        const osLogos = this.#shadow!.querySelector('.os-logos') as HTMLElement
        // osLogos.appendChild(document.createTextNode(this.#repo.latestRelease?.binaries.length === 1 ? '1 binary' : this.#repo.latestRelease?.binaries.length + ' binaries'))
        if (this.#repo.latestRelease?.binaries.some(b => b.os === 'Linux')) {
            osLogos.appendChild(new SystemLogo({os: 'Linux'}))
        }
        if (this.#repo.latestRelease?.binaries.some(b => b.os === 'MacOS')) {
            osLogos.appendChild(new SystemLogo({os: 'MacOS'}))
        }
        if (this.#repo.latestRelease?.binaries.some(b => b.os === 'Windows')) {
            osLogos.appendChild(new SystemLogo({os: 'Windows'}))
        }
    }
}
