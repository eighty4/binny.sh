import { findGhToken } from 'Binny.sh/dom/ghTokenStorage'
import SyncProgress from './SyncProgress'
import type {
    SearchDataReply,
    SearchDataSyncStage,
} from '../search/searchDataW'

let syncMessage: HTMLElement
let syncProgress: SyncProgress
// mapping the keyboard event's key to .shortcuts parent
const shortcuts: Record<string, HTMLElement> = {}
// mapping the keyboard event's key code to .key
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
            const { stage, completed, total } = e.data
            onSearchDataProgress(stage, completed, total)
            break
        case 'synced':
            document.cookie = `Ductus=1;SameSite=strict`
            if (guideFinished) {
                navToSearch()
            } else {
                syncFinished = true
                syncProgress.parentElement!.remove()
                document
                    .getElementById('sync-progress')!
                    .classList.add('finished')
                document.getElementById('explanation')!.innerHTML =
                    `<h2>We\'re ready to go!</h2><p>&nbsp;</p>`
            }
            break
    }
}

function onSearchDataProgress(
    stage: SearchDataSyncStage,
    completed: number,
    total: number,
) {
    syncProgress.updateProgress(stage, completed, total)
    switch (stage) {
        case 'fetch':
            if (total !== completed) {
                syncMessage.innerText = `Fetching repos from GitHub GraphQL (page ${completed + 1})`
            }
            break
        case 'db':
            syncMessage.innerText = `Syncing ${total} repos to IndexedDB`
            break
    }
}

function initGuide() {
    document.body
        .querySelectorAll<HTMLElement>('.key[data-activator]')
        .forEach(kbd => {
            shortcuts[kbd.dataset.activator!] = kbd.parentElement!
            kbds[kbd.dataset.activator!] = kbd
        })
    syncMessage = document.querySelector(
        '#sync-progress-msg',
    ) as HTMLDialogElement
    syncProgress = document.querySelector('sync-progress') as SyncProgress
    window.addEventListener('keydown', onKeyDown)
}

async function onKeyDown(e: KeyboardEvent) {
    switch (e.code) {
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowRight':
            e.preventDefault()
    }
    shortcuts[e.code].classList.add('done')
    kbds[e.code].animate([{}, { background: 'var(--color-green)' }, {}], {
        duration: 150,
        iterations: 1,
    })
    guideFinished = Object.values(shortcuts).every(elem =>
        elem.classList.contains('done'),
    )
    if (guideFinished) {
        if (syncFinished) {
            navToSearch()
        } else {
            window.removeEventListener('keydown', onKeyDown)
        }
    }
}

function navToSearch() {
    location.assign('/search')
}
