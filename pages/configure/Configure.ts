import { Unauthorized } from '@binny.sh/github'
import type { Repository, RepositoryId } from '@binny.sh/github'
import { getLatestRepoReleaseData } from '@binny.sh/github/queries/latestRelease'
import {
    type GenerateScriptOptions,
    type BinaryDistributions,
} from '@binny.sh/template'
import { findGhToken } from 'Binny.sh/dom/ghTokenStorage'
import removeChildNodes from 'Binny.sh/dom/removeChildNodes'
import logout from 'Binny.sh/logout'
import './CrossMatrix.ts'
import './ProgressRing.ts'
import './ReleaseHeader.ts'
import './ScriptPreview.ts'
import type CrossPlatformMatrix from './CrossMatrix.ts'
import type ScriptPreview from './ScriptPreview.ts'
import type ReleaseHeader from './ReleaseHeader.ts'
import errorHtml from '../client.error.html'
import type { ConfiguredScriptsResult } from './generateScriptW.ts'

type ConfigureView = 'matrix' | 'posix' | 'powershell' | 'release'

const [owner, name] = location.pathname.substring(11).split('/')
const repoId: RepositoryId = { owner, name }
const ghToken = findGhToken()
const fetchingDataController: AbortController = new AbortController()
let fetchingData: Promise<Repository | 'network-error' | 'navigating'>
let worker: Worker
let mainElem: HTMLElement
let headerElem: ReleaseHeader
let matrixView: CrossPlatformMatrix
let posixView: HTMLElement
let posixElem: ScriptPreview
let powershellView: HTMLElement
let powershellElem: ScriptPreview
let releaseView: HTMLElement
let navButtons: Record<ConfigureView, HTMLButtonElement>
let views: Record<ConfigureView, HTMLElement>
let activeView: ConfigureView

// aborting fetch requests before unload for cleaner navigation
window.onbeforeunload = () => {
    fetchingDataController.abort()
}

// todo style header
// todo release details view
// todo interactive matrix for configuring script
// todo controls for script download

if (ghToken === null) {
    // todo github login redirect with state storing redirect uri
    // location.assign(`/login?redirect=${encodeURIComponent(location.pathname)}`)
    location.assign('/')
} else {
    // todo dank building and serving web worker
    worker = new Worker('./generateScriptW.ts')
    worker.onmessage = onWorkerMessage
    fetchingData = getLatestRepoReleaseData(
        ghToken,
        repoId,
        fetchingDataController.signal,
    )
        .then(data => {
            window.onbeforeunload = null
            return data
        })
        .catch(e => {
            if (e instanceof Unauthorized) {
                logout()
            }
            if (e.name === 'TypeError' && e.message === 'Failed to fetch') {
                return 'network-error'
            }
            if (e instanceof Unauthorized || e.name === 'AbortError') {
                return 'navigating'
            }
            console.error('error loading search data', e)
            document.body.innerHTML = errorHtml
            throw e
        })
    document.addEventListener('DOMContentLoaded', onDomReady, { once: true })
}

function initializeButton(
    nav: HTMLElement,
    view: ConfigureView,
): HTMLButtonElement {
    const button = nav.querySelector(
        `button[data-view="${view}"]`,
    ) as HTMLButtonElement
    button.onclick = () => transitionView(view)
    return button
}

function initializeElements() {
    mainElem = document.body.querySelector('main')!
    headerElem = document.body.querySelector('release-header')!
    headerElem.repository = repoId
    matrixView = mainElem.querySelector('crossplatform-matrix')!
    posixView = mainElem.querySelector('#posix')!
    posixElem = posixView.querySelector('script-preview')!
    powershellView = mainElem.querySelector('#powershell')!
    powershellElem = posixView.querySelector('script-preview')!
    releaseView = mainElem.querySelector('#release')!
    const nav = document.body.querySelector('nav')!
    navButtons = {
        matrix: initializeButton(nav, 'matrix'),
        posix: initializeButton(nav, 'posix'),
        powershell: initializeButton(nav, 'powershell'),
        release: initializeButton(nav, 'release'),
    }
    views = {
        matrix: matrixView,
        posix: posixView,
        powershell: powershellView,
        release: releaseView,
    }
    const posixScript = sessionStorage.getItem(scriptCacheKey(repoId, 'posix'))
    if (posixScript) {
        posixElem.content = posixScript
    }
    const powershellScript = sessionStorage.getItem(
        scriptCacheKey(repoId, 'powershell'),
    )
    if (powershellScript) {
        powershellElem.content = powershellScript
    }
    matrixView.remove()
    posixView.remove()
    powershellView.remove()
    releaseView.remove()
    mainElem.classList.remove('loading')
}

async function onDomReady() {
    initializeElements()
    const data = await fetchingData
    if (data === 'network-error') {
        alert('network error, try again')
    } else if (data !== 'navigating') {
        onConfigReady(data)
    }
}

function onWorkerMessage({ data }: MessageEvent<ConfiguredScriptsResult>) {
    if (data.error) {
        console.error(data.error)
    }
    if (data.result) {
        posixElem.content = data.result.sh
        sessionStorage.setItem(scriptCacheKey(repoId, 'posix'), data.result.sh)
    }
}

function transitionView(toView: ConfigureView) {
    if (activeView === toView) throw Error('wtf')
    activeView = toView
    document
        .startViewTransition(() => {
            Object.values(navButtons)
                .find(navButton => navButton.classList.contains('active'))
                ?.classList.remove('active')
            navButtons[toView].classList.add('active')
            removeChildNodes(mainElem)
            mainElem.appendChild(views[activeView])
        })
        .finished.then(() => {
            if (activeView === 'posix') {
                posixElem.focus()
            }
        })
}

// todo powershell
function transitionLeft() {
    switch (activeView) {
        case 'posix':
            transitionView('matrix')
            break
        case 'release':
            transitionView('posix')
            break
    }
}

// todo powershell
function transitionRight() {
    switch (activeView) {
        case 'matrix':
            transitionView('posix')
            break
        case 'posix':
            transitionView('release')
            break
    }
}

function onConfigReady(repo: Repository) {
    let generateReady: boolean = repo.latestRelease!.binaries.every(
        binary => !!binary.arch,
    )

    if (generateReady) {
        transitionView('posix')
        worker.postMessage(createGenerateOptions(repo))
    } else {
        navButtons.posix.disabled = navButtons.powershell.disabled = true
        transitionView('matrix')
    }

    posixElem.addEventListener('scroll', () => {
        if (document.activeElement !== posixElem) {
            posixElem.focus()
        }
    })
    posixElem.addEventListener('click', () => {
        if (document.activeElement !== posixElem) {
            posixElem.focus()
        }
    })

    window.addEventListener('keyup', e => {
        if (!generateReady) return
        switch (e.code) {
            case 'ArrowLeft':
            case 'KeyH':
                transitionLeft()
                break
            case 'ArrowRight':
            case 'KeyL':
                transitionRight()
                break
        }
    })
}

function scriptCacheKey(
    repo: RepositoryId,
    platform: 'posix' | 'powershell',
): string {
    return `${repo.owner}/${repo.name} script-${platform}`
}

function createGenerateOptions(repo: Repository): GenerateScriptOptions {
    const distributions: BinaryDistributions = {
        Linux: {},
        MacOS: {},
        Windows: {},
    }
    for (const binary of repo.latestRelease!.binaries) {
        if (binary.arch) {
            distributions[binary.os]![binary.arch] = binary.filename
        }
    }
    return {
        repository: repo,
        installName: repo.name,
        distributions,
    }
}
