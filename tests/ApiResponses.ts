import type { Page, Request } from '@playwright/test'

export type ApiResponse = {
    fulfill: {
        body?: string
        contentType?: string
        json?: any
    }
    predicate?: (req: Request) => boolean
}

export type HttpMethod = 'GET' | 'POST' | 'UPDATE'

export type UnfulfilledBehavior = 'continue' | 'abort'

export class ApiResponses {
    #behavior: UnfulfilledBehavior
    #res: Partial<Record<HttpMethod, Array<ApiResponse>>> = {}

    constructor(behavior: UnfulfilledBehavior = 'continue') {
        this.#behavior = behavior
    }

    async configure(page: Page, url: string) {
        await page.route(url, async (route, request) => {
            const response = this.#res[request.method() as HttpMethod]?.shift()
            if (response) {
                if (
                    typeof response.predicate === 'undefined' ||
                    response.predicate(request)
                ) {
                    await route.fulfill(response.fulfill)
                } else {
                    throw Error(`${url} route matching failed predicate`)
                }
            } else {
                if (this.#behavior === 'abort') {
                    await route.abort()
                } else {
                    await route.continue()
                }
            }
        })
    }

    GET(
        fulfill: ApiResponse['fulfill'],
        predicate?: ApiResponse['predicate'],
    ): this {
        return this.#add('GET', fulfill, predicate)
    }

    POST(
        fulfill: ApiResponse['fulfill'],
        predicate?: ApiResponse['predicate'],
    ): this {
        return this.#add('POST', fulfill, predicate)
    }

    #add(
        method: HttpMethod,
        fulfill: ApiResponse['fulfill'],
        predicate?: ApiResponse['predicate'],
    ): this {
        if (typeof this.#res[method] === 'undefined') {
            this.#res[method] = []
        }
        this.#res[method].push({ fulfill, predicate })
        return this
    }
}
