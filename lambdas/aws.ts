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
