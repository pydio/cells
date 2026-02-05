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

import React, {useCallback} from 'react'
import {NumberInput} from '@mantine/core'
import {InputProps} from "./CommonInputProps";
import {LeftSectionMenu, NumberRangeModifiers} from "./SearchModifiers";

export const NumbersInputSearch: React.FC<InputProps> = ({label, description, placeholder, disabled, value, requestToggleClose, onChange, errorText}) => {
    const props = {
        label,
        value: value || '',
        disabled,
        error: errorText,
    }

    const simpleEnter = (event: React.KeyboardEvent) => {
        if(event.key === 'Enter'){
            onChange(value, true);
        }
    }

    // Decide for int or decimal
    const parser = parseFloat


    let searchComp = ''
    if (value && value.indexOf && ['<','>'].indexOf(value.charAt(0))>-1){
        searchComp = value.charAt(0)
        if(value.charAt(1) === "=") {
            searchComp += "="
            value = parser(value.substring(2))
        } else {
            value = parser(value.substring(1))
        }
    } else {
        value = parser(value)
    }

    const updateSearchComparator= useCallback((comp) => {
        onChange(comp+''+value, true);
    }, [value])

    const menu = <LeftSectionMenu items={NumberRangeModifiers} value={searchComp} onChange={updateSearchComparator}/>

    return (
            <NumberInput
                {...props}
                value={parser(value)}
                leftSection={menu}
                onChange={(v) => onChange(searchComp+''+v)}
                onKeyPress={simpleEnter}
                autoFocus={!!requestToggleClose}
                onBlur={() => requestToggleClose && requestToggleClose()}
                thousandSeparator=" "
                prefix="€"
                description={description}
                placeholder={placeholder}
            />
    )
}
