import {type Repository} from '@eighty4/install-github'
import './search.css'
import emptyHtml from './search.empty.html?raw'
import errorHtml from './search.error.html?raw'
import createGitHubGraphApiClient from '../createGitHubGraphApiClient.ts'
import {removeChildNodes} from '../dom.ts'
import {showGraphPaper} from '../graphPaper.ts'
import {createSessionCache, gitHubUserCache} from '../sessionCache.ts'
import RepositorySection from '../components/search/RepositorySection.ts'

type RepoSectionType = 'generated' | 'released' | 'compatible'

interface RepoSectionData {
    type: RepoSectionType
    repos: Array<Repository>
}

const sectionHeaders: Record<RepoSectionType, string> = {
    generated: 'Install.sh scripts',
    released: 'With released binaries',
    compatible: 'Uses compiled languages',
}

const projectsCache = createSessionCache<Array<Repository>>('search.projects')

export function findProgramRepository() {
    showGraphPaper((graphPaper) => {
        graphPaper.classList.add('search-route')

        let loading: boolean = true
        let projects = projectsCache.read()
        if (projects?.length) {
            showProjects(projects)
        } else {
            graphPaper.innerHTML = '<spin-indicator/>'
        }

        createGitHubGraphApiClient().collectUserRepositories().then(onProjectsReceived).catch(onExceptionalCondition)

        function onProjectsReceived(repositories: Array<Repository>) {
            projectsCache.write(projects = repositories)
            showProjects(projects)
        }

        function showProjects(projects: Array<Repository>) {
            if (loading) {
                removeChildNodes(graphPaper)
                loading = false
                const groupedRepos = groupRepositories(projects)
                const primaryRepoGroups: Array<RepoSectionData> = []
                if (groupedRepos.releasesWithGeneratedScripts) {
                    // todo
                }
                if (groupedRepos.releasesWithBinaries.length) {
                    primaryRepoGroups.push({
                        type: 'released',
                        repos: groupedRepos.releasesWithBinaries,
                    })
                }
                if (groupedRepos.notReleasedWithCompiledLanguage.length) {
                    primaryRepoGroups.push({
                        type: 'compatible',
                        repos: groupedRepos.notReleasedWithCompiledLanguage,
                    })
                }
                if (primaryRepoGroups.length) {
                    graphPaper.innerHTML = `<h3>${gitHubUserCache.read()!.login}'s repos</h3>`
                    showPrimaryRepoSections(primaryRepoGroups)
                } else {
                    showGuideOnEmptyProjects()
                }
            } else {
                // todo diff cache and api response
            }
        }

        function showPrimaryRepoSections(repoSections: Array<RepoSectionData>) {
            for (const data of repoSections) {
                graphPaper.insertAdjacentHTML('beforeend', `<repository-section class="${data.type}" header="${sectionHeaders[data.type]}"></repository-section>`)
                const repoSection = graphPaper.querySelector(`.${data.type}`) as RepositorySection
                repoSection.repos = data.repos
            }
        }

        function showGuideOnEmptyProjects() {
            // todo separate instruction links from messaging screen, open instructions/guide from a call to action
            // todo search/filter repositories
            // todo show projects without releases
            // todo link to fork a workflow template to create Zig/Rust/Golang workflows with release uploads
            graphPaper.innerHTML = emptyHtml
        }

        function onExceptionalCondition(e: Error) {
            console.error(e)
            graphPaper.innerHTML = errorHtml
            if (import.meta.env.DEV) {
                graphPaper.querySelector('code')!.innerText = e.stack?.toString() || e.message
            }
        }
    })
}

interface GroupedRepos {
    releasesWithGeneratedScripts: Array<Repository>
    releasesWithBinaries: Array<Repository>
    notReleasedWithCompiledLanguage: Array<Repository>
    everythingElse: Array<Repository>
}

function groupRepositories(repos: Array<Repository>): GroupedRepos {
    const releasesWithBinaries: Array<Repository> = []
    const notReleasedWithCompiledLanguage: Array<Repository> = []
    const everythingElse: Array<Repository> = []
    for (const repo of repos) {
        if (repo.latestRelease?.binaries?.length) {
            releasesWithBinaries.push(repo)
        } else if (repo.languages.length) {
            notReleasedWithCompiledLanguage.push(repo)
        } else {
            everythingElse.push(repo)
        }
    }
    return {
        releasesWithGeneratedScripts: [],
        releasesWithBinaries,
        notReleasedWithCompiledLanguage,
        everythingElse,
    }
}
