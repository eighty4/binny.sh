import {v4 as createUuid} from 'uuid'
import {fetchAccessToken, fetchEmail, fetchUserId} from './User.js'

// todo https://blog.logrocket.com/complete-guide-abortcontroller-node-js
class PromiseMap<T> {
    private readonly resultById: Record<string, { timestamp: number, promise: Promise<T> }> = {}
    private readonly resultByTimestamp: Array<{ id: string, timestamp: number }> = []

    add(id: string, promise: Promise<T>) {
        const timestamp = Date.now()
        this.resultByTimestamp.push({id, timestamp})
        this.resultById[id] = {timestamp, promise}
    }

    remove(id: string) {
        delete this.resultById[id]
        this.resultByTimestamp.splice(this.resultByTimestamp.findIndex((obj: any) => obj.id === id), 1)
    }

    resolve(id: string): Promise<T> {
        const result = this.resultById[id]
        this.remove(id)
        if (!result) {
            throw new Error('ain\'t shit here for you')
        }
        return result.promise
    }
}

export interface AuthedUser {
    accessToken: string
    email: string
    userId: number
}

const map = new PromiseMap<AuthedUser>()

// todo error handling does not bubble up to resolveLogin(loginId)
async function loginSequence(code: string): Promise<AuthedUser> {
    const accessToken = await fetchAccessToken(code)
    const [email, userId] = await Promise.all([
        fetchEmail(accessToken),
        fetchUserId(accessToken),
    ])
    return {accessToken, email, userId}
}

export async function initiateLogin(code: string): Promise<string> {
    const loginId = createUuid()
    map.add(loginId, loginSequence(code))
    return loginId
}

export async function resolveLogin(loginId: string): Promise<AuthedUser> {
    return map.resolve(loginId)
}
