export type LambdaHttpRequest = {
    body: string | null
    headers: Record<string, string>
    queryStringParameters: Record<string, string>
}

export type LambdaHttpResponse = {
    body?: string | null
    headers?: Record<string, string>
    statusCode: number
}

export function getHeader(
    event: LambdaHttpRequest,
    find: string,
): string | null {
    find = find.toLowerCase()
    for (const name of Object.keys(event.headers)) {
        if (name.toLowerCase() === find) {
            return event.headers[name]
        }
    }
    return null
}

export function getCookie(
    event: LambdaHttpRequest,
    name: string,
): string | null {
    const cookieHV = getHeader(event, 'cookie')
    if (cookieHV?.length) {
        for (const cookie of cookieHV.split(';')) {
            const [key, value] = cookie.split('=')
            if (key.trim() === name) {
                return value.trim()
            }
        }
    }
    return null
}
