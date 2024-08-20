import cookieParser from 'cookie-parser'
import express from 'express'
import {lookupRepositoryReleasesGraph, lookupViewerRepositoriesWithLatestReleaseGraph} from './data.js'

const HTTP_PORT = 7411

const app = express()
app.use(cookieParser())
app.use(express.json())
app.use((req, res, next) => {
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
})

app.post('/offline/github/graph', (req, res) => {
    if (/^\s*{\s*viewer\s*{\s*repositories\(/.test(req.body.query)) {
        res.json(lookupViewerRepositoriesWithLatestReleaseGraph()).end()
    } else {
        const matches = /repository\(owner:\s"(?<owner>[a-z0-9-]+)",\sname:\s"(?<name>[a-z0-9-]+)"\)/.exec(req.body.query)
        if (matches && matches.groups) {
            const {owner, name} = matches.groups
            const result = lookupRepositoryReleasesGraph({owner, name})
            if (result) {
                res.json(result).end()
            } else {
                res.end()
            }
        } else {
            res.status(500).end()
        }
    }
})

app.get('/offline/github/oauth', async (req, res) => {
    const accessToken = '1234'
    res.setHeader('Set-Cookie', `ght=${accessToken}; Secure; SameSite=Strict; Path=/`)
    res.redirect('http://localhost:5711')
})

app.listen(HTTP_PORT, () => {
    console.log('install.sh http listening on', 7411)
})
