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

import React, {useEffect, useState} from 'react'
import {TagsInput} from '@mantine/core'
import {StringItemsInputProps} from "./CommonInputProps";

export const TagsCloudInput: React.FC<StringItemsInputProps> = ({name, label, description, placeholder, disabled, value, onChange, data, dataLoader, requestToggleClose, errorText}) => {

    const [items, setItems] = useState<string[]>(data);

    const props = {
        label,
        disabled,
        description,
        placeholder,
        error: errorText,
    }

    useEffect(()=>{
        if(dataLoader) {
            dataLoader().then(ss => setItems(ss));
        }
    }, [name])

    const valueData= value ? value.split(',') : []
    const onChangeJoin = (values: string[]) => {
        onChange(values.join(','), true)
    }

    return <TagsInput
        {...props}
        value={valueData}
        data={items}
        onChange={onChangeJoin}
        comboboxProps={{withinPortal: false}}
        autoFocus={!!requestToggleClose}
        onBlur={requestToggleClose}
    />
 }