import {Unauthorized} from '@eighty4/install-github'
import createGitHubGraphApiClient from './createGitHubGraphApiClient.ts'
import {initializeCustomizationControls} from './customizations.ts'
import {initializeExplainButton} from './explain.ts'
import {showLoginButton} from './login.ts'
import {logout} from './logout.ts'
import {getCookie} from './parse.ts'
import {handleCurrentRoute, subscribeRouterEvents} from './router.ts'
import {gitHubTokenCache, gitHubUserCache} from './sessionCache.ts'
import {initializeUserPanel} from './userPanel.ts'
import './components/define.ts'

if (document.readyState !== 'loading') {
    startApp()
} else {
    document.addEventListener('DOMContentLoaded', startApp)
}

function startApp() {
    initializeCustomizationControls()
    if (gitHubUserCache.hasValue()) {
        startUserSession()
        return
    } else {
        const ght = getCookie('ght')
        if (ght) {
            gitHubTokenCache.write(ght)
            createGitHubGraphApiClient().queryUser()
                .then(user => gitHubUserCache.write(user))
                .then(startUserSession)
                .catch((e) => {
                    if (e instanceof Unauthorized) {
                        logout()
                    } else {
                        // todo handle error
                        throw e
                    }
                })
            return
        }
    }
    startLandingSession()
}

function startLandingSession() {
    initializeExplainButton()
    showLoginButton()
}

function startUserSession() {
    initializeUserPanel()
    subscribeRouterEvents()
    handleCurrentRoute()
}
