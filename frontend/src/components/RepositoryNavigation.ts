import {Repository} from '@eighty4/install-github'
import RepositoryLink from './RepositoryLink.ts'
// import RepositoryPagination from './RepositoryPagination.ts'
import {cloneTemplate} from '../dom.ts'

export default class RepositoryNavigation extends HTMLElement {

    private static readonly TEMPLATE_ID = 'tmpl-repo-nav'

    static templateHTML(): string {
        return `
            <template id="${RepositoryNavigation.TEMPLATE_ID}">
                <style>
                    .repos {
                        width: 40vw;
                        max-width: 30rem;
                        background: #111;
                        padding: 2.5rem 2rem;
                    }
                    .container {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 6rem;
                        will-change: transform;
                    }
                    repository-link {
                        flex: 1;
                    }
                    .separator {
                        background: #222;
                        margin: 1rem 1rem;
                        height: 1px;
                        transition: all .075s ease-in-out;
                    }
                    .separator.hide {
                        background: #111;
                    }
                </style>
                <repository-search></repository-search>
                <div class="repos"></div>
                <repository-pagination></repository-pagination>
            </template>`
    }

    #links: HTMLDivElement

    // #pagination: RepositoryPagination

    #projects: Array<Repository> = []

    #shadow: ShadowRoot

    constructor() {
        super()
        this.#shadow = this.attachShadow({mode: 'open'})
        this.#shadow.appendChild(cloneTemplate(RepositoryNavigation.TEMPLATE_ID))
        this.#links = this.#shadow.querySelector('.repos') as HTMLDivElement
        // this.#pagination = this.#shadow.querySelector('repository-pagination') as RepositoryPagination
    }

    disconnectedCallback() {
        this.clear()
    }

    set projects(projects: Array<Repository>) {
        this.#projects = projects
        this.update()
    }

    private clear() {
        for (const container of this.querySelectorAll<HTMLElement>('.container')) {
            container.removeEventListener('mouseenter', this.onContainerMouseEnter)
            container.removeEventListener('mouseleave', this.onContainerMouseLeave)
        }
        this.#links.innerHTML = ''
    }

    private update() {
        this.clear()
        // const pageCount = Math.floor(this.#projects.length / 3) + 1
        // this.#pagination.pageCount = pageCount
        if (this.#projects.length) {
            const repos = this.#projects.slice(0, 3)
            const links = repos.map((repo) => new RepositoryLink(repo))
            const children: Array<HTMLElement> = []
            for (let i = 0; i < (links.length * 2) - 1; i++) {
                if (i % 2 === 0) {
                    const container = document.createElement('container')
                    container.classList.add('container')
                    container.appendChild(links[i === 0 ? 0 : i / 2])
                    children.push(container)
                    container.addEventListener('mouseenter', this.onContainerMouseEnter)
                    container.addEventListener('mouseleave', this.onContainerMouseLeave)
                } else {
                    const separator = document.createElement('div')
                    separator.classList.add('separator')
                    children.push(separator)
                }
            }
            this.#links.append(...children)
        }
    }

    private onContainerMouseEnter = (e: MouseEvent) => {
        for (let i = 0; i < this.#links.children.length; i++) {
            const childElement = this.#links.children[i]
            if (childElement === e.target) {
                if (i !== 0) {
                    this.#links.children[i - 1].classList.toggle('hide')
                }
                if (i + 1 < this.#links.children.length) {
                    this.#links.children[i + 1].classList.toggle('hide')
                }
                break
            }
        }
    }

    private onContainerMouseLeave = () => {
        for (const separator of this.#links.querySelectorAll('.separator')) {
            separator.classList.remove('hide')
        }
    }
}
