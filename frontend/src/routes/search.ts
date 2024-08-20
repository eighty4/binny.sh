import {type Repository} from '@eighty4/install-github'
import RepositoryNavigation from '../components/search/RepositoryNavigation.ts'
import {showGraphPaper} from '../graphPaper.ts'
import {createSessionCache} from '../sessionCache.ts'
import createGitHubGraphApiClient from '../createGitHubGraphApiClient.ts'
import {removeChildNodes} from '../dom.ts'

const projectsCache = createSessionCache<Array<Repository>>('search.projects')

export function findProgramRepository() {
    showGraphPaper((graphPaper) => {
        graphPaper.classList.add('center')

        let navigation: RepositoryNavigation
        let projects = projectsCache.read()

        if (projects?.length) {
            showProjects(projects)
        } else {
            graphPaper.innerHTML = '<spin-indicator/>'
        }

        createGitHubGraphApiClient().collectUserRepositories().then(onProjectsReceived).catch(onExceptionalCondition)

        function onProjectsReceived(repositories: Array<Repository>) {
            projectsCache.write(projects = repositories)
            if (projects.length) {
                showProjects(projects)
            } else {
                showGuideOnEmptyProjects()
            }
        }

        function showProjects(projects: Array<Repository>) {
            if (!navigation) {
                navigation = new RepositoryNavigation()
                removeChildNodes(graphPaper)
                graphPaper.appendChild(navigation)
            }
            navigation.projects = projects
        }

        function showGuideOnEmptyProjects() {
            // todo separate instruction links from messaging screen, open instructions/guide from a call to action
            // todo search/filter repositories
            // todo show projects without releases
            // todo link to fork a workflow template to create Zig/Rust/Golang workflows with release uploads
            graphPaper.innerHTML = `
                <div style="color: var(--head-text-color); width: 25vmin; padding: 6vmin; background: var(--head-bg-color);">
                    <h3 style="font-size: 2rem; margin-bottom: 2rem">Oh, this is awkward</h3>
                    <p style="margin-bottom: 1rem;">You don't have any GitHub releases with artifacts for Linux, MacOS or Windows.</p>
                    <p style="margin-bottom: .75rem;">Try these docs and come back:</p>
                    <h4 style="padding: 1rem 0 .5rem">CLI</h4>
                    <p><a href="https://cli.github.com/manual/gh_release_create" style="color: var(--head-text-color); padding: .5rem">Create a release</a></p>
                    <p><a href="https://cli.github.com/manual/gh_release_upload" style="color: var(--head-text-color); padding: .5rem">Create a release asset</a></p>
                    <h4 style="padding: 1rem 0 .5rem">Rest API</h4>
                    <p><a href="https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#create-a-release" style="color: var(--head-text-color); padding: .5rem">Create a release</a></p>
                    <p><a href="https://docs.github.com/en/rest/releases/assets?apiVersion=2022-11-28#upload-a-release-asset" style="color: var(--head-text-color); padding: .5rem">Create a release asset</a></p>
                </div>
            `
        }

        function onExceptionalCondition(e: Error) {
            console.error(e)
            graphPaper.innerHTML = `
                <div style="color: var(--head-text-color); min-width: 25vmin; padding: 6vmin; background: orangered">
                    <h3 style="font-size: 2rem; margin-bottom: 2rem">Oh, this is awkward</h3>
                    <pre><code>${e.stack}</code></pre>
                </div>
            `
        }
    })
}
