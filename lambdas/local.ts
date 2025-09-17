import {
    createServer,
    type IncomingMessage,
    type ServerResponse,
} from 'node:http'
import {
    GET as getGeneratedScripts,
    POST as postGeneratedScripts,
} from './routes/generated-scripts/lambda.ts'
import { GET as redirectAfterLogin } from './routes/login/github/callback/lambda.ts'
import { GET as redirectToLogin } from './routes/login/github/redirect/lambda.ts'

const server = createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
        if (!req.url) throw Error('?')
        const url = new URL('http://localhost:7411' + req.url)
        console.log(req.method, url.pathname)
        if (url.pathname === '/generated-scripts') {
            if (req.method === 'GET') {
                const result = await getGeneratedScripts({
                    headers: {
                        Authorization: req.headers['authorization'],
                    },
                })
                res.statusCode = result.statusCode
                if (result.headers) {
                    res.setHeaders(new Headers(result.headers))
                }
                res.end(result.body)
            } else if (req.method === 'POST') {
                let body = ''
                req.on('data', chunk => {
                    body += chunk
                })
                req.on('end', async () => {
                    const result = await postGeneratedScripts({
                        headers: {
                            Authorization: req.headers['authorization'],
                            'Content-Type': req.headers['content-type'],
                        },
                        body: body,
                    })
                    res.writeHead(result.statusCode)
                    res.end()
                })
            } else {
                res.writeHead(405)
                res.end()
            }
        } else if (url.pathname === '/login/github/redirect') {
            if (req.method === 'GET') {
                const result = await redirectToLogin()
                res.statusCode = result.statusCode
                if (result.headers) {
                    res.setHeaders(new Headers(result.headers))
                }
                res.end()
            } else {
                res.writeHead(405)
                res.end()
            }
        } else if (url.pathname === '/login/github/callback') {
            if (req.method === 'GET') {
                const result = await redirectAfterLogin({
                    queryStringParameters: {
                        code: url.searchParams.get('code'),
                    },
                })
                res.statusCode = result.statusCode
                if (result.headers) {
                    res.setHeaders(new Headers(result.headers))
                }
                res.end()
            } else {
                res.writeHead(405)
                res.end()
            }
        } else {
            res.writeHead(404)
            res.end()
        }
    },
)

server.listen(7411)

console.log('binny.sh lambdas running at http://localhost:7411')
