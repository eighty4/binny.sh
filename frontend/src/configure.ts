import {type Repository} from '@eighty4/install-github'
import createGitHubGraphApiClient from './createGitHubGraphApiClient.ts'
import {showGraphPaper} from './graphPaper.ts'
import {createSessionCache} from './sessionCache.ts'
import ConfigureScript from './components/ConfigureScript.ts'
import {removeChildNodes} from './dom.ts'

export const configureRepositoryCache = createSessionCache<Repository>('configure.repo')

// todo error handling
export function openRepositoryConfig(repoOwner: string, repoName: string) {
    showGraphPaper((graphPaper: HTMLElement) => {
        graphPaper.classList.add('center')
        let repository = configureRepositoryCache.read()
        if (repository) {
            configureRepositoryCache.clear()
            showConfig(repository)
        } else {
            graphPaper.innerHTML = '<spin-indicator/>'
            createGitHubGraphApiClient()
                .queryLatestRelease(repoOwner, repoName)
                .then(showConfig)
                .catch(console.error)
        }

        function showConfig(repository: Repository) {
            removeChildNodes(graphPaper)
            graphPaper.appendChild(new ConfigureScript(repository))
        }
    })
}
