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
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

import { TextInput } from './TextInput';

// Helper to render components that need MantineProvider
const renderWithProvider = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>);
};

describe('TextInput Component', () => {
    beforeEach(() => {
        cleanup();
    });

    describe('basic rendering', () => {
        it('renders text input by default', () => {
            const handleChange = vi.fn();
            const handleCommitChange = vi.fn();

            renderWithProvider(
                <TextInput
                    name="test-input"
                    value=""
                    onChange={handleChange}
                    onCommitChange={handleCommitChange}
                />,
            );

            const input = screen.getByRole('textbox');
            expect(input).toBeInTheDocument();
        });

        it('renders with label and description', () => {
            const handleChange = vi.fn();
            const handleCommitChange = vi.fn();

            renderWithProvider(
                <TextInput
                    name="test-input"
                    label="Test Label"
                    description="Test Description"
                    value=""
                    onChange={handleChange}
                    onCommitChange={handleCommitChange}
                />,
            );

            expect(screen.getByText('Test Label')).toBeInTheDocument();
            expect(screen.getByText('Test Description')).toBeInTheDocument();
        });

        it('renders with placeholder', () => {
            const handleChange = vi.fn();
            const handleCommitChange = vi.fn();

            renderWithProvider(
                <TextInput
                    name="test-input"
                    placeholder="Enter text here"
                    value=""
                    onChange={handleChange}
                    onCommitChange={handleCommitChange}
                />,
            );

            const input = screen.getByPlaceholderText('Enter text here');
            expect(input).toBeInTheDocument();
        });

        it('renders as disabled when disabled prop is true', () => {
            const handleChange = vi.fn();
            const handleCommitChange = vi.fn();

            renderWithProvider(
                <TextInput
                    name="test-input"
                    disabled={true}
                    value=""
                    onChange={handleChange}
                    onCommitChange={handleCommitChange}
                />,
            );

            const input = screen.getByRole('textbox');
            expect(input).toBeDisabled();
        });

        it('displays error text when provided', () => {
            const handleChange = vi.fn();
            const handleCommitChange = vi.fn();

            renderWithProvider(
                <TextInput
                    name="test-input"
                    errorText="This field has an error"
                    value=""
                    onChange={handleChange}
                    onCommitChange={handleCommitChange}
                />,
            );

            expect(
                screen.getByText('This field has an error'),
            ).toBeInTheDocument();
        });
    });

    describe('subType variants', () => {
        it('renders textarea when subType is textarea', () => {
            const handleChange = vi.fn();
            const handleCommitChange = vi.fn();

            const { container } = renderWithProvider(
                <TextInput
                    name="test-input"
                    subType="textarea"
                    value=""
                    onChange={handleChange}
                    onCommitChange={handleCommitChange}
                />,
            );

            const textarea = container.querySelector('textarea');
            expect(textarea).toBeInTheDocument();
        });

        it('renders json input when subType is json', () => {
            const handleChange = vi.fn();
            const handleCommitChange = vi.fn();

            const { container } = renderWithProvider(
                <TextInput
                    name="test-input"
                    subType="json"
                    value=""
                    onChange={handleChange}
                    onCommitChange={handleCommitChange}
                />,
            );

            const textarea = container.querySelector('textarea');
            expect(textarea).toBeInTheDocument();
        });
    });

    describe('onChange behavior', () => {
        it('calls onChange when user types in text input', () => {
            const handleChange = vi.fn();
            const handleCommitChange = vi.fn();

            renderWithProvider(
                <TextInput
                    name="test-input"
                    value=""
                    onChange={handleChange}
                    onCommitChange={handleCommitChange}
                />,
            );

            const input = screen.getByRole('textbox');
            fireEvent.change(input, { target: { value: 'new text' } });

            expect(handleChange).toHaveBeenCalledWith('new text');
        });

        it('calls onChange when user types in textarea', () => {
            const handleChange = vi.fn();
            const handleCommitChange = vi.fn();

            renderWithProvider(
                <TextInput
                    name="test-input"
                    subType="textarea"
                    value=""
                    onChange={handleChange}
                    onCommitChange={handleCommitChange}
                />,
            );

            const textarea = screen.getByRole('textbox');
            fireEvent.change(textarea, { target: { value: 'new text' } });

            expect(handleChange).toHaveBeenCalledWith('new text');
        });
    });

    describe('onEnterCommit behavior (lines 49-53) - testing the conditional logic', () => {
        it('executes line 51 when condition is true: event.key=Enter AND event.ctrlKey=true', () => {
            const handleChange = vi.fn();
            const handleCommitChange = vi.fn();
            const testValue = 'test value';

            renderWithProvider(
                <TextInput
                    name="test-input"
                    value={testValue}
                    onChange={handleChange}
                    onCommitChange={handleCommitChange}
                />,
            );

            const input = screen.getByRole('textbox');

            // Test the TRUE branch: (event.key === 'Enter' && event.ctrlKey) evaluates to true
            // Should execute line 51: onCommitChange(value)
            fireEvent.keyPress(input, {
                key: 'Enter',
                code: 'Enter',
                charCode: 13,
                ctrlKey: true,
            });

            expect(handleCommitChange).toHaveBeenCalledWith(testValue);
            expect(handleCommitChange).toHaveBeenCalledTimes(1);
        });

        it('skips line 51 when Enter=true but ctrlKey=false (condition evaluates to false)', () => {
            const handleChange = vi.fn();
            const handleCommitChange = vi.fn();
            const testValue = 'test value';

            renderWithProvider(
                <TextInput
                    name="test-input"
                    value={testValue}
                    onChange={handleChange}
                    onCommitChange={handleCommitChange}
                />,
            );

            const input = screen.getByRole('textbox');

            // Test the FALSE branch: (true && false) = false
            // Should NOT execute line 51
            fireEvent.keyPress(input, {
                key: 'Enter',
                code: 'Enter',
                charCode: 13,
                ctrlKey: false,
            });

            expect(handleCommitChange).not.toHaveBeenCalled();
        });

        it('skips line 51 when Enter=false but ctrlKey=true (condition evaluates to false)', () => {
            const handleChange = vi.fn();
            const handleCommitChange = vi.fn();
            const testValue = 'test value';

            renderWithProvider(
                <TextInput
                    name="test-input"
                    value={testValue}
                    onChange={handleChange}
                    onCommitChange={handleCommitChange}
                />,
            );

            const input = screen.getByRole('textbox');

            // Test the FALSE branch: (false && true) = false
            // Should NOT execute line 51
            fireEvent.keyPress(input, {
                key: 'a',
                code: 'KeyA',
                charCode: 97,
                ctrlKey: true,
            });

            expect(handleCommitChange).not.toHaveBeenCalled();
        });

        it('skips line 51 when both Enter=false and ctrlKey=false (condition evaluates to false)', () => {
            const handleChange = vi.fn();
            const handleCommitChange = vi.fn();
            const testValue = 'test value';

            renderWithProvider(
                <TextInput
                    name="test-input"
                    value={testValue}
                    onChange={handleChange}
                    onCommitChange={handleCommitChange}
                />,
            );

            const input = screen.getByRole('textbox');

            // Test the FALSE branch: (false && false) = false
            // Should NOT execute line 51
            fireEvent.keyPress(input, {
                key: 'a',
                code: 'KeyA',
                charCode: 97,
                ctrlKey: false,
            });

            expect(handleCommitChange).not.toHaveBeenCalled();
        });

        it('line 51 passes the current value prop to onCommitChange', () => {
            const handleChange = vi.fn();
            const handleCommitChange = vi.fn();

            renderWithProvider(
                <TextInput
                    name="test-input"
                    value="specific test value"
                    onChange={handleChange}
                    onCommitChange={handleCommitChange}
                />,
            );

            const input = screen.getByRole('textbox');

            // Trigger the condition to test line 51's behavior
            fireEvent.keyPress(input, {
                key: 'Enter',
                code: 'Enter',
                charCode: 13,
                ctrlKey: true,
            });

            // Verify line 51 uses the 'value' prop
            expect(handleCommitChange).toHaveBeenCalledWith(
                'specific test value',
            );
        });

        it('line 51 uses empty string when value prop is empty', () => {
            const handleChange = vi.fn();
            const handleCommitChange = vi.fn();

            renderWithProvider(
                <TextInput
                    name="test-input"
                    value=""
                    onChange={handleChange}
                    onCommitChange={handleCommitChange}
                />,
            );

            const input = screen.getByRole('textbox');

            // Trigger the condition
            fireEvent.keyPress(input, {
                key: 'Enter',
                code: 'Enter',
                charCode: 13,
                ctrlKey: true,
            });

            // Verify line 51 correctly passes empty string
            expect(handleCommitChange).toHaveBeenCalledWith('');
        });
    });

    describe('value handling', () => {
        it('displays the provided value', () => {
            const handleChange = vi.fn();
            const handleCommitChange = vi.fn();

            renderWithProvider(
                <TextInput
                    name="test-input"
                    value="test value"
                    onChange={handleChange}
                    onCommitChange={handleCommitChange}
                />,
            );

            const input = screen.getByRole('textbox') as HTMLInputElement;
            expect(input.value).toBe('test value');
        });

        it('uses empty string when value is null or undefined', () => {
            const handleChange = vi.fn();
            const handleCommitChange = vi.fn();

            renderWithProvider(
                <TextInput
                    name="test-input"
                    value={null}
                    onChange={handleChange}
                    onCommitChange={handleCommitChange}
                />,
            );

            const input = screen.getByRole('textbox') as HTMLInputElement;
            expect(input.value).toBe('');
        });
    });
});
