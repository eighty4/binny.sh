import type { LambdaHttpResponse } from '../../../../aws.ts'

export async function GET(): Promise<LambdaHttpResponse> {
    return {
        statusCode: 301,
        headers: {
            Location:
                'https://github.com/login/oauth/authorize?client_id=' +
                process.env.GH_OAUTH_CLIENT_ID,
        },
    }
}
