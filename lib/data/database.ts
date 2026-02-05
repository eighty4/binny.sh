import type { Asset, Binary, Language } from '@binny.sh/github'

const DB_NAME = 'binny-sh'
const DB_VERSION = 1

export const DB_STORE_REPOS = 'repos'
export const DB_STORE_REPOS_KEY = ['owner', 'name']

export type RepoRecord = {
    owner: string
    name: string
    languages: Array<Language>
}

export const DB_STORE_RELEASES = 'releases'
export const DB_STORE_RELEASES_KEY = ['repoOwner', 'repoName', 'tag']

export const DB_INDEX_LATEST_RELEASE = 'latest-release'
export const DB_INDEX_LATEST_RELEASE_KEY = ['repoOwner', 'repoName', 'latest']

export type ReleaseRecord = {
    latest: Date
    repoName: string
    repoOwner: string
    createdAt: string
    binaries: Array<Binary>
    otherAssets: Array<Asset>
    commitHash: string
    tag: string
    updatedAt: string
    url: string
}

function upgradeDatabaseSchema(db: IDBDatabase, oldVersion: number) {
    console.log('upgrading db from', oldVersion)
    while (oldVersion < DB_VERSION) {
        if (oldVersion === 0) {
            db.createObjectStore(DB_STORE_REPOS, {
                keyPath: DB_STORE_REPOS_KEY,
            })
            db.createObjectStore(DB_STORE_RELEASES, {
                keyPath: DB_STORE_RELEASES_KEY,
            }).createIndex(DB_INDEX_LATEST_RELEASE, DB_INDEX_LATEST_RELEASE_KEY)
        }
        oldVersion++
    }
}

export async function connectToDb(): Promise<IDBDatabase> {
    return new Promise((res, rej) => {
        const opening = indexedDB.open(DB_NAME, DB_VERSION)
        opening.onupgradeneeded = (e: IDBVersionChangeEvent) => {
            try {
                upgradeDatabaseSchema((e.target as any).result, e.oldVersion)
            } catch (e) {
                console.error(e)
                throw e
            }
        }
        opening.onerror = e =>
            rej(
                new Error('error requesting database', {
                    cause: (e.target as any).error,
                }),
            )
        opening.onsuccess = e => res((e.target as any).result)
    })
}
