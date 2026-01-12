import type { OperatingSystem } from '@binny.sh/template'

interface SystemLogoOptions {
    color: string
    os: OperatingSystem
    size: string
}

export default class SystemLogo extends HTMLElement {
    static observedAttributes = ['color', 'os', 'size']

    constructor(opts?: Partial<SystemLogoOptions>) {
        super()
        if (opts?.color) this.setAttribute('color', opts?.color)
        if (opts?.os) this.setAttribute('os', opts?.os)
        if (opts?.size) this.setAttribute('size', opts?.size)
        this.style.aspectRatio = '1 / 1'
        this.style.background = this.getAttribute('color') || 'hotpink'
        this.style.display = 'inline-block'
        this.style.width = this.getAttribute('size') || '1rem'
        this.style.willChange = 'transform'
    }

    connectedCallback() {
        const os = this.os
        this.style.mask = `url('/systems/${os.toLowerCase()}.svg') no-repeat 50%`
        if (os === 'macos') {
            this.style.transform = 'translateY(-1px)'
            this.style.maskSize = '80%'
        } else if (os === 'linux') {
            this.style.maskSize = '100%'
        } else {
            this.style.maskSize = '85%'
        }
    }

    get os(): string {
        const os = this.getAttribute('os')
        if (os === null) {
            throw new Error('asdf')
        }
        return os
    }
}

customElements.define('system-logo', SystemLogo)
