import ConfigureBinaries from './configure/ConfigureBinaries.ts'
import ConfigureBinary from './configure/ConfigureBinary.ts'
import ConfigureScript from './configure/ConfigureScript.ts'
import RepositoryLink from './search/RepositoryLink.ts'
import RepositorySection from './search/RepositorySection.ts'
import SpinIndicator from './SpinIndicator.ts'
import SystemLogo from './SystemLogo.ts'
import ProfilePicture from './ProfilePicture.ts'

document.head.innerHTML += ConfigureBinaries.templateHTML()
    + ConfigureBinary.templateHTML()
    + ConfigureScript.templateHTML()
    + RepositoryLink.templateHTML()
    + RepositorySection.templateHTML()
    + SpinIndicator.templateHTML()

customElements.define('configure-binaries', ConfigureBinaries)
customElements.define('configure-binary', ConfigureBinary)
customElements.define('configure-script', ConfigureScript)
customElements.define('profile-picture', ProfilePicture)
customElements.define('repository-link', RepositoryLink)
customElements.define('repository-section', RepositorySection)
customElements.define('spin-indicator', SpinIndicator)
customElements.define('system-logo', SystemLogo)
