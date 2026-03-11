import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, screen, cleanup } from '@testing-library/react'

import { FieldSearch } from './FieldSearch'

vi.mock('../fieldsv2/TextInputSearch', () => ({
    TextInputSearch: ({ onChange }) => (
        <div>
            <button onClick={() => onChange('draft-url', { debounced: true })}>type</button>
            <button onClick={() => onChange('final-url')}>submit</button>
        </div>
    )
}))

describe('FieldSearch', () => {
    beforeEach(() => {
        cleanup()
        vi.clearAllMocks()
    })

    it('keeps submit updates immediate by default', () => {
        const updateValue = vi.fn()

        render(
            <FieldSearch
                name="website"
                value=""
                updateValue={updateValue}
                meta={{ type: 'url', label: 'Website', data: {} } as any}
            />
        )

        fireEvent.click(screen.getByRole('button', { name: 'submit' }))

        expect(updateValue).toHaveBeenCalledWith('website', 'final-url', undefined)
    })

    it('marks typing updates as debounced', () => {
        const updateValue = vi.fn()

        render(
            <FieldSearch
                name="website"
                value=""
                updateValue={updateValue}
                meta={{ type: 'url', label: 'Website', data: {} } as any}
            />
        )

        fireEvent.click(screen.getByRole('button', { name: 'type' }))

        expect(updateValue).toHaveBeenCalledWith('website', 'draft-url', { debounced: true })
    })
})
