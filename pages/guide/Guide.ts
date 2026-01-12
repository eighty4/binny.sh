import { findGhToken } from 'Binny.sh/dom/ghTokenStorage'
import SyncProgress from './SyncProgress'
import type { SearchDataReply } from '../search/searchDataW'

let steps: Array<HTMLElement>
let current = 0
let settings: HTMLDialogElement
let syncProgress: SyncProgress
const kbds: Record<string, HTMLElement> = {}

const worker = new Worker('../search/searchDataW.ts')
worker.onerror = e => console.error('searchDataW error', e)
worker.onmessageerror = e => console.error('searchDataW messageerror', e)
worker.onmessage = onSearchDataReply

let syncFinished = false
let guideFinished = false

const ghToken = findGhToken()
if (ghToken) {
    worker.postMessage({ kind: 'init', ghToken, progress: true })
    document.addEventListener('DOMContentLoaded', initGuide, { once: true })
} else {
    location.assign('/')
}

function onSearchDataReply(e: MessageEvent<SearchDataReply>) {
    switch (e.data.kind) {
        case 'unauthorized':
            location.assign('/logout')
            break
        case 'progress':
            syncProgress.updateProgress(
                e.data.stage,
                e.data.completed,
                e.data.total,
            )
            break
        case 'synced':
            if (guideFinished) {
                navToSearch()
            } else {
                syncFinished = true
                syncProgress.finished()
            }
            break
    }
}

function initGuide() {
    document.body
        .querySelectorAll<HTMLElement>('.key[data-activator]')
        .forEach(kbd => {
            for (const activator of kbd.dataset.activator!.split(' ')) {
                kbds[activator] = kbd
            }
        })
    steps = Array.from(document.body.querySelectorAll('.step'))
    settings = document.querySelector('#settings') as HTMLDialogElement
    syncProgress = document.querySelector('sync-progress') as SyncProgress
    window.addEventListener('keyup', onKeyUp)
}

async function onKeyUp(e: KeyboardEvent) {
    if (settings.open) {
        return
    }
    const kbd = kbds[e.code]
    let parentTraversal: HTMLElement | null = kbd
    while (parentTraversal && parentTraversal !== steps[current]) {
        parentTraversal = parentTraversal.parentElement
    }
    if (parentTraversal === steps[current]) {
        const duration = 150
        kbd.animate(
            [{}, { background: 'green', borderColor: 'lightgreen' }, {}],
            {
                duration,
                iterations: 1,
            },
        )
        kbd.parentElement?.querySelector('.checkmark')?.classList.add('done')
        await new Promise(res => setTimeout(res, duration / 2))
    }
    switch (current) {
        case 0:
            onKeyUp0(e)
            return
        case 1:
            onKeyUp1(e)
            return
        case 2:
            onKeyUp2(e)
            return
    }
}

function onKeyUp0(e: KeyboardEvent) {
    switch (e.code) {
        case 'ArrowRight':
        case 'KeyL':
            navNext()
            return
    }
}

function onKeyUp1(e: KeyboardEvent) {
    const done =
        steps[current].querySelectorAll('.done').length ===
        steps[current].querySelectorAll('.checkmark').length
    switch (e.code) {
        case 'KeyS':
            settings.showModal()
            if (done) {
                settings.addEventListener('close', navNext, { once: true })
            }
            return
        case 'KeyT':
            document.documentElement.classList.toggle('dark-theme')
            if (done) {
                navNext()
            }
            return
    }
}

function onKeyUp2(e: KeyboardEvent) {
    switch (e.code) {
        case 'KeyD':
            if (syncFinished) {
                navToSearch()
            } else {
                guideFinished = true
                navNext()
            }
            return
    }
}

function navNext() {
    document.startViewTransition(() => {
        steps[current].classList.remove('current')
        current++
        steps[current].classList.add('current')
    })
}

function navToSearch() {
    setGuidedCookie()
    location.assign('/search')
}

function setGuidedCookie() {
    document.cookie = `ductus=1;SameSite=strict;Secure`
}
