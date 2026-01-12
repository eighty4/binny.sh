export default function getCookie(name: string): string | null {
    if (document.cookie.length) {
        for (const cookie of document.cookie.split(';')) {
            const [key, value] = cookie.split('=')
            if (key.trim() === name) {
                return value.trim()
            }
        }
    }
    return null
}
