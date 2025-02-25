import { toggleLandingElements } from './ui.ts'
import './graphPaper.css'
import { removeChildNodes } from './dom.ts'

let graphPaper: HTMLElement

let clearGraphPaperFn: (() => void) | null

export function onClearGraphPaper(fn: () => void) {
    clearGraphPaperFn = fn
}

export function showGraphPaper(
    readyFn?: (graphPaper: HTMLElement) => void,
): HTMLElement {
    if (!graphPaper) {
        graphPaper = createGraphPaper()
        toggleLandingElements(false)
        document.body.insertAdjacentHTML(
            'beforeend',
            `<div id="triangle-ish"></div>`,
        )
        if (readyFn)
            document
                .getElementById('triangle')!
                .addEventListener('transitionend', () => readyFn(graphPaper), {
                    once: true,
                })
    } else {
        clearGraphPaper(graphPaper)
        if (readyFn) readyFn(graphPaper)
    }
    return graphPaper
}

function createGraphPaper(): HTMLElement {
    document.body.insertAdjacentHTML(
        'beforeend',
        `<main id="graph-paper-grid"><div id="graph-paper-header"><back-button></back-button></div><div id="graph-paper"></div></main>`,
    )
    return document.getElementById('graph-paper')!
}

function clearGraphPaper(graphPaper: HTMLElement) {
    if (clearGraphPaperFn) clearGraphPaperFn()
    clearGraphPaperFn = null
    removeChildNodes(graphPaper)
    graphPaper.classList.remove(...graphPaper.classList.values())
}
