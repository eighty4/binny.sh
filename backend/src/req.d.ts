declare namespace Express {
    export interface Request {
        user?: { accessToken: string, login: string, userId: number },
        cookies: { ght?: string },
    }
}
