import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'

import { TextSearchModifierInput, RangeSearchModifierInput } from './SearchModifierInput'
import { TextSearchModifiers, NumberRangeModifiers } from './SearchModifiers'

vi.mock('./SearchModifiers', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        LeftSectionMenu: ({ items, onChange }) => (
            <button onClick={() => onChange(items[0]?.value || '')}>menu</button>
        )
    }
})

const renderProbe = ({ text, leftSection, onTextChange, onSubmit, onBlur, autoFocus }) => (
    <div>
        <output aria-label="text-value">{text}</output>
        <div aria-label="left-section">{leftSection}</div>
        <button onClick={() => onTextChange('next')}>change</button>
        <button onClick={() => onSubmit()}>submit</button>
        <button onClick={() => onBlur && onBlur()}>blur</button>
        <output aria-label="auto-focus">{autoFocus ? 'yes' : 'no'}</output>
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

    it('exposes requestToggleClose handlers to children', () => {
        const onChange = vi.fn()
        const requestToggleClose = vi.fn()

        render(
            <TextSearchModifierInput
                value="alpha"
                onChange={onChange}
                items={TextSearchModifiers}
                requestToggleClose={requestToggleClose}
            >
                {renderProbe}
            </TextSearchModifierInput>
        )

        expect(screen.getByLabelText('auto-focus').textContent).toBe('yes')
        fireEvent.click(screen.getByRole('button', { name: 'blur' }))
        expect(requestToggleClose).toHaveBeenCalled()
    })
})
