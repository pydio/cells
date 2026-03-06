import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'

import { TextSearchModifierInput, RangeSearchModifierInput, DateTimeSearchModifierInput } from './SearchModifierInput'
import { TextSearchModifiers, NumberRangeModifiers, DateRangeModifiers } from './SearchModifiers'

vi.mock('./SearchModifiers', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        LeftSectionMenu: ({ items, onChange }) => (
            <button onClick={() => onChange(items[0]?.value || '')}>menu</button>
        )
    }
})

const renderProbe = ({ text, leftSection, onTextChange, onSubmit }) => (
    <div>
        <output aria-label="text-value">{text}</output>
        <div aria-label="left-section">{leftSection}</div>
        <button onClick={() => onTextChange('next')}>change</button>
        <button onClick={() => onSubmit()}>submit</button>
    </div>
)

describe('SearchModifierInput', () => {
    beforeEach(() => {
        cleanup()
        vi.clearAllMocks()
    })

    it('parses contains modifier and applies it on change', () => {
        const onChange = vi.fn()

        render(
            <TextSearchModifierInput value="*alpha*" onChange={onChange} items={TextSearchModifiers}>
                {renderProbe}
            </TextSearchModifierInput>
        )

        expect(screen.getByLabelText('text-value').textContent).toBe('alpha')

        fireEvent.click(screen.getByRole('button', { name: 'change' }))
        expect(onChange).toHaveBeenCalledWith('*next*')
    })

    it('parses starts-with modifier and applies it on change', () => {
        const onChange = vi.fn()

        render(
            <TextSearchModifierInput value="beta*" onChange={onChange} items={TextSearchModifiers}>
                {renderProbe}
            </TextSearchModifierInput>
        )

        expect(screen.getByLabelText('text-value').textContent).toBe('beta')

        fireEvent.click(screen.getByRole('button', { name: 'change' }))
        expect(onChange).toHaveBeenCalledWith('next*')
    })

    it('returns empty text for empty input and submits empty value', () => {
        const onChange = vi.fn()

        render(
            <TextSearchModifierInput value="" onChange={onChange} items={TextSearchModifiers}>
                {renderProbe}
            </TextSearchModifierInput>
        )

        expect(screen.getByLabelText('text-value').textContent).toBe('')

        fireEvent.click(screen.getByRole('button', { name: 'submit' }))
        expect(onChange).toHaveBeenCalledWith('', true)
    })

    it('keeps plain text when no modifier is present', () => {
        const onChange = vi.fn()

        render(
            <TextSearchModifierInput value="plain" onChange={onChange} items={TextSearchModifiers}>
                {renderProbe}
            </TextSearchModifierInput>
        )

        expect(screen.getByLabelText('text-value').textContent).toBe('plain')
    })

    it('parses range modifier and applies it on change and submit', () => {
        const onChange = vi.fn()

        render(
            <RangeSearchModifierInput value=">=10" onChange={onChange} items={NumberRangeModifiers}>
                {renderProbe}
            </RangeSearchModifierInput>
        )

        expect(screen.getByLabelText('text-value').textContent).toBe('10')

        fireEvent.click(screen.getByRole('button', { name: 'change' }))
        expect(onChange).toHaveBeenCalledWith('>=next')

        fireEvent.click(screen.getByRole('button', { name: 'submit' }))
        expect(onChange).toHaveBeenCalledWith('>=10', true)
    })

    it('parses single-character range modifier', () => {
        const onChange = vi.fn()

        render(
            <RangeSearchModifierInput value="<5" onChange={onChange} items={NumberRangeModifiers}>
                {renderProbe}
            </RangeSearchModifierInput>
        )

        expect(screen.getByLabelText('text-value').textContent).toBe('5')
        fireEvent.click(screen.getByRole('button', { name: 'change' }))
        expect(onChange).toHaveBeenCalledWith('<next')
    })

    it('updates modifier when left menu changes', () => {
        const onChange = vi.fn()

        render(
            <RangeSearchModifierInput value="10" onChange={onChange} items={NumberRangeModifiers}>
                {renderProbe}
            </RangeSearchModifierInput>
        )

        fireEvent.click(screen.getByRole('button', { name: 'menu' }))
        expect(onChange).toHaveBeenCalledWith('10')
    })

    describe('DateTimeSearchModifierInput', () => {
        it('parses >= date modifier and applies it on change', () => {
            const onChange = vi.fn()

            render(
                <DateTimeSearchModifierInput value=">=1707550800" onChange={onChange} items={DateRangeModifiers}>
                    {renderProbe}
                </DateTimeSearchModifierInput>
            )

            expect(screen.getByLabelText('text-value').textContent).toBe('1707550800')

            fireEvent.click(screen.getByRole('button', { name: 'change' }))
            expect(onChange).toHaveBeenCalledWith('>=next')
        })

        it('parses <= date modifier and applies it on change', () => {
            const onChange = vi.fn()

            render(
                <DateTimeSearchModifierInput value="<=1707550800" onChange={onChange} items={DateRangeModifiers}>
                    {renderProbe}
                </DateTimeSearchModifierInput>
            )

            expect(screen.getByLabelText('text-value').textContent).toBe('1707550800')

            fireEvent.click(screen.getByRole('button', { name: 'change' }))
            expect(onChange).toHaveBeenCalledWith('<=next')
        })

        it('parses exact date (no modifier) and applies it on change', () => {
            const onChange = vi.fn()

            render(
                <DateTimeSearchModifierInput value="1707550800" onChange={onChange} items={DateRangeModifiers}>
                    {renderProbe}
                </DateTimeSearchModifierInput>
            )

            expect(screen.getByLabelText('text-value').textContent).toBe('1707550800')

            fireEvent.click(screen.getByRole('button', { name: 'change' }))
            expect(onChange).toHaveBeenCalledWith('next')
        })

        it('returns empty text for empty input and preserves modifier', () => {
            const onChange = vi.fn()

            render(
                <DateTimeSearchModifierInput value="" onChange={onChange} items={DateRangeModifiers}>
                    {renderProbe}
                </DateTimeSearchModifierInput>
            )

            expect(screen.getByLabelText('text-value').textContent).toBe('')

            fireEvent.click(screen.getByRole('button', { name: 'submit' }))
            expect(onChange).toHaveBeenCalledWith('', true)
        })

        it('handles modifier change with timestamp value', () => {
            const onChange = vi.fn()

            render(
                <DateTimeSearchModifierInput value="1707550800" onChange={onChange} items={DateRangeModifiers}>
                    {renderProbe}
                </DateTimeSearchModifierInput>
            )

            fireEvent.click(screen.getByRole('button', { name: 'menu' }))
            expect(onChange).toHaveBeenCalledWith('1707550800')
        })

        it('preserves timestamp value when modifying modifier', () => {
            const onChange = vi.fn()

            render(
                <DateTimeSearchModifierInput value=">=1707550800" onChange={onChange} items={DateRangeModifiers}>
                    {renderProbe}
                </DateTimeSearchModifierInput>
            )

            expect(screen.getByLabelText('text-value').textContent).toBe('1707550800')

            fireEvent.click(screen.getByRole('button', { name: 'submit' }))
            expect(onChange).toHaveBeenCalledWith('>=1707550800', true)
        })

        it('parses single-character range modifier (>)', () => {
            const onChange = vi.fn()

            render(
                <DateTimeSearchModifierInput value=">1707550800" onChange={onChange} items={DateRangeModifiers}>
                    {renderProbe}
                </DateTimeSearchModifierInput>
            )

            expect(screen.getByLabelText('text-value').textContent).toBe('1707550800')
            fireEvent.click(screen.getByRole('button', { name: 'change' }))
            expect(onChange).toHaveBeenCalledWith('>next')
        })

        it('parses single-character range modifier (<)', () => {
            const onChange = vi.fn()

            render(
                <DateTimeSearchModifierInput value="<1707550800" onChange={onChange} items={DateRangeModifiers}>
                    {renderProbe}
                </DateTimeSearchModifierInput>
            )

            expect(screen.getByLabelText('text-value').textContent).toBe('1707550800')
            fireEvent.click(screen.getByRole('button', { name: 'change' }))
            expect(onChange).toHaveBeenCalledWith('<next')
        })

        it('handles empty timestamp with >= modifier', () => {
            const onChange = vi.fn()

            render(
                <DateTimeSearchModifierInput value=">=" onChange={onChange} items={DateRangeModifiers}>
                    {renderProbe}
                </DateTimeSearchModifierInput>
            )

            expect(screen.getByLabelText('text-value').textContent).toBe('')
        })

        it('composes modifier correctly when applying', () => {
            const onChange = vi.fn()

            render(
                <DateTimeSearchModifierInput value=">=1707550800" onChange={onChange} items={DateRangeModifiers}>
                    {renderProbe}
                </DateTimeSearchModifierInput>
            )

            fireEvent.click(screen.getByRole('button', { name: 'submit' }))
            // Should preserve the >= modifier with the timestamp value
            expect(onChange).toHaveBeenCalledWith('>=1707550800', true)
        })

        it('handles null/undefined values gracefully', () => {
            const onChange = vi.fn()

            const { rerender } = render(
                <DateTimeSearchModifierInput value={undefined} onChange={onChange} items={DateRangeModifiers}>
                    {renderProbe}
                </DateTimeSearchModifierInput>
            )

            expect(screen.getByLabelText('text-value').textContent).toBe('')

            rerender(
                <DateTimeSearchModifierInput value={null as any} onChange={onChange} items={DateRangeModifiers}>
                    {renderProbe}
                </DateTimeSearchModifierInput>
            )

            expect(screen.getByLabelText('text-value').textContent).toBe('')
        })
    })
})
