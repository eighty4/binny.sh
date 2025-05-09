import { playAnimationIntro, removeIntroElements } from './intro/animation.js'
import { willSkipAnimation } from './intro/versioning.js'
import { initializeGitHubCallToAction } from './landing/gitHubCallToAction.js'
import { showLoginButton } from './landing/login.js'
import './launch.css'

if (location.search === '?login') {
    history.replaceState(null, '', '/')
    triggerAppStart('login')
} else if (location.hash.length) {
    triggerAppStart()
} else if (willSkipAnimation()) {
    triggerLoginLanding()
} else {
    playAnimationIntro().then(triggerLoginLanding)
}

function cleanupLandingAfterIntro() {
    removeIntroElements()
    initializeGitHubCallToAction()
}

function triggerLoginLanding() {
    cleanupLandingAfterIntro()
    showLoginButton()
}

function triggerAppStart(mode?: 'login') {
    cleanupLandingAfterIntro()
    document.getElementById('triangle')!.remove()
    document.getElementById('binny-intro-header')!.remove()
    document.documentElement.classList.add('app-ready')
    if (mode === 'login') {
        document.documentElement.classList.add('login')
    }
    document.documentElement.dispatchEvent(
        new CustomEvent('app-ready', { detail: { mode } }),
    )
}
