import {
    getHeader,
    type LambdaHttpRequest,
    type LambdaHttpResponse,
} from '../../aws.ts'

const generatedScripts: Record<string, Array<string>> = {}

export async function GET(
    event: LambdaHttpRequest,
): Promise<LambdaHttpResponse> {
    const authHV = getHeader(event, 'Authorization')
    if (!authHV?.startsWith('Bearer ')) {
        return { statusCode: 401 }
    }
    const userId = await fetchUserId(authHV.substring(7))
    if (!userId) {
        return { statusCode: 401 }
    }
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(generatedScripts[userId] || []),
    }
}

export async function POST(
    event: LambdaHttpRequest,
): Promise<LambdaHttpResponse> {
    const authHV = getHeader(event, 'Authorization')
    if (authHV === null || !authHV.startsWith('Bearer ')) {
        return { statusCode: 401 }
    }
    const userId = await fetchUserId(authHV.substring(7))
    if (!userId) {
        return { statusCode: 401 }
    }
    if (
        !getHeader(event, 'Content-Type')?.includes('application/json') ||
        !event.body
    ) {
        return { statusCode: 400 }
    }
    if (!generatedScripts[userId]) {
        generatedScripts[userId] = []
    }
    generatedScripts[userId].push(JSON.parse(event.body))
    // todo validate
    // todo save to db
    return { statusCode: 201 }
}

// todo use client in @eighty4/binny-github
// todo graphql viewer request might be faster than retrieving the entire /user payload
async function fetchUserId(accessToken: string) {
    const response = await fetch('https://api.github.com/user', {
        headers: {
            Authorization: 'Bearer ' + accessToken,
            'X-GitHub-Api-Version': '2022-11-28',
        },
    })
    if (response.status !== 200) {
        switch (response.status) {
            case 401:
                console.error('GET api.github.com/user unauthorized')
                return
            default:
                throw new Error(
                    'GET api.github.com/user unexpected response status ' +
                        response.status,
                )
        }
    }
    return (await response.json()).id
}
