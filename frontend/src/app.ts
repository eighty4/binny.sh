import {initializeCustomizationControls} from './customizations.ts'
import {showLoginButton} from './login.ts'
import {getCookie, parseQueryParams} from './parse.ts'
import {handleCurrentRoute, subscribeRouterEvents} from './router.ts'
import './components/define.ts'

if (document.readyState !== 'loading') {
    onPageLoad()
} else {
    document.addEventListener('DOMContentLoaded', onPageLoad)
}

function onPageLoad() {
    const params = parseQueryParams()
    if (params['login']) {
        handleLoginRequest(params['login'])
    } else if (params['auth']) {
        showLoginButton(params['auth'])
    } else {
        startApp()
    }
}

function handleLoginRequest(loginId: string) {
    fetch('/login/notify?login=' + loginId)
        .then((r) => {
            if (r.status === 200) {
                startApp()
            } else {
                showLoginButton('failed')
            }
        })
        .catch(e => {
            console.log('await login error', e)
        })
    window.history.replaceState(null, '', '/')
}

function startApp() {
    initializeCustomizationControls()
    const ght = getCookie('ght')
    if (ght) {
        sessionStorage.setItem('ght', ght)
        subscribeRouterEvents()
        handleCurrentRoute()
    } else {
        showLoginButton()
    }
}
