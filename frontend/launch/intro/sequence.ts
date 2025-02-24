import {
    createScaledCalculationsFromWindowSize,
    type Logo,
    type ScaledCalculations,
} from './calculations.js'

const tl = document.getElementById('intro-tl') as HTMLElement
const br = document.getElementById('intro-br') as HTMLElement
const tagline = document.getElementById('binny-tagline') as HTMLElement

let calculations: ScaledCalculations = createScaledCalculationsFromWindowSize()
applyScaledCalculations()

function applyScaledCalculations() {
    tl.style.setProperty(
        '--circle-origin-x',
        `${calculations.step0.circleOrigin.x}px`,
    )
    tl.style.setProperty(
        '--circle-origin-y',
        `${calculations.step0.circleOrigin.y}px`,
    )
    tl.style.setProperty(
        '--circle-radius',
        `${calculations.step0.circleRadius}px`,
    )
    br.style.setProperty(
        '--circle-origin-x',
        `${calculations.step1.circleOrigin.x}px`,
    )
    br.style.setProperty(
        '--circle-origin-y',
        `${calculations.step1.circleOrigin.y}px`,
    )
    br.style.setProperty('--path', `'${calculations.step1.offsetPath}'`)

    const zeroLogos = queryLogoImages(tl, 'zero')
    if (zeroLogos) {
        Object.entries(zeroLogos).forEach(([logo, image]) => {
            setCalculatedLogoImageStyleProps(logo as Logo, image, 'step0')
        })
    }

    const oneLogos = queryLogoImages(br, 'one')
    if (oneLogos) {
        Object.entries(oneLogos).forEach(([logo, image]) => {
            setCalculatedLogoImageStyleProps(logo as Logo, image, 'step1')
        })
    }
}

function setCalculatedLogoImageStyleProps(
    logo: Logo,
    image: HTMLImageElement,
    step: 'step0' | 'step1',
) {
    const tangency = calculations[step].logoTangencyOffsets[logo]
    image.style.setProperty('--logo-tangency-x', `${tangency.x}px`)
    image.style.setProperty('--logo-tangency-y', `${tangency.y}px`)
    const midpoint = calculations.step0point5.logoTangencyMidpoints[logo]
    image.style.setProperty('--logo-midpoint-x', `${midpoint.x}px`)
    image.style.setProperty('--logo-midpoint-y', `${midpoint.y}px`)
}

function queryLogoImages(
    container: HTMLElement,
    step: 'zero' | 'one' | 'two',
): Record<Logo, HTMLImageElement> | undefined {
    if (!container.classList.contains(step)) {
        return
    }
    const queried: NodeListOf<HTMLImageElement> =
        container.querySelectorAll('.support-logo')
    if (queried.length) {
        const images: Partial<Record<Logo, HTMLImageElement>> = {}
        for (let i = 0; i < queried.length; i++) {
            const image = queried[i]
            images[image.getAttribute('data-logo') as Logo] = image
        }
        return images as Record<Logo, HTMLImageElement>
    }
}

function updateScaledCalculations() {
    calculations = createScaledCalculationsFromWindowSize()
    applyScaledCalculations()
}

export async function animateIntroSequence(): Promise<void> {
    tl.style.display = ''
    br.style.display = ''
    window.addEventListener('resize', updateScaledCalculations)
    return new Promise(res => {
        function finish() {
            window.removeEventListener('resize', updateScaledCalculations)
            res()
        }

        stepZero().then(stepTwo).then(finish)
    })
}

async function stepZero() {
    const images: Array<HTMLImageElement> = Array.from(
        tl.querySelectorAll('.support-logo'),
    )
    await Promise.all(
        images.map(async img => {
            await new Promise(res =>
                img.addEventListener('animationend', res, { once: true }),
            )
        }),
    )
    await Promise.all(images.map(animateLogoFromZeroToOne))
}

async function animateLogoFromZeroToOne(img: HTMLImageElement): Promise<void> {
    img.addEventListener(
        'animationstart',
        () => {
            changeCurrentZeroCompileCommand(
                img.getAttribute('data-logo') as Logo,
            )
        },
        { once: true },
    )
    img.classList.add('zeroToOne')
    await new Promise<void>(res =>
        img.addEventListener(
            'animationend',
            () => {
                img.remove()
                addSupportLogoToOne(
                    img.src,
                    img.alt,
                    img.getAttribute('data-logo') as Logo,
                )
                res()
            },
            { once: true },
        ),
    )
}

// todo consistent animation velocity with duration scaled for window size
function addSupportLogoToOne(src: string, alt: string, logo: Logo) {
    const img = new Image()
    img.classList.add('support-logo')
    img.src = src
    img.alt = alt
    setCalculatedLogoImageStyleProps(logo, img, 'step1')
    br.appendChild(img)
    let cb: (e: AnimationEvent) => void | undefined
    img.addEventListener(
        'animationend',
        (cb = (e: AnimationEvent) => {
            if (e.animationName === 'oneMoveLogo') {
                img.removeEventListener('animationend', cb)
                // img.remove()
            }
        }),
    )
}

async function stepTwo() {
    Array.from(tl.querySelectorAll('.compile.cmd')).forEach(element =>
        element.remove(),
    )
    changeCurrentStepCursor(2)
    tl.classList.remove('zero')
    tl.classList.add('two')
}

function changeCurrentZeroCompileCommand(logo: Logo) {
    tl.querySelector('.compile.cmd.current')?.classList.remove('current')
    tl.querySelector(`.compile.cmd[data-logo="${logo}"]`)!.classList.add(
        'current',
    )
}

function changeCurrentStepCursor(n: number) {
    tagline.querySelector('.step-num.current')!.classList.remove('current')
    tagline
        .querySelector(`.step-num[data-step="${n}"]`)!
        .classList.add('current')
}
