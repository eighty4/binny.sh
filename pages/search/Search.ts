import {
    OPERATING_SYSTEMS,
    type Architecture,
    type GeneratedScript,
    type OperatingSystem,
} from '@binny.sh/template'
import { findGhToken } from 'Binny.sh/dom/ghTokenStorage'
import type { Binary, Language, Repository } from 'Binny.sh/github/model'
import logout from 'Binny.sh/logout'
import emptyHtml from './search.empty.html'
import type {
    SearchData,
    SearchDataReply,
    SearchDataRequest,
} from './searchDataW.ts'
import removeChildNodes from 'Binny.sh/dom/removeChildNodes'

const worker = new Worker('../search/searchDataW.ts')
worker.onerror = e => console.error('searchDataW error', e)
worker.onmessageerror = e => console.error('searchDataW messageerror', e)
worker.onmessage = onSearchDataReply

function postRequest(req: SearchDataRequest) {
    worker.postMessage(req)
}

let domReady = false
let foundReposElem: HTMLElement
let syncElem: HTMLButtonElement
// let filterElem: HTMLInputElement

type RepoGridItem = {
    // .repo
    elem: HTMLElement
    // .repo centering for cursor-x and cursor-y
    cursorX: number
    cursorY: number
}

const repoGridResizing = new ResizeObserver(onRepoGridResize)
const repoGrid: Array<Array<RepoGridItem>> = []
let repoGridCursor: RepoGridItem | null = null

let dataRendered = false
let searchData: SearchData | null = null

const ghToken = findGhToken()

function onSearchDataReply(e: MessageEvent<SearchDataReply>) {
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
    console.warn('ght missing, redirecting to homepage')
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
    // todo github login name
    document.getElementById('search-header')!.textContent = `eighty4's repos`
    foundReposElem = document.getElementById('found-repos') as HTMLElement
    repoGridResizing.observe(foundReposElem)
    // filterElem = document.getElementById('repo-filter') as HTMLInputElement
    // filterElem.oninput = onRepoFilter
    syncElem = document.getElementById('repo-resync') as HTMLButtonElement
    syncElem.onclick = onRepoSync
    if (searchData !== null && !searchData.empty) {
        showSearchData(searchData)
    }
    window.addEventListener('keydown', e => {
        if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
            e.preventDefault()
        }
    })
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('resize', updateResizeCssVars, { passive: true })
    window.addEventListener('scroll', updateScrollCssVars, { passive: true })
    updateScrollCssVars()
    updateResizeCssVars()
}

function onRepoGridResize(entries: Array<ResizeObserverEntry>) {
    repoGrid.length = 0
    const gridRepos = entries.flatMap(entry =>
        Array.from(entry.target.querySelectorAll<HTMLElement>('.repo')),
    )
    if (!gridRepos.length) return
    let cursorMatchRepoName: string = gridItemToMatch()
    const rows: Record<string, Array<RepoGridItem>> = {}
    const gridBounding = foundReposElem.getBoundingClientRect()
    for (const repo of gridRepos) {
        const cardBounding = repo.getBoundingClientRect()
        if (!rows[cardBounding.top]) rows[cardBounding.top] = []
        const item = {
            elem: repo,
            cursorX:
                cardBounding.left - gridBounding.left + cardBounding.width / 2,
            cursorY:
                cardBounding.top - gridBounding.top + cardBounding.height / 2,
        }
        if (cursorMatchRepoName === repo.dataset.name) {
            updateGridItemCssVars(item)
        }
        rows[cardBounding.top].push(item)
    }
    for (const items of Object.values(rows).sort(sortGridRow)) {
        repoGrid.push(items.sort(sortGridRowItem))
    }
}

function sortGridRow(ra: Array<RepoGridItem>, rb: Array<RepoGridItem>): 1 | -1 {
    return ra[0].cursorY < rb[0].cursorY ? -1 : 1
}

function sortGridRowItem(ia: RepoGridItem, ib: RepoGridItem): 1 | -1 {
    return ia.cursorX < ib.cursorX ? -1 : 1
}

const gridItemToMatch: () => string = () =>
    repoGridCursor === null
        ? foundReposElem.querySelector<HTMLElement>('.repo')!.dataset.name!
        : repoGridCursor.elem.dataset.name!

function updateScrollCssVars() {
    document.body.style.setProperty('--scroll-x', scrollX + 'px')
    document.body.style.setProperty('--scroll-y', scrollY + 'px')
}

function updateResizeCssVars() {
    const rect = foundReposElem.getBoundingClientRect()
    document.body.style.setProperty('--repos-x', rect.left + scrollX + 'px')
    document.body.style.setProperty('--repos-y', rect.top + scrollY + 'px')
}

