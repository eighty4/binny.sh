import {
    getHeader,
    type LambdaHttpRequest,
    type LambdaHttpResponse,
} from '../../aws.ts'

export async function GET(
    event: LambdaHttpRequest,
): Promise<LambdaHttpResponse> {
    const headers: Record<string, string> = {
        'Clear-Site-Data': '"storage"',
        Location: '/',
    }
    const cookie = getHeader(event, 'cookie')
    if (cookie && cookie.includes('ght')) {
        headers['Set-Cookie'] =
            `ght=UselessGrant; Secure; SameSite=Strict; Path=/; Max-Age=0`
    }
    return {
        statusCode: 302,
        headers,
    }
}
