import type {Binary} from '@eighty4/install-github'
import SystemLogo from './SystemLogo.ts'
import {cloneTemplate} from '../dom.ts'

export default class ConfigureBinary extends HTMLElement {

    private static readonly TEMPLATE_ID = 'tmpl-configure-binary'

    static templateHTML(): string {
        return `
            <template id="${this.TEMPLATE_ID}">
                <style>
                    .bin {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .filename {
                        flex: 1;
                    }
                    .os {
                        width: 5vw;
                    }
                    .arch {
                        width: 8vw;
                        text-align: right;
                    }
                </style>
                <div class="bin">
                    <span class="filename"></span>
                    <div class="os"></div>
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
        this.#shadow.querySelector('.os')!.appendChild(new SystemLogo(this.#bin.os!, '#111'))
        this.#shadow.querySelector('.arch')!.textContent = this.#bin.arch || '?'
    }
}
