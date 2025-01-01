import type {User} from '@eighty4/install-github'
import type {RepositoryWithScript} from '../routes/searchData.ts'

export interface SessionCache<T> {
    clear(): void

    hasValue(): boolean

    read(): T | null

    write(data: T): void
}

export function createSessionCache<T>(key: string): SessionCache<T> {
    return {
        clear() {
            sessionStorage.removeItem(key)
        },
        hasValue() {
            return sessionStorage.getItem(key) !== null
        },
        read() {
            const data = sessionStorage.getItem(key)
            return data === null ? null : JSON.parse(data)
        },
        write(data: T) {
            sessionStorage.setItem(key, JSON.stringify(data))
        },
    }
}

export const configureRepoCache = createSessionCache<RepositoryWithScript>('configure.repo')

export const gitHubTokenCache = createSessionCache<string>('ght')

export const gitHubUserCache = createSessionCache<User>('ghu')
