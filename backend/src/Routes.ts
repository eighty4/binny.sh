import type {RequestHandler} from 'express'
import {generateScript} from '@eighty4/install-template'
import {saveTemplateVersion} from './Database.js'
import {initiateLogin, resolveLogin} from './Login.js'
import {resolveTemplateRuntimeVersion} from './Template.js'

const TEMPLATE_VERSION = resolveTemplateRuntimeVersion()

export function createAccessTokenCookie(accessToken: string): string {
    if (process.env.NODE_ENV === 'production') {
        return `ght=${accessToken}; Secure; SameSite=Strict; Path=/`
    } else {
        return `ght=${accessToken}; SameSite=Strict; Path=/`
    }
}

export const getOAuthRedirectRouteFn: RequestHandler = async (req, res) => {
    try {
        const loginId = await initiateLogin(req.query.code as string)
        res.redirect(301, 'http://localhost:5711?login=' + loginId)
    } catch (e: any) {
        console.error('auth redirect from github wtf', e.message)
        res.redirect(301, 'http://localhost:5711?auth=failed')
    }
}

export const getLoginResultRouteFn: RequestHandler = async (req, res) => {
    const loginId = req.query.login as string
    if (!loginId || !loginId.length) {
        res.status(400).send()
    } else {
        try {
            const authData = await resolveLogin(loginId)
            res.setHeader('Set-Cookie', createAccessTokenCookie(authData.accessToken))
            res.end()
        } catch (e: any) {
            console.error('auth resolve wtf', e.message)
            res.status(500).send()
        }
    }
}

export const generateScriptRouteFn: RequestHandler = async (req, res) => {
    const script = generateScript(req.body)
    await saveTemplateVersion(req.user!.userId, req.body.repository, TEMPLATE_VERSION)
    res.set('Content-Type', 'text/plain')
    res.set('Content-Disposition', 'inline; filename="draft.sh"')
    res.send(script)
}
