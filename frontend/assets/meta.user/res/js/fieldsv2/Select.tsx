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
import {Select} from '@mantine/core'
import {ItemsInputProps, InputProps} from "./CommonInputProps";

interface RenderOptionProps {
    option: {
        value: string;
        label: string;
    };
    checked: boolean;
}

export interface SelectInputProps extends InputProps, ItemsInputProps {
    stepper?: boolean;
}

export const Selector: React.FC<SelectInputProps> = ({value, label, description, placeholder, onChange, items, requestToggleClose, errorText, disabled, stepper}) => {

    //const {data:{items=[], steps=false}} = meta;
    const handleColors = items.find(i => !!i.color)

    const renderOptions = useCallback(({option, checked}: RenderOptionProps) => {
        const item = items.find(i => i.key === option.value)
        if(item && item.color) {
            return <span><span className={"mdi mdi-label"} style={{color: item.color, marginRight:8, marginLeft:-3, fontSize:11}}/>{item.value}</span>
        }
    }, [items, value])

    const crtItem = items.find(i => i.key === value)

    let leftSection: React.ReactNode, rightSection: React.ReactNode
    if(handleColors && value) {
        if(crtItem && crtItem.color) {
            leftSection = <div className={"mdi mdi-label"} style={{color: crtItem.color, fontSize:11}}/>
        }
    }

    if(stepper){
        const pos = items.indexOf(crtItem!)
        if(pos > 0) {
            const prevLabel = items[pos-1].value
            leftSection = <div
                className={"mdi mdi-chevron-left"}
                style={{fontSize:11, cursor:"pointer"}}
                title={prevLabel}
                onClick={() => {onChange(items[pos-1].key, true)}}
            />
        }
        if(pos < items.length -1) {
            const nextLabel = items[pos+1].value
            rightSection = <div
                className={"mdi mdi-chevron-right"}
                style={{fontSize:11, cursor:"pointer"}}
                title={nextLabel}
                onClick={() => {onChange(items[pos+1].key, true)}}
            />
        }
    }


    return (
        <Select
            label={label}
            description={description}
            placeholder={placeholder}
            value={value}
            error={errorText}
            disabled={disabled}
            onChange={v => onChange(v, true)}
            data={items.map(i => {return {value: i.key, label: i.value}})}
            allowDeselect={false}
            leftSection={leftSection}
            leftSectionPointerEvents="all"
            rightSectionPointerEvents="all"
            rightSection={rightSection}
            comboboxProps={{ withinPortal: false }}
            styles={leftSection?{input:{paddingLeft: 30}}:undefined}
            renderOption={handleColors?renderOptions:undefined}
            onDropdownClose={requestToggleClose}
            onBlur={requestToggleClose}
        />
    )
}
