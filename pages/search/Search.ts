import type { GeneratedScript } from '@binny.sh/template'
import { findGhToken } from 'Binny.sh/dom/ghTokenStorage'
import type { Repository } from 'Binny.sh/github/model'
import logout from 'Binny.sh/logout'
import emptyHtml from './search.empty.html'
import type {
    SearchData,
    SearchDataReply,
    SearchDataRequest,
} from './searchDataW.ts'

const worker = new Worker('../search/searchDataW.ts')
worker.onerror = e => console.error('searchDataW error', e)
worker.onmessageerror = e => console.error('searchDataW messageerror', e)
worker.onmessage = onSearchDataReply

function postRequest(req: SearchDataRequest) {
    worker.postMessage(req)
}

let domReady = false
let pageElem: HTMLElement
let containerElem: HTMLElement
let syncElem: HTMLButtonElement
let filterElem: HTMLInputElement

let dataRendered = false
let searchData: SearchData | null = null

const ghToken = findGhToken()

function onSearchDataReply(e: MessageEvent<SearchDataReply>) {
    console.log('search worker reply:', e.data.kind)
    switch (e.data.kind) {
        case 'unauthorized':
            logout()
            break
        case 'fetch':
            searchData = e.data.data
            // defer to resyncing fetch if initial fetch from db is empty
            if (domReady && !searchData.empty) {
                showSearchData(searchData)
            }
            break
        case 'synced':
            if (searchData !== null && searchData.empty && !e.data.updated) {
                showSearchData(searchData)
            } else if (e.data.updated) {
                if (dataRendered) {
                    syncElem.disabled = false
                }
                postRequest({
                    kind: 'fetch',
                    method: 'db',
                })
            }
            break
    }
}

if (ghToken === null) {
    // todo github login redirect with state storing redirect uri
    location.assign('/')
} else {
    postRequest({
        kind: 'fetch',
        method: 'resync',
        ghToken,
    })
    document.addEventListener('DOMContentLoaded', onDomReady, { once: true })
}

async function onDomReady() {
    domReady = true
    pageElem = document.getElementById('search-page') as HTMLElement
    if (searchData !== null && !searchData.empty) {
        showSearchData(searchData)
    }
}

function onRepoFilter(e: Event) {
    const value = (e.target as HTMLInputElement).value
    if (value !== '') {
        containerElem.classList.add('filtering')
        containerElem
            .querySelectorAll<HTMLElement>('.repo')
            .forEach(repoElem => {
                if (repoElem.dataset.name!.includes(value)) {
                    repoElem.classList.add('match')
                } else {
                    repoElem.classList.remove('match')
                }
            })
    } else {
        containerElem.classList.remove('filtering')
        containerElem
            .querySelectorAll<HTMLElement>('.repo.match')
            .forEach(repoElem => {
                repoElem.classList.remove('match')
            })
    }
}

function onRepoSync() {
    syncElem.disabled = true
    postRequest({
        kind: 'fetch',
        method: 'db',
    })
}

function showSearchData(searchData: SearchData) {
    if (dataRendered) {
        filterElem.oninput = null
        syncElem.onclick = null
        containerElem.remove()
    }
    dataRendered = true
    console.log('show search data')
    if (searchData.empty) {
        pageElem.innerHTML = emptyHtml
    } else {
        const sections: Array<HTMLElement> = []
        if (searchData.releasesWithGeneratedScripts.length) {
            sections.push(
                createRepoSection(
                    'Your release scripts',
                    searchData.releasesWithGeneratedScripts,
                ),
            )
        }
        if (searchData.releasesWithBinaries.length) {
            sections.push(
                createRepoSection(
                    'With released binaries',
                    searchData.releasesWithBinaries,
                ),
            )
        }
        if (searchData.notReleasedWithCompatibleLanguage.length) {
            sections.push(
                createRepoSection(
                    'Uses compiled languages',
                    searchData.notReleasedWithCompatibleLanguage,
                ),
            )
        }
        if (searchData.everythingElse.length) {
            sections.push(
                createRepoSection(
                    'All your JavaScript, Python and Ruby repositories (that create excessive carbon footprints and are bad for the environment)',
                    searchData.everythingElse,
                ),
            )
        }
        const title = document.createElement('h2')
        title.innerText = "eighty4's repos"
        containerElem = document.createElement('div')
        containerElem.id = 'found-repos'
        containerElem.append(title, createControls(), ...sections)
        pageElem.append(containerElem)
    }
}
// <div id="search-controls">
//     <input type="search" placeholder="Find your repo" />
//     <button>resync</button>
// </div>

function createControls() {
    const controls = document.createElement('div')
    controls.id = 'search-controls'
    filterElem = document.createElement('input')
    filterElem.id = 'filter'
    filterElem.autocomplete = 'off'
    filterElem.type = 'search'
    filterElem.placeholder = 'Find your repo'
    filterElem.oninput = onRepoFilter
    syncElem = document.createElement('button')
    syncElem.innerText = 'refresh'
    syncElem.disabled = true
    syncElem.onclick = onRepoSync
    controls.append(filterElem, syncElem)
    return controls
}

function createRepoSection(
    title: string,
    repos: Array<Repository & { script?: GeneratedScript }>,
): HTMLElement {
    const section = document.createElement('section')
    section.classList.add('section')
    const header = document.createElement('h3')
    header.classList.add('title')
    header.innerText = title
    section.append(
        header,
        ...repos.map(repo => {
            const div = document.createElement('div')
            div.dataset.name = repo.name
            div.className = 'repo'
            div.innerHTML = `\
<a href="/configure/${repo.owner}/${repo.name}">${repo.owner}/${repo.name}</a>`
            return div
        }),
    )
    return section
}
