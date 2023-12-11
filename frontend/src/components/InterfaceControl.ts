import './InterfaceControl.css'

export default class InterfaceControl extends HTMLElement {
    static observedAttributes = ['key', 'key-label', 'label']

    private readonly keyElem: HTMLSpanElement
    private readonly labelElem: HTMLSpanElement

    constructor() {
        super()
        this.keyElem = document.createElement('span')
        this.keyElem.classList.add('keyboard-key')
        this.labelElem = document.createElement('span')
        this.appendChild(this.keyElem)
        // this.appendChild(this.labelElem)
    }

    attributeChangedCallback(name: any, _oldValue: string, newValue: string) {
        if (name === 'key' && !this.attributes.getNamedItem('key-label')) {
            this.keyElem.textContent = newValue
        } else if (name === 'key-label') {
            this.keyElem.textContent = newValue
        } else if (name === 'label') {
            this.labelElem.textContent = newValue
        }
    }

    connectedCallback() {
        this.keyElem.textContent = this.keyLabel
        this.labelElem.textContent = this.label
        window.addEventListener('keyup', this.onKeyUp)
        this.keyElem.addEventListener('click', this.onClick)
        this.labelElem.addEventListener('click', this.onClick)
    }

    disconnectedCallback() {
        window.removeEventListener('keyup', this.onKeyUp)
        this.keyElem.removeEventListener('click', this.onClick)
        this.labelElem.removeEventListener('click', this.onClick)
    }

    private onClick = () => this.activate()

    private onKeyUp = (e: KeyboardEvent) => {
        if (e.key === this.key) {
            this.activate()
        }
    }

    private activate() {
        this.dispatchEvent(new CustomEvent<void>('activate'))
    }

    get key(): string {
        return this.attributes.getNamedItem('key')?.textContent || ''
    }

    get keyLabel(): string {
        return this.attributes.getNamedItem('key-label')?.textContent || this.key
    }

    get label(): string {
        return this.attributes.getNamedItem('label')?.textContent || ''
    }

    set key(v: string) {
        this.setAttribute('key', v)
    }

    set keyLabel(v: string) {
        this.setAttribute('key-label', v)
    }

    set label(v: string) {
        this.setAttribute('label', v)
    }
}
