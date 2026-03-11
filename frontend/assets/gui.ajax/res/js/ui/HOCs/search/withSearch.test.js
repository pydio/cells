import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { debounce } from 'lodash'

vi.mock('./nlpMatcher', () => ({
    default: vi.fn(() => Promise.resolve([]))
}))

vi.mock('./emptyDataModel', () => ({
    default: () => ({})
}))

import withSearch from './withSearch'

const createInstance = () => {
    const Wrapped = withSearch(() => null, null, 'all', false)
    const instance = new Wrapped({ pydio: { getContextHolder: () => ({}) } })

    instance.state = {
        ...instance.state,
        values: { scope: 'all' },
        dataModel: {},
    }

    instance.setState = (update, callback) => {
        const nextState = typeof update === 'function' ? update(instance.state, instance.props) : update
        instance.state = { ...instance.state, ...nextState }
        if (callback) {
            callback()
        }
    }

    const runSearch = vi.fn()
    instance.performSearch = runSearch
    instance.performSearchD = debounce(runSearch, 500)

    return { instance, runSearch }
}

describe('withSearch setValues scheduling', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('keeps default updates debounced', () => {
        const { instance, runSearch } = createInstance()

        instance.setValues({ basenameOrContent: 'report' })
        expect(runSearch).not.toHaveBeenCalled()

        vi.advanceTimersByTime(499)
        expect(runSearch).not.toHaveBeenCalled()

        vi.advanceTimersByTime(1)
        expect(runSearch).toHaveBeenCalledTimes(1)
    })

    it('runs immediate callback and cancels pending debounce', () => {
        const { instance, runSearch } = createInstance()

        instance.setValues({ basenameOrContent: 'report' })
        vi.advanceTimersByTime(300)

        instance.setValues({ basenameOrContent: 'report-now' }, true)
        expect(runSearch).toHaveBeenCalledTimes(1)

        vi.advanceTimersByTime(500)
        expect(runSearch).toHaveBeenCalledTimes(1)
    })
})
