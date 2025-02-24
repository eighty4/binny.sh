import { getCookie } from '../../src/parse.js'

// bump to 0 to show intro
const INTRO_VERSION = 0

const STORAGE_KEY = 'binny.skip_launch_animation'

// todo dont forget to clean up ?intro=1 from e2e intro tests
export function willSkipAnimation(): boolean {
    if (location.search.includes('intro=1')) {
        return false
    }
    if (location.search.includes('intro=0')) {
        return true
    }
    if (typeof getCookie('ght') === 'undefined') {
        return true
    }
    return getStoredSkipVersion() >= INTRO_VERSION
}

function getStoredSkipVersion(): number {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            return parseInt(stored, 10)
        }
    } catch (_) {}
    return -1
}

export function skipAnimationNextLaunch(): void {
    return localStorage.setItem(STORAGE_KEY, '' + INTRO_VERSION)
}
