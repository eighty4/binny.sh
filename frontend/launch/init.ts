import {initializeGitHubCallToAction} from './gitHubCallToAction.js'
import './theme.js'
import {animateTriangleIntro} from './triangle.js'
import {getCookie} from '../src/parse.js'

const SKIP_ANIMATION = 'ish.skip_launch_animation'

function skipAnimation(): boolean {
    return !!(getCookie('ght') || localStorage.getItem(SKIP_ANIMATION))
}

const skipAnimationNextLaunch = () => localStorage.setItem(SKIP_ANIMATION, '1')

if (location.search === '?login') {
    history.replaceState(null, '', '/')
    // todo synchronize login redirect confirm view
    // todo animate from ui::toggleReaderMode to triangle-ish view
    triggerAppStart()
} else if (skipAnimation()) {
    // todo start in triangle-ish view
    triggerAppStart()
} else {
    playAnimationIntro().then(triggerAppStart)
}

async function playAnimationIntro() {
    if (document.hidden) {
        await new Promise(res => {
            document.addEventListener('visibilitychange', res, {once: true})
        })
    }
    await animateTriangleIntro()
    skipAnimationNextLaunch()
}

function triggerAppStart() {
    document.getElementById('page-grid')!.classList.add('visible')
    initializeGitHubCallToAction()
    document.documentElement.classList.add('app-ready')
    document.documentElement.dispatchEvent(new Event('app-ready'))
}
