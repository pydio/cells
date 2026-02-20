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
import { TagsInput } from '@mantine/core';
import { StringItemsInputProps } from './CommonInputProps';
import { parseTagsValue, formatTagsArrayToString } from '../utils/mapTags';

/**
 * @typedef {Object} TagsCloudInputProps
 * @property {string} name
 * @property {string} label
 * @property {string} description
 * @property {string} placeholder
 * @property {boolean} disabled
 * @property {function} dataLoader
 * @property {boolean} requestToggleClose
 * @property {string} errorText
 * @property {string} value
 * @property {function} onCommitChange
 */

/**
 * @param {TagsCloudInputProps} props
 */
export const TagsCloudInput: React.FC<StringItemsInputProps> = ({
    name,
    label,
    required,
    description,
    placeholder,
    disabled,
    dataLoader,
    errorText,
    value,
    onCommitChange,
}) => {
    const [localValue, setLocalValue] = useState([]);
    const [items, setItems] = useState<string[]>([]);

    React.useEffect(() => {
        setLocalValue(parseTagsValue(value));
    }, [value]);

    const props = {
        label,
        description,
        placeholder,
        error: errorText,
        required,
    };

    useEffect(() => {
        if (dataLoader) {
            dataLoader().then((ss) => setItems(ss));
        }
    }, [name]);

    const onChangeJoin = (values: string[]) => {
        setLocalValue(values.filter((v) => v));
        onCommitChange(formatTagsArrayToString(values));
    };

    return (
        <TagsInput
            {...props}
            value={localValue}
            data={items}
            onChange={onChangeJoin}
            comboboxProps={{ withinPortal: false }}
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                const { key } = e;
                const value = (e.target as HTMLInputElement).value;
                if (key === 'Enter') {
                    onCommitChange(
                        formatTagsArrayToString([...localValue, value]),
                    );
                }
                if (key === ',') {
                    onCommitChange(
                        formatTagsArrayToString([...localValue, value]),
                    );
                }
            }}
            onBlur={(e) => {
                const value = (e.target as HTMLInputElement).value;
                    onCommitChange(
                        formatTagsArrayToString([...localValue, value]),
                    );
            }}
        />
    );
};
