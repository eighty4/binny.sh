import {serve} from '@hono/node-server'
import {Hono} from 'hono'
import {logger} from 'hono/logger'
import {handleGraphQuery} from './data.ts'

const HTTP_PORT = 7411

const app = new Hono()
app.use(logger())

app.post('/offline/github/graph', async (c) => {
    const json = await c.req.json()
    return c.json({data: handleGraphQuery(json.query)})
})

app.get('/offline/github/oauth', (c) => {
    const accessToken = '1234'
    // todo does Safari work with Secure and SameSite=Strict when the hostname isn't localhost?
    if (c.req.header('User-Agent')?.includes('Safari')) {
        c.res.headers.append('Set-Cookie', `ght=${accessToken}; Path=/`)
    } else {
        c.res.headers.append('Set-Cookie', `ght=${accessToken}; Secure; SameSite=Strict; Path=/`)
    }
    return c.redirect('http://localhost:5711?login', 302)
})

const generatedScripts: Array<any> = []

app.get('/offline/api/generated-scripts', (c) => c.json(generatedScripts))

app.post('/offline/api/generated-scripts', async (c) => {
    const generatedScript = await c.req.json()
    generatedScripts.push(generatedScript)
    console.log(JSON.stringify(generatedScript, null, 4))
    return c.body('')
})

serve({
    fetch: app.fetch,
    port: HTTP_PORT,
})

process.once('SIGTERM', function () {
    console.log('SIGTERM')
    process.exit(0)
})
