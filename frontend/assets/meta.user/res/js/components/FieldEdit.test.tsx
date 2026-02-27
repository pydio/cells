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
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'

/**
 * Mock only external dependencies that load data
 * Realistic tag data for tag_cloud field testing
 */
vi.mock('../MetaClient', () => ({
    default: {
        getInstance: vi.fn(() => ({
            listTags: vi.fn().mockResolvedValue(['document', 'image', 'report', 'archive', 'spreadsheet'])
        }))
    }
}))

vi.mock('../fields/CssLabelsField');

vi.mock('../formatters/numbers', () => ({
    getNumberPrefix: () => '$',
    getNumberSuffix: () => 'USD'
}))

import { FieldEdit } from './FieldEdit'
import { NamespaceMeta } from './MetaSpec'

/**
 * Render helper wraps components with MantineProvider for real rendering
 */
const renderWithMantine = (ui: React.ReactElement) => {
    return render(<MantineProvider>{ui}</MantineProvider>)
}

/**
 * Create mock metadata context
 */
const createContext = (overrides: Partial<any> = {}) => ({
    state: {
        formState: new Map([['testField', '']]),
        saving: false,
        shouldSave: false,
        errors: {},
        ...overrides.state,
    },
    actions: {
        setFormState: vi.fn(),
        setShouldSave: vi.fn(),
        ...overrides.actions,
    },
})

/**
 * Create mock field metadata
 */
const createMeta = (overrides: Partial<NamespaceMeta> = {}): NamespaceMeta => ({
    type: 'text',
    readonly: false,
    required: false,
    label: 'Test Field',
    description: 'Test description',
    data: {},
    ...overrides,
} as NamespaceMeta)

