let i = 0
const bugPaths = [
    'M20 200C0 68 55 90 30 0',
    'M40,200 C40,150 20,20 50,0',
    'M20,200 C40,150 20,20 0,0',
]
const getRandomBugPath = () => `path("${bugPaths[Math.floor(Math.random() * bugPaths.length)]}")`

export function initializeGitHubCallToAction() {
    const githubContainer = document.getElementById('github') as HTMLElement
    let callToActions = githubContainer.querySelectorAll('.call-to-action') as NodeListOf<HTMLElement>

    setInterval(() => {
        // duped removal here bc an inactive tab may not fire onanimationend consistently
        // while setInterval is consistently called
        const zombieBug = githubContainer.querySelector('#bug') as HTMLElement | null
        if (zombieBug) {
            zombieBug.onanimationend = null
            zombieBug.remove()
        }
        callToActions[i].classList.remove('current')
        i++
        if (i === callToActions.length) {
            i = 0
        }
        const callToAction = callToActions[i]
        callToAction.classList.add('current')
        if (callToAction.dataset.infested) {
            const bugImg = document.createElement('div')
            bugImg.id = 'bug'
            bugImg.role = 'img'
            bugImg.ariaLabel = 'ah! a bug!'
            bugImg.style.offsetPath = getRandomBugPath()
            bugImg.style.right = `${document.body.clientWidth - callToAction.getBoundingClientRect().right + 25}px`
            bugImg.onanimationend = (e) => (e.target as HTMLElement).remove()
            githubContainer.appendChild(bugImg)
        }
    }, 4000)
}
