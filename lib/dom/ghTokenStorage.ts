import getCookie from './getCookie.ts'

export function findGhToken(): string | null {
    const fromSession = sessionStorage.getItem('ght')
    if (fromSession !== null) {
        return fromSession
    }
    const fromCookie = getCookie('ght')
    if (fromCookie) {
        sessionStorage.setItem('ght', fromCookie)
    }
    return fromCookie
}
