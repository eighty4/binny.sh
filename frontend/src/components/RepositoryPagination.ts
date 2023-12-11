import {removeChildNodes} from '../dom.ts'

export default class RepositoryPagination extends HTMLElement {

    #currentPage: number = 0

    #pageCount: number = 0

    get currentPage(): number {
        return this.#currentPage
    }

    get pageCount(): number {
        return this.#pageCount
    }

    set currentPage(currentPage: number) {
        this.#currentPage = Math.min(currentPage, this.#pageCount)
        this.update()
    }

    set pageCount(pageCount: number) {
        this.#currentPage = Math.min(this.#currentPage, pageCount)
        this.#pageCount = pageCount
        this.update()
    }

    private update() {
        if (this.pageCount < 2) {
            removeChildNodes(this)
        } else {
            this.innerHTML = '<p>multiple pages of repos not yet implemented</p>'
            // for (let i = this.childNodes.length - this.pageCount; i > 0; i--) {
            //     this.removeChild(this.childNodes[this.childNodes.length - 1])
            // }
            // for (let i = this.pageCount - this.childNodes.length; i > 0; i--) {
            //     this.appendChild(this.createPaginationLink(this.childNodes.length + 1))
            // }
        }
    }

    // private createPaginationLink(i: number): HTMLButtonElement {
    //     const button = document.createElement('button')
    //     button.innerText = '' + i
    //     return button
    // }
}
