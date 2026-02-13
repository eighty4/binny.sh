import { readdir, stat } from 'node:fs/promises'
import {
    createServer,
    type IncomingMessage,
    type OutgoingHttpHeaders,
    type ServerResponse,
} from 'node:http'
import { join, sep } from 'node:path'
import type { LambdaHttpRequest, LambdaHttpResponse } from './aws.ts'

type PlatformBridge<PIN, POUT> = {
    request(platform: PIN): Promise<LambdaHttpRequest> | LambdaHttpRequest
    response(platform: POUT, res: LambdaHttpResponse): void
}

type NodeHttpBridge = PlatformBridge<IncomingMessage, ServerResponse>

const bridge: NodeHttpBridge = {
    request(platform: IncomingMessage) {
        const headers: Record<string, string> = {}
        for (const [n, v] of Object.entries(platform.headers)) {
            if (typeof v === 'string') {
                headers[n] = v
            } else if (v) {
                throw Error('unsupported header array')
            }
        }
        const url = new URL('http://localhost:7411' + platform.url)
        const queryStringParameters: Record<string, string> = {}
        url.searchParams.forEach((v, k) => {
            queryStringParameters[k] = v
        })
        if (platform.method === 'GET') {
            return { body: null, headers, queryStringParameters }
        } else {
            return new Promise(res => {
                let body = ''
                platform.on('data', chunk => {
                    body += chunk
                })
                platform.on('end', async () => {
                    res({ body, headers, queryStringParameters })
                })
            })
        }
    },

    response(platform: ServerResponse, res: LambdaHttpResponse) {
        const headers: OutgoingHttpHeaders = res.headers
            ? { ...res.headers }
            : {}
        if (res.multiValueHeaders) {
            for (const [k, av] of Object.entries(res.multiValueHeaders)) {
                if (k in headers) {
                    if (!Array.isArray(headers[k])) {
                        headers[k] = [headers[k] as string]
                    }
                } else {
                    headers[k] = []
                }
                for (const v of av) {
                    headers[k].push(v)
                }
            }
        }
        platform.writeHead(res.statusCode, headers)
        platform.end(res.body)
    },
}

type HttpMethod = 'GET' | 'POST'

type LambdaRoute = {
    method: HttpMethod
    path: string
    handler: (
        req: LambdaHttpRequest,
    ) => LambdaHttpResponse | Promise<LambdaHttpResponse>
}

async function findLambdas(): Promise<Array<LambdaRoute>> {
    const lambdas: Array<LambdaRoute> = []
    for (const path of await recursiveFindFiles('routes', p =>
        p.endsWith('lambda.ts'),
    )) {
        const exports = await import('./' + path)
        const handlers: Partial<Record<HttpMethod, LambdaRoute['handler']>> = {}
        if (exports.GET) {
            handlers['GET'] = exports.GET
        }
        if (exports.POST) {
            handlers['POST'] = exports.POST
        }
        lambdas.push(
            ...Object.entries(handlers).map(([method, handler]) => ({
                method: method as HttpMethod,
                path: `/${path.split(sep).slice(1, -1).join('/')}`,
                handler,
            })),
        )
    }
    return lambdas
}

async function recursiveFindFiles(
    dir: string,
    predicate: (p: string) => boolean,
): Promise<Array<string>> {
    const found: Array<string> = []
    for (let p of await readdir(dir)) {
        p = join(dir, p)
        try {
            const stats = await stat(p)
            if (stats.isDirectory()) {
                found.push(...(await recursiveFindFiles(p, predicate)))
            } else if (predicate(p)) {
                found.push(p)
            }
        } catch (e) {
            console.error('stat error', p, e)
        }
    }
    return found
}

const lambdas = await findLambdas()

const server = createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
        if (!req.url) throw Error('?')
        const url = new URL('http://localhost:7411' + req.url)
        console.log(req.method, url.pathname)
        const lambda = lambdas.find(
            l => l.method === req.method && l.path === url.pathname,
        )
        if (!lambda) {
            res.writeHead(
                !!lambdas.find(l => l.path === url.pathname) ? 405 : 404,
            )
            res.end()
        } else {
            try {
                bridge.response(
                    res,
                    await lambda.handler(await bridge.request(req)),
                )
            } catch (e) {
                console.error(req.method, url.pathname, 'error', e)
                res.writeHead(500)
                res.end()
            }
        }
    },
)

server.listen(7411)

console.log('binny.sh lambdas running at http://localhost:7411')
