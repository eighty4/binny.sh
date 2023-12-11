import type {Repository} from '@eighty4/install-github'
import ConfigureBinary from './ConfigureBinary.ts'
import {cloneTemplate} from '../dom.ts'

export default class ConfigureScript extends HTMLElement {

    private static readonly AVATAR_SIZE = 30

    private static readonly TEMPLATE_ID = 'tmpl-configure-script'

    static templateHTML(): string {
        return `
            <template id="${this.TEMPLATE_ID}">
                <style>
                    .bg {
                        background: rgba(238 238 238 / 70%);
                        padding: 1rem;
                    }
                    .header {
                        width: 45vw;
                    }
                    .row {
                        display: flex;
                        gap: .75rem;
                        justify-content: center;
                        align-items: center;
                    }
                    .profile-pic {
                        border-radius: ${this.AVATAR_SIZE / 2}px;
                    }
                    .name {
                        flex: 1;
                        font-size: 1.2rem;
                        font-weight: 600;
                    }
                    .version {
                        font-size: 1.1rem;
                        font-weight: 600;
                    }
                    .binaries {
                        min-height: 20vh;
                    }
                </style>
                <div class="header bg">
                    <div class="row">
                        <img class="profile-pic" alt="" height="${this.AVATAR_SIZE}" width="${this.AVATAR_SIZE}"/>
                        <span class="name"></span>
                        <span class="version"></span>
                    </div>
                    <div class="row">
                        <span style="flex: 1"></span>
                        <span class="commit"></span>
                    </div>
                </div>
                <div class="binaries bg">
                    
                </div>
            </template>
        `
    }

    readonly #repo: Repository

    readonly #shadow: ShadowRoot

    constructor(repo: Repository) {
        super()
        this.#repo = repo
        this.#shadow = this.attachShadow({mode: 'open'})
        this.#shadow.appendChild(cloneTemplate(ConfigureScript.TEMPLATE_ID))
        this.update()
    }

    update() {
        const profilePicElem = this.#shadow.querySelector('.profile-pic') as HTMLImageElement
        profilePicElem.alt = `${this.#repo.owner} profile picture`
        profilePicElem.src = `https://github.com/${this.#repo.owner}.png?size=${ConfigureScript.AVATAR_SIZE}`
        this.#shadow.querySelector('.commit')!.textContent = this.#repo.latestRelease?.commitHash || ''
        this.#shadow.querySelector<HTMLElement>('.header')!.style.viewTransitionName = `repo-${this.#repo.owner}-${this.#repo.name}`
        this.#shadow.querySelector('.name')!.textContent = `${this.#repo.owner}/${this.#repo.name}`
        this.#shadow.querySelector('.version')!.textContent = this.#repo.latestRelease?.tag || ''
        const binsBin = this.#shadow.querySelector('.binaries') as HTMLElement
        if (this.#repo.latestRelease?.binaries.length) {
            for (const bin of this.#repo.latestRelease.binaries) {
                binsBin.appendChild(new ConfigureBinary(bin))
            }
        } else {
            binsBin.appendChild(new ConfigureBinary({
                filename: 'l3-linux-arm64',
                os: 'Linux',
                arch: 'aarch64',
                contentType: 'mimes are silly',
            }))
            binsBin.appendChild(new ConfigureBinary({
                filename: 'l3-linux-amd64',
                os: 'Linux',
                arch: 'x86_64',
                contentType: 'mimes are silly',
            }))
        }
        console.log('ConfigureScript', this.#repo.latestRelease?.binaries)
    }
}
