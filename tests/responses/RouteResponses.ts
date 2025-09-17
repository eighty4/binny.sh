import type { Page, Request, Route } from '@playwright/test'

type FulfillOpts = Parameters<Route['fulfill']>[0]

export type RouteBehavior = {
    fulfill: FulfillOpts
    // return false or throw to not fulfill
    predicate?: (req: Request) => boolean | void
}

export type HttpMethod = 'GET' | 'POST' | 'UPDATE'

export type UnfulfilledBehavior = 'continue' | 'abort'

function isRedirect(fulfill: FulfillOpts): boolean {
    return fulfill?.status === 301 || fulfill?.status === 302
}

function isWebKit(page: Page): boolean {
    return page.context().browser()?.browserType().name() === 'webkit'
}

// webkit cannot use page.route with 301/302
async function fauxLogin(fulfill: FulfillOpts, page: Page) {
    const headers = fulfill?.headers
    if (!headers) throw Error()
    if (!headers['Location']) throw Error()
    const cookie = headers['Set-Cookie']
    if (!cookie) throw Error()
    await page.evaluate(
        ght => {
            document.cookie = 'ght=' + ght
        },
        cookie.substring(cookie.indexOf('=') + 1, cookie.indexOf(';')),
    )
    await page.goto('/?login')
}

export class RouteResponses {
    #behavior: UnfulfilledBehavior
    #res: Partial<Record<HttpMethod, Array<RouteBehavior>>> = {}

    constructor(opts?: { behavior?: UnfulfilledBehavior }) {
        this.#behavior = opts?.behavior || 'abort'
    }

    async configure(page: Page, url: string) {
        await page.route(url, async (route, request) => {
            const behavior = this.#res[request.method() as HttpMethod]?.shift()
            if (behavior) {
                let toFulfill: boolean =
                    typeof behavior.predicate === 'undefined'
                if (!toFulfill) {
                    const result = behavior.predicate!(request)
                    toFulfill = typeof result === 'undefined' || result === true
                }
                if (toFulfill) {
                    if (isRedirect(behavior.fulfill) && isWebKit(page)) {
                        await fauxLogin(behavior.fulfill, page)
                    } else {
                        await route.fulfill(behavior.fulfill)
                    }
                } else {
                    console.error(
                        url,
                        'route matching failed predicate',
                        request.postDataJSON(),
                    )
                    throw Error()
                }
            } else {
                console.error(url, 'missing route', request.postDataJSON())
                if (this.#behavior === 'abort') {
                    await route.abort()
                } else {
                    await route.continue()
                }
            }
        })
    }

    GET(behavior: RouteBehavior): this {
        return this.#add('GET', behavior)
    }

    POST(behavior: RouteBehavior): this {
        return this.#add('POST', behavior)
    }

    #add(method: HttpMethod, behavior: RouteBehavior): this {
        if (typeof this.#res[method] === 'undefined') {
            this.#res[method] = []
        }
        if (!behavior.predicate) {
            console.warn(
                `use RouteBehavior['predicate'] to assert http requests`,
            )
        }
        this.#res[method].push(behavior)
        return this
    }
}
