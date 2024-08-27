import type {User} from '@eighty4/install-github'
import createGitHubGraphApiClient from './createGitHubGraphApiClient.ts'
import {logout} from './logout.ts'
import html from './userPanel.html?raw'
import './userPanel.css'

let userPanel: HTMLElement
let userMenu: HTMLElement
let userAvatar: HTMLImageElement
let userLogin: HTMLElement
let logoutLink: HTMLElement

export function initializeUserPanel() {
    createGitHubGraphApiClient().queryUser().then(createUserPanel)
}

function createUserPanel(user: User) {
    document.getElementById('grid')!.insertAdjacentHTML('beforeend', html)
    userPanel = document.getElementById('user-panel')!
    userAvatar = userPanel.querySelector('#user-avatar') as HTMLImageElement
    userAvatar.src = user.avatarUrl
    userLogin = userPanel.querySelector('#user-login') as HTMLElement
    userLogin.innerText = user.login
    userMenu = userPanel.querySelector('#user-menu') as HTMLElement
    userMenu.onmouseenter = showUserMenu
    userMenu.onmouseleave = hideUserMenu
    logoutLink = userPanel.querySelector('#logout') as HTMLButtonElement
    logoutLink.onclick = logout
}

function showUserMenu() {
    userMenu.classList.add('expanded')
}

function hideUserMenu() {
    userMenu.classList.remove('expanded')
}
