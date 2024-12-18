import type {Repository} from '@eighty4/install-github'
import {openRepositoryConfig} from './routes/configure.ts'
import {findProgramRepository} from './routes/search.ts'
import {toggleReaderMode} from './ui.ts'

export function subscribeRouterEvents() {
    window.addEventListener('hashchange', handleCurrentRoute)
}

export function replaceCurrentRoute(route: string) {
    console.log('redirect route', location.hash, route)
    window.history.replaceState({}, '', route)
    handleCurrentRoute()
}

export function pushConfigureRoute(repo: any) {
    repo = repo as Repository
    if (repo.owner && repo.name) {
        location.hash = `configure/${repo.owner}/${repo.name}`
    } else {
        location.hash = `configure/${repo}`
    }
}

export function handleCurrentRoute() {
    console.log('handle route', location.hash)
    if (location.hash.startsWith('#page/')) {
        toggleReaderMode(true).then(/* todo use links to docs */)
    } else if (location.hash.startsWith('#configure/')) {
        const hashParts = location.hash.split('/')
        if (hashParts.length !== 3) {
            alert('wtf ' + location.hash)
            // @ts-ignore
            location = location.protocol + '//' + location.host
        }
        const [_, repoOwner, repoName] = hashParts
        openRepositoryConfig(repoOwner, repoName)
    } else if (location.hash === '#search') {
        findProgramRepository()
    } else if (location.hash === '') {
        replaceCurrentRoute('#search')
    } else {
        console.error('wtf')
    }
}
