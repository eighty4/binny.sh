export type Logo = 'cpp' | 'zig' | 'rust' | 'go' | 'win' | 'linux' | 'mac'

export type Point = { x: number; y: number }

export interface ScaledCalculations {
    step0: {
        circleOrigin: Point
        circleRadius: number
        logoTangencyOffsets: Record<Logo, Point>
        logoTangencyPoints: Record<Logo, Point>
    }
    step0point5: {
        logoTangencyMidpoints: Record<Logo, Point>
    }
    step1: {
        circleOrigin: Point
        circleRadius: number
        logoTangencyOffsets: Record<Logo, Point>
        logoTangencyPoints: Record<Logo, Point>
        offsetPath: string
        offsetDurationMs: number
    }
}

export function createScaledCalculationsFromWindowSize(): ScaledCalculations {
    const zeroCircleRadius = 100
    const zeroCircleOrigin = {
        x: 0.2 * document.body.clientWidth,
        y: 0.4 * document.body.clientHeight,
    }
    const zeroLogoTangencyOffsets = createLogoTangencyOffsets(zeroCircleRadius)
    const zeroLogoTangencyPoints = createLogoTangencyPoints(
        zeroCircleOrigin,
        zeroLogoTangencyOffsets,
    )
    const oneCircleRadius = 35
    const oneCircleOrigin = {
        x: 0.4 * document.body.clientWidth,
        y: 0.8 * document.body.clientHeight,
    }
    const oneLogoTangencyOffsets = createLogoTangencyOffsets(oneCircleRadius)
    const oneLogoTangencyPoints = createLogoTangencyPoints(
        oneCircleOrigin,
        oneLogoTangencyOffsets,
    )
    return {
        step0: {
            circleOrigin: zeroCircleOrigin,
            circleRadius: zeroCircleRadius,
            logoTangencyOffsets: zeroLogoTangencyOffsets,
            logoTangencyPoints: zeroLogoTangencyPoints,
        },
        step0point5: {
            logoTangencyMidpoints: createLogoTangencyMidpoints(
                zeroLogoTangencyPoints,
                oneLogoTangencyPoints,
            ),
        },
        step1: {
            circleOrigin: oneCircleOrigin,
            circleRadius: oneCircleRadius,
            logoTangencyOffsets: oneLogoTangencyOffsets,
            logoTangencyPoints: oneLogoTangencyPoints,
            offsetPath: createOffsetPath(),
            offsetDurationMs: 2000,
        },
    }
}

function createLogoTangencyOffsets(radius: number): Record<Logo, Point> {
    const topAngleFn = (i: number, n: number) =>
        Math.PI + (Math.PI * (i + 0.5)) / n
    const bottomAngleFn = (i: number, n: number) =>
        (Math.PI * (n - i - 0.5)) / n
    return {
        ...calculateLogoTangencies(topAngleFn, radius, [
            'cpp',
            'zig',
            'rust',
            'go',
        ]),
        ...calculateLogoTangencies(bottomAngleFn, radius, [
            'win',
            'mac',
            'linux',
        ]),
    } as Record<Logo, Point>
}

type AngleFn = (i: number, n: number) => number

function calculateLogoTangencies(
    angleFn: AngleFn,
    radius: number,
    logos: Array<Logo>,
): Partial<Record<Logo, Point>> {
    const result: Partial<Record<Logo, Point>> = {}
    for (let i = 0; i < logos.length; i++) {
        const angle = angleFn(i, logos.length)
        result[logos[i]] = {
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle),
        }
    }
    return result
}

function createLogoTangencyPoints(
    origin: Point,
    tangencyOffsets: Record<Logo, Point>,
): Record<Logo, Point> {
    const result: Partial<Record<Logo, Point>> = {}
    Object.entries(tangencyOffsets).forEach(([logo, tangencyOffset]) => {
        result[logo as Logo] = {
            x: origin.x + tangencyOffset.x,
            y: origin.y + tangencyOffset.y,
        }
    })
    return result as Record<Logo, Point>
}

function createLogoTangencyMidpoints(
    zeroLogos: Record<Logo, Point>,
    oneLogos: Record<Logo, Point>,
): Record<Logo, Point> {
    const result: Partial<Record<Logo, Point>> = {}
    Object.entries(zeroLogos).forEach(([logo, zeroPoint]) => {
        result[logo as Logo] = {
            x: (zeroPoint.x + oneLogos[logo as Logo].x) / 2,
            y: (zeroPoint.y + oneLogos[logo as Logo].y) / 2,
        }
    })
    return result as Record<Logo, Point>
}

function createOffsetPath() {
    const totalWidth = document.body.clientWidth * 0.4
    let x = 0
    let p = 'M-50,-50 L0,0 '
    const alternatingQuadCurvesWidth = totalWidth * 0.75
    while (x + 40 < alternatingQuadCurvesWidth) {
        p += `Q${(x += 10)},4,${(x += 10)},0 `
        p += `Q${(x += 10)},-4,${(x += 10)},0 `
    }
    p += `Q${(x += 10)},4,${(x += 10)},0 `
    p += `Q${(x += 10)},-4,${(x += 10)},-100 `
    return p
}
