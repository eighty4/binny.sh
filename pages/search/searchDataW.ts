import type { GeneratedScript } from '@binny.sh/template'
import {
    connectToDb,
    DB_INDEX_LATEST_RELEASE,
    DB_STORE_RELEASES,
    DB_STORE_REPOS,
    type ReleaseRecord,
    type RepoRecord,
} from 'Binny.sh/data/database'
import type { Repository } from 'Binny.sh/github/model'
import { collectViewerRepos } from 'Binny.sh/github/queries/viewerRepos'

declare const self: DedicatedWorkerGlobalScope

export type SearchData = {
    // true if all collections in SearchData are empty
    empty: boolean
    releasesWithGeneratedScripts: Array<
        Repository & { script?: GeneratedScript }
    >
    releasesWithBinaries: Array<Repository>
    notReleasedWithCompatibleLanguage: Array<Repository>
    everythingElse: Array<Repository>
}

export type SearchDataRequest =
    | {
          kind: 'init'
          ghToken: string
      }
    | {
          kind: 'fetch'
          method: 'db'
      }
    | {
          kind: 'fetch'
          method: 'resync'
          ghToken: string
      }

export type SearchDataSyncStage = 'fetch' | 'db'

export type SearchDataReply =
    | {
          kind: 'unauthorized'
      }
    | {
          kind: 'fetch'
          data: SearchData
      }
    | {
          kind: 'synced'
          updated: boolean
          total: number
      }
    | {
          kind: 'progress'
          stage: SearchDataSyncStage
          completed: number
          total: number
      }

let ghToken: string | null = null

// post progress updates to client
let progress: boolean = false

onmessage = async (e: MessageEvent<SearchDataRequest>) => {
    switch (e.data.kind) {
        case 'init':
            ghToken = e.data.ghToken
            progress = true
            await performSync()
            break
        case 'fetch':
            performFetch().then(data => {
                postReply({
                    kind: 'fetch',
                    data,
                })
            })
            if (e.data.method === 'resync') {
                ghToken = e.data.ghToken
                progress = false
                await performSync()
            }
            break
        default:
            throw Error(
                'searchDataW.ts unsupported event ' + JSON.stringify(e.data),
            )
    }
}

onmessageerror = (e: any) => console.log('searchDataW.ts error', e)

function postReply(reply: SearchDataReply) {
    postMessage(reply)
}

function postProgress(
    stage: SearchDataSyncStage,
    completed: number,
    total: number,
) {
    if (progress) {
        postReply({
            kind: 'progress',
            stage,
            total,
            completed,
        })
    }
}

function postSynced(updated: boolean, total: number) {
    postReply({ kind: 'synced', updated, total })
}

async function performFetch(): Promise<SearchData> {
    const repos = await readReposFromDb()
    return transformSearchData(repos, {})
}

async function performSync() {
    postProgress('fetch', 0, 1)
    const opts = progress
        ? {
              onPage: (completed: number, total: number) =>
                  postProgress('fetch', completed, total),
          }
        : undefined
    const repos = await collectViewerRepos(ghToken!, opts)
    const updated = await syncReposToDb(repos)
    postSynced(updated, repos.length)
}

async function syncReposToDb(repos: Array<Repository>): Promise<boolean> {
    postProgress('db', 0, repos.length)
    return new Promise(async (res, rej) => {
        const db = await connectToDb()
        const tx = db.transaction(
            [DB_STORE_REPOS, DB_STORE_RELEASES],
            'readwrite',
        )
        let updated = false
        let completed = 0
        tx.oncomplete = () => res(updated)
        tx.onerror = rej
        const repoStore = tx.objectStore(DB_STORE_REPOS)
        const releaseStore = tx.objectStore(DB_STORE_RELEASES)
        const req: IDBRequest<IDBCursorWithValue | null> =
            repoStore.openCursor()

        const reposByName: Record<string, Repository> = {}
        for (const repo of repos)
            reposByName[`${repo.owner}/${repo.name}`] = repo

        req.onsuccess = () => {
            const cursor = req.result
            if (cursor) {
                const repo = cursor.value as RepoRecord
                const fetched = reposByName[`${repo.owner}/${repo.name}`]
                if (fetched) {
                    let update = false
                    if (
                        repo.languages.length !== fetched.languages.length ||
                        !fetched.languages.every(l =>
                            repo.languages.includes(l),
                        )
                    ) {
                        update = true
                    }
                    if (update) {
                        cursor.update({
                            owner: repo.owner,
                            name: repo.name,
                            languages: fetched.languages,
                        }).onsuccess = () =>
                            postProgress('db', ++completed, repos.length)
                        updated = true
                    }
                    // todo updating latest release info should report that sync updated
                    putLatestReleaseInDb(releaseStore, fetched)
                    delete reposByName[`${repo.owner}/${repo.name}`]
                } else {
                    cursor.delete()
                    // todo unable to test this .delete(lowerBound())
                    // releaseStore.delete(
                    //     IDBKeyRange.lowerBound([repo.owner, repo.name], false),
                    // )
                }
                cursor.continue()
            } else {
                for (const repo of Object.values(reposByName)) {
                    updated = true
                    repoStore.put({
                        owner: repo.owner,
                        name: repo.name,
                        languages: repo.languages,
                    }).onsuccess = () =>
                        postProgress('db', ++completed, repos.length)
                    putLatestReleaseInDb(releaseStore, repo)
                }
            }
        }
    })
}

