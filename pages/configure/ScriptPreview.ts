// import html from './ScriptPreview.html'

export default class ScriptPreview extends HTMLElement {
    // #shadow: ShadowRoot

    constructor() {
        super()
        // this.#shadow = this.attachShadow({ mode: 'open' })
        // this.#shadow.appendChild(prepTemplate().content.cloneNode())
    }

    set content(content: string) {
        this.innerHTML = `<pre>${content}</pre>`
    }
}

// let template: HTMLTemplateElement | null = null
// function prepTemplate() {
//     if (template === null) {
//         template = document.createElement('template')
//         template.dataset.component = 'ScriptPreview'
//         template.innerHTML = html
//         // const style = document.createElement('style')
//         // style.innerText = css
//         // template.insertAdjacentElement('afterbegin', style)
//         document.head.insertAdjacentElement('beforeend', template)
//     }
//     return template
// }

customElements.define('script-preview', ScriptPreview)
