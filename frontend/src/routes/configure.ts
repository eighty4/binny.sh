import {type Repository} from '@eighty4/install-github'
import ConfigureScript from '../components/configure/ConfigureScript.ts'
import createGitHubGraphApiClient from '../createGitHubGraphApiClient.ts'
import {showGraphPaper} from '../graphPaper.ts'
import {removeChildNodes} from '../dom.ts'
import {configureRepoCache} from '../sessionCache.ts'

// todo error handling
export function openRepositoryConfig(repoOwner: string, repoName: string) {
    showGraphPaper((graphPaper: HTMLElement) => {
        graphPaper.classList.add('configure')
        let repository = configureRepoCache.read()
        if (repository) {
            configureRepoCache.clear()
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
