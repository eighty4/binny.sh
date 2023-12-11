import {OperatingSystem} from '@eighty4/install-template'

export default class SystemLogo extends HTMLElement {

    static observedAttributes = ['color', 'os']

    constructor(os?: OperatingSystem, color?: string) {
        super()
        if (color) this.setAttribute('color', color)
        if (os) this.setAttribute('os', os)
        this.style.aspectRatio = '1 / 1'
        this.style.background = color || 'hotpink'
        this.style.display = 'inline-block'
        this.style.width = '1rem'
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
