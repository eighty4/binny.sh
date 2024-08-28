import cookieParser from 'cookie-parser'
import express from 'express'
import {handleGraphQuery} from './data.js'

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
    res.json({data: handleGraphQuery(req.body.query)})
})

app.get('/offline/github/oauth', async (req, res) => {
    const accessToken = '1234'
    // todo does Safari work with Secure and SameSite=Strict when the hostname isn't localhost?
    if (req.header('user-agent')?.includes('Safari')) {
        res.setHeader('Set-Cookie', `ght=${accessToken}; Path=/`)
    } else {
        res.setHeader('Set-Cookie', `ght=${accessToken}; Secure; SameSite=Strict; Path=/`)
    }
    res.redirect('http://localhost:5711')
})

const generatedScripts: Array<any> = []

app.get('/offline/api/generated-scripts', async (_req, res) => {
    res.json(generatedScripts)
})

app.post('/offline/api/generated-scripts', async (req, res) => {
    generatedScripts.push(req.body)
    console.log(generatedScripts)
    res.end()
})

app.listen(HTTP_PORT, () => {
    console.log('install.sh http listening on', 7411)
})
