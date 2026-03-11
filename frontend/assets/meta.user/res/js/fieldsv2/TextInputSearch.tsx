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
import {TextInput as MTextInput, Textarea, JsonInput} from '@mantine/core'
import {InputProps} from "./CommonInputProps";
import {LeftSectionMenu, TextSearchModifiers} from "./SearchModifiers";

export const TextInputSearch: React.FC<InputProps> = ({
    name,
    label,
    description,
    placeholder,
    disabled,
    value,
    onChange,
    errorText
}) => {
    const props = {
        label,
        description,
        placeholder,
        value:value||'',
        disabled,
        error: errorText,
    }

    const applyModifier = useCallback((m:string, t:string):string => {
        if(!t) {
            return ''
        }
        switch (m) {
            case '*':
                return t+'*'
            case '**':
                return '*' + t + '*'
            default:
                return t;
        }
    }, [])

    const parseModifier = useCallback((input:string):{m:string, t:string} => {
        if(!input) {
            return {m:'', t:''};
        }
        const startsWithWildcard = input.indexOf('*') === 0
        const endsWithWildcard = input.lastIndexOf('*') === input.length-1
        if(endsWithWildcard && !startsWithWildcard) {
            return {m:'*', t:input.substring(0, input.length-1)};
        } else if(startsWithWildcard && endsWithWildcard) {
            return {m:'**', t:input.substring(1, input.length-1)};
        } else {
            return {m:'', t:input};
        }
    }, [])

    let {m, t} = parseModifier(value)

    const onChangeEvent = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange(applyModifier(m, e.target.value), {debounced: true})
    }, [m, name, onChange])

    const simpleEnter = useCallback((event: React.KeyboardEvent) => {
        if(event.key === 'Enter'){
            onChange(value);
        }
    }, [value, onChange])

    // Do not switch on type for json/textarea case, we always render a TextInput here

    return <MTextInput
        {...props}
        value={t}
        leftSection={<LeftSectionMenu
            items={TextSearchModifiers}
            value={m}
            onChange={(m) => onChange(applyModifier(m, t))}
        />}
        onChange={onChangeEvent}
        onKeyPress={simpleEnter}
    />
}
