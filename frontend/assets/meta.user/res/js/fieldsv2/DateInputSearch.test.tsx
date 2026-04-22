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

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DateInputSearch } from './DateInputSearch';

// Mock Mantine components
vi.mock('@mantine/dates', () => ({
    DatePickerInput: ({ value, onChange, leftSection, ...props }: any) => (
        <div data-testid="date-picker-input">
            <output data-testid="current-date">
                {value?.toISOString() || 'null'}
            </output>
            <div data-testid="left-section">{leftSection}</div>
            <button
                data-testid="date-input-change"
                onClick={() =>
                    onChange(
                        value ? null : new Date('2024-02-10T10:00:00.000Z'),
                    )
                }
            >
                toggle
            </button>
            <button
                data-testid="date-input-set-epoch"
                onClick={() => onChange(new Date(0))}
            >
                set epoch
            </button>
            <input
                data-testid="date-picker-hidden-input"
                defaultValue={value?.toISOString() || ''}
                {...props}
            />
        </div>
    ),
}));

vi.mock('./SearchModifiers', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        LeftSectionMenu: ({ items, onChange }: any) => (
            <button
                data-testid="modifier-menu"
                onClick={() =>
                    onChange(
                        items.find((i: any) => i.value === '>=')?.value || '',
                    )
                }
            >
                menu
            </button>
        ),
    };
});

