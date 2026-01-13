import {
    getCookie,
    getHeader,
    type LambdaHttpRequest,
    type LambdaHttpResponse,
} from '../../../../aws.ts'

export async function GET(
    event: LambdaHttpRequest,
): Promise<LambdaHttpResponse> {
    const redirect = new URL('https://github.com/login/oauth/authorize')
    redirect.searchParams.set('prompt', 'select_account')
    redirect.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID!)
    redirect.searchParams.set(
        'state',
        `guide=${!!getCookie(event, 'Ductus') ? 0 : 1}`,
    )
    redirect.searchParams.set('redirect_uri', redirectURI(event))
    return {
        statusCode: 302,
        headers: {
            Location: redirect.toString(),
        },
    }
}

// locally hacking around env var for webapp address
// resolves automatically for `dank dev` and `dank dev --preview`
// by just setting WEBAPP_ADDRESS to `localhost`
function redirectURI(event: LambdaHttpRequest): string {
    const path = '/login/github/callback'
    if (process.env.WEBAPP_ADDRESS === 'localhost') {
        const referer = new URL(getHeader(event, 'referer')!)
        process.env.WEBAPP_ADDRESS = `http://localhost:${referer.port}`
    }
    return process.env.WEBAPP_ADDRESS + path
}
