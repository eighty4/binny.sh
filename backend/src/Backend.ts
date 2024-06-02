// import net from 'node:net'
import cookieParser from 'cookie-parser'
import express from 'express'
import {authorizeGitHubUser, printHttpLog} from './Middleware.js'
import {generateScriptRouteFn, getLoginResultRouteFn, getOAuthRedirectRouteFn} from './Routes.js'

const parsePortEnvVariable = (key: string, def: number): number => {
    const val = process.env[key]
    if (typeof val === 'undefined') {
        return def
    } else {
        try {
            return parseInt(val, 10)
        } catch (e) {
            console.error(`env variable ${key} must be numeric`)
            process.exit(1)
        }
    }
}

const HTTP_PORT = parsePortEnvVariable('HTTP_PORT', 5741)
// const TCP_PORT = parsePortEnvVariable('TCP_PORT', 7411)

const app = express()
app.use(cookieParser())
app.use(express.json())
app.use(printHttpLog)

app.get('/login/oauth/github', getOAuthRedirectRouteFn)
app.get('/login/notify', getLoginResultRouteFn)
app.post('/api/script', authorizeGitHubUser, generateScriptRouteFn)

app.listen(HTTP_PORT, () => {
    console.log('install.sh http listening on', HTTP_PORT)
})

// const tcp = net.createServer((c) => {
//     console.log('#feelthezig')
//     c.end()
// })
//
// tcp.listen(TCP_PORT, () => {
//     console.log('install.sh tcp listening on', TCP_PORT)
// })
