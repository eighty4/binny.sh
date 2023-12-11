import ConfigureBinary from './ConfigureBinary.ts'
import ConfigureScript from './ConfigureScript.ts'
import RepositoryLink from './RepositoryLink.ts'
import RepositoryNavigation from './RepositoryNavigation.ts'
import RepositoryPagination from './RepositoryPagination.ts'
import SpinIndicator from './SpinIndicator.ts'
import SystemLogo from './SystemLogo.ts'

document.head.innerHTML += ConfigureBinary.templateHTML()
    + ConfigureScript.templateHTML()
    + RepositoryLink.templateHTML()
    + RepositoryNavigation.templateHTML()
    + SpinIndicator.templateHTML()

customElements.define('configure-binary', ConfigureBinary)
customElements.define('configure-script', ConfigureScript)
customElements.define('repository-link', RepositoryLink)
customElements.define('repository-navigation', RepositoryNavigation)
customElements.define('repository-pagination', RepositoryPagination)
customElements.define('spin-indicator', SpinIndicator)
customElements.define('system-logo', SystemLogo)
