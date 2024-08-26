import type {Binary} from '@eighty4/install-github'
import {type Architecture, ARCHITECTURES} from '@eighty4/install-template'
import {createArchitectureUpdate} from './ArchitectureUpdate.ts'
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
    }

    connectedCallback() {
        this.#shadow.querySelector('.filename')!.textContent = this.#bin.filename
        const archContainer = this.#shadow.querySelector('.arch')!
        if (this.#bin.arch) {
            archContainer.textContent = this.#bin.arch
        } else {
            archContainer.replaceWith(this.#createArchSelect())
        }
    }

    #createArchSelect(): HTMLSelectElement {
        const archSelect = document.createElement('select')
        archSelect.classList.add('arch')
        archSelect.innerHTML = '<option value=""></option>' + ARCHITECTURES.map(arch => `<option>${arch}</option>`).join()
        archSelect.addEventListener('input', this.#onArchUpdate)
        return archSelect
    }

    disconnectedCallback() {
        this.#shadow.querySelector('select')?.removeEventListener('change', this.#onArchUpdate)
    }

    #onArchUpdate = () => {
        this.#shadow.querySelector('option[value=""]')?.remove()
        const arch = this.#shadow.querySelector('select')!.value as Architecture
        this.dispatchEvent(createArchitectureUpdate(arch, this.#bin.filename))
    }
}
