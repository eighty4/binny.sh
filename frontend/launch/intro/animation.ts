import { showAnimatedIntroHeader } from '../landing/header.js'
import { removeFastForwardButton, showFastForwardButton } from './ff.js'
import { animateIntroSequence } from './sequence.js'
import { animateTitle } from './title.js'
import { hideTriangle, showTriangle } from './triangle.js'
import { skipAnimationNextLaunch } from './versioning.js'
import './intro.css'

export async function playAnimationIntro() {
    if (document.hidden) {
        await waitUntilVisible()
    }
    await hideTriangle()
    showFastForwardButton()
    await animateTitle()
    await showTriangle()
    showAnimatedIntroHeader()
    await animateIntroSequence()
    skipAnimationNextLaunch()
}

async function waitUntilVisible() {
    await new Promise(res => {
        document.addEventListener('visibilitychange', res, { once: true })
    })
}

export function removeIntroElements() {
    removeFastForwardButton()
    document.getElementById('intro-tl')!.remove()
    document.getElementById('intro-br')!.remove()
    document.getElementById('intro-title')!.remove()
    for (const chrome of document.querySelectorAll('.binny-landing-chrome')) {
        ;(chrome as HTMLElement).classList.add('show')
    }
    document.getElementById('page-grid')!.classList.add('visible')
}
