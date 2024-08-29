import ConfigureBinaryFile from './configure/ConfigureBinaryFile.ts'
import ConfigureScript from './configure/ConfigureScript.ts'
import RepositoryLink from './search/RepositoryLink.ts'
import RepositorySection from './search/RepositorySection.ts'
import SpinIndicator from './SpinIndicator.ts'
import SystemLogo from './SystemLogo.ts'
import ProfilePicture from './ProfilePicture.ts'

document.head.insertAdjacentHTML('beforeend', ConfigureBinaryFile.templateHTML())
document.head.insertAdjacentHTML('beforeend', ConfigureScript.templateHTML())
document.head.insertAdjacentHTML('beforeend', RepositoryLink.templateHTML())
document.head.insertAdjacentHTML('beforeend', RepositorySection.templateHTML())
document.head.insertAdjacentHTML('beforeend', SpinIndicator.templateHTML())

customElements.define('configure-binary-file', ConfigureBinaryFile)
customElements.define('configure-script', ConfigureScript)
customElements.define('profile-picture', ProfilePicture)
customElements.define('repository-link', RepositoryLink)
customElements.define('repository-section', RepositorySection)
customElements.define('spin-indicator', SpinIndicator)
customElements.define('system-logo', SystemLogo)
