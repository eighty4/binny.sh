export function logout() {
    localStorage.clear()
    sessionStorage.clear()
    document.cookie = `ght=;Path=/;Max-Age=0`
    window.location.replace('/')
}