function updateGridItemCssVars(item: RepoGridItem) {
    repoGridCursor?.elem.classList.remove('cursor')
    repoGridCursor = item
    item.elem.classList.add('cursor')
    document.body.style.setProperty('--grid-item-x', item.cursorX + 'px')
    document.body.style.setProperty('--grid-item-y', item.cursorY + 'px')
}

function onRepoHover(e: Event) {
    for (const row of repoGrid) {
        for (const item of row) {
            if (e.target === item.elem) {
                updateGridItemCssVars(item)
                return
            }
        }
    }
}

const DIRECTIONS = {
    left: 0,
    up: 1,
    down: 2,
    right: 3,
} as const

type Direction = (typeof DIRECTIONS)[keyof typeof DIRECTIONS]

function onKeyUp(e: KeyboardEvent) {
    switch (e.code) {
        // case 'Slash':
        //     filterElem.focus()
        //     break
        case 'Enter':
            repoGridCursor?.elem.click()
            break
        case 'ArrowLeft':
        case 'KeyH':
            onNavKey(DIRECTIONS.left)
            break
        case 'ArrowUp':
        case 'KeyK':
            onNavKey(DIRECTIONS.up)
            break
        case 'ArrowDown':
        case 'KeyJ':
            onNavKey(DIRECTIONS.down)
            break
        case 'ArrowRight':
        case 'KeyL':
            onNavKey(DIRECTIONS.right)
            break
    }
}

function onNavKey(dir: Direction) {
    let x = 0,
        y = 0
    let found = false
    for (let ri = 0; ri < repoGrid.length; ri++) {
        const row = repoGrid[ri]
        for (let ci = 0; ci < row.length; ci++) {
            const item = row[ci]
            if (item.elem.dataset.name === repoGridCursor?.elem.dataset.name) {
                y = ri
                x = ci
                found = true
                break
            }
        }
        if (found) break
    }
    if (!found) throw Error()
    switch (dir) {
        case DIRECTIONS.left:
            if (x > 0) {
                // previous in current row
                updateGridItemCssVars(repoGrid[y][x - 1])
            } else if (y > 0) {
                // last of previous row
                updateGridItemCssVars(
                    repoGrid[y - 1][repoGrid[y - 1].length - 1],
                )
            }
            break
        case DIRECTIONS.up:
            if (y > 0) {
                const prevRow = repoGrid[y - 1]
                if (x < prevRow.length - 1) {
                    // above in previous row
                    updateGridItemCssVars(prevRow[x])
                } else {
                    // last of previous row
                    updateGridItemCssVars(prevRow[prevRow.length - 1])
                }
            }
            break
        case DIRECTIONS.right:
            if (x + 1 < repoGrid[y].length) {
                // next in current row
                updateGridItemCssVars(repoGrid[y][x + 1])
            } else if (y + 1 < repoGrid.length) {
                // first of next row
                updateGridItemCssVars(repoGrid[y + 1][0])
            }
            break
        case DIRECTIONS.down:
            const downY = y + 1
            if (downY < repoGrid.length) {
                if (x + 1 < repoGrid[downY].length) {
                    // below in next row
                    updateGridItemCssVars(repoGrid[downY][x])
                } else {
                    // last of below row
                    updateGridItemCssVars(
                        repoGrid[downY][repoGrid[downY].length - 1],
                    )
                }
            }
            break
    }
    repoGridCursor?.elem.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
    })
}

// function onRepoFilter(e: Event) {
//     const value = (e.target as HTMLInputElement).value
//     if (value !== '') {
//         foundReposElem.classList.add('filtering')
//         foundReposElem
//             .querySelectorAll<HTMLElement>('.repo')
//             .forEach(repoElem => {
//                 if (repoElem.dataset.name!.includes(value)) {
//                     repoElem.classList.add('match')
//                 } else {
//                     repoElem.classList.remove('match')
//                 }
//             })
//     } else {
//         foundReposElem.classList.remove('filtering')
//         foundReposElem
//             .querySelectorAll<HTMLElement>('.repo.match')
//             .forEach(repoElem => {
//                 repoElem.classList.remove('match')
//             })
//     }
// }

function onRepoSync() {
    syncElem.disabled = true
    postRequest({
        kind: 'fetch',
        method: 'db',
    })
}

