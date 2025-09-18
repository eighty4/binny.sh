import removeChildNodes from '@eighty4/binny-dom/removeChildNodes'

export default class ProfilePicture extends HTMLElement {
    static readonly SIZE = 30

    static observedAttributes = ['owner']

    readonly #img: HTMLImageElement

    constructor() {
        super()
        this.#img = this.appendChild(document.createElement('img'))
        this.#img.height = this.#img.width = ProfilePicture.SIZE
        this.#img.style.borderRadius = `${ProfilePicture.SIZE / 2}px`
    }

    connectedCallback() {
        const owner = this.getAttribute('owner')
        if (owner) {
            this.setImgProps(owner)
        }
    }

    disconnectedCallback() {
        removeChildNodes(this)
    }

    attributeChangedCallback(
        _name: string,
        _oldValue: string,
        newValue: string,
    ) {
        this.setImgProps(newValue)
    }

    setImgProps(owner: string) {
        this.#img.alt = owner + ' profile picture'
        this.#img.src = `https://github.com/${owner}.png?size=${ProfilePicture.SIZE}`
    }
}

customElements.define('profile-picture', ProfilePicture)
