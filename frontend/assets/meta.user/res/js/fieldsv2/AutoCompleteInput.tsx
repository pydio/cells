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

import React, { useEffect, useState } from 'react'
import { Autocomplete } from '@mantine/core'
import { StringItemsInputProps } from "./CommonInputProps";

/**
 * @param {TagsCloudInputProps} props
 */
export const AutoCompleteInput: React.FC<StringItemsInputProps> = ({
    name,
    label,
    description,
    placeholder,
    dataLoader,
    errorText,
    value,
    onCommitChange,
}) => {
    const [localValue, setLocalValue] = useState('');
    const [items, setItems] = useState<string[]>([]);

    React.useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const props = {
        label,
        description,
        placeholder,
        error: errorText,
    }

    useEffect(() => {
        if (dataLoader) {
            dataLoader().then(ss => setItems(ss));
        }
    }, [name])

    return <Autocomplete
        {...props}
        value={localValue}
        data={items}
        onChange={setLocalValue}
        comboboxProps={{ withinPortal: false }}
        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
            const { key, target } = e;
            const { value } = target;
            if(key === 'Enter'){
                onCommitChange(value);
            }
        }}
        onBlur={(e) => {
            onCommitChange(e.target.value);
        }}
    />
}