function showSearchData(searchData: SearchData) {
    if (dataRendered) {
        repoGridResizing.disconnect()
        repoGrid.length = 0
        foundReposElem
            .querySelectorAll('.repo')
            .forEach(repo =>
                repo.removeEventListener('mouseenter', onRepoHover),
            )
        removeChildNodes(foundReposElem)
        // filterElem.value = ''
    }
    dataRendered = true
    if (searchData.empty) {
        foundReposElem.innerHTML = emptyHtml
    } else {
        const sections: Array<HTMLElement> = []
        if (searchData.withGeneratedScripts.length) {
            sections.push(
                createRepoSection(
                    'Your release scripts',
                    searchData.withGeneratedScripts,
                ),
            )
        }
        if (searchData.nativeWithReleaseWithBins.length) {
            sections.push(
                createRepoSection(
                    'With released binaries',
                    searchData.nativeWithReleaseWithBins,
                ),
            )
        }
        if (searchData.nativeWithReleaseWithoutBins.length) {
            sections.push(
                createRepoSection(
                    'Without released binaries',
                    searchData.nativeWithReleaseWithoutBins,
                ),
            )
        }
        if (searchData.nativeWithReleaseWithoutAssets.length) {
            sections.push(
                createRepoSection(
                    'Without any release assets',
                    searchData.nativeWithReleaseWithoutAssets,
                ),
            )
        }
        if (searchData.nativeWithoutRelease.length) {
            sections.push(
                createRepoSection(
                    'Unreleased',
                    searchData.nativeWithoutRelease,
                ),
            )
        }
        // if (searchData.nativeWithoutRelease.length) {
        //     sections.push(
        //         createRepoSection(
        //             'Uses compiled languages',
        //             searchData.notReleasedWithCompatibleLanguage,
        //         ),
        //     )
        // }
        // if (searchData.everythingElse.length) {
        //     sections.push(
        //         createRepoSection(
        //             'All your JavaScript, Python and Ruby repositories (that create excessive carbon footprints and are bad for the environment)',
        //             searchData.everythingElse,
        //         ),
        //     )
        // }
        foundReposElem.append(...sections)
    }
}

function createRepoSection(
    title: string,
    repos: Array<Repository & { script?: GeneratedScript }>,
): HTMLElement {
    const section = document.createElement('section')
    section.className = 'section'
    const titleElem = document.createElement('h3')
    titleElem.className = 'title'
    titleElem.innerText = title
    const reposElem = document.createElement('div')
    reposElem.classList.add('repos')
    reposElem.append(...repos.map(createRepoLink))
    section.append(titleElem, reposElem)
    return section
}

function createRepoLink(
    repo: Repository & { script?: GeneratedScript },
): HTMLElement {
    const link = document.createElement('a')
    link.addEventListener('mouseenter', onRepoHover)
    link.className = 'repo'
    link.dataset.name = repo.name
    link.href = `/configure/${repo.owner}/${repo.name}`
    const card = document.createElement('div')
    card.className = 'card'
    const header = document.createElement('div')
    header.className = 'header'
    const name = document.createElement('div')
    name.className = 'name'
    name.textContent = repo.name
    header.append(name)
    if (repo.latestRelease) {
        const tag = document.createElement('span')
        tag.textContent = repo.latestRelease.tag
        const commit = document.createElement('commit')
        commit.textContent = repo.latestRelease.commitHash
        const release = document.createElement('div')
        release.className = 'release'
        release.append(tag, commit)
        header.append(release)
    }
    card.append(header)
    if (repo.languages.length) {
        const languages = document.createElement('div')
        languages.className = 'languages'
        languages.append(...repo.languages.map(createLanguageIcon))
        card.append(languages)
    }
    if (repo.latestRelease?.binaries.length) {
        const support = document.createElement('div')
        support.className = 'support'
        support.append(...createSupportIcons(repo.latestRelease.binaries))
        card.append(support)
    }
    link.append(card)
    return link
}

function createLanguageIcon(language: Language) {
    const lang = document.createElement('div')
    lang.role = 'img'
    lang.ariaLabel = language + ' logo'
    lang.className = 'language ' + languageClassName(language)
    return lang
}

function languageClassName(language: Language): string {
    switch (language) {
        case 'C':
            return 'c'
        case 'C++':
            return 'cpp'
        case 'Go':
            return 'go'
        case 'Rust':
            return 'rust'
        case 'Zig':
            return 'zig'
        default:
            throw Error()
    }
}

function createSupportIcons(bins: Array<Binary>): Array<HTMLElement> {
    const matrix: Record<
        OperatingSystem,
        Partial<Record<Architecture, boolean>>
    > = {
        Linux: {
            aarch64: false,
            arm: false,
            x86_64: false,
        },
        MacOS: {
            aarch64: false,
            x86_64: false,
        },
        Windows: {
            aarch64: false,
            x86_64: false,
        },
    }
    for (const bin of bins) {
        if (bin.arch) {
            matrix[bin.os][bin.arch] = true
        }
    }
    return OPERATING_SYSTEMS.map(os => {
        const bools = Object.values(matrix[os])
        let support: 'mia' | 'partial' | 'full' = bools.every(b => b)
            ? 'full'
            : 'mia'
        if (support !== 'full' && bools.some(b => b)) support = 'partial'
        const logo = document.createElement('div')
        logo.className = 'logo ' + os
        const indicator = document.createElement('div')
        indicator.className = 'indicator ' + support
        const system = document.createElement('div')
        system.className = 'system'
        system.append(logo, indicator)
        return system
    })
}
