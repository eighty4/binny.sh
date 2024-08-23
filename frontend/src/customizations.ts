import './customizations.css'
import html from './customizations.html?raw'

export function initializeCustomizationControls() {
    if (!localStorage.getItem('level')) {
        return
    }
    const header = document.querySelector('#grid header')!
    header.insertAdjacentHTML('beforeend', html)
    initializeStyleControl(header.querySelector('#flip-input') as HTMLInputElement)
}

function initializeStyleControl(styleInput: HTMLInputElement) {
    if (document.documentElement.classList.contains('flipped')) {
        styleInput.checked = true
    }
    styleInput.addEventListener('click', () => {
        const flipped = document.documentElement.classList.toggle('flipped')
        localStorage.setItem('theme-flip', flipped ? '1' : '0')
    })
}
