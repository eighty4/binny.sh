import { Unauthorized, type User } from '@eighty4/binny-github'
import './app.css'
import createGitHubGraphApiClient from './createGitHubGraphApiClient.ts'
import { initializeCustomizationControls } from './customizations.ts'
import { getCookie } from './parse.ts'
import { handleCurrentRoute, subscribeRouterEvents } from './router.ts'
import './components/define.ts'
import { logout } from './session/logout.ts'
import { gitHubTokenCache, gitHubUserCache } from './session/sessionCache.ts'

if (document.documentElement.classList.contains('app-ready')) {
    startApp()
} else {
    document.documentElement.addEventListener('app-ready', startApp)
}

function startApp() {
    initializeCustomizationControls()
    if (gitHubUserCache.hasValue()) {
        startUserSession()
    } else {
        const ght = getCookie('ght')
        if (ght) {
            gitHubTokenCache.write(ght)
            createGitHubGraphApiClient()
                .queryUser()
                .then(user => gitHubUserCache.write(user))
                .then(startUserSession)
                .catch(e => {
                    if (e instanceof Unauthorized) {
                        logout()
                    } else {
                        // todo handle error
                        throw e
                    }
                })
        }
    }
}

function startUserSession() {
    document.documentElement.classList.add('authed')
    initializeUserPanel()
    subscribeRouterEvents()
    handleCurrentRoute()
}

export function initializeUserPanel() {
    createGitHubGraphApiClient().queryUser().then(createUserPanel)
}

function createUserPanel(user: User) {
    document
        .getElementById('page-grid')!
        .insertAdjacentHTML(
            'beforeend',
            `<user-panel avatar="${user.avatarUrl}" username="${user.login}"></user-panel>`,
        )
}
