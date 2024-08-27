import dialogMarkup from './explain.html?raw'
import './explain.css'

let dialog: HTMLDialogElement

export const initializeExplainButton = () => {
    const button = document.querySelector('#explain button')!
    button.addEventListener('click', openDialog)
    appendDialogMarkup()
}

function openDialog() {
    if (!dialog.open) {
        dialog.showModal()
    }
}

function appendDialogMarkup() {
    dialog = document.createElement('dialog')
    dialog.id = 'explain-dialog'
    dialog.innerHTML = dialogMarkup
    document.body.appendChild(dialog)
    dialog.querySelector('.close')?.addEventListener('click', () => dialog.close())
}
