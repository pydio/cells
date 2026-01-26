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
import {TextInput} from '@mantine/core'
import {InputProps} from "./CommonInputProps";

export const URLInput: React.FC<InputProps> = ({label, description, placeholder, disabled, value, onChange, requestToggleClose, errorText}) => {
    const props = {
        label,
        description,
        placeholder,
        value,
        disabled,
        error: errorText,
    }
    const onChangeEvent = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value)
    const simpleEnter = (event: React.KeyboardEvent) => {
        if(event.key === 'Enter'){
            onChange(value, true);
        }
    }

    return <TextInput
        {...props}
        onChange={onChangeEvent}
        onKeyPress={simpleEnter}
        rightSection={<span className={'mdi mdi-open-in-new'}/>}
        autoFocus={!!requestToggleClose}
        onBlur={requestToggleClose}
    />
 }