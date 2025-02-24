import './header.css'

export function showAnimatedIntroHeader() {
    const h = document.querySelector('#binny-intro-header')!
    h.classList.remove('griddled')
    h.classList.add('centered', 'show')
}
