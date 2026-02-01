import type { SearchDataSyncStage } from '../search/searchDataW'

export default class SyncProgress extends HTMLElement {
    #completed: number = 0
    #state: SearchDataSyncStage = 'fetch'
    #total: number = 1

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
                this.#updateProgress()
                break
        }
    }

    #onResize = () => this.#calculateIndicatorWidth()

    #calculateIndicatorWidth() {
        const gapTotalArea = Math.min(
            0.375 * this.clientWidth,
            (this.#total + 1) * 2,
        )
        const barTotalArea = this.clientWidth - gapTotalArea
        const barGap = gapTotalArea / (this.#total + 1)
        const barWidth = barTotalArea / this.#total
        this.style.setProperty('--bar-gap', `${barGap}px`)
        this.style.setProperty('--bar-width', `${barWidth}px`)
    }

    #clearProgress() {
        this.querySelectorAll('.progress').forEach(bar => bar.remove())
    }

    #updateProgress() {
        const appendingCount = this.#completed - this.childElementCount
        for (let i = 0; i < appendingCount; i++) {
            const bar = document.createElement('div')
            bar.classList.add('progress')
            this.appendChild(bar)
        }
    }
}

customElements.define('sync-progress', SyncProgress)
