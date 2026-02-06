import { type ChildProcessWithoutNullStreams, spawn } from 'node:child_process'

export default class DockerProcess {
    #args: Array<string>
    #done: Promise<void>
    #errored: boolean = false
    #label: string
    #output: string = ''
    #p: ChildProcessWithoutNullStreams

    constructor(label: string, args: Array<string>) {
        this.#args = args
        this.#label = label
        this.#p = spawn('docker', args)
        this.#p.stdout.on('data', chunk => (this.#output += chunk.toString()))
        this.#p.stderr.on('data', chunk => (this.#output += chunk.toString()))
        this.#done = new Promise((res, rej) => {
            this.#p.on('error', err => {
                this.#errored = true
                rej(err)
            })
            this.#p.on('exit', code => {
                if (code !== 0) {
                    this.#errored = true
                }
                res()
            })
        })
    }

    get command(): string {
        return `docker ${this.#args.join(' ')}`
    }

    get done(): Promise<void> {
        return this.#done
    }

    get errored(): boolean {
        return this.#errored
    }

    get label(): string {
        return this.#label
    }

    get output(): string {
        return this.#output
    }
}
