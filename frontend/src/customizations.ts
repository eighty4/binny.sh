import './customizations.css'
import html from './customizations.html?raw'

// todo move to component
export function initializeCustomizationControls() {
    if (!localStorage.getItem('level')) {
        return
    }
    const pageGrid = document.querySelector('#page-grid')!
    pageGrid.insertAdjacentHTML('beforeend', html)
    initializeStyleControl(
        pageGrid.querySelector('#flip-input') as HTMLInputElement,
    )
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
