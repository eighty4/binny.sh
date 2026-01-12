import type { SearchDataSyncStage } from '../search/searchDataW'

type SyncState = 'fetch' | 'db' | 'done' | 'error'

export default class SyncProgress extends HTMLElement {
    #completed: number = 0
    #indicator: HTMLElement
    #label: HTMLElement
    #state: SyncState = 'fetch'
    #total: number = 1

    constructor() {
        super()
        this.#label = document.createElement('div')
        this.#label.classList.add('label')
        this.#updateLabel()
        this.#indicator = document.createElement('div')
        this.#indicator.classList.add('indicator')
        this.appendChild(this.#label)
        this.appendChild(this.#indicator)
    }

    connectedCallback() {
        window.addEventListener('resize', this.#onResize)
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this.#onResize)
    }

    updateProgress(
        stage: SearchDataSyncStage,
        completed: number,
        total: number,
    ) {
        switch (stage) {
            case 'fetch':
                const recalc = this.#total !== total
                this.#completed = completed
                this.#total = total
                if (recalc) {
                    this.#calculateIndicatorWidth()
                }
                this.#updateLabel()
                this.#updateProgress()
                break
            case 'db':
                this.#completed = completed
                this.#total = total
                if (this.#state === 'fetch') {
                    this.#clearProgress()
                    this.#state = 'db'
                    this.#calculateIndicatorWidth()
                }
                this.#updateLabel()
                this.#updateProgress()
                break
        }
    }

    finished() {
        this.#indicator.style.visibility = 'hidden'
        this.#label.innerHTML = `<a href="/search">Continue to search</a>`
    }

    #onResize = () => {
        if (this.#state === 'db') {
            this.#calculateIndicatorWidth()
        }
    }

    #calculateIndicatorWidth() {
        const gapTotal = Math.min(
            0.375 * this.#indicator.clientWidth,
            (this.#total + 1) * 2,
        )
        const barTotal = this.#indicator.clientWidth - gapTotal
        const barGap = gapTotal / (this.#total + 1)
        const barWidth = barTotal / this.#total
        this.#indicator.style.setProperty('--bar-gap', `${barGap}px`)
        this.#indicator.style.setProperty('--bar-width', `${barWidth}px`)
    }

    #clearProgress() {
        for (let i = 0; i < this.#indicator.childNodes.length; i++) {
            this.#indicator.childNodes[i].remove()
        }
    }

    #updateLabel() {
        switch (this.#state) {
            case 'fetch':
                if (this.#total !== this.#completed) {
                    this.#label.innerText = `Fetching repos from GitHub GraphQL (page ${this.#completed + 1})`
                }
                break
            case 'db':
                this.#label.innerText = `Syncing ${this.#total} repos to IndexedDB`
                break
        }
    }

    #updateProgress() {
        const appendingCount =
            this.#completed - this.#indicator.childNodes.length
        for (let i = 0; i < appendingCount; i++) {
            const bar = document.createElement('div')
            bar.classList.add('progress')
            this.#indicator.appendChild(bar)
        }
    }
}

customElements.define('sync-progress', SyncProgress)