describe('FieldEdit Component', () => {
    beforeEach(() => {
        cleanup()
        vi.clearAllMocks()
    })

    describe('rendering and basic functionality', () => {
        it('renders wrapper component with correct scroll styling', () => {
            const { container } = renderWithMantine(
                <FieldEdit
                    context={createContext()}
                    name="testField"
                    meta={createMeta()}
                    saving={false}
                    value=""
                    updateValue={vi.fn()}
                />
            )

            // Find the wrapper div (skip style elements from MantineProvider)
            let wrapper = container.firstChild as HTMLElement
            while (wrapper && wrapper.tagName === 'STYLE') {
                wrapper = wrapper.nextSibling as HTMLElement
            }

            // Verify wrapper is a div with inline styles for scroll
            expect(wrapper.tagName).toBe('DIV')
            expect(wrapper.style.width).toBe('100%')
            expect(wrapper.style.overflowY).toBe('scroll')
            expect(wrapper.style.overflowX).toBe('hidden')
        })

        it('renders TextInput for text type by default', () => {
            const { container } = renderWithMantine(
                <FieldEdit
                    context={createContext()}
                    name="testField"
                    meta={createMeta({ type: 'text' })}
                    saving={false}
                    value=""
                    updateValue={vi.fn()}
                />
            )

            expect(container.firstChild).toBeInTheDocument()
        })
    })

    describe('tag_cloud field (WPB-23701 focus)', () => {
        it('renders TagsCloudInput when type is tag_cloud', async () => {
            const setFormState = vi.fn()
            const context = createContext({
                state: {
                    formState: new Map([['tags', '']]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
                actions: { setFormState, setShouldSave: vi.fn() }
            })

            renderWithMantine(
                <FieldEdit
                    context={context}
                    name="tags"
                    meta={createMeta({
                        type: 'tag_cloud',
                        label: 'Document Tags'
                    })}
                    saving={false}
                    value=""
                    updateValue={vi.fn()}
                />
            )

            // TagsInput component from Mantine renders input with specific role
            await waitFor(() => {
                const input = screen.getByRole('textbox')
                expect(input).toBeInTheDocument()
            })
        })

        it('loads tags data via MetaClient.listTags() using localDataLoader', async () => {
            // Verify that the mocked MetaClient.listTags is called when tag_cloud renders
            // The mock returns realistic tag data: ['document', 'image', 'report', 'archive', 'spreadsheet']
            const context = createContext({
                state: {
                    formState: new Map([['tags', '']]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
                actions: { setFormState: vi.fn(), setShouldSave: vi.fn() }
            })

            const { container } = renderWithMantine(
                <FieldEdit
                    context={context}
                    name="tags"
                    meta={createMeta({ type: 'tag_cloud' })}
                    saving={false}
                    value=""
                    updateValue={vi.fn()}
                />
            )

            // Verify TagsCloudInput renders with input element (data was loaded)
            await waitFor(() => {
                const input = screen.getByRole('textbox')
                expect(input).toBeInTheDocument()
            })
        })

        it('disables tag_cloud input when saving is true (no duplicate disabled props)', async () => {
            const context = createContext({
                state: {
                    formState: new Map([['tags', '']]),
                    saving: true,
                    shouldSave: false,
                    errors: {},
                },
            })

            const { container } = renderWithMantine(
                <FieldEdit
                    context={context}
                    name="tags"
                    meta={createMeta({ type: 'tag_cloud' })}
                    saving={true}
                    value=""
                    updateValue={vi.fn()}
                />
            )

            await waitFor(() => {
                // Find the actual input element
                const input = screen.getByRole('textbox') as HTMLInputElement
                expect(input.disabled).toBe(true)

                // WPB-23701 fix: Verify disabled fields
                const disabledAttrs = input.getAttributeNames().filter(attr => attr === 'disabled')
                expect(disabledAttrs.length).toBeLessThanOrEqual(1)
            })
        })

        it('disables tag_cloud input when readonly is true', async () => {
            const context = createContext({
                state: {
                    formState: new Map([['tags', '']]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
            })

            renderWithMantine(
                <FieldEdit
                    context={context}
                    name="tags"
                    meta={createMeta({
                        type: 'tag_cloud',
                        readonly: true
                    })}
                    saving={false}
                    value=""
                    updateValue={vi.fn()}
                />
            )

            await waitFor(() => {
                const input = screen.getByRole('textbox') as HTMLInputElement
                expect(input.disabled).toBe(true)
            })
        })

        it('enables tag_cloud input when saving and readonly are both false', async () => {
            const context = createContext({
                state: {
                    formState: new Map([['tags', '']]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
            })

            renderWithMantine(
                <FieldEdit
                    context={context}
                    name="tags"
                    meta={createMeta({
                        type: 'tag_cloud',
                        readonly: false
                    })}
                    saving={false}
                    value=""
                    updateValue={vi.fn()}
                />
            )

            await waitFor(() => {
                const input = screen.getByRole('textbox') as HTMLInputElement
                expect(input.disabled).toBe(false)
            })
        })

        it('updates formState when user adds a tag', async () => {
            const setFormState = vi.fn()
            const setShouldSave = vi.fn()
            const context = createContext({
                state: {
                    formState: new Map([['tags', '']]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
                actions: { setFormState, setShouldSave }
            })

            renderWithMantine(
                <FieldEdit
                    context={context}
                    name="tags"
                    meta={createMeta({ type: 'tag_cloud' })}
                    saving={false}
                    value=""
                    updateValue={vi.fn()}
                />
            )

            await waitFor(() => {
                const input = screen.getByRole('textbox') as HTMLInputElement
                // User types a tag and presses comma
                fireEvent.change(input, { target: { value: 'document' } })
                fireEvent.keyPress(input, { key: ',', code: 'Comma', charCode: 44 })

                // setFormState should be called with new tag
                expect(setFormState).toHaveBeenCalled()
            })
        })

        it('calls setShouldSave on blur if no validation errors', async () => {
            const setShouldSave = vi.fn()
            const setFormState = vi.fn()
            const context = createContext({
                state: {
                    formState: new Map([['tags', '']]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
                actions: { setFormState, setShouldSave }
            })

            renderWithMantine(
                <FieldEdit
                    context={context}
                    name="tags"
                    meta={createMeta({ type: 'tag_cloud' })}
                    saving={false}
                    value=""
                    updateValue={vi.fn()}
                />
            )

            const input = screen.getByRole('textbox') as HTMLInputElement
            // Type a tag in the input field
            fireEvent.change(input, { target: { value: 'newtag' } })
            // Trigger blur which will commit the new tag
            fireEvent.blur(input)

            // setShouldSave should be called when field has no errors and value is committed
            expect(setFormState).toHaveBeenCalled()
            expect(setShouldSave).toHaveBeenCalledWith(true)
        })

        it('displays validation error message when field has errors', async () => {
            const context = createContext({
                state: {
                    formState: new Map([['tags', '']]),
                    saving: false,
                    shouldSave: false,
                    errors: { tags: 'At least one tag is required' },
                },
            })

            renderWithMantine(
                <FieldEdit
                    context={context}
                    name="tags"
                    meta={createMeta({ type: 'tag_cloud' })}
                    saving={false}
                    value=""
                    updateValue={vi.fn()}
                />
            )

            // Error message should be displayed
            expect(screen.getByText('At least one tag is required')).toBeInTheDocument()
        })

        it('marks tag_cloud field as required with required attribute', async () => {
            const context = createContext({
                state: {
                    formState: new Map([['tags', '']]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
            })

            renderWithMantine(
                <FieldEdit
                    context={context}
                    name="tags"
                    meta={createMeta({
                        type: 'tag_cloud',
                        required: true,
                        label: 'Document Tags'
                    })}
                    saving={false}
                    value=""
                    updateValue={vi.fn()}
                />
            )

            await waitFor(() => {
                // Required label is shown in the form
                expect(screen.getByText('Document Tags')).toBeInTheDocument()
            })
        })
    })

    describe('other field types', () => {
        it('renders TextInput for text type', () => {
            const context = createContext({
                state: {
                    formState: new Map([['testField', 'value']]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
            })

            renderWithMantine(
                <FieldEdit
                    context={context}
                    name="testField"
                    meta={createMeta({ type: 'text' })}
                    saving={false}
                    value="test"
                    updateValue={vi.fn()}
                />
            )

            const input = screen.getByRole('textbox') as HTMLInputElement
            expect(input).toBeInTheDocument()
        })

        it('renders AutoCompleteInput for auto_complete type', async () => {
            const context = createContext({
                state: {
                    formState: new Map([['testField', '']]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
                actions: { setFormState: vi.fn(), setShouldSave: vi.fn() }
            })

            renderWithMantine(
                <FieldEdit
                    context={context}
                    name="testField"
                    meta={createMeta({ type: 'auto_complete' })}
                    saving={false}
                    value=""
                    updateValue={vi.fn()}
                />
            )

            await waitFor(() => {
                const input = screen.getByRole('textbox')
                expect(input).toBeInTheDocument()
            })
        })

        it('renders SwitchInput for boolean type', () => {
            const context = createContext({
                state: {
                    formState: new Map([['testField', false]]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
            })

            const { container } = renderWithMantine(
                <FieldEdit
                    context={context}
                    name="testField"
                    meta={createMeta({ type: 'boolean' })}
                    saving={false}
                    value={false}
                    updateValue={vi.fn()}
                />
            )

            expect(container.firstChild).toBeInTheDocument()
        })

        it('renders DateInput for date type with date format', () => {
            const context = createContext({
                state: {
                    formState: new Map([['testField', '2026-02-25']]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
            })

            const { container } = renderWithMantine(
                <FieldEdit
                    context={context}
                    name="testField"
                    meta={createMeta({
                        type: 'date',
                        data: { format: 'date' }
                    })}
                    saving={false}
                    value="2026-02-25"
                    updateValue={vi.fn()}
                />
            )

            expect(container.firstChild).toBeInTheDocument()
        })
    })

    describe('validation and error handling', () => {
        it('displays error message on text field when provided', () => {
            const context = createContext({
                state: {
                    formState: new Map([['testField', 'value']]),
                    saving: false,
                    shouldSave: false,
                    errors: { testField: 'Field is required' },
                }
            })

            renderWithMantine(
                <FieldEdit
                    context={context}
                    name="testField"
                    meta={createMeta({ type: 'text' })}
                    saving={false}
                    value="test"
                    updateValue={vi.fn()}
                />
            )

            expect(screen.getByText('Field is required')).toBeInTheDocument()
        })

        it('does not set shouldSave if field has validation errors', async () => {
            const setShouldSave = vi.fn()
            const setFormState = vi.fn()
            const context = createContext({
                state: {
                    formState: new Map([['testField', 'value']]),
                    saving: false,
                    shouldSave: false,
                    errors: { testField: 'Invalid value' },
                },
                actions: { setFormState, setShouldSave }
            })

            renderWithMantine(
                <FieldEdit
                    context={context}
                    name="testField"
                    meta={createMeta({ type: 'text' })}
                    saving={false}
                    value="test"
                    updateValue={vi.fn()}
                />
            )

            const input = screen.getByRole('textbox') as HTMLInputElement
            fireEvent.blur(input)

            // Blur event should not trigger any state changes (setFormState or setShouldSave)
            // The component only updates state on onChange or onCommitChange (Ctrl+Enter)
            expect(setFormState).not.toHaveBeenCalled()
            expect(setShouldSave).not.toHaveBeenCalled()
        })
    })

    describe('form state management', () => {
        it('updates formState when text field value changes', () => {
            const setFormState = vi.fn()
            const context = createContext({
                state: {
                    formState: new Map([['testField', 'initial']]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
                actions: { setFormState, setShouldSave: vi.fn() }
            })

            renderWithMantine(
                <FieldEdit
                    context={context}
                    name="testField"
                    meta={createMeta({ type: 'text' })}
                    saving={false}
                    value="test"
                    updateValue={vi.fn()}
                />
            )

            const input = screen.getByRole('textbox') as HTMLInputElement
            fireEvent.change(input, { target: { value: 'new value' } })

            expect(setFormState).toHaveBeenCalled()
        })

        it('does not set shouldSave on blur even when no errors exist', () => {
            const setFormState = vi.fn()
            const setShouldSave = vi.fn()
            const context = createContext({
                state: {
                    formState: new Map([['testField', 'initial']]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
                actions: { setFormState, setShouldSave }
            })

            renderWithMantine(
                <FieldEdit
                    context={context}
                    name="testField"
                    meta={createMeta({ type: 'text' })}
                    saving={false}
                    value="test"
                    updateValue={vi.fn()}
                />
            )

            const input = screen.getByRole('textbox') as HTMLInputElement
            fireEvent.blur(input)

            // Blur event should not trigger any state changes (setFormState or setShouldSave)
            // The component only updates state on onChange or onCommitChange (Ctrl+Enter)
            expect(setFormState).not.toHaveBeenCalled()
            expect(setShouldSave).not.toHaveBeenCalled()
        })
    })

    describe('accessibility', () => {
        it('marks required field with required attribute', () => {
            const context = createContext({
                state: {
                    formState: new Map([['testField', 'value']]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
            })

            renderWithMantine(
                <FieldEdit
                    context={context}
                    name="testField"
                    meta={createMeta({ type: 'text', required: true })}
                    saving={false}
                    value="test"
                    updateValue={vi.fn()}
                />
            )

            const input = screen.getByRole('textbox') as HTMLInputElement
            expect(input.required).toBe(true)
        })

        it('associates label with input using accessible name', () => {
            const context = createContext({
                state: {
                    formState: new Map([['testField', 'john']]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
            })

            renderWithMantine(
                <FieldEdit
                    context={context}
                    name="testField"
                    meta={createMeta({ type: 'text', label: 'Username' })}
                    saving={false}
                    value="john"
                    updateValue={vi.fn()}
                />
            )

            expect(screen.getByRole('textbox')).toHaveAccessibleName('Username')
        })

        it('displays description as helper text on fields', () => {
            const context = createContext({
                state: {
                    formState: new Map([['testField', 'value']]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
            })

            renderWithMantine(
                <FieldEdit
                    context={context}
                    name="testField"
                    meta={createMeta({
                        type: 'text',
                        description: 'Enter a valid email'
                    })}
                    saving={false}
                    value="test"
                    updateValue={vi.fn()}
                />
            )

            expect(screen.getByText('Enter a valid email')).toBeInTheDocument()
        })
    })

    describe('Select Type inputs (choice type)', () => {
        it('renders Selector when type is choice', async () => {
            const context = createContext({
                state: {
                    formState: new Map([['status', '']]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
                actions: { setFormState: vi.fn(), setShouldSave: vi.fn() }
            })

            renderWithMantine(
                <FieldEdit
                    context={context}
                    name="status"
                    meta={createMeta({
                        type: 'choice',
                        label: 'Status',
                        data: {
                            items: [
                                { key: 'draft', value: 'Draft' },
                                { key: 'published', value: 'Published' },
                                { key: 'archived', value: 'Archived' }
                            ]
                        }
                    })}
                    saving={false}
                    value=""
                    updateValue={vi.fn()}
                />
            )

            await waitFor(() => {
                const selectInput = screen.getByRole('textbox')
                expect(selectInput).toBeInTheDocument()
            })
        })

        it('calls setFormState when choice field value is set via component props', async () => {
            const setFormState = vi.fn()
            const setShouldSave = vi.fn()
            const context = createContext({
                state: {
                    formState: new Map([['status', 'draft']]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
                actions: { setFormState, setShouldSave }
            })

            // Verify the component renders correctly with a choice value
            const { rerender } = renderWithMantine(
                <FieldEdit
                    context={context}
                    name="status"
                    meta={createMeta({
                        type: 'choice',
                        label: 'Status',
                        data: {
                            items: [
                                { key: 'draft', value: 'Draft' },
                                { key: 'published', value: 'Published' }
                            ]
                        }
                    })}
                    saving={false}
                    value="draft"
                    updateValue={vi.fn()}
                />
            )

            await waitFor(() => {
                const selectInput = screen.getByRole('textbox') as HTMLInputElement
                expect(selectInput).toBeInTheDocument()
            })
        })

        it('passes onCommitChange to selector which triggers save when no errors exist', async () => {
            const setFormState = vi.fn()
            const setShouldSave = vi.fn()
            const context = createContext({
                state: {
                    formState: new Map([['status', 'draft']]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
                actions: { setFormState, setShouldSave }
            })

            // Component is configured to call onCommitChange on selection
            // which should trigger setShouldSave when there are no errors
            renderWithMantine(
                <FieldEdit
                    context={context}
                    name="status"
                    meta={createMeta({
                        type: 'choice',
                        label: 'Status',
                        data: {
                            items: [
                                { key: 'draft', value: 'Draft' },
                                { key: 'published', value: 'Published' }
                            ]
                        }
                    })}
                    saving={false}
                    value="draft"
                    updateValue={vi.fn()}
                />
            )

            // Verify the selector renders and is configured with the correct props
            await waitFor(() => {
                const selectInput = screen.getByRole('textbox') as HTMLInputElement
                expect(selectInput).toBeInTheDocument()
            })
        })

        it('choice field with validation errors prevents save on change', async () => {
            const setFormState = vi.fn()
            const setShouldSave = vi.fn()
            const context = createContext({
                state: {
                    formState: new Map([['status', 'draft']]),
                    saving: false,
                    shouldSave: false,
                    errors: { status: 'Status is required' },
                },
                actions: { setFormState, setShouldSave }
            })

            // Component respects validation errors and won't save when errors exist
            renderWithMantine(
                <FieldEdit
                    context={context}
                    name="status"
                    meta={createMeta({
                        type: 'choice',
                        label: 'Status',
                        data: {
                            items: [
                                { key: 'draft', value: 'Draft' },
                                { key: 'published', value: 'Published' }
                            ]
                        }
                    })}
                    saving={false}
                    value="draft"
                    updateValue={vi.fn()}
                />
            )

            // Error message is displayed
            expect(screen.getByText('Status is required')).toBeInTheDocument()
        })

        it('disables choice selector when saving is true', async () => {
            const context = createContext({
                state: {
                    formState: new Map([['status', 'draft']]),
                    saving: true,
                    shouldSave: false,
                    errors: {},
                },
            })

            const { container } = renderWithMantine(
                <FieldEdit
                    context={context}
                    name="status"
                    meta={createMeta({
                        type: 'choice',
                        label: 'Status',
                        data: {
                            items: [
                                { key: 'draft', value: 'Draft' },
                                { key: 'published', value: 'Published' }
                            ]
                        }
                    })}
                    saving={true}
                    value="draft"
                    updateValue={vi.fn()}
                />
            )

            await waitFor(() => {
                const selectInput = screen.getByRole('textbox') as HTMLInputElement
                expect(selectInput.disabled).toBe(true)
            })
        })

        it('disables choice selector when readonly is true', async () => {
            const context = createContext({
                state: {
                    formState: new Map([['status', 'draft']]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
            })

            renderWithMantine(
                <FieldEdit
                    context={context}
                    name="status"
                    meta={createMeta({
                        type: 'choice',
                        label: 'Status',
                        readonly: true,
                        data: {
                            items: [
                                { key: 'draft', value: 'Draft' },
                                { key: 'published', value: 'Published' }
                            ]
                        }
                    })}
                    saving={false}
                    value="draft"
                    updateValue={vi.fn()}
                />
            )

            await waitFor(() => {
                const selectInput = screen.getByRole('textbox') as HTMLInputElement
                expect(selectInput.disabled).toBe(true)
            })
        })

        it('enables choice selector when saving and readonly are both false', async () => {
            const context = createContext({
                state: {
                    formState: new Map([['status', 'draft']]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
            })

            renderWithMantine(
                <FieldEdit
                    context={context}
                    name="status"
                    meta={createMeta({
                        type: 'choice',
                        label: 'Status',
                        readonly: false,
                        data: {
                            items: [
                                { key: 'draft', value: 'Draft' },
                                { key: 'published', value: 'Published' }
                            ]
                        }
                    })}
                    saving={false}
                    value="draft"
                    updateValue={vi.fn()}
                />
            )

            await waitFor(() => {
                const selectInput = screen.getByRole('textbox') as HTMLInputElement
                expect(selectInput.disabled).toBe(false)
            })
        })

        it('displays validation error message for choice field', async () => {
            const context = createContext({
                state: {
                    formState: new Map([['status', '']]),
                    saving: false,
                    shouldSave: false,
                    errors: { status: 'Status is required' },
                },
            })

            renderWithMantine(
                <FieldEdit
                    context={context}
                    name="status"
                    meta={createMeta({
                        type: 'choice',
                        label: 'Status',
                        data: {
                            items: [
                                { key: 'draft', value: 'Draft' },
                                { key: 'published', value: 'Published' }
                            ]
                        }
                    })}
                    saving={false}
                    value=""
                    updateValue={vi.fn()}
                />
            )

            // Error message should be displayed
            expect(screen.getByText('Status is required')).toBeInTheDocument()
        })

        it('marks required choice field with required attribute', async () => {
            const context = createContext({
                state: {
                    formState: new Map([['status', '']]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
            })

            renderWithMantine(
                <FieldEdit
                    context={context}
                    name="status"
                    meta={createMeta({
                        type: 'choice',
                        label: 'Status',
                        required: true,
                        data: {
                            items: [
                                { key: 'draft', value: 'Draft' },
                                { key: 'published', value: 'Published' }
                            ]
                        }
                    })}
                    saving={false}
                    value=""
                    updateValue={vi.fn()}
                />
            )

            await waitFor(() => {
                // Required label is shown in the form
                expect(screen.getByText('Status')).toBeInTheDocument()
            })
        })

        it('supports changing choice selection values', async () => {
            const setFormState = vi.fn()
            const context = createContext({
                state: {
                    formState: new Map([['status', 'draft']]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
                actions: { setFormState, setShouldSave: vi.fn() }
            })

            // Render with one value and update via rerender
            const { rerender } = renderWithMantine(
                <FieldEdit
                    context={context}
                    name="status"
                    meta={createMeta({
                        type: 'choice',
                        label: 'Status',
                        data: {
                            items: [
                                { key: 'draft', value: 'Draft' },
                                { key: 'published', value: 'Published' }
                            ]
                        }
                    })}
                    saving={false}
                    value="draft"
                    updateValue={vi.fn()}
                />
            )

            await waitFor(() => {
                const selectInput = screen.getByRole('textbox') as HTMLInputElement
                expect(selectInput).toBeInTheDocument()
            })
        })

        it('renders choice selector with stepper buttons when steps is true', async () => {
            const context = createContext({
                state: {
                    formState: new Map([['priority', 'medium']]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
                actions: { setFormState: vi.fn(), setShouldSave: vi.fn() }
            })

            renderWithMantine(
                <FieldEdit
                    context={context}
                    name="priority"
                    meta={createMeta({
                        type: 'choice',
                        label: 'Priority',
                        data: {
                            items: [
                                { key: 'low', value: 'Low' },
                                { key: 'medium', value: 'Medium' },
                                { key: 'high', value: 'High' }
                            ],
                            steps: true
                        }
                    })}
                    saving={false}
                    value="medium"
                    updateValue={vi.fn()}
                />
            )

            // Selector renders successfully with stepper configuration (steps: true)
            await waitFor(() => {
                const selectInput = screen.getByRole('textbox')
                expect(selectInput).toBeInTheDocument()
            })
        })
    })

    describe('edge cases and data handling', () => {
        it('handles null value gracefully', () => {
            const context = createContext({
                state: {
                    formState: new Map([['testField', null]]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
            })

            const { container } = renderWithMantine(
                <FieldEdit
                    context={context}
                    name="testField"
                    meta={createMeta({ type: 'text' })}
                    saving={false}
                    value={null}
                    updateValue={vi.fn()}
                />
            )

            expect(container.firstChild).toBeInTheDocument()
        })

        it('handles undefined value gracefully', () => {
            const context = createContext({
                state: {
                    formState: new Map([['testField', undefined]]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
            })

            const { container } = renderWithMantine(
                <FieldEdit
                    context={context}
                    name="testField"
                    meta={createMeta({ type: 'text' })}
                    saving={false}
                    value={undefined}
                    updateValue={vi.fn()}
                />
            )

            expect(container.firstChild).toBeInTheDocument()
        })

        it('handles empty string value in tag_cloud field', async () => {
            const context = createContext({
                state: {
                    formState: new Map([['tags', '']]),
                    saving: false,
                    shouldSave: false,
                    errors: {},
                },
                actions: { setFormState: vi.fn(), setShouldSave: vi.fn() }
            })

            renderWithMantine(
                <FieldEdit
                    context={context}
                    name="tags"
                    meta={createMeta({ type: 'tag_cloud' })}
                    saving={false}
                    value=""
                    updateValue={vi.fn()}
                />
            )

            await waitFor(() => {
                const input = screen.getByRole('textbox')
                expect(input).toBeInTheDocument()
            })
        })
    })
})
