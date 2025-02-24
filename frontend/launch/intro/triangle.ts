let triangleDiv: HTMLElement

export function hideTriangle(): Promise<void> {
    triangleDiv = document.body.querySelector('#triangle')!
    triangleDiv.classList.add('hide')
    return new Promise(res =>
        triangleDiv.addEventListener('transitionend', () => res(), {
            once: true,
        }),
    )
}

export function showTriangle(): Promise<void> {
    triangleDiv.classList.remove('hide')
    return new Promise(res =>
        triangleDiv.addEventListener('transitionend', () => res(), {
            once: true,
        }),
    )
}

function lerp(min: number, max: number, ratio: number): number {
    if (ratio < 0) {
        return min
    } else if (ratio > 1) {
        return max
    } else {
        return ratio * (max - min) + min
    }
}

function easeInQuint(x: number): number {
    return x * x * x * x * x
}

function easeOutQuint(x: number): number {
    return 1 - Math.pow(1 - x, 5)
}

abstract class AnimationCanvas {
    readonly #ctx: CanvasRenderingContext2D
    readonly #element: HTMLCanvasElement

    #resize: number = 0

    protected constructor(canvas: HTMLCanvasElement) {
        this.#element = canvas
        this.#ctx = canvas.getContext('2d')!
        window.addEventListener('resize', this.#onResize)
        this.#onResize()
    }

    abstract boxPosX(cx: number, boxW: number): number

    abstract boxPosY(ry: number, boxH: number): number

    protected abstract clipPath(): Path2D

    remove() {
        window.removeEventListener('resize', this.#onResize)
        this.#element.remove()
    }

    get ctx(): CanvasRenderingContext2D {
        return this.#ctx
    }

    get height(): number {
        return this.#element.height
    }

    get resize(): number {
        return this.#resize
    }

    get width(): number {
        return this.#element.width
    }

    #onResize = () => {
        this.#element.width = window.innerWidth
        this.#element.height = window.innerHeight
        this.#ctx.reset()
        this.#ctx.clip(this.clipPath())
        this.#ctx.save()
        this.#resize++
    }
}

class BotRightAnimationCanvas extends AnimationCanvas {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas)
    }

    boxPosX(cx: number, boxW: number): number {
        return this.width - boxW - cx * boxW
    }

    boxPosY(ry: number, boxH: number): number {
        return this.height - boxH - ry * boxH
    }

    clipPath(): Path2D {
        const path = new Path2D()
        path.moveTo(0, this.height)
        path.lineTo(this.width, 0)
        path.lineTo(this.width, this.height)
        path.lineTo(0, this.height)
        return path
    }
}

class TopLeftAnimationCanvas extends AnimationCanvas {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas)
    }

    boxPosX(cx: number, boxW: number): number {
        return cx * boxW
    }

    boxPosY(ry: number, boxH: number): number {
        return ry * boxH
    }

    clipPath(): Path2D {
        const path = new Path2D()
        path.moveTo(0, 0)
        path.lineTo(this.width, 0)
        path.lineTo(0, this.height)
        path.lineTo(0, 0)
        return path
    }
}

interface AnimationSequence {
    update(progress: number): void
}

class SizeAnimation implements AnimationSequence {
    readonly #canvas: AnimationCanvas
    readonly #bgColor: string
    readonly #fgColor: string

    #boxH: number = 0
    #boxW: number = 0
    #resize: number = -1

    constructor(canvas: AnimationCanvas, bgColor: string, fgColor: string) {
        this.#canvas = canvas
        this.#bgColor = bgColor
        this.#fgColor = fgColor
    }

    update(progress: number) {
        if (this.#canvas.resize !== this.#resize) {
            this.#resizeUpdate()
            this.#resize = this.#canvas.resize
        }
        this.#canvas.ctx.restore()
        this.#canvas.ctx.fillStyle = this.#fgColor

        for (let cx = 0; cx <= 10; cx++) {
            for (let ry = 0; ry <= 10; ry++) {
                if (cx + ry < 10) {
                    this.#drawBox(cx, ry, progress)
                }
            }
        }
    }

    #drawBox(cx: number, ry: number, progress: number) {
        this.#canvas.ctx.beginPath()
        // this.#canvas.ctx.rotate(0 * (Math.PI / 100))
        const h = lerp(0, this.#boxH, easeInQuint(progress))
        const w = lerp(0, this.#boxW, easeInQuint(progress))
        let x = this.#canvas.boxPosX(cx, this.#boxW)
        let y = this.#canvas.boxPosY(ry, this.#boxH)
        // while animating, offset pos by animated size
        if (progress < 1) {
            x += (this.#boxW - w) / 2
            y += (this.#boxH - h) / 2
        }
        this.#canvas.ctx.fillRect(x, y, w, h)
    }

    #resizeUpdate() {
        this.#boxH = this.#canvas.height / 10
        this.#boxW = this.#canvas.width / 10
        this.#canvas.ctx.fillStyle = this.#bgColor
        this.#canvas.ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height)
        this.#canvas.ctx.save()
    }
}

// resolves when triangle animation is complete and #triangle has been added to document
export function animateTriangleIntro(durationMs: number): Promise<void> {
    const halfDurationMs = durationMs / 2
    const botRightCanvas = new BotRightAnimationCanvas(createCanvasElement())
    const topLeftCanvas = new TopLeftAnimationCanvas(createCanvasElement())
    const firstBotRightAnimation = new SizeAnimation(
        botRightCanvas,
        '#eee',
        '#111',
    )
    const secondBotRightAnimation = new SizeAnimation(
        botRightCanvas,
        '#111',
        '#eee',
    )
    const firstTopLeftAnimation = new SizeAnimation(
        topLeftCanvas,
        '#111',
        '#eee',
    )
    const secondTopLeftAnimation = new SizeAnimation(
        topLeftCanvas,
        '#eee',
        '#111',
    )
    const start = Date.now()
    return new Promise(res => {
        const update = () => {
            const elapsed = Date.now() - start
            if (elapsed > halfDurationMs) {
                const progress = elapsed / durationMs
                secondBotRightAnimation.update(progress)
                secondTopLeftAnimation.update(progress)
            } else {
                const progress = elapsed / (durationMs / 2)
                firstBotRightAnimation.update(progress)
                firstTopLeftAnimation.update(progress)
            }
            if (elapsed < durationMs) {
                window.requestAnimationFrame(update)
            } else {
                botRightCanvas.remove()
                topLeftCanvas.remove()
                res()
            }
        }
        window.requestAnimationFrame(update)
    })
}

function createCanvasElement() {
    const canvas = document.createElement('canvas')
    canvas.classList.add('triangle-animation')
    canvas.style.zIndex = 'calc(var(--triangle-z-index) + 1)'
    canvas.ariaHidden = 'true'
    document.body.appendChild(canvas)
    return canvas
}
