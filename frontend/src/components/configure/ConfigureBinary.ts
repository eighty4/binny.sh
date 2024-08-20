import type {Binary} from '@eighty4/install-github'
import css from './ConfigureBinary.css?inline'
import {cloneTemplate} from '../../dom.ts'

export default class ConfigureBinary extends HTMLElement {

    private static readonly TEMPLATE_ID = 'tmpl-configure-binary'

    static templateHTML(): string {
        return `
            <template id="${this.TEMPLATE_ID}">
                <style>${css}</style>
                <div class="bin">
                    <span class="filename"></span>
                    <span class="arch"></span>
                </div>
            </template>
        `
    }

    readonly #bin: Binary

    readonly #shadow: ShadowRoot

    constructor(bin: Binary) {
        super()
        this.#bin = bin
        this.#shadow = this.attachShadow({mode: 'open'})
        this.#shadow.appendChild(cloneTemplate(ConfigureBinary.TEMPLATE_ID))
        this.update()
    }

    update() {
        this.#shadow.querySelector('.filename')!.textContent = this.#bin.filename
        this.#shadow.querySelector('.arch')!.textContent = this.#bin.arch || '?'
    }
}
