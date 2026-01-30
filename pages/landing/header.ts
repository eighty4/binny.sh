document.addEventListener('DOMContentLoaded', animateGetShippedText, {
    once: true,
})

function animateGetShippedText() {
    const getShippedTextPath = document.querySelector(
        '#get-shipped textPath',
    ) as SVGTextPathElement
    const getShippedStartOffset = parseInt(
        getShippedTextPath.getAttribute('startOffset')!.replace('%', ''),
        10,
    )
    const header = document.getElementById('binny-header') as HTMLElement
    const headerAnimationRangeEnd = parseInt(
        getComputedStyle(document.documentElement)
            .getPropertyValue('--header-max-height')
            .replace('px', ''),
        10,
    )

    addScrollListener()

    header.addEventListener('animationstart', e => {
        if (e.animationName === 'header-height') {
            addScrollListener()
        }
    })

    function addScrollListener() {
        window.addEventListener('scroll', onScroll)
    }

    function onScroll() {
        if (window.scrollY > headerAnimationRangeEnd) {
            window.removeEventListener('scroll', onScroll)
            getShippedTextPath.setAttribute('startOffset', '0%')
        } else {
            const progress =
                (headerAnimationRangeEnd - window.scrollY) /
                headerAnimationRangeEnd
            getShippedTextPath.setAttribute(
                'startOffset',
                progress * getShippedStartOffset + '%',
            )
        }
    }
}
