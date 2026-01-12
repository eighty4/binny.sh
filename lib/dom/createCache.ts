export interface StorageCache<T> {
    clear(): void

    hasValue(): boolean

    read(): T | null

    write(data: T): void
}

export default function createCache<T>(
    storage: Storage,
    key: string,
): StorageCache<T> {
    return {
        clear() {
            storage.removeItem(key)
        },
        hasValue() {
            return storage.getItem(key) !== null
        },
        read() {
            const data = storage.getItem(key)
            return data === null ? null : JSON.parse(data)
        },
        write(data: T) {
            storage.setItem(key, JSON.stringify(data))
        },
    }
}
