import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FieldSearch } from './FieldSearch';

vi.mock('../fieldsv2/TextInputSearch', () => ({
    TextInputSearch: ({ onChange }) => (
        <div>
            <button onClick={() => onChange('typed-value', { debounced: true })}>
                type
            </button>
            <button onClick={() => onChange('submitted-value')}>submit</button>
        </div>
    ),
}));

describe('FieldSearch', () => {
    afterEach(() => {
        cleanup();
    });
    const meta = {
        type: 'string',
        readonly: false,
        required: false,
        errorText: '',
        label: 'Label',
        data: {},
    } as any;

    it('forwards debounced options from text input changes', () => {
        const updateValue = vi.fn();

        render(
            <FieldSearch
                name="my-field"
                meta={meta}
                value=""
                updateValue={updateValue}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'type' }));

        expect(updateValue).toHaveBeenCalledWith('my-field', 'typed-value', {
            debounced: true,
        });
    });

    it('keeps submit updates immediate by default', () => {
        const updateValue = vi.fn();

        render(
            <FieldSearch
                name="my-field"
                meta={meta}
                value=""
                updateValue={updateValue}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'submit' }));

        expect(updateValue).toHaveBeenCalledWith(
            'my-field',
            'submitted-value',
            undefined,
        );
    });
});
