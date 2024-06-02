import path from 'node:path'
import type {RequestHandler} from 'express'
import {verifyAccessToken} from './User.js'

export const authorizeGitHubUser: RequestHandler = (req, res, next) => {
    const accessToken = req.cookies.ght
    verifyAccessToken(accessToken)
        .then((user) => {
            if (user === false) {
                if (req.path.startsWith('/api/')) {
                    res.status(401).end()
                } else {
                    res.redirect(301, 'http://localhost:5711')
                }
            } else {
                req.user = user
                next()
            }
        })
        .catch((e) => {
            console.error('gh authorize error:', e.message)
            if (req.path.startsWith('/api/')) {
                res.status(500).end()
            } else {
                res.redirect(301, 'http://localhost:5711?error')
            }
        })
}

export const printHttpLog: RequestHandler = (req, res, next) => {
    const start = Date.now()
    res.on('finish', () => {
        const uri = decodeURI(req.url)
        const end = `${Date.now() - start}ms`
        if (res.statusCode === 301) {
            console.log(req.method, uri, res.statusCode, res.statusMessage, 'to', res.getHeaders().location, end)
        } else {
            console.log(req.method, uri, res.statusCode, res.statusMessage, end)
        }
    })
    next()
}
