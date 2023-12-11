import './customizations.css'

export function initializeCustomizationControls() {
    if (!localStorage.getItem('level')) {
        return
    }
    const controls = createCustomizationControls()
    initializeStyleControl(controls.querySelector('#flip-input') as HTMLInputElement)
    document.querySelector('#grid header')!.appendChild(controls)
}

function createCustomizationControls(): HTMLElement {
    const controls = document.createElement('div')
    controls.id = 'controls'
    controls.ariaHidden = 'true'
    controls.innerHTML = `
<div class="control">
    <button>style</button>
    <label id="flip-toggle" for="flip-input"><input type="checkbox" name="flip-input" id="flip-input"></label>
</div>`
    return controls
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
