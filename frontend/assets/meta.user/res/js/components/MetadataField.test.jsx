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
import { MetadataField } from './MetadataField';

// Mock only the external dependencies that we need to avoid JS/JSX import issues
vi.mock('material-ui', () => ({
    Checkbox: function MockCheckbox({ checked, label, onCheck }) {
        return (
            <input
                type="checkbox"
                checked={checked}
                aria-label={label}
                onChange={() => onCheck && onCheck(null, !checked)}
                data-testid="checkbox"
            />
        );
    },
}));

// Mock child components with minimal implementation
vi.mock('./FieldEdit', () => ({
    FieldEdit: function MockFieldEdit({ shouldHideLabel, updateValue }) {
        return (
            <input
                type="text"
                aria-label={
                    shouldHideLabel ? 'Hidden field input' : 'Field input'
                }
                onChange={(e) => updateValue && updateValue(e.target.value)}
                data-testid="field-input"
            />
        );
    },
}));

vi.mock('./FieldDisplay', () => ({
    FieldDisplay: function MockFieldDisplay({ meta, value }) {
        return (
            <div>
                <span>{meta.label}: </span>
                <span>{value}</span>
            </div>
        );
    },
}));

/**
 * Render helper wraps components with MantineProvider for real rendering
 */
const renderWithMantine = (ui) => {
    return render(<MantineProvider>{ui}</MantineProvider>);
};

/**
 * Create mock metadata context
 */
