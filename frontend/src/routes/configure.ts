import removeChildNodes from '@eighty4/binny-dom/removeChildNodes'
import { GitHubApiClient } from '@eighty4/binny-github'
import type { RepositoryWithScript } from './searchData.ts'
import { showGraphPaper } from '../graphPaper.ts'
import ConfigureScript from '../components/configure/ConfigureScript.ts'
import {
    configureRepoCache,
    gitHubTokenCache,
} from '../session/sessionCache.ts'

// todo error handling
export function openRepositoryConfig(repoOwner: string, repoName: string) {
    showGraphPaper((graphPaper: HTMLElement) => {
        graphPaper.classList.add('configure')
        let repository = configureRepoCache.read()
        if (repository) {
            configureRepoCache.clear()
            showConfig(repository)
        } else {
            graphPaper.innerHTML = '<spin-indicator></spin-indicator>'
            new GitHubApiClient(gitHubTokenCache.read()!)
                .queryLatestRelease(repoOwner, repoName)
                .then(showConfig)
                .catch(console.error)
        }

        function showConfig(repository: RepositoryWithScript) {
            removeChildNodes(graphPaper)
            graphPaper.appendChild(new ConfigureScript(repository))
        }
    })
}
