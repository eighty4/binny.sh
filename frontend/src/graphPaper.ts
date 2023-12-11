import {toggleLandingElements} from './ui.ts'
import './graphPaper.css'

const gridDiv = document.getElementById('graph-paper-grid') as HTMLDivElement

let clearGraphPaperFn: (() => void) | null

export function onClearGraphPaper(fn: () => void) {
    clearGraphPaperFn = fn
}

export function showGraphPaper(readyFn?: (graphPaper: HTMLElement) => void): HTMLElement {
    const graphPaper = document.getElementById('graph-paper') as HTMLElement
    if (!gridDiv.classList.contains('hide')) {
        clearGraphPaper(graphPaper)
        if (readyFn) readyFn(graphPaper)
    } else {
        toggleLandingElements(false)
        gridDiv.classList.remove('hide')
        setTimeout(() => graphPaper.classList.add('full'), 25)
        if (readyFn) graphPaper.addEventListener('animationend', () => readyFn(graphPaper), {once: true})
    }
    return graphPaper
}

function clearGraphPaper(graphPaper: HTMLElement) {
    if (clearGraphPaperFn) clearGraphPaperFn()
    clearGraphPaperFn = null
    for (const elem of graphPaper.childNodes) {
        elem.remove()
    }
}
