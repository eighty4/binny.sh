import { getUserId } from '@binny.sh/github/queries/userId'
import { findGhToken } from 'Binny.sh/dom/ghTokenStorage'
import removeChildNodes from 'Binny.sh/dom/removeChildNodes'

// works around https://github.com/eighty4.png avatar url
// being a redirect and not cacheable
// fetches and caches user id to load img from a cacheable cdn URI
export default class ProfilePicture extends HTMLElement {
    static readonly SIZE = 40
    static observedAttributes = ['owner']
    static #userIds: Record<string, Promise<number>> = {}

    readonly #img: HTMLImageElement

    constructor() {
        super()
        this.#img = document.createElement('img')
        this.#img.height = this.#img.width = ProfilePicture.SIZE
        this.#img.style.borderRadius = '50%'
    }

    connectedCallback() {
        const ghLogin = this.getAttribute('ghLogin')
        if (ghLogin) {
            this.ghLogin = ghLogin
        }
        this.appendChild(this.#img)
    }

    disconnectedCallback() {
        removeChildNodes(this)
    }

    attributeChangedCallback(
        name: string,
        _oldValue: string,
        newValue: string,
    ) {
        if (name === 'ghLogin') {
            this.ghLogin = newValue
        }
    }

    set ghLogin(ghLogin: string) {
        this.#img.alt = ghLogin + ' profile picture'
        const userId = localStorage.getItem(userIdCacheKey(ghLogin))
        if (userId) {
            this.#img.src = avatarUrl(userId)
        } else {
            if (!ProfilePicture.#userIds[ghLogin]) {
                ProfilePicture.#userIds[ghLogin] = getUserId(
                    findGhToken()!,
                    ghLogin,
                ).then(userId => {
                    localStorage.setItem(userIdCacheKey(ghLogin), `${userId}`)
                    return userId
                })
            }
            ProfilePicture.#userIds[ghLogin].then(userId => {
                this.#img.src = avatarUrl(userId)
            })
        }
    }
}

function avatarUrl(userId: number | string) {
    return `https://avatars.githubusercontent.com/u/${userId}?s=${ProfilePicture.SIZE}&v=4`
}

function userIdCacheKey(ghLogin: string): string {
    return `gh user ${ghLogin} databaseId`
}

customElements.define('profile-picture', ProfilePicture)
