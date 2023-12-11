import pg from 'pg'
import {describe, expect, it} from 'vitest'
import {loadGeneratedScripts, saveTemplateVersion, saveUserLogin} from './Database.js'

const db = new pg.Pool()

const randomUserId = () => (Math.floor(Math.random() * 10000000))

describe('Database', () => {

    describe('saveUserLogin', () => {

        it('saves new user', async () => {
            const userId = randomUserId()
            const newUser = await saveUserLogin(userId, 'adam@eighty4.tech', 'open sesame')
            expect(newUser).toBe(true)
            const result = await db.query('select * from install_sh.users where id = $1', [userId])
            expect(result.rows.length).toBe(1)
            expect(result.rows[0].email).toBe('adam@eighty4.tech')
            expect(result.rows[0].access_token).toBe('open sesame')
            expect(result.rows[0].authed_when).toBeDefined()
            expect(result.rows[0].authed_when).toStrictEqual(result.rows[0].created_when)
        })

        it('saves login for existing user', async () => {
            const userId = randomUserId()
            let newUser = await saveUserLogin(userId, 'adam@eighty4.tech', 'accessToken0')
            expect(newUser).toBe(true)
            const result1 = await db.query('select * from install_sh.users where id = $1', [userId])
            expect(result1.rows[0].email).toBe('adam@eighty4.tech')
            expect(result1.rows[0].access_token).toBe('accessToken0')
            newUser = await saveUserLogin(userId, 'mckee@eighty4.tech', 'accessToken1')
            expect(newUser).toBe(false)
            const result2 = await db.query('select * from install_sh.users where id = $1', [userId])
            expect(result2.rows[0].email).toBe('mckee@eighty4.tech')
            expect(result2.rows[0].access_token).toBe('accessToken1')
            expect(result2.rows[0].authed_when).not.toStrictEqual(result1.rows[0].created_when)
            expect(result2.rows[0].created_when < result2.rows[0].authed_when).toBe(true)
        })
    })

    describe('loadGeneratedScripts', () => {

        it('returns empty array if no generated scripts for user', async () => {
            const userId = randomUserId()
            const result = await loadGeneratedScripts(userId)
            expect(result).toStrictEqual([])
        })

        it('retrieves generated scripts', async () => {
            const userId = randomUserId()
            await db.query('insert into install_sh.users (id, email, access_token) values ($1, $2, $3)', [userId, 'adam@eighty4.tech', 'open sesame'] as Array<any>)
            await db.query('insert into install_sh.scripts (user_id, repo_owner, repo_name, template_version) values ($1, $2, $3, $4)', [userId, 'eighty4', 'maestro', '1'] as Array<any>)
            await db.query('insert into install_sh.scripts (user_id, repo_owner, repo_name, template_version) values ($1, $2, $3, $4)', [userId, 'eighty4', 'cquill', '2'] as Array<any>)
            const result = await loadGeneratedScripts(userId)
            expect(result).toHaveLength(2)
            expect(result[0]).toStrictEqual({
                repository: {
                    owner: 'eighty4',
                    name: 'cquill',
                },
                templateVersion: '2',
            })
            expect(result[1]).toStrictEqual({
                repository: {
                    owner: 'eighty4',
                    name: 'maestro',
                },
                templateVersion: '1',
            })
        })
    })

    describe('saveGeneratedScript', () => {

        it('saves generated script for new repository', async () => {
            const userId = randomUserId()
            await db.query('insert into install_sh.users (id, email, access_token) values ($1, $2, $3)', [userId, 'adam@eighty4.tech', 'open sesame'])
            const repository = {owner: 'eighty4', name: 'maestro'}
            await saveTemplateVersion(userId, repository, '1')
            const result = await db.query('select * from install_sh.scripts where user_id = $1', [userId])
            expect(result.rows).toHaveLength(1)
            const {template_version, repo_name, repo_owner, created_when, generated_when} = result.rows[0]
            expect(repo_owner).toBe('eighty4')
            expect(repo_name).toBe('maestro')
            expect(template_version).toBe('1')
            expect(created_when).toStrictEqual(generated_when)
        })

        it('updates generated script template version', async () => {
            const userId = randomUserId()
            await db.query('insert into install_sh.users (id, email, access_token) values ($1, $2, $3)', [userId, 'adam@eighty4.tech', 'open sesame'])
            const repository = {owner: 'eighty4', name: 'maestro'}
            await saveTemplateVersion(userId, repository, '1')
            await new Promise((res) => setTimeout(res, 100))
            await saveTemplateVersion(userId, repository, '2')
            const result = await db.query('select * from install_sh.scripts where user_id = $1', [userId])
            expect(result.rows).toHaveLength(1)
            const {template_version, repo_name, repo_owner, created_when, generated_when} = result.rows[0]
            expect(repo_owner).toBe('eighty4')
            expect(repo_name).toBe('maestro')
            expect(template_version).toBe('2')
            expect(generated_when > created_when).toBe(true)
        })
    })
})
