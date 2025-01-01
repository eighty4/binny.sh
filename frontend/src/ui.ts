import './ui.css'

export function getPageGrid(): HTMLElement {
    return document.getElementById('page-grid')!
}

export function toggleLandingElements(showOrHide?: boolean) {
    const fn = typeof showOrHide === 'undefined' ? 'toggle' : showOrHide ? 'remove' : 'add'
    document.documentElement.classList[fn]('out')
}

export async function toggleReaderMode(openOrClose: boolean): Promise<void> {
    const triangleDiv = document.getElementById('triangle')!
    toggleLandingElements(!openOrClose)
    document.documentElement.classList[openOrClose ? 'add' : 'remove']('reader')
    triangleDiv.classList.toggle(openOrClose ? 'shift' : 'unshift')
    return new Promise((res) => {
        triangleDiv.addEventListener('animationend', () => {
            triangleDiv.classList.toggle('shifted')
            triangleDiv.classList.remove('shift', 'unshift')
            res()
        }, {once: true})
    })
}
