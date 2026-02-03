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
import { TagsInput } from '@mantine/core'
import { StringItemsInputProps } from "./CommonInputProps";

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

const formatValueStringToArray = (value: string) => {
    return (value || '').split(',').filter((tag) => tag.trim());
}

const formatValueArrayToString = (value: string[]) => {
    return value.filter(v => v).join(',')
}

/**
 * @param {TagsCloudInputProps} props
 */
export const TagsCloudInput: React.FC<StringItemsInputProps> = ({
    name,
    label,
    description,
    placeholder,
    disabled,
    dataLoader,
    requestToggleClose,
    errorText,
    value,
    onCommitChange,
}) => {

    const [localValue, setLocalValue] = useState(formatValueStringToArray(value));
    const [items, setItems] = useState<string[]>([]);

    const props = {
        label,
        disabled: disabled,
        description,
        placeholder,
        error: errorText,
    }

    useEffect(() => {
        if (dataLoader) {
            dataLoader().then(ss => setItems(ss));
        }
    }, [name])

    const onChangeJoin = (values: string[]) => {
        if(values.length > 0 ) {
            const joined = values.join(',')
            setLocalValue(joined.split(',').filter(v => v))
        } else {
            setLocalValue([])
        }
    }

    return <TagsInput
        {...props}
        value={localValue}
        data={items}
        onChange={onChangeJoin}
        comboboxProps={{ withinPortal: false }}
        autoFocus={!!requestToggleClose}
        onBlur={(e) => {
            const { value } = e.target;
            onCommitChange(formatValueArrayToString([...localValue, value]));
        }}
    />
}
