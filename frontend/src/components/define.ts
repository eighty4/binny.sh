import ArchitectureSelect from './configure/ArchitectureSelect.ts'
import ConfigureScript from './configure/ConfigureScript.ts'
import DownloadPanel from './configure/DownloadPanel.ts'
import RepositoryLink from './search/RepositoryLink.ts'
import RepositorySection from './search/RepositorySection.ts'
import BackButton from './BackButton.ts'
import ProfilePicture from './ProfilePicture.ts'
import SpinIndicator from './SpinIndicator.ts'
import SystemLogo from './SystemLogo.ts'
import UserPanel from './UserPanel.ts'

document.head.insertAdjacentHTML('beforeend', ArchitectureSelect.templateHTML())
document.head.insertAdjacentHTML('beforeend', BackButton.templateHTML())
document.head.insertAdjacentHTML('beforeend', ConfigureScript.templateHTML())
document.head.insertAdjacentHTML('beforeend', DownloadPanel.templateHTML())
document.head.insertAdjacentHTML('beforeend', RepositoryLink.templateHTML())
document.head.insertAdjacentHTML('beforeend', RepositorySection.templateHTML())
document.head.insertAdjacentHTML('beforeend', SpinIndicator.templateHTML())
document.head.insertAdjacentHTML('beforeend', UserPanel.templateHTML())

customElements.define('architecture-select', ArchitectureSelect)
customElements.define('back-button', BackButton)
customElements.define('configure-script', ConfigureScript)
customElements.define('download-panel', DownloadPanel)
customElements.define('profile-picture', ProfilePicture)
customElements.define('repository-link', RepositoryLink)
customElements.define('repository-section', RepositorySection)
customElements.define('spin-indicator', SpinIndicator)
customElements.define('system-logo', SystemLogo)
customElements.define('user-panel', UserPanel)
