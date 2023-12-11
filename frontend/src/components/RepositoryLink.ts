import type {Repository} from '@eighty4/install-github'
import SystemLogo from './SystemLogo.ts'
import {configureRepositoryCache} from '../configure.ts'
import {cloneTemplate} from '../dom.ts'
import {pushConfigureRoute} from '../router.ts'

export default class RepositoryLink extends HTMLElement {

    private static readonly AVATAR_SIZE = 20

    private static readonly TEMPLATE_ID = 'tmpl-repo-link'

    static templateHTML(): string {
        return `
            <template id="${this.TEMPLATE_ID}">
                <style>
                    .link {
                        background: #111;
                        border: 1px solid transparent;
                        color: var(--head-text-color);
                        display: flex;
                        flex-direction: column;
                        gap: .75rem;
                        text-decoration: none;
                        padding: 1rem;
                        box-sizing: border-box;
                        cursor: pointer;
                        transition: all .3s ease-in-out;
                    }
                    .link:hover {
                        background: #282828;
                        border-color: #555;
                        border-radius: ${this.AVATAR_SIZE}px;
                        padding: 1rem 1.5rem;
                        transform: scale(.9);
                        transform-origin: center;
                    }
                    .deets, .header {
                        display: flex;
                        align-items: center;
                        gap: .75rem;
                    }
                    .header img {
                        border-radius: ${this.AVATAR_SIZE / 2}px;
                    }
                    .name {
                        flex: 1;
                        font-size: 1.1rem;
                    }
                    .version {
                        font-size: .9rem;
                    }
                    .deets {
                        padding-left: calc(.5rem + ${this.AVATAR_SIZE}px);
                    }
                    .os-logos {
                        display: contents;
                    }
                    .update {
                        font-size: .8rem;
                        flex: 1;
                        text-align: right;
                    }
                </style>
                <div class="link">
                    <div class="header">
                        <img class="profile-pic" alt="" height="${this.AVATAR_SIZE}" width="${this.AVATAR_SIZE}"/>
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
        this.update()
    }

    connectedCallback() {
        this.addEventListener('click', this.onClick)
    }

    disconnectedCallback() {
        this.removeEventListener('click', this.onClick)
    }

    private onClick = () => {
        configureRepositoryCache.write(this.#repo)
        this.style.viewTransitionName = `repo-${this.#repo.owner}-${this.#repo.name}`
        pushConfigureRoute(this.#repo)
    }

    private update() {
        const profilePicElem = this.#shadow.querySelector('.profile-pic') as HTMLImageElement
        profilePicElem.alt = `${this.#repo.owner} profile picture`
        profilePicElem.src = `https://github.com/${this.#repo.owner}.png?size=${RepositoryLink.AVATAR_SIZE}`
        this.#shadow.querySelector('.name')!.textContent = `${this.#repo.owner}/${this.#repo.name}`
        this.#shadow.querySelector('.update')!.textContent = this.#repo.latestRelease?.commitHash || ''
        this.#shadow.querySelector('.version')!.textContent = this.#repo.latestRelease?.tag || ''
        const osLogos = this.#shadow!.querySelector('.os-logos') as HTMLElement
        // osLogos.appendChild(document.createTextNode(this.#repo.latestRelease?.binaries.length === 1 ? '1 binary' : this.#repo.latestRelease?.binaries.length + ' binaries'))
        if (this.#repo.latestRelease?.binaries.some(b => b.os === 'Linux')) {
            osLogos.appendChild(new SystemLogo('Linux'))
        }
        if (this.#repo.latestRelease?.binaries.some(b => b.os === 'MacOS')) {
            osLogos.appendChild(new SystemLogo('MacOS'))
        }
        if (this.#repo.latestRelease?.binaries.some(b => b.os === 'Windows')) {
            osLogos.appendChild(new SystemLogo('Windows'))
        }
    }
}
