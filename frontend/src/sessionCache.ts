export interface SessionCache<T> {
    clear(): void

    read(): T | null

    write(data: T): void
}

export function createSessionCache<T>(key: string): SessionCache<T> {
    return {
        clear() {
            sessionStorage.removeItem(key)
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