const createContext = (overrides = {}) => {
    const formState = new Map([['testField', 'initialValue']]);

    return {
        state: {
            formState,
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
    };
};

/**
 * Create mock field metadata
 */
const createMeta = (overrides = {}) => ({
    type: 'text',
    readonly: false,
    required: false,
    label: 'Test Field',
    description: 'Test description',
    data: {},
    ...overrides,
});

describe('MetadataField Component', () => {
    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    describe('form state management for multiple fields', () => {
        it('removes unchecked multiple fields from form state', () => {
            const formState = new Map([['testField', 'initialValue']]);
            const deleteMock = vi.fn().mockReturnValue(true);
            formState.delete = deleteMock;

            const setFormState = vi.fn();
            const context = createContext({
                state: { formState },
                actions: { setFormState },
            });

            renderWithMantine(
                <MetadataField
                    context={context}
                    fieldKey="testField"
                    meta={createMeta()}
                    node={null}
                    editMode={true}
                    multiple={true}
                    checked={false}
                    value="initialValue"
                    updateValue={vi.fn()}
                    onCheck={vi.fn()}
                    configsForGroup={{}}
                    supportTemplates={false}
                    additionalProps={{}}
                />,
            );

            // The useEffect should call formState.delete and setFormState
            expect(deleteMock).toHaveBeenCalledWith('testField');
            expect(setFormState).toHaveBeenCalledWith(formState);
        });

        it('keeps checked multiple fields in form state', () => {
            const formState = new Map([['testField', 'initialValue']]);
            const deleteMock = vi.fn().mockReturnValue(true);
            formState.delete = deleteMock;

            const setFormState = vi.fn();
            const context = createContext({
                state: { formState },
                actions: { setFormState },
            });

            renderWithMantine(
                <MetadataField
                    context={context}
                    fieldKey="testField"
                    meta={createMeta()}
                    node={null}
                    editMode={true}
                    multiple={true}
                    checked={true}
                    value="initialValue"
                    updateValue={vi.fn()}
                    onCheck={vi.fn()}
                    configsForGroup={{}}
                    supportTemplates={false}
                    additionalProps={{}}
                />,
            );

            // The useEffect should NOT call formState.delete or setFormState
            expect(deleteMock).not.toHaveBeenCalled();
            expect(setFormState).not.toHaveBeenCalled();
        });

        it('does not modify form state for single fields', () => {
            const formState = new Map([['testField', 'initialValue']]);
            const deleteMock = vi.fn().mockReturnValue(true);
            formState.delete = deleteMock;

            const setFormState = vi.fn();
            const context = createContext({
                state: { formState },
                actions: { setFormState },
            });

            renderWithMantine(
                <MetadataField
                    context={context}
                    fieldKey="testField"
                    meta={createMeta()}
                    node={null}
                    editMode={true}
                    multiple={false}
                    checked={false}
                    value="initialValue"
                    updateValue={vi.fn()}
                    onCheck={vi.fn()}
                    configsForGroup={{}}
                    supportTemplates={false}
                    additionalProps={{}}
                />,
            );

            // The useEffect should NOT call formState.delete or setFormState
            expect(deleteMock).not.toHaveBeenCalled();
            expect(setFormState).not.toHaveBeenCalled();
        });

        it('does not update form state when no field is removed', () => {
            const formState = new Map([['testField', 'initialValue']]);
            const deleteMock = vi.fn().mockReturnValue(false); // Returns false (nothing deleted)
            formState.delete = deleteMock;

            const setFormState = vi.fn();
            const context = createContext({
                state: { formState },
                actions: { setFormState },
            });

            renderWithMantine(
                <MetadataField
                    context={context}
                    fieldKey="testField"
                    meta={createMeta()}
                    node={null}
                    editMode={true}
                    multiple={true}
                    checked={false}
                    value="initialValue"
                    updateValue={vi.fn()}
                    onCheck={vi.fn()}
                    configsForGroup={{}}
                    supportTemplates={false}
                    additionalProps={{}}
                />,
            );

            // delete should be called but setFormState should not
            expect(deleteMock).toHaveBeenCalledWith('testField');
            expect(setFormState).not.toHaveBeenCalled();
        });

        it('reacts to changes in field selection state', () => {
            const formState = new Map([['testField', 'initialValue']]);
            const deleteMock = vi.fn().mockReturnValue(true);
            formState.delete = deleteMock;

            const setFormState = vi.fn();
            const context = createContext({
                state: { formState },
                actions: { setFormState },
            });

            const { rerender } = renderWithMantine(
                <MetadataField
                    context={context}
                    fieldKey="testField"
                    meta={createMeta()}
                    node={null}
                    editMode={true}
                    multiple={true}
                    checked={true}
                    value="initialValue"
                    updateValue={vi.fn()}
                    onCheck={vi.fn()}
                    configsForGroup={{}}
                    supportTemplates={false}
                    additionalProps={{}}
                />,
            );

            // Initially, effect should not trigger (checked is true)
            expect(deleteMock).not.toHaveBeenCalled();
            expect(setFormState).not.toHaveBeenCalled();

            // Rerender with checked=false should trigger the effect
            rerender(
                <MetadataField
                    context={context}
                    fieldKey="testField"
                    meta={createMeta()}
                    node={null}
                    editMode={true}
                    multiple={true}
                    checked={false}
                    value="initialValue"
                    updateValue={vi.fn()}
                    onCheck={vi.fn()}
                    configsForGroup={{}}
                    supportTemplates={false}
                    additionalProps={{}}
                />,
            );

            // Now the effect should trigger
            expect(deleteMock).toHaveBeenCalledWith('testField');
            expect(setFormState).toHaveBeenCalledWith(formState);
        });
    });

    describe('edit mode behavior', () => {
        it('displays editable field for single field entry', () => {
            const context = createContext();

            renderWithMantine(
                <MetadataField
                    context={context}
                    fieldKey="testField"
                    meta={createMeta()}
                    node={null}
                    editMode={true}
                    multiple={false}
                    checked={false}
                    value="testValue"
                    updateValue={vi.fn()}
                    onCheck={vi.fn()}
                    configsForGroup={{}}
                    supportTemplates={false}
                    additionalProps={{}}
                />,
            );

            expect(screen.getByLabelText('Field input')).toBeInTheDocument();
            expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
        });

        it('shows checkbox with editable field when field is selected', () => {
            const context = createContext();

            renderWithMantine(
                <MetadataField
                    context={context}
                    fieldKey="testField"
                    meta={createMeta({ label: 'Test Label' })}
                    node={null}
                    editMode={true}
                    multiple={true}
                    checked={true}
                    value="testValue"
                    updateValue={vi.fn()}
                    onCheck={vi.fn()}
                    configsForGroup={{}}
                    supportTemplates={false}
                    additionalProps={{}}
                />,
            );

            expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
            expect(
                screen.getByLabelText('Hidden field input'),
            ).toBeInTheDocument();
        });

        it('hides input when multiple field is not selected', () => {
            const context = createContext();

            renderWithMantine(
                <MetadataField
                    context={context}
                    fieldKey="testField"
                    meta={createMeta({ label: 'Test Label' })}
                    node={null}
                    editMode={true}
                    multiple={true}
                    checked={false}
                    value="testValue"
                    updateValue={vi.fn()}
                    onCheck={vi.fn()}
                    configsForGroup={{}}
                    supportTemplates={false}
                    additionalProps={{}}
                />,
            );

            expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
            // Input should not be visible when checkbox is not checked
            expect(
                screen.queryByLabelText('Hidden field input'),
            ).not.toBeInTheDocument();
        });

        it('renders edit input with correct configuration', () => {
            const updateValue = vi.fn();
            const context = createContext();

            renderWithMantine(
                <MetadataField
                    context={context}
                    fieldKey="testField"
                    meta={createMeta()}
                    node={null}
                    editMode={true}
                    multiple={false}
                    checked={false}
                    value="testValue"
                    updateValue={updateValue}
                    onCheck={vi.fn()}
                    configsForGroup={{ someConfig: true }}
                    supportTemplates={true}
                    additionalProps={{ customProp: 'value' }}
                />,
            );

            // Check that the input field is rendered
            expect(screen.getByLabelText('Field input')).toBeInTheDocument();
        });

        it('uses hidden label styling for multiple field inputs', () => {
            const context = createContext();

            renderWithMantine(
                <MetadataField
                    context={context}
                    fieldKey="testField"
                    meta={createMeta()}
                    node={null}
                    editMode={true}
                    multiple={true}
                    checked={true}
                    value="testValue"
                    updateValue={vi.fn()}
                    onCheck={vi.fn()}
                    configsForGroup={{}}
                    supportTemplates={false}
                    additionalProps={{}}
                />,
            );

            expect(
                screen.getByLabelText('Hidden field input'),
            ).toBeInTheDocument();
        });
    });

    describe('display mode behavior', () => {
        it('shows field value in read-only format', () => {
            const context = createContext();

            renderWithMantine(
                <MetadataField
                    context={context}
                    fieldKey="testField"
                    meta={createMeta({ label: 'Display Label' })}
                    node={null}
                    editMode={false}
                    multiple={false}
                    checked={false}
                    value="displayValue"
                    updateValue={vi.fn()}
                    onCheck={vi.fn()}
                    configsForGroup={{}}
                    supportTemplates={false}
                    additionalProps={{}}
                />,
            );

            expect(screen.getByText('Display Label:')).toBeInTheDocument();
            expect(screen.getByText('displayValue')).toBeInTheDocument();
        });

        it('hides checkbox in display mode even for multiple fields', () => {
            const context = createContext();

            renderWithMantine(
                <MetadataField
                    context={context}
                    fieldKey="testField"
                    meta={createMeta()}
                    node={null}
                    editMode={false}
                    multiple={true}
                    checked={true}
                    value="displayValue"
                    updateValue={vi.fn()}
                    onCheck={vi.fn()}
                    configsForGroup={{}}
                    supportTemplates={false}
                    additionalProps={{}}
                />,
            );

            expect(screen.getByText('Test Field:')).toBeInTheDocument();
            expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
        });
    });

    describe('user interactions', () => {
        it('toggles field selection when checkbox is clicked', () => {
            const onCheck = vi.fn();
            const context = createContext();

            renderWithMantine(
                <MetadataField
                    context={context}
                    fieldKey="testField"
                    meta={createMeta()}
                    node={null}
                    editMode={true}
                    multiple={true}
                    checked={false}
                    value="testValue"
                    updateValue={vi.fn()}
                    onCheck={onCheck}
                    configsForGroup={{}}
                    supportTemplates={false}
                    additionalProps={{}}
                />,
            );

            const checkbox = screen.getByLabelText('Test Field');
            fireEvent.click(checkbox);

            expect(onCheck).toHaveBeenCalledWith('testField', true);
        });
    });
});
