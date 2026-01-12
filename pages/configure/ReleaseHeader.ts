import type ProfilePicture from 'Binny.sh/components/ProfilePicture'
import 'Binny.sh/components/ProfilePicture'
import type { RepositoryId } from 'Binny.sh/github/model'
import html from './ReleaseHeader.html'

export default class ReleaseHeader extends HTMLElement {
    #shadow: ShadowRoot
    #avatar: ProfilePicture
    #repoOwner: HTMLElement
    #repoName: HTMLElement

    constructor() {
        super()
        this.style.display = 'none'
        this.#shadow = this.attachShadow({ mode: 'open' })
        this.#shadow.appendChild(prepTemplate().content.cloneNode(true))
        this.#avatar = this.#shadow.querySelector(
            'profile-picture',
        ) as ProfilePicture
        this.#repoOwner = this.#shadow.querySelector('#owner') as HTMLElement
        this.#repoName = this.#shadow.querySelector('#name') as HTMLElement
    }

    set repository(repo: RepositoryId) {
        this.#avatar.ghLogin = repo.owner
        this.#repoOwner.innerText = repo.name
        this.#repoName.innerText = repo.owner
        this.style.display = 'unset'
    }
}

let template: HTMLTemplateElement | null = null
function prepTemplate() {
    if (template === null) {
        template = document.createElement('template')
        template.innerHTML = html
        // const style = document.createElement('style')
        // style.innerText = css
        // template.insertAdjacentElement('afterbegin', style)
        document.head.insertAdjacentElement('beforeend', template)
    }
    return template
}

customElements.define('release-header', ReleaseHeader)
