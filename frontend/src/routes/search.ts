import './search.css'
import emptyHtml from './search.empty.html?raw'
import errorHtml from './search.error.html?raw'
import { fetchSearchData, type SearchData } from './searchData.ts'
import { showGraphPaper } from '../graphPaper.ts'
import RepositorySection from '../components/search/RepositorySection.ts'
import { createSessionCache, gitHubUserCache } from '../session/sessionCache.ts'

const searchDataCache = createSessionCache<SearchData>('search.data')

// todo move view oriented code of route fn to component
export function findProgramRepository() {
    showGraphPaper(graphPaper => {
        graphPaper.classList.add('search-route')

        const searchData = searchDataCache.read()
        if (searchData) {
            showSearchData(searchData)
        } else {
            graphPaper.innerHTML = '<spin-indicator/>'
        }

        fetchSearchData().then(onSearchData).catch(onExceptionalCondition)

        function onSearchData(searchData: SearchData) {
            graphPaper.querySelector('spin-indicator')?.remove()
            searchDataCache.write(searchData)
            showSearchData(searchData)
        }

        function showSearchData(searchData: SearchData) {
            if (searchData.empty) {
                showGuideOnEmptyProjects()
            } else {
                graphPaper.innerHTML = `<h3 class="search-header">${gitHubUserCache.read()!.login}</h3>`
                if (searchData.releasesWithGeneratedScripts.length) {
                    graphPaper.appendChild(
                        new RepositorySection(
                            'generated',
                            searchData.releasesWithGeneratedScripts,
                        ),
                    )
                }
                if (searchData.releasesWithBinaries.length) {
                    graphPaper.appendChild(
                        new RepositorySection(
                            'released',
                            searchData.releasesWithBinaries,
                        ),
                    )
                }
                if (searchData.notReleasedWithCompatibleLanguage.length) {
                    graphPaper.appendChild(
                        new RepositorySection(
                            'compatible',
                            searchData.notReleasedWithCompatibleLanguage,
                        ),
                    )
                }
                if (searchData.everythingElse.length) {
                    graphPaper.appendChild(
                        new RepositorySection(
                            'incompatible',
                            searchData.everythingElse,
                        ),
                    )
                }
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
                graphPaper.querySelector('code')!.innerText =
                    e.stack?.toString() || e.message
            }
        }
    })
}
