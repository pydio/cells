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

import React, { useEffect, useState } from 'react';
import { TagsInput, MultiSelect } from '@mantine/core';
import { StringItemsInputProps } from './CommonInputProps';
import {
    parseTagsValue as parseCSLtoArray,
    formatTagsArrayToString,
} from '../utils/mapTags';

/**
 * @typedef {Object} TagsCloudInputProps
 * @property {string} name
 * @property {string} label
 * @property {string} description
 * @property {string} placeholder
 * @property {boolean} disabled
 * @property {function} dataLoader
 * @property {string} errorText
 * @property {string} value
 * @property {function} onCommitChange
 * @property {boolean} onlyValuesFromList
 * @property {string} ariaLabel
 * @property {boolean} clearable
 * @property {string} clearAriaLabel
 * @property {boolean} readOnly
 * @property {function} onFocus
 * @property {function} onBlur
 */

type TagsCloudInputProps = StringItemsInputProps & {
    onlyValuesFromList?: boolean;

    /** Forwarded to Mantine TagsInput as aria-label.
     *  Required for screen readers when no visible label is rendered.
     *  When label is set this is not needed but is still forwarded. */
    ariaLabel?: string;
    /** Allow the user to clear all tags with a single button.
     *  When set, provide clearAriaLabel so the button is announced correctly. */
    clearable?: boolean;
    /** aria-label for the clear button; only relevant when clearable is true. */
    clearAriaLabel?: string;
    /** Makes the input non-interactive without dimming it visually.
     *  Use instead of disabled when the value should still be readable. */
    readOnly?: boolean;

    /** When true, renders a MultiSelect restricted to entity-backed values.
     *  Derived from the entity's PoliciesContextEditable field. */
    editableValues?: boolean;
};

/**
 * @param {TagsCloudInputProps} props
 */
export const TagsCloudInput: React.FC<TagsCloudInputProps> = ({
    name,
    label,
    required,
    description,
    placeholder,
    disabled,
    readOnly,
    dataLoader,
    errorText,
    value,
    onlyValuesFromList,
    editableValues,
    ariaLabel,
    clearable,
    clearAriaLabel,
    onCommitChange,
    onFocus,
    onBlur,
}) => {
    const [localValue, setLocalValue] = useState(parseCSLtoArray(value));
    const [items, setItems] = useState<string[]>([]);

    const props = {
        label,
        description,
        placeholder,
        error: errorText,
        required,
        // aria-label is announced by screen readers when no visible label is
        // rendered. Mantine wires this onto the underlying <input> element.
        'aria-label': ariaLabel,
    };

    useEffect(() => {
        setLocalValue(parseCSLtoArray(value));
    }, [value]);

    useEffect(() => {
        if (dataLoader) {
            dataLoader().then((ss) => setItems(ss));
        }
    }, [name]);

    const onChangeJoin = (values: string[]) => {
        setLocalValue(values.filter((v) => v));
        onCommitChange(formatTagsArrayToString(values));
    };

    if (editableValues) {
        return (
            <MultiSelect
                {...props}
                value={localValue}
                data={items}
                onFocus={onFocus}
                onChange={onChangeJoin}
                disabled={disabled}
                comboboxProps={{ withinPortal: false }}
                searchable
                onBlur={(e) => {
                    if (onBlur) {
                        onBlur(e);
                    }
                }}
            />
        );
    }

    return (
        <TagsInput
            {...props}
            value={localValue}
            data={items}
            onFocus={onFocus}
            onChange={onChangeJoin}
            disabled={disabled}
            readOnly={readOnly}
            clearable={clearable}
            clearButtonProps={clearAriaLabel ? { 'aria-label': clearAriaLabel } : undefined}
            comboboxProps={{ withinPortal: false }}
            splitChars={onlyValuesFromList ? [''] : undefined}
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                const { key, target } = e;
                const { value } = target;

                if (key === 'Enter' || key === ',') {
                    if (onlyValuesFromList && !items.includes(value)) return;

                    onCommitChange(
                        formatTagsArrayToString([...localValue, value]),
                    );
                }
            }}
            onBlur={(e) => {
                const { value } = e.target;

                if (onlyValuesFromList && !items.includes(value)) return;

                onCommitChange(formatTagsArrayToString([...localValue, value]));

                if (onBlur) {
                    onBlur(e);
                }
            }}
        />
    );
};
