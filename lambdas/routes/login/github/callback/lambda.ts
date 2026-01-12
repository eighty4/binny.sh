import {
    getCookie,
    type LambdaHttpRequest,
    type LambdaHttpResponse,
} from '../../../../aws.ts'

export async function GET(
    event: LambdaHttpRequest,
): Promise<LambdaHttpResponse> {
    const accessToken = await fetchAccessToken(event.queryStringParameters.code)
    const skipGuide = !!getCookie(event, 'Ductus')
    return {
        statusCode: 302,
        headers: {
            Location:
                process.env.WEBAPP_ADDRESS + (skipGuide ? '/search' : '/guide'),
            'Set-Cookie': `ght=${accessToken}; Secure; SameSite=Strict; Path=/`,
        },
    }
}

async function fetchAccessToken(code: string) {
    const response = await fetch(
        'https://github.com/login/oauth/access_token',
        {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            }),
        },
    )
    if (response.status !== 200) {
        console.error(
            `github access token response ${response.status}: ${await response.text()}`,
        )
        throw new Error('github access token exchange failed')
    }
    const formData = await response.formData()
    const accessToken = formData.get('access_token')
    if (accessToken) {
        return accessToken
    } else {
        let formDataStr = ''
        for (const key in formData.keys()) {
            formDataStr += `${key}=${formData.get(key)}`
        }
        console.error(
            'github access token exchange form data missing access_token, form data has: ' +
                formDataStr,
        )
        throw new Error('github access token exchange failed')
    }
}
