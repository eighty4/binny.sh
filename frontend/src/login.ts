import './login.css'
import html from  './login.html?raw'
import {getPageGrid, toggleReaderMode} from './ui.ts'

const LOGIN_LINK_MOVE_THRESHOLD = .075

interface Point {
    x: number
    y: number
}

export function showLoginButton() {
    let delaying = false
    const loginLink = createLoginLink()
    let splitDistance = 0
    let splitSlope = 0
    let splitYIntercept = 0
    let proximitySlope = 0
    let previousIntersectionPoint: Point = {x: document.body.clientWidth / 2, y: document.body.clientHeight / 2}
    let previousPositionRatio = .15

    function onResize() {
        const {clientHeight, clientWidth} = document.body
        splitDistance = calculateDistanceBetweenPoints({
            x: 0,
            y: document.body.clientHeight,
        }, {
            x: document.body.clientWidth,
            y: 0,
        })
        splitSlope = -1 * document.body.clientHeight / document.body.clientWidth
        splitYIntercept = document.body.clientHeight
        proximitySlope = calculateInverseReciprocal(splitSlope)
        document.documentElement.style.setProperty('--diagonal-length-px', `${splitDistance}px`)
        document.documentElement.style.setProperty('--diagonal-rotate-rad', `${Math.atan(clientHeight / clientWidth) * -1}rad`)
    }

    onResize()
    window.addEventListener('resize', onResize)

    function onMouseEvent(e: MouseEvent) {
        if (loginLink.classList.contains('moving') || delaying) {
            return
        }
        const proximityPoint = {x: e.clientX, y: e.clientY}
        const proximityYIntercept = calculateYInterceptForLine(proximityPoint, proximitySlope)
        const intersectionPoint = calculateIntersectionPointOfTwoLines(splitSlope, splitYIntercept, proximitySlope, proximityYIntercept)
        const intersectionPointDistance = calculateDistanceBetweenPoints(intersectionPoint, {
            x: document.body.clientWidth,
            y: 0,
        })
        const positionRatio = intersectionPointDistance / splitDistance
        const positionRatioDeltaWithPreviousRatio = Math.abs(positionRatio - previousPositionRatio)
        if (positionRatioDeltaWithPreviousRatio < LOGIN_LINK_MOVE_THRESHOLD) {
            return
        }
        const pixelsMoved = calculateDistanceBetweenPoints(intersectionPoint, previousIntersectionPoint)
        loginLink.style.setProperty('--login-link-previous-position-percent', loginLink.style.getPropertyValue('--login-link-position-percent'))
        const positionPercent = positionRatio * 100
        const clampedPositionPercent = positionPercent < 50 ? Math.max(positionPercent, 12) : Math.min(positionPercent, 88)
        loginLink.style.setProperty('--login-link-position-percent', `${clampedPositionPercent}%`)
        console.log(positionPercent, clampedPositionPercent)
        loginLink.style.setProperty('--login-link-moving-duration', `${(pixelsMoved / splitDistance) * 2}s`)
        previousIntersectionPoint = intersectionPoint
        previousPositionRatio = positionRatio
        loginLink.classList.add('moving')
    }

    loginLink.addEventListener('animationend', () => {
        delaying = true
        loginLink.classList.remove('moving')
        setTimeout(() => delaying = false, 100)
    })
    window.addEventListener('mousemove', debounce(onMouseEvent, 84))

    document.body.appendChild(loginLink)
}

function createLoginLink(): HTMLDivElement {
    const loginLink = document.createElement('div')
    loginLink.id = 'login'
    loginLink.innerText = 'Login'
    loginLink.onclick = () => toggleReaderMode(true).then(showLoginPrompt)
    return loginLink
}

function showLoginPrompt() {
    const grid = getPageGrid()
    grid.insertAdjacentHTML('beforeend', html)
    const loginPrompt = grid.querySelector('#login-prompt')!
    const redirectButton = loginPrompt.querySelector('#login-redirect') as HTMLButtonElement
    const cancelButton = loginPrompt.querySelector('#login-cancel') as HTMLButtonElement
    redirectButton.addEventListener('click', redirectToLogin)
    cancelButton.addEventListener('click', closeLoginPrompt)

    function redirectToLogin() {
        loginPrompt.innerHTML = '<spin-indicator></spin-indicator>'
        document.location = import.meta.env.VITE_GITHUB_OAUTH_ADDRESS
    }

    function closeLoginPrompt() {
        redirectButton.removeEventListener('click', redirectToLogin)
        cancelButton.removeEventListener('click', closeLoginPrompt)
        grid.removeChild(loginPrompt)
        toggleReaderMode(false).then()
    }
}

function calculateDistanceBetweenPoints(p1: Point, p2: Point): number {
    const xd = p2.x - p1.x
    const yd = p2.y - p1.y
    return Math.sqrt((xd * xd) + (yd * yd))
}

function calculateYInterceptForLine(p: Point, m: number): number {
    return p.y - (m * p.x)
}

function calculateIntersectionPointOfTwoLines(m1: number, yi1: number, m2: number, yi2: number): Point {
    const x = (yi1 - yi2) / (m2 - m1)
    const y = m2 * x + yi2
    return {x, y}
}

function calculateInverseReciprocal(m: number) {
    return -1 * (1 / m)
}

// function calculateDistanceFromLine(p: Point, lineSlope: number, lineYIntercept: number): number {
//     return Math.abs((lineSlope * p.x) + (-1 * p.y) + lineYIntercept) / Math.sqrt((lineSlope * lineSlope) + (-1 * -1))
// }

function debounce(func: any, wait: number, immediate?: any) {
    let timeout: any
    return function () {
        // @ts-ignore
        const context = this
        const args = arguments
        const later = function () {
            timeout = null
            if (!immediate) func.apply(context, args)
        }
        const callNow = immediate && !timeout
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
        if (callNow) func.apply(context, args)
    }
}
