import removeChildNodes from '@eighty4/binny-dom/removeChildNodes'
import './graphPaper.css'

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
    } else {
        clearGraphPaper(graphPaper)
    }
    if (readyFn) readyFn(graphPaper)
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
