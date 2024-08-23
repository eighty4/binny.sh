import dialogMarkup from './explain.html?raw'
import './explain.css'

let dialog: HTMLDialogElement

export const initializeExplainButton = () => {
    const button = document.querySelector('#explain button')!
    button.addEventListener('click', openDialog)
    console.log(button)
    appendDialogMarkup()
}

function openDialog() {
    if (!dialog.open) {
        console.log('wtf')
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
