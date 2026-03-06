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
import {NumberInput} from '@mantine/core'
import {InputProps} from "./CommonInputProps";
import {NumberRangeModifiers} from "./SearchModifiers";
import {RangeSearchModifierInput} from "./SearchModifierInput";

export const NumbersInputSearch: React.FC<InputProps> = ({label, description, placeholder, disabled, value, onChange, errorText}) => {
    const simpleEnter = (event: React.KeyboardEvent) => {
        if(event.key === 'Enter'){
            event.currentTarget.blur();
        }
    }

    return (
        <RangeSearchModifierInput
            value={value}
            onChange={onChange}
            items={NumberRangeModifiers}
        >
            {({text, leftSection, onTextChange}) => (
                <NumberInput
                    label={label}
                    value={text === '' ? '' : parseFloat(text) || ''}
                    disabled={disabled}
                    error={errorText}
                    leftSection={leftSection}
                    onChange={(v) => onTextChange(v === '' ? '' : v?.toString() || '')}
                    onKeyPress={simpleEnter}
                    description={description}
                    placeholder={placeholder}
                />
            )}
        </RangeSearchModifierInput>
    )
}
