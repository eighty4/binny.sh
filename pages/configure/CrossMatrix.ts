import {
    ARCHITECTURES,
    OPERATING_SYSTEMS,
    type Architecture,
    type OperatingSystem,
} from '@binny.sh/template'

export default class CrossPlatformMatrix extends HTMLElement {
    static #archDiv(os: OperatingSystem, arch: Architecture): HTMLElement {
        const div = document.createElement('div')
        if (arch === 'arm' && os !== 'Linux') {
            const unsupported = document.createElement('span')
            unsupported.innerText = 'x'
            unsupported.style.color = 'maroon'
            div.appendChild(unsupported)
        } else {
            const img = document.createElement('img')
            img.classList.add('checkmark')
            img.src = '/checkmark.svg'
            img.alt = `Support for OS ${os} and CPU ${arch}`
            div.appendChild(img)
        }
        return div
    }
    static #archDivs(os: OperatingSystem): Record<Architecture, HTMLElement> {
        return {
            aarch64: CrossPlatformMatrix.#archDiv(os, 'aarch64'),
            arm: CrossPlatformMatrix.#archDiv(os, 'arm'),
            x86_64: CrossPlatformMatrix.#archDiv(os, 'x86_64'),
        }
    }
    static #archLabel(arch: Architecture): HTMLElement {
        const archElem = document.createElement('div')
        const archSpan = document.createElement('span')
        archSpan.innerText = arch
        archSpan.title = arch === 'arm' ? '32-bit' : '64-bit'
        archElem.appendChild(archSpan)
        return archElem
    }

    #architectures: Record<OperatingSystem, Record<Architecture, HTMLElement>>

    constructor() {
        super()
        this.#architectures = {
            Linux: CrossPlatformMatrix.#archDivs('Linux'),
            MacOS: CrossPlatformMatrix.#archDivs('MacOS'),
            Windows: CrossPlatformMatrix.#archDivs('Windows'),
        }
        for (const arch of ARCHITECTURES) {
            this.append(
                CrossPlatformMatrix.#archLabel(arch),
                ...OPERATING_SYSTEMS.map((os: OperatingSystem) => {
                    return this.#architectures[os][arch]
                }),
            )
        }
    }
}

customElements.define('crossplatform-matrix', CrossPlatformMatrix)
