// Use CSS variable `--progress-ring-progress` with a range of 0 to 1
// Setting `progress` attribute on element will override CSS variable
export default class ProgressRing extends HTMLElement {
    static get observedAttributes() {
        return ['progress']
    }

    #progress: number | null = null

    #shadow: ShadowRoot

    constructor() {
        super()
        this.#shadow = this.attachShadow({ mode: 'open' })
        this.#shadow.appendChild(prepTemplate().content.cloneNode(true))
    }

    attributeChangedCallback(name: string, _previous: string, value: string) {
        if (name === 'progress') {
            const progress = parseFloat(value)
            if (isNaN(progress)) throw TypeError('bad progress ' + progress)
            this.progress = progress
        }
    }

    get progress(): number | null {
        return this.#progress
    }

    set progress(progress: number) {
        if (typeof progress !== 'number')
            throw TypeError('bad progress ' + progress)
        if (progress > 1 || progress < 0)
            throw TypeError('bad progress ' + progress)
        this.#progress = progress
        this.style.setProperty('--progress-ring-progress', `${progress}`)
    }
}

const html = `\
<style>
    :host {
        display: block;
    }
    #stack {
        display: grid;
        grid-template-areas: "stack";
        place-items: center;
    }
    svg, ::slotted(*) {
        grid-area: stack;
    }
    svg {
        --pr-color: var(--progress-ring-color, green);
        --pr-progress: var(--progress-ring-progress, 0);
        --pr-size: var(--progress-ring-size, 8rem);
        --pr-stroke: var(--progress-ring-line-w, 4);
        width: var(--pr-size);
        height: var(--pr-size);

        & circle {
          --pr-r: calc((100 / 2) - (var(--pr-stroke) / 2));
          --pr-c: calc(var(--pr-r) * 2 * pi);
          r: var(--pr-r);
          stroke: var(--pr-color);
          stroke-width: var(--pr-stroke);
          stroke-dasharray: var(--pr-c), var(--pr-c);
          stroke-dashoffset: calc(var(--pr-c) - (var(--pr-progress) * var(--pr-c)));
          transform: rotate(90deg);
          transform-origin: 50% 50%;
          transition: stroke-dashoffset 1s ease-in-out;
        }
    }
</style>
<div id="stack">
    <svg viewBox="0 0 100 100">
        <circle fill="transparent" cx="50" cy="50" />
    </svg>
    <slot/>
</div>
`

let template: HTMLTemplateElement | null = null
function prepTemplate(): HTMLTemplateElement {
    if (template === null) {
        template = document.createElement('template')
        template.innerHTML = html
        template.dataset.component = 'progress-ring'
        document.head.insertAdjacentElement('beforeend', template)
    }
    return template
}

customElements.define('progress-ring', ProgressRing)
