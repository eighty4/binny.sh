import type {Binary} from '@eighty4/install-github'
import {type OperatingSystem, operatingSystemLabel} from '@eighty4/install-template'
import {
    ARCHITECTURE_UPDATE_EVENT_TYPE,
    type ArchitectureUpdateEvent,
    createArchitectureUpdate,
} from './ArchitectureUpdate.ts'
import css from './ConfigureBinaries.css?inline'
import ConfigureBinary from './ConfigureBinary.ts'
import SystemLogo from '../SystemLogo.ts'
import {cloneTemplate, removeChildNodes} from '../../dom.ts'

export default class ConfigureBinaries extends HTMLElement {

    private static readonly TEMPLATE_ID = 'tmpl-configure-binaries'

    static templateHTML(): string {
        return `
            <template id="${this.TEMPLATE_ID}">
                <style>${css}</style>
                <div class="container">
                    <h3 class="os">
                        <div class="logo"></div>
                    </h3>
                    <div class="bins">
                    </div>
                </div>
            </template>
        `
    }

    readonly #bins: Array<Binary>

    readonly #container: HTMLElement

    readonly #shadow: ShadowRoot

    constructor(bins: Array<Binary>, os: OperatingSystem) {
        super()
        this.#bins = bins
        this.#shadow = this.attachShadow({mode: 'open'})
        this.#shadow.appendChild(cloneTemplate(ConfigureBinaries.TEMPLATE_ID))
        this.#shadow.querySelector('.os .logo')!.appendChild(new SystemLogo({os, color: '#111', size: '1.5rem'}))
        this.#shadow.querySelector('.os')!.appendChild(document.createTextNode(`${operatingSystemLabel(os)} binaries`))
        this.#container = this.#shadow.querySelector('.bins')!
    }

    connectedCallback() {
        for (const bin of this.#bins) {
            this.#container.appendChild(new ConfigureBinary(bin))
                .addEventListener(ARCHITECTURE_UPDATE_EVENT_TYPE, this.#onArchUpdate as EventListener)
        }
    }

    disconnectedCallback() {
        for (const configureBinary of this.querySelectorAll('configure-binary')) {
            configureBinary.removeEventListener(ARCHITECTURE_UPDATE_EVENT_TYPE, this.#onArchUpdate as EventListener)
        }
        removeChildNodes(this.#container)
    }

    #onArchUpdate = (e: ArchitectureUpdateEvent) => {
        const {arch, filename} = e.detail
        this.dispatchEvent(createArchitectureUpdate(arch, filename))
    }
}
