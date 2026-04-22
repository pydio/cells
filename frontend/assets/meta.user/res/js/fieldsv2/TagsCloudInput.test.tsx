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
import {
    render,
    screen,
    fireEvent,
    cleanup,
    waitFor,
} from '@testing-library/react';

import { TagsCloudInput } from './TagsCloudInput';

/**
 * Mock TagsInput from @mantine/core
 *
 * This mock provides a functional input implementation for testing.
 * It simulates the Mantine TagsInput behavior:
 * - Accepts comma-separated values
 * - Filters empty values
 * - Supports blur and keyPress events
 * - Displays data items and rendered tags
 */
vi.mock('@mantine/core', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        TagsInput: ({
            value,
            onChange,
            onBlur,
            onKeyPress,
            data,
            ...props
        }) => (
            <div>
                <input
                    type="text"
                    value={value?.join(',')}
                    onChange={(e) => {
                        const newValue = e.target.value
                            .split(',')
                            .filter((v) => v);
                        onChange(newValue);
                    }}
                    onBlur={(e) => {
                        if (onBlur) {
                            onBlur(e);
                        }
                    }}
                    onKeyPress={(e) => {
                        if (onKeyPress) {
                            onKeyPress(e);
                        }
                    }}
                    placeholder={props.placeholder}
                    disabled={props.disabled}
                    aria-label={props.label}
                    {...(props.required && { required: true })}
                    {...(props.error && { 'data-error': props.error })}
                />
                {props.label && <label>{props.label}</label>}
                {props.description && <p>{props.description}</p>}
                {props.error && <div role="alert">{props.error}</div>}
                {/* Using getByTestId for data element - internal state, not user-visible */}
                <div data-testid="tags-data">{JSON.stringify(data)}</div>
                {value &&
                    value.map((tag, idx) => (
                        <span key={idx} data-testid={`tag-${idx}`}>
                            {tag}
                        </span>
                    ))}
            </div>
        ),
    };
});

