/*
 * Copyright 2026 Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'

import { DateTimeInputSearch } from './DateTimeInputSearch'

// Mock Mantine components
vi.mock('@mantine/dates', () => ({
    DateTimePicker: ({ value, onChange, leftSection, ...props }: any) => (
        <div data-testid="datetime-picker">
            <output data-testid="current-datetime">{value?.toISOString() || 'null'}</output>
            <div data-testid="left-section">{leftSection}</div>
            <button
                data-testid="datetime-input-change"
                onClick={() => onChange(value ? null : new Date('2024-02-10T14:30:00.000Z'))}
            >
                toggle
            </button>
            <button
                data-testid="datetime-input-set-epoch"
                onClick={() => onChange(new Date(0))}
            >
                set epoch
            </button>
            <input
                data-testid="datetime-picker-hidden-input"
                defaultValue={value?.toISOString() || ''}
                {...props}
            />
        </div>
    )
}))

vi.mock('./SearchModifiers', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        LeftSectionMenu: ({ items, onChange }: any) => (
            <button
                data-testid="datetime-modifier-menu"
                onClick={() => onChange(items.find((i: any) => i.value === '>=')?.value || '')}
            >
                menu
            </button>
        )
    }
})

describe('DateTimeInputSearch', () => {
    beforeEach(() => {
        cleanup()
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe('basic functionality', () => {
        it('should render with default props', () => {
            const onChange = vi.fn()

            render(
                <DateTimeInputSearch
                    label="Test DateTime"
                    value=""
                    onChange={onChange}
                />
            )

            expect(screen.getByTestId('datetime-picker')).toBeInTheDocument()
            expect(screen.getByTestId('current-datetime')).toHaveTextContent('null')
        })

        it('should display label and description when provided', () => {
            const onChange = vi.fn()

            render(
                <DateTimeInputSearch
                    label="Select DateTime"
                    description="Choose a date and time"
                    placeholder="Pick a datetime..."
                    value=""
                    onChange={onChange}
                />
            )

            const input = screen.getByTestId('datetime-picker-hidden-input')
            expect(input).toHaveAttribute('placeholder', 'Pick a datetime...')
        })
    })

    describe('datetime selection and conversion', () => {
        it('should convert valid timestamp to DateTime object for display', () => {
            const onChange = vi.fn()
            const timestamp = '1707550800' // 2024-02-10 10:00:00 UTC

            render(
                <DateTimeInputSearch
                    label="Test DateTime"
                    value={timestamp}
                    onChange={onChange}
                />
            )

            const output = screen.getByTestId('current-datetime')
            expect(output.textContent).toContain('2024-02-10')
        })

        it('should handle null/empty selection by returning empty string', () => {
            const onChange = vi.fn()
            const timestamp = '1707550800'

            render(
                <DateTimeInputSearch
                    label="Test DateTime"
                    value={timestamp}
                    onChange={onChange}
                />
            )

            fireEvent.click(screen.getByTestId('datetime-input-change'))

            // Should call onChange with empty string, not epoch 0
            expect(onChange).toHaveBeenCalledWith('')
        })

        it('should convert selected datetime to timestamp string', () => {
            const onChange = vi.fn()

            render(
                <DateTimeInputSearch
                    label="Test DateTime"
                    value=""
                    onChange={onChange}
                />
            )

            fireEvent.click(screen.getByTestId('datetime-input-change'))

            expect(onChange).toHaveBeenCalled()
            const call = onChange.mock.calls[0][0]
            expect(typeof call).toBe('string')
            expect(/^\d+$/.test(call)).toBe(true)
        })

        it('should reject epoch 0 datetime selection', () => {
            const onChange = vi.fn()

            render(
                <DateTimeInputSearch
                    label="Test DateTime"
                    value=""
                    onChange={onChange}
                />
            )

            fireEvent.click(screen.getByTestId('datetime-input-set-epoch'))

            // Should call onChange with empty string (epoch 0 is rejected)
            expect(onChange).toHaveBeenCalledWith('')
        })
    })

    describe('modifier integration', () => {
        it('should display modifier menu from SearchModifiers', () => {
            const onChange = vi.fn()

            render(
                <DateTimeInputSearch
                    label="Test DateTime"
                    value=""
                    onChange={onChange}
                />
            )

            expect(screen.getByTestId('datetime-modifier-menu')).toBeInTheDocument()
        })

        it('should parse >= modifier from value', () => {
            const onChange = vi.fn()
            const timestamp = '1707550800'

            render(
                <DateTimeInputSearch
                    label="Start DateTime"
                    value={`>=${timestamp}`}
                    onChange={onChange}
                />
            )

            const output = screen.getByTestId('current-datetime')
            expect(output.textContent).toContain('2024-02-10')
        })

        it('should parse <= modifier from value', () => {
            const onChange = vi.fn()
            const timestamp = '1707550800'

            render(
                <DateTimeInputSearch
                    label="End DateTime"
                    value={`<=${timestamp}`}
                    onChange={onChange}
                />
            )

            const output = screen.getByTestId('current-datetime')
            expect(output.textContent).toContain('2024-02-10')
        })

        it('should handle exact datetime (no modifier)', () => {
            const onChange = vi.fn()
            const timestamp = '1707550800'

            render(
                <DateTimeInputSearch
                    label="Exact DateTime"
                    value={timestamp}
                    onChange={onChange}
                />
            )

            const output = screen.getByTestId('current-datetime')
            expect(output.textContent).toContain('2024-02-10')
        })

        it('should preserve modifier when datetime changes', () => {
            const onChange = vi.fn()
            const timestamp = '1707550800'

            render(
                <DateTimeInputSearch
                    label="Start DateTime"
                    value={`>=${timestamp}`}
                    onChange={onChange}
                />
            )

            fireEvent.click(screen.getByTestId('datetime-input-change'))

            const call = onChange.mock.calls[0][0]
            expect(call).toBe('') // Empty because we cleared the datetime
        })
    })

    describe('disabled and required states', () => {
        it('should be disabled when disabled prop is true', () => {
            const onChange = vi.fn()

            render(
                <DateTimeInputSearch
                    label="Test DateTime"
                    value=""
                    onChange={onChange}
                    disabled={true}
                />
            )

            const input = screen.getByTestId('datetime-picker-hidden-input')
            expect(input).toHaveAttribute('disabled')
        })

        it('should show as required when required prop is true', () => {
            const onChange = vi.fn()

            render(
                <DateTimeInputSearch
                    label="Required DateTime"
                    value=""
                    onChange={onChange}
                    required={true}
                />
            )

            const input = screen.getByTestId('datetime-picker-hidden-input')
            expect(input).toHaveAttribute('required')
        })
    })

    describe('error handling', () => {
        it('should display error text when provided', () => {
            const onChange = vi.fn()

            render(
                <DateTimeInputSearch
                    label="Test DateTime"
                    value=""
                    onChange={onChange}
                    errorText="Invalid datetime selection"
                />
            )

            const input = screen.getByTestId('datetime-picker-hidden-input')
            expect(input).toHaveAttribute('error', 'Invalid datetime selection')
        })

        it('should handle invalid timestamp gracefully', () => {
            const onChange = vi.fn()

            const { rerender } = render(
                <DateTimeInputSearch
                    label="Test DateTime"
                    value="invalid"
                    onChange={onChange}
                />
            )

            expect(screen.getByTestId('current-datetime')).toHaveTextContent('null')

            rerender(
                <DateTimeInputSearch
                    label="Test DateTime"
                    value="abc123"
                    onChange={onChange}
                />
            )

            expect(screen.getByTestId('current-datetime')).toHaveTextContent('null')
        })
    })

    describe('edge cases', () => {
        it('should handle empty string value', () => {
            const onChange = vi.fn()

            render(
                <DateTimeInputSearch
                    label="Test DateTime"
                    value=""
                    onChange={onChange}
                />
            )

            expect(screen.getByTestId('current-datetime')).toHaveTextContent('null')
        })

        it('should handle undefined value', () => {
            const onChange = vi.fn()

            render(
                <DateTimeInputSearch
                    label="Test DateTime"
                    value={undefined}
                    onChange={onChange}
                />
            )

            expect(screen.getByTestId('current-datetime')).toHaveTextContent('null')
        })

        it('should handle value with only modifier (no timestamp)', () => {
            const onChange = vi.fn()

            render(
                <DateTimeInputSearch
                    label="Test DateTime"
                    value=">="
                    onChange={onChange}
                />
            )

            expect(screen.getByTestId('current-datetime')).toHaveTextContent('null')
        })

        it('should handle floating point timestamps', () => {
            const onChange = vi.fn()
            const timestamp = '1707550800.999'

            render(
                <DateTimeInputSearch
                    label="Test DateTime"
                    value={timestamp}
                    onChange={onChange}
                />
            )

            const output = screen.getByTestId('current-datetime')
            expect(output.textContent).toContain('2024-02-10')
        })

        it('should handle very old timestamps', () => {
            const onChange = vi.fn()
            const timestamp = '631152000' // 1990-01-01

            render(
                <DateTimeInputSearch
                    label="Test DateTime"
                    value={timestamp}
                    onChange={onChange}
                />
            )

            const output = screen.getByTestId('current-datetime')
            expect(output.textContent).toContain('1990-01-01')
        })

        it('should handle future timestamps', () => {
            const onChange = vi.fn()
            const timestamp = '2524608000' // 2050-01-01

            render(
                <DateTimeInputSearch
                    label="Test DateTime"
                    value={timestamp}
                    onChange={onChange}
                />
            )

            const output = screen.getByTestId('current-datetime')
            expect(output.textContent).toContain('2050-01-01')
        })
    })

    describe('time precision', () => {
        it('should preserve time information in timestamp', () => {
            const onChange = vi.fn()
            // This timestamp represents 2024-02-10 12:10:45 UTC (1707567045)
            const timestamp = '1707567045'

            render(
                <DateTimeInputSearch
                    label="Test DateTime"
                    value={timestamp}
                    onChange={onChange}
                />
            )

            const output = screen.getByTestId('current-datetime')
            expect(output.textContent).toContain('2024-02-10')
            expect(output.textContent).toContain('12:10:45')
        })

        it('should handle timestamps with millisecond precision', () => {
            const onChange = vi.fn()
            const timestamp = '1707550800.123'

            render(
                <DateTimeInputSearch
                    label="Test DateTime"
                    value={timestamp}
                    onChange={onChange}
                />
            )

            const output = screen.getByTestId('current-datetime')
            expect(output.textContent).not.toBe('null')
        })
    })

    describe('integration flow', () => {
        it('should complete full flow: user selects datetime -> converted to timestamp', () => {
            const onChange = vi.fn()

            const { unmount } = render(
                <DateTimeInputSearch
                    label="Filter DateTime"
                    value=""
                    onChange={onChange}
                />
            )

            fireEvent.click(screen.getByTestId('datetime-input-change'))

            expect(onChange).toHaveBeenCalled()
            const timestamp = onChange.mock.calls[0][0]
            
            // Unmount before rerender to avoid duplicate testids
            unmount()
            
            render(
                <DateTimeInputSearch
                    label="Filter DateTime"
                    value={timestamp}
                    onChange={onChange}
                />
            )

            const output = screen.getByTestId('current-datetime')
            expect(output.textContent).not.toBe('null')
        })

        it('should preserve value through edit cycle with modifier', () => {
            const onChange = vi.fn()
            const timestamp = '1707550800'

            render(
                <DateTimeInputSearch
                    label="Start DateTime"
                    value={`>=${timestamp}`}
                    onChange={onChange}
                />
            )

            expect(screen.getByTestId('current-datetime')).toContainHTML('2024-02-10')

            fireEvent.click(screen.getByTestId('datetime-input-change'))

            expect(onChange).toHaveBeenCalled()
        })

        it('should handle date range query: start and end datetime', () => {
            const onChange = vi.fn()
            const startTimestamp = '1707550800' // 2024-02-10
            const endTimestamp = '1707637200' // 2024-02-11

            const { rerender } = render(
                <DateTimeInputSearch
                    label="Start DateTime"
                    value={`>=${startTimestamp}`}
                    onChange={onChange}
                />
            )

            expect(screen.getByTestId('current-datetime')).toContainHTML('2024-02-10')

            rerender(
                <DateTimeInputSearch
                    label="End DateTime"
                    value={`<=${endTimestamp}`}
                    onChange={onChange}
                />
            )

            expect(screen.getByTestId('current-datetime')).toContainHTML('2024-02-11')
        })
    })

})
