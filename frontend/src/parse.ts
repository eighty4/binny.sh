export function getCookie(name: string): string | undefined {
    if (document.cookie.length) {
        for (const cookie of document.cookie.split(';')) {
            const [key, value] = cookie.split('=')
            if (key.trim() === name) {
                return value.trim()
            }
        }
    }
}

export function parseDocumentCookies(): Record<string, string> {
    const result: Record<string, string> = {}
    if (document.cookie.length) {
        for (const cookie of document.cookie.split(';')) {
            const [key, value] = cookie.split('=')
            result[key.trim()] = value.trim()
        }
    }
    return result
}

export function parseQueryParams(): Record<string, string> {
    const result: Record<string, string> = {}
    if (location.search.length) {
        const keyValuePairs = location.search.substring(1).split('&')
        for (const keyValuePair of keyValuePairs) {
            const [key, value] = keyValuePair.split('=')
            result[key] = value
        }
    }
    return result
}