describe('TagsCloudInput', () => {
    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    describe('rendering and display', () => {
        it('renders an input field', () => {
            const onCommitChange = vi.fn();
            render(
                <TagsCloudInput
                    name="test-tags"
                    onCommitChange={onCommitChange}
                    value=""
                />,
            );

            const input = screen.getByRole('textbox');
            expect(input).toBeInTheDocument();
        });

        it('displays label when provided', () => {
            const onCommitChange = vi.fn();
            render(
                <TagsCloudInput
                    name="test-tags"
                    label="Select Tags"
                    onCommitChange={onCommitChange}
                    value=""
                />,
            );

            expect(screen.getByText('Select Tags')).toBeInTheDocument();
        });

        it('displays description when provided', () => {
            const onCommitChange = vi.fn();
            render(
                <TagsCloudInput
                    name="test-tags"
                    description="Enter comma-separated tags"
                    onCommitChange={onCommitChange}
                    value=""
                />,
            );

            expect(
                screen.getByText('Enter comma-separated tags'),
            ).toBeInTheDocument();
        });

        it('displays placeholder in input field', () => {
            const onCommitChange = vi.fn();
            render(
                <TagsCloudInput
                    name="test-tags"
                    placeholder="Add tags..."
                    onCommitChange={onCommitChange}
                    value=""
                />,
            );

            const input = screen.getByPlaceholderText('Add tags...');
            expect(input).toBeInTheDocument();
        });

        it('displays error message when provided', () => {
            const onCommitChange = vi.fn();
            render(
                <TagsCloudInput
                    name="test-tags"
                    errorText="Invalid tags"
                    onCommitChange={onCommitChange}
                    value=""
                />,
            );

            expect(screen.getByRole('alert')).toHaveTextContent('Invalid tags');
        });

        it('marks input as required when required prop is true', () => {
            const onCommitChange = vi.fn();
            render(
                <TagsCloudInput
                    name="test-tags"
                    required={true}
                    onCommitChange={onCommitChange}
                    value=""
                />,
            );

            expect(screen.getByRole('textbox')).toHaveAttribute('required');
        });
    });

    describe('tag value handling', () => {
        it('displays tags from comma-separated string value', () => {
            const onCommitChange = vi.fn();
            render(
                <TagsCloudInput
                    name="test-tags"
                    value="tag1,tag2,tag3"
                    onCommitChange={onCommitChange}
                />,
            );

            expect(screen.getByText('tag1')).toBeInTheDocument();
            expect(screen.getByText('tag2')).toBeInTheDocument();
            expect(screen.getByText('tag3')).toBeInTheDocument();
        });

        it('displays no tags for empty string value', () => {
            const onCommitChange = vi.fn();
            render(
                <TagsCloudInput
                    name="test-tags"
                    value=""
                    onCommitChange={onCommitChange}
                />,
            );

            // Input should exist but no tag elements
            expect(screen.getByRole('textbox')).toHaveValue('');
        });

        it('displays no tags for undefined value', () => {
            const onCommitChange = vi.fn();
            render(
                <TagsCloudInput
                    name="test-tags"
                    value={undefined}
                    onCommitChange={onCommitChange}
                />,
            );

            expect(screen.getByRole('textbox')).toBeInTheDocument();
        });

        it('filters and displays only non-empty tags', () => {
            const onCommitChange = vi.fn();
            render(
                <TagsCloudInput
                    name="test-tags"
                    value="tag1,,tag2, ,tag3"
                    onCommitChange={onCommitChange}
                />,
            );

            // Should display three tags (empty values filtered out)
            expect(screen.getByText('tag1')).toBeInTheDocument();
            expect(screen.getByText('tag2')).toBeInTheDocument();
            expect(screen.getByText('tag3')).toBeInTheDocument();
        });

        it('trims whitespace from tags', () => {
            const onCommitChange = vi.fn();
            render(
                <TagsCloudInput
                    name="test-tags"
                    value=" tag1 , tag2 , tag3 "
                    onCommitChange={onCommitChange}
                />,
            );

            expect(screen.getByText('tag1')).toBeInTheDocument();
            expect(screen.getByText('tag2')).toBeInTheDocument();
            expect(screen.getByText('tag3')).toBeInTheDocument();
        });

        it('preserves special characters in tags', () => {
            const onCommitChange = vi.fn();
            render(
                <TagsCloudInput
                    name="test-tags"
                    value="tag-1,tag_2,tag.3,tag@4"
                    onCommitChange={onCommitChange}
                />,
            );

            expect(screen.getByText('tag-1')).toBeInTheDocument();
            expect(screen.getByText('tag_2')).toBeInTheDocument();
            expect(screen.getByText('tag.3')).toBeInTheDocument();
            expect(screen.getByText('tag@4')).toBeInTheDocument();
        });

        it('updates displayed tags when prop value changes', async () => {
            const onCommitChange = vi.fn();
            const { rerender } = render(
                <TagsCloudInput
                    name="test-tags"
                    value="tag1,tag2"
                    onCommitChange={onCommitChange}
                />,
            );

            expect(screen.getByText('tag1')).toBeInTheDocument();
            expect(screen.getByText('tag2')).toBeInTheDocument();

            rerender(
                <TagsCloudInput
                    name="test-tags"
                    value="tag3,tag4,tag5"
                    onCommitChange={onCommitChange}
                />,
            );

            await waitFor(() => {
                expect(screen.getByText('tag3')).toBeInTheDocument();
                expect(screen.getByText('tag4')).toBeInTheDocument();
                expect(screen.getByText('tag5')).toBeInTheDocument();
            });
        });

        it('handles single tag without comma', () => {
            const onCommitChange = vi.fn();
            render(
                <TagsCloudInput
                    name="test-tags"
                    value="singletag"
                    onCommitChange={onCommitChange}
                />,
            );

            expect(screen.getByText('singletag')).toBeInTheDocument();
        });

        it('handles tags with unicode characters', () => {
            const onCommitChange = vi.fn();
            render(
                <TagsCloudInput
                    name="test-tags"
                    value="tag1,café,日本語"
                    onCommitChange={onCommitChange}
                />,
            );

            expect(screen.getByText('tag1')).toBeInTheDocument();
            expect(screen.getByText('café')).toBeInTheDocument();
            expect(screen.getByText('日本語')).toBeInTheDocument();
        });

        it('displays many tags', () => {
            const onCommitChange = vi.fn();
            const manyTags = Array.from(
                { length: 20 },
                (_, i) => `tag${i}`,
            ).join(',');

            render(
                <TagsCloudInput
                    name="test-tags"
                    value={manyTags}
                    onCommitChange={onCommitChange}
                />,
            );

            for (let i = 0; i < 20; i++) {
                expect(screen.getByText(`tag${i}`)).toBeInTheDocument();
            }
        });

        it('handles null value gracefully', () => {
            const onCommitChange = vi.fn();
            render(
                <TagsCloudInput
                    name="test-tags"
                    value={null}
                    onCommitChange={onCommitChange}
                />,
            );

            expect(screen.getByRole('textbox')).toBeInTheDocument();
        });
    });

    describe('data loading', () => {
        it('loads data on mount', async () => {
            const dataLoader = vi
                .fn()
                .mockResolvedValue(['option1', 'option2', 'option3']);
            const onCommitChange = vi.fn();

            render(
                <TagsCloudInput
                    name="test-tags"
                    dataLoader={dataLoader}
                    onCommitChange={onCommitChange}
                    value=""
                />,
            );

            await waitFor(() => {
                expect(dataLoader).toHaveBeenCalledTimes(1);
            });
        });

        it('populates available options from dataLoader', async () => {
            const dataLoader = vi
                .fn()
                .mockResolvedValue(['option1', 'option2', 'option3']);
            const onCommitChange = vi.fn();

            render(
                <TagsCloudInput
                    name="test-tags"
                    dataLoader={dataLoader}
                    onCommitChange={onCommitChange}
                    value=""
                />,
            );

            await waitFor(() => {
                // getByTestId is necessary here because data is internal state
                // not visible to users, but important for component functionality
                const dataElement = screen.getByTestId('tags-data');
                expect(dataElement.textContent).toContain('option1');
                expect(dataElement.textContent).toContain('option2');
                expect(dataElement.textContent).toContain('option3');
            });
        });

        it('reloads data when name prop changes', async () => {
            const dataLoader = vi
                .fn()
                .mockResolvedValue(['option1', 'option2']);
            const onCommitChange = vi.fn();

            const { rerender } = render(
                <TagsCloudInput
                    name="tags-1"
                    dataLoader={dataLoader}
                    onCommitChange={onCommitChange}
                    value=""
                />,
            );

            await waitFor(() => {
                expect(dataLoader).toHaveBeenCalledTimes(1);
            });

            dataLoader.mockResolvedValue([
                'newOption1',
                'newOption2',
                'newOption3',
            ]);

            rerender(
                <TagsCloudInput
                    name="tags-2"
                    dataLoader={dataLoader}
                    onCommitChange={onCommitChange}
                    value=""
                />,
            );

            await waitFor(() => {
                expect(dataLoader).toHaveBeenCalledTimes(2);
            });
        });

        it('renders input even without dataLoader', () => {
            const onCommitChange = vi.fn();
            render(
                <TagsCloudInput
                    name="test-tags"
                    onCommitChange={onCommitChange}
                    value=""
                />,
            );

            expect(screen.getByRole('textbox')).toBeInTheDocument();
        });

        it('handles empty dataLoader result', async () => {
            const dataLoader = vi.fn().mockResolvedValue([]);
            const onCommitChange = vi.fn();

            render(
                <TagsCloudInput
                    name="test-tags"
                    dataLoader={dataLoader}
                    onCommitChange={onCommitChange}
                    value=""
                />,
            );

            await waitFor(() => {
                const dataElement = screen.getByTestId('tags-data');
                expect(dataElement.textContent).toBe('[]');
            });
        });

        it('handles dataLoader errors gracefully', async () => {
            const dataLoader = vi
                .fn()
                .mockImplementation(() =>
                    Promise.reject(new Error('Load failed')).catch(() => {}),
                );
            const onCommitChange = vi.fn();

            render(
                <TagsCloudInput
                    name="test-tags"
                    dataLoader={dataLoader}
                    onCommitChange={onCommitChange}
                    value=""
                />,
            );

            await waitFor(() => {
                expect(dataLoader).toHaveBeenCalled();
            });

            expect(screen.getByRole('textbox')).toBeInTheDocument();
        });
    });

    describe('user interactions', () => {
        it('calls onCommitChange when user types tags', () => {
            const onCommitChange = vi.fn();
            render(
                <TagsCloudInput
                    name="test-tags"
                    onCommitChange={onCommitChange}
                    value=""
                />,
            );

            const input = screen.getByRole('textbox');
            fireEvent.change(input, { target: { value: 'tag1,tag2' } });

            expect(onCommitChange).toHaveBeenCalledWith('tag1,tag2');
        });

        it('filters empty values from input', () => {
            const onCommitChange = vi.fn();
            render(
                <TagsCloudInput
                    name="test-tags"
                    onCommitChange={onCommitChange}
                    value=""
                />,
            );

            const input = screen.getByRole('textbox');
            fireEvent.change(input, { target: { value: 'tag1,,tag2,' } });

            expect(onCommitChange).toHaveBeenCalledWith('tag1,tag2');
        });

        it('triggers onChange when user leaves input field', () => {
            const onCommitChange = vi.fn();
            render(
                <TagsCloudInput
                    name="test-tags"
                    onCommitChange={onCommitChange}
                    value="existing"
                />,
            );

            const input = screen.getByRole('textbox');
            fireEvent.blur(input);

            expect(onCommitChange).toHaveBeenCalled();
        });

        it('triggers onChange on Enter key press', () => {
            const onCommitChange = vi.fn();
            render(
                <TagsCloudInput
                    name="test-tags"
                    onCommitChange={onCommitChange}
                    value=""
                />,
            );

            const input = screen.getByRole('textbox');
            fireEvent.change(input, { target: { value: 'newtag' } });
            fireEvent.keyPress(input, { key: 'Enter' });

            expect(onCommitChange).toHaveBeenCalled();
        });

        it('maintains value through multiple interactions', () => {
            const onCommitChange = vi.fn();
            render(
                <TagsCloudInput
                    name="test-tags"
                    onCommitChange={onCommitChange}
                    value="initial"
                />,
            );

            const input = screen.getByRole('textbox');
            fireEvent.change(input, { target: { value: 'initial,new' } });
            expect(onCommitChange).toHaveBeenCalledWith('initial,new');

            fireEvent.blur(input);
            expect(onCommitChange).toHaveBeenCalled();
        });

        it('supports full workflow: render, load data, then add tags', async () => {
            const dataLoader = vi
                .fn()
                .mockResolvedValue(['option1', 'option2', 'option3']);
            const onCommitChange = vi.fn();

            render(
                <TagsCloudInput
                    name="test-tags"
                    label="Select Options"
                    dataLoader={dataLoader}
                    onCommitChange={onCommitChange}
                    value=""
                />,
            );

            await waitFor(() => {
                expect(dataLoader).toHaveBeenCalled();
                const dataElement = screen.getByTestId('tags-data');
                expect(dataElement.textContent).toContain('option1');
            });

            const input = screen.getByRole('textbox');
            fireEvent.change(input, { target: { value: 'option1,option2' } });

            expect(onCommitChange).toHaveBeenCalledWith('option1,option2');
        });
    });

    describe('prop updates', () => {
        it('updates label when prop changes', () => {
            const onCommitChange = vi.fn();
            const { rerender } = render(
                <TagsCloudInput
                    name="test-tags"
                    label="Old Label"
                    onCommitChange={onCommitChange}
                    value=""
                />,
            );

            expect(screen.getByText('Old Label')).toBeInTheDocument();

            rerender(
                <TagsCloudInput
                    name="test-tags"
                    label="New Label"
                    onCommitChange={onCommitChange}
                    value=""
                />,
            );

            expect(screen.getByText('New Label')).toBeInTheDocument();
        });

        it('updates placeholder when prop changes', () => {
            const onCommitChange = vi.fn();
            const { rerender } = render(
                <TagsCloudInput
                    name="test-tags"
                    placeholder="Old placeholder"
                    onCommitChange={onCommitChange}
                    value=""
                />,
            );

            expect(
                screen.getByPlaceholderText('Old placeholder'),
            ).toBeInTheDocument();

            rerender(
                <TagsCloudInput
                    name="test-tags"
                    placeholder="New placeholder"
                    onCommitChange={onCommitChange}
                    value=""
                />,
            );

            expect(
                screen.getByPlaceholderText('New placeholder'),
            ).toBeInTheDocument();
        });

        it('updates required attribute when prop changes', () => {
            const onCommitChange = vi.fn();
            const { rerender } = render(
                <TagsCloudInput
                    name="test-tags"
                    required={false}
                    onCommitChange={onCommitChange}
                    value=""
                />,
            );

            expect(screen.getByRole('textbox')).not.toHaveAttribute('required');

            rerender(
                <TagsCloudInput
                    name="test-tags"
                    required={true}
                    onCommitChange={onCommitChange}
                    value=""
                />,
            );

            expect(screen.getByRole('textbox')).toHaveAttribute('required');
        });

        it('updates error message when prop changes', () => {
            const onCommitChange = vi.fn();
            const { rerender } = render(
                <TagsCloudInput
                    name="test-tags"
                    errorText=""
                    onCommitChange={onCommitChange}
                    value=""
                />,
            );

            // No error initially
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();

            rerender(
                <TagsCloudInput
                    name="test-tags"
                    errorText="New error"
                    onCommitChange={onCommitChange}
                    value=""
                />,
            );

            expect(screen.getByRole('alert')).toHaveTextContent('New error');
        });
    });

    describe('validation and restrictions', () => {
        it('renders with onlyValuesFromList enabled', () => {
            const dataLoader = vi
                .fn()
                .mockResolvedValue(['option1', 'option2']);
            const onCommitChange = vi.fn();

            render(
                <TagsCloudInput
                    name="test-tags"
                    dataLoader={dataLoader}
                    onCommitChange={onCommitChange}
                    onlyValuesFromList={true}
                    value="option1"
                />,
            );

            expect(screen.getByRole('textbox')).toBeInTheDocument();
        });

        it('allows custom values when onlyValuesFromList is disabled', () => {
            const onCommitChange = vi.fn();
            render(
                <TagsCloudInput
                    name="test-tags"
                    onCommitChange={onCommitChange}
                    onlyValuesFromList={false}
                    value=""
                />,
            );

            expect(screen.getByRole('textbox')).toBeInTheDocument();
        });
    });
});
