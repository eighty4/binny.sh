import type {Repository} from '@eighty4/install-github'
import type {GeneratedScript} from '@eighty4/install-template'
import {fetchGeneratedScriptsKeyedByRepo} from '../api.ts'
import createGitHubGraphApiClient from '../createGitHubGraphApiClient.ts'

export type RepositoryWithScript = Repository & { script?: GeneratedScript }

export interface SearchData {
    empty: boolean
    releasesWithGeneratedScripts: Array<RepositoryWithScript>
    releasesWithBinaries: Array<Repository>
    notReleasedWithCompatibleLanguage: Array<Repository>
    everythingElse: Array<Repository>
}

export async function fetchSearchData(): Promise<SearchData> {
    const repositories = await createGitHubGraphApiClient().collectUserRepositories()
    const generatedScripts = await fetchGeneratedScriptsKeyedByRepo()
    const releasesWithGeneratedScripts: Array<RepositoryWithScript> = []
    const releasesWithBinaries: Array<Repository> = []
    const notReleasedWithCompatibleLanguage: Array<Repository> = []
    const everythingElse: Array<Repository> = []
    for (const repo of repositories) {
        const script = generatedScripts[`${repo.owner}/${repo.name}`]
        if (script) {
            releasesWithGeneratedScripts.push({...repo, script})
        } else if (repo.latestRelease?.binaries?.length) {
            releasesWithBinaries.push(repo)
        } else if (repo.languages.length) {
            notReleasedWithCompatibleLanguage.push(repo)
        } else {
            everythingElse.push(repo)
        }
    }
    return {
        empty: !repositories.length,
        releasesWithGeneratedScripts,
        releasesWithBinaries,
        notReleasedWithCompatibleLanguage,
        everythingElse,
    }
}
