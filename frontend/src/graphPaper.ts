import {toggleLandingElements} from './ui.ts'
import './graphPaper.css'
import {removeChildNodes} from './dom.ts'

let graphPaper: HTMLElement
let appendedTriangle2 = false

let clearGraphPaperFn: (() => void) | null

export function onClearGraphPaper(fn: () => void) {
    clearGraphPaperFn = fn
}

export function showGraphPaper(readyFn?: (graphPaper: HTMLElement) => void): HTMLElement {
    if (!appendedTriangle2) {
        appendTriangle2()
    }
    if (!graphPaper) {
        graphPaper = createGraphPaper()
        toggleLandingElements(false)
        if (readyFn) document.getElementById('triangle')!
            .addEventListener('transitionend', () => readyFn(graphPaper), {once: true})
    } else {
        clearGraphPaper(graphPaper)
        if (readyFn) readyFn(graphPaper)
    }
    return graphPaper
}

function appendTriangle2() {
    const triangle2 = document.createElement('div')
    triangle2.id = 'triangle2'
    triangle2.classList.add('triangle')
    triangle2.ariaHidden = 'true'
    document.body.appendChild(triangle2)
    appendedTriangle2 = true
}

function createGraphPaper() {
    graphPaper = document.createElement('div')
    graphPaper.id = 'graph-paper'
    return document.body.querySelector('main')!.appendChild(graphPaper)
}

function clearGraphPaper(graphPaper: HTMLElement) {
    if (clearGraphPaperFn) clearGraphPaperFn()
    clearGraphPaperFn = null
    removeChildNodes(graphPaper)
}