function putLatestReleaseInDb(releaseStore: IDBObjectStore, repo: Repository) {
    if (repo.latestRelease) {
        releaseStore.put({
            repoOwner: repo.owner,
            repoName: repo.name,
            latest: new Date(),
            ...repo.latestRelease,
        })
    }
}

async function readReposFromDb(): Promise<Array<Repository>> {
    return new Promise(async (res, rej) => {
        const db = await connectToDb()
        const tx = db.transaction(
            [DB_STORE_REPOS, DB_STORE_RELEASES],
            'readonly',
        )
        const repos: Array<Repository> = []
        tx.oncomplete = () => res(repos)
        tx.onerror = rej

        const repoStore = tx.objectStore(DB_STORE_REPOS)
        const latestReleaseIndex = tx
            .objectStore(DB_STORE_RELEASES)
            .index(DB_INDEX_LATEST_RELEASE)
        const req: IDBRequest<IDBCursorWithValue | null> =
            repoStore.openCursor()

        req.onsuccess = () => {
            const cursor = req.result
            if (cursor) {
                const repo = cursor.value as RepoRecord
                repos.push(repo)

                // todo this method of getting one record from [repoOwner, repoName, latest] with only [repoOwner, repoName]
                //  retrieves another repo's record from the index when [reopOwner, repoName] does not match a record
                //  currently working around with a comparison but ideally would like to not retireve unncessary data
                const latestReleaseRequest: IDBRequest<ReleaseRecord> =
                    latestReleaseIndex.get(
                        IDBKeyRange.lowerBound([repo.owner, repo.name]),
                    )
                latestReleaseRequest.onsuccess = () => {
                    const release: ReleaseRecord = latestReleaseRequest.result
                    if (
                        release &&
                        release.repoOwner === repo.owner &&
                        release.repoName === repo.name
                    ) {
                        ;(repo as Repository).latestRelease = {
                            binaries: release.binaries,
                            createdAt: release.createdAt,
                            commitHash: release.commitHash,
                            otherAssets: release.otherAssets,
                            tag: release.tag,
                            updatedAt: release.updatedAt,
                            url: release.url,
                        }
                    }
                }
                cursor.continue()
            }
        }
    })
}

function transformSearchData(
    repos: Array<Repository>,
    generatedScripts: Record<string, GeneratedScript>,
): SearchData {
    const releasesWithGeneratedScripts: Array<
        Repository & { script?: GeneratedScript }
    > = []
    const releasesWithBinaries: Array<Repository> = []
    const notReleasedWithCompatibleLanguage: Array<Repository> = []
    const everythingElse: Array<Repository> = []
    for (const repo of repos) {
        const script = generatedScripts[`${repo.owner}/${repo.name}`]
        if (script) {
            releasesWithGeneratedScripts.push({ ...repo, script })
        } else if (repo.latestRelease?.binaries?.length) {
            releasesWithBinaries.push(repo)
        } else if (repo.languages.length) {
            notReleasedWithCompatibleLanguage.push(repo)
        } else {
            everythingElse.push(repo)
        }
    }
    return {
        empty: !repos.length,
        releasesWithGeneratedScripts,
        releasesWithBinaries,
        notReleasedWithCompatibleLanguage,
        everythingElse,
    }
}
