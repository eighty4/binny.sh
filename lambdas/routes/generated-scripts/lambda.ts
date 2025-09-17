const generatedScripts = {}

export async function GET(event) {
    console.log(event.headers.Authorization)
    if (
        !event.headers['Authorization'] ||
        !event.headers['Authorization'].startsWith('Bearer ')
    ) {
        return { statusCode: 401 }
    }
    const accessToken = event.headers['Authorization'].substring(7)
    const userId = await fetchUserId(accessToken)
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

export async function POST(event) {
    if (
        !event.headers['Authorization'] ||
        !event.headers['Authorization'].startsWith('Bearer ')
    ) {
        return { statusCode: 401 }
    }
    const accessToken = event.headers['Authorization'].substring(7)
    const userId = await fetchUserId(accessToken)
    if (!userId) {
        return { statusCode: 401 }
    }
    if (
        !event.headers['Content-Type'] ||
        !event.headers['Content-Type'].includes('application/json')
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
