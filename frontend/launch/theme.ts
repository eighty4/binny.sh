let flipped = localStorage.getItem('benny.theme.flip') === '1'
if (typeof flipped === 'undefined' || flipped === null) {
    flipped = window.matchMedia('(prefers-color-scheme: dark)').matches
}
if (flipped) {
    document.documentElement.classList.add('flipped')
}