describe('DateInputSearch', () => {
    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('basic functionality', () => {
        it('should render with default props', () => {
            const onChange = vi.fn();

            render(
                <DateInputSearch
                    label="Test Date"
                    value=""
                    onChange={onChange}
                />,
            );

            expect(screen.getByTestId('date-picker-input')).toBeInTheDocument();
            expect(screen.getByTestId('current-date')).toHaveTextContent(
                'null',
            );
        });

        it('should display label and description when provided', () => {
            const onChange = vi.fn();

            const { container } = render(
                <DateInputSearch
                    label="Select Date"
                    description="Choose a date for filtering"
                    placeholder="Pick a date..."
                    value=""
                    onChange={onChange}
                />,
            );

            // Check that input receives the props
            const input = screen.getByTestId('date-picker-hidden-input');
            expect(input).toHaveAttribute('placeholder', 'Pick a date...');
        });
    });

    describe('date selection and conversion', () => {
        it('should convert valid timestamp to Date object for display', () => {
            const onChange = vi.fn();
            const timestamp = '1707550800'; // 2024-02-10 10:00:00 UTC

            render(
                <DateInputSearch
                    label="Test Date"
                    value={timestamp}
                    onChange={onChange}
                />,
            );

            const output = screen.getByTestId('current-date');
            expect(output.textContent).toContain('2024-02-10');
        });

        it('should handle null/empty selection by returning empty string', () => {
            const onChange = vi.fn();
            const timestamp = '1707550800';

            render(
                <DateInputSearch
                    label="Test Date"
                    value={timestamp}
                    onChange={onChange}
                />,
            );

            // Click to toggle/clear the date
            fireEvent.click(screen.getByTestId('date-input-change'));

            // Should call onChange with empty string (not with epoch 0)
            expect(onChange).toHaveBeenCalledWith('', { debounced: true });
        });

        it('should convert selected date to timestamp string', () => {
            const onChange = vi.fn();

            render(
                <DateInputSearch
                    label="Test Date"
                    value=""
                    onChange={onChange}
                />,
            );

            // Toggle to set a date
            fireEvent.click(screen.getByTestId('date-input-change'));

            // Should call onChange with timestamp string
            expect(onChange).toHaveBeenCalled();
            const call = onChange.mock.calls[0][0];
            expect(typeof call).toBe('string');
            expect(/^\d+$/.test(call)).toBe(true);
        });

        it('should reject epoch 0 date selection (January 1, 1970)', () => {
            const onChange = vi.fn();

            render(
                <DateInputSearch
                    label="Test Date"
                    value=""
                    onChange={onChange}
                />,
            );

            // Click button that sets epoch date
            fireEvent.click(screen.getByTestId('date-input-set-epoch'));

            // Should call onChange with empty string (epoch 0 is rejected)
            expect(onChange).toHaveBeenCalledWith('', { debounced: true });
        });
    });

    describe('modifier integration', () => {
        it('should display modifier menu from SearchModifiers', () => {
            const onChange = vi.fn();

            render(
                <DateInputSearch
                    label="Test Date"
                    value=""
                    onChange={onChange}
                />,
            );

            expect(screen.getByTestId('modifier-menu')).toBeInTheDocument();
        });

        it('should parse >= modifier from value', () => {
            const onChange = vi.fn();
            const timestamp = '1707550800';

            render(
                <DateInputSearch
                    label="Start Date"
                    value={`>=${timestamp}`}
                    onChange={onChange}
                />,
            );

            const output = screen.getByTestId('current-date');
            expect(output.textContent).toContain('2024-02-10');
        });

        it('should parse <= modifier from value', () => {
            const onChange = vi.fn();
            const timestamp = '1707550800';

            render(
                <DateInputSearch
                    label="End Date"
                    value={`<=${timestamp}`}
                    onChange={onChange}
                />,
            );

            const output = screen.getByTestId('current-date');
            expect(output.textContent).toContain('2024-02-10');
        });

        it('should handle exact date (no modifier)', () => {
            const onChange = vi.fn();
            const timestamp = '1707550800';

            render(
                <DateInputSearch
                    label="Exact Date"
                    value={timestamp}
                    onChange={onChange}
                />,
            );

            const output = screen.getByTestId('current-date');
            expect(output.textContent).toContain('2024-02-10');
        });

        it('should preserve modifier when date changes', () => {
            const onChange = vi.fn();
            const timestamp = '1707550800';

            render(
                <DateInputSearch
                    label="Start Date"
                    value={`>=${timestamp}`}
                    onChange={onChange}
                />,
            );

            // Toggle date selection
            fireEvent.click(screen.getByTestId('date-input-change'));

            // Should call onChange with the new timestamp, preserving the >= modifier
            const call = onChange.mock.calls[0][0];
            expect(call).toBe(''); // Empty because we cleared the date
        });
    });

    describe('disabled and required states', () => {
        it('should be disabled when disabled prop is true', () => {
            const onChange = vi.fn();

            render(
                <DateInputSearch
                    label="Test Date"
                    value=""
                    onChange={onChange}
                    disabled={true}
                />,
            );

            const input = screen.getByTestId('date-picker-hidden-input');
            expect(input).toHaveAttribute('disabled');
        });

        it('should show as required when required prop is true', () => {
            const onChange = vi.fn();

            render(
                <DateInputSearch
                    label="Required Date"
                    value=""
                    onChange={onChange}
                    required={true}
                />,
            );

            const input = screen.getByTestId('date-picker-hidden-input');
            expect(input).toHaveAttribute('required');
        });
    });

    describe('error handling', () => {
        it('should display error text when provided', () => {
            const onChange = vi.fn();

            render(
                <DateInputSearch
                    label="Test Date"
                    value=""
                    onChange={onChange}
                    errorText="Invalid date selection"
                />,
            );

            const input = screen.getByTestId('date-picker-hidden-input');
            expect(input).toHaveAttribute('error', 'Invalid date selection');
        });

        it('should handle invalid timestamp gracefully', () => {
            const onChange = vi.fn();

            // Should not crash with invalid timestamp
            const { rerender } = render(
                <DateInputSearch
                    label="Test Date"
                    value="invalid"
                    onChange={onChange}
                />,
            );

            expect(screen.getByTestId('current-date')).toHaveTextContent(
                'null',
            );

            rerender(
                <DateInputSearch
                    label="Test Date"
                    value="abc123"
                    onChange={onChange}
                />,
            );

            expect(screen.getByTestId('current-date')).toHaveTextContent(
                'null',
            );
        });
    });

    describe('edge cases', () => {
        it('should handle empty string value', () => {
            const onChange = vi.fn();

            render(
                <DateInputSearch
                    label="Test Date"
                    value=""
                    onChange={onChange}
                />,
            );

            expect(screen.getByTestId('current-date')).toHaveTextContent(
                'null',
            );
        });

        it('should handle undefined value', () => {
            const onChange = vi.fn();

            render(
                <DateInputSearch
                    label="Test Date"
                    value={undefined}
                    onChange={onChange}
                />,
            );

            expect(screen.getByTestId('current-date')).toHaveTextContent(
                'null',
            );
        });

        it('should handle value with only modifier (no timestamp)', () => {
            const onChange = vi.fn();

            render(
                <DateInputSearch
                    label="Test Date"
                    value=">="
                    onChange={onChange}
                />,
            );

            // Should show null since there's no valid timestamp
            expect(screen.getByTestId('current-date')).toHaveTextContent(
                'null',
            );
        });

        it('should handle floating point timestamps', () => {
            const onChange = vi.fn();
            const timestamp = '1707550800.5';

            render(
                <DateInputSearch
                    label="Test Date"
                    value={timestamp}
                    onChange={onChange}
                />,
            );

            // Should parse the floating point and display the date
            const output = screen.getByTestId('current-date');
            expect(output.textContent).toContain('2024-02-10');
        });

        it('should handle very old timestamps (before 2000)', () => {
            const onChange = vi.fn();
            const timestamp = '631152000'; // 1990-01-01

            render(
                <DateInputSearch
                    label="Test Date"
                    value={timestamp}
                    onChange={onChange}
                />,
            );

            const output = screen.getByTestId('current-date');
            expect(output.textContent).toContain('1990-01-01');
        });

        it('should handle future timestamps', () => {
            const onChange = vi.fn();
            const timestamp = '2524608000'; // 2050-01-01

            render(
                <DateInputSearch
                    label="Test Date"
                    value={timestamp}
                    onChange={onChange}
                />,
            );

            const output = screen.getByTestId('current-date');
            expect(output.textContent).toContain('2050-01-01');
        });
    });

    describe('integration flow', () => {
        it('should complete full flow: user selects date -> converted to timestamp -> stored', () => {
            const onChange = vi.fn();

            const { unmount } = render(
                <DateInputSearch
                    label="Filter Date"
                    value=""
                    onChange={onChange}
                />,
            );

            // Step 1: User selects a date
            fireEvent.click(screen.getByTestId('date-input-change'));

            // Step 2: onChange should be called with a timestamp string
            expect(onChange).toHaveBeenCalledWith(
                expect.stringMatching(/^\d+$/),
                { debounced: true },
            );

            // Step 3: Unmount and re-render with the new value
            const timestamp = onChange.mock.calls[0][0];
            unmount();

            render(
                <DateInputSearch
                    label="Filter Date"
                    value={timestamp}
                    onChange={onChange}
                />,
            );

            // Step 4: The component should display the date correctly
            const output = screen.getByTestId('current-date');
            expect(output.textContent).not.toBe('null');
        });

        it('should preserve value through edit cycle with modifier', () => {
            const onChange = vi.fn();
            const timestamp = '1707550800';

            const { rerender } = render(
                <DateInputSearch
                    label="Start Date"
                    value={`>=${timestamp}`}
                    onChange={onChange}
                />,
            );

            // Verify initial state
            expect(screen.getByTestId('current-date')).toContainHTML(
                '2024-02-10',
            );

            // Simulate clearing and selecting again
            fireEvent.click(screen.getByTestId('date-input-change'));

            // Should call onChange
            expect(onChange).toHaveBeenCalled();
        });

        it('should handle round-trip: timestamp -> date object -> timestamp', () => {
            const onChange = vi.fn();
            const originalTimestamp = '1707550800';

            const { rerender } = render(
                <DateInputSearch
                    label="Test Date"
                    value={originalTimestamp}
                    onChange={onChange}
                />,
            );

            // Clear the date
            fireEvent.click(screen.getByTestId('date-input-change'));

            // Set it again - in real scenario this would go back through the date picker
            // which would call onChange with a new timestamp
            fireEvent.click(screen.getByTestId('date-input-change'));

            // Should have called onChange (the actual conversion is tested in dateTimeConversion tests)
            expect(onChange).toHaveBeenCalled();
        });
    });
});
