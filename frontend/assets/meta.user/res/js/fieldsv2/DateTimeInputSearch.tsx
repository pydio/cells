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
import {InputProps} from "./CommonInputProps";
import {DateTimePicker} from '@mantine/dates'
import {Button, Menu, PopoverProps} from "@mantine/core";

export const DateTimeInputSearch: React.FC<InputProps> = ({label, description, placeholder, required, disabled, value, onChange, requestToggleClose, errorText}) => {
    const props = {
        label,
        disabled,
        error: errorText,
        required: required,
    }

    const popoverProps : PopoverProps = {withinPortal: false}
    if(requestToggleClose && !disabled) {
        popoverProps.opened = true
        popoverProps.onClose= requestToggleClose
    }
    const fromTimestamp = (v:any):{vDate:Date,searchComp:string}|null => {
        let floatValue, searchComp;
        if (v && v.indexOf && ['<','>'].indexOf(v.charAt(0))>-1){
            searchComp = v.charAt(0)
            if(v.charAt(1) === "=") {
                searchComp += "="
                floatValue = parseFloat(v.substring(2))
            } else {
                floatValue = parseFloat(v.substring(1))
            }
        } else {
            floatValue = parseFloat(v)
        }
        const mDate = new Date(parseFloat(floatValue)*1000);
        if (isNaN(mDate.getTime())) {
            return {vDate: null, searchComp};
        } else {
            return {vDate: mDate, searchComp};
        }
    }

    const {vDate, searchComp} = fromTimestamp(value)

    const toTimestamp= useCallback((d:string|Date):string => {
        if(!d) {
            return ''
        }
        return new Date(d).getTime()/1000 + ''
    }, [searchComp])

    const updateSearchComparator= useCallback((comp) => {
        const ts = toTimestamp(vDate)
        if(!ts) {
            onChange('', true)
        } else {
            onChange(comp+''+ts, true);
        }
    }, [vDate])


    const menu = (
        <Menu withinPortal={false}>
            <Menu.Target>
                <Button style={{padding:0, height:26, width:26}} variant={"subtle"} size={"sm"}>{searchComp || '='}</Button>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item  onClick={() => updateSearchComparator('')}>=</Menu.Item>
                <Menu.Item onClick={() => updateSearchComparator('>=')}>&gt;=</Menu.Item>
                <Menu.Item onClick={() => updateSearchComparator('<=')}>&lt;=</Menu.Item>
                <Menu.Item onClick={() => updateSearchComparator('>')}>&gt;</Menu.Item>
                <Menu.Item onClick={() => updateSearchComparator('<')}>&lt;</Menu.Item>
            </Menu.Dropdown>
        </Menu>
    )


    return <DateTimePicker
        {...props}
        radius={"md"}
        value={vDate}
        leftSection={menu}
        onChange={(v) => {
            onChange(toTimestamp(v), true)
        }}
        description={description}
        placeholder={placeholder}
        autoFocus={!!requestToggleClose}
        popoverProps={popoverProps}
    />
}