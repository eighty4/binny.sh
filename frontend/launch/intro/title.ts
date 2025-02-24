let introTitleDiv: HTMLElement | null

export async function animateTitle(): Promise<void> {
    introTitleDiv = document.getElementById('intro-title')!
    introTitleDiv.style.display = 'block'
    // window.addEventListener('resize', updateCssVars)
    // updateCssVars()

    const frameTitleDivs = Array.from(introTitleDiv.querySelectorAll('.frame'))
    await Promise.all(
        frameTitleDivs.map(frameTitleDiv => {
            return new Promise(res => {
                frameTitleDiv
                    .querySelector('.title')!
                    .addEventListener('animationend', res, {
                        once: true,
                    })
            })
        }),
    )

    const fullTitleFrame = frameTitleDivs[frameTitleDivs.length - 1]
    fullTitleFrame.querySelector('.hide')!.classList.remove('hide')
    for (let i = 0; i < frameTitleDivs.length - 1; i++) {
        frameTitleDivs[i].remove()
    }

    fullTitleFrame.querySelector('.title')!.classList.add('flip')
    return new Promise(res =>
        fullTitleFrame.addEventListener(
            'animationend',
            () => {
                cleanup()
                res()
            },
            {
                once: true,
            },
        ),
    )
}

function updateCssVars() {
    // introTitleDiv!.style.setProperty(
    //     '--title-rotate-z',
    //     `${Math.atan(
    //         document.body.clientHeight / document.body.clientWidth,
    //     )}rad`,
    // )
}

function cleanup() {
    window.removeEventListener('resize', updateCssVars)
    introTitleDiv = null
}
