import {describe, it} from 'vitest'
// @ts-ignore
import wasmtimeReleases from '../graphs/queryRepositoryReleases/bytecodealliance_wasmtime.json' with {type: 'json'}

// todo find a github repo that uses releases to publish releases for several projects
//  with independent labelling and versioning

describe('extractPatternsFromReleaseLabels', () => {
    it('works', async () => {
        console.log(wasmtimeReleases)
    })
})
