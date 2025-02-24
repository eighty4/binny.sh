import './ff.css'

let ffButton: HTMLButtonElement | null = null

export function showFastForwardButton() {
    ffButton = document.getElementById('ff-animation') as HTMLButtonElement
    ffButton.style.display = 'block'
    ffButton.addEventListener('click', fastForwardAnimation, {
        once: true,
    })
}

export function removeFastForwardButton() {
    ffButton?.removeEventListener('click', fastForwardAnimation)
    ffButton = null
    // remove from dom with doc lookup in case show was not called
    document.getElementById('ff-animation')!.remove()
}

function fastForwardAnimation() {
    ffButton!.classList.add('clicked')
    document.body.style.setProperty(
        '--intro-animation-speed',
        'var(--intro-animation-skip-speed)',
    )
}
