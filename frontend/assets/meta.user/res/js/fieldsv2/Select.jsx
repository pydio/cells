/*
 * Copyright 2026 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

export const Selector = ({fieldname, value, label, onValueChange, errorText, search, meta, mode}) => {

    const {data:{items=[], steps=false}} = meta;
    const handleColors = items.find(i => !!i.color)

    const renderOptions = useCallback(({option, checked}) => {
        const item = items.find(i => i.key === option.value)
        if(item && item.color) {
            return <span><span className={"mdi mdi-label"} style={{color: item.color, marginRight:8, marginLeft:-3, fontSize:11}}/>{item.value}</span>
        }
    }, [items])

    const crtItem = items.find(i => i.key === value)

    let leftSection, rightSection
    if(handleColors && value) {
        if(crtItem && crtItem.color) {
            leftSection = <div className={"mdi mdi-label"} style={{color: crtItem.color, fontSize:11}}/>
        }
    }

    if(steps && !search){
        const pos = items.indexOf(crtItem)
        if(pos > 0) {
            const prevLabel = items[pos-1].value
            leftSection = <div
                className={"mdi mdi-chevron-left"}
                style={{fontSize:11, cursor:"pointer"}}
                title={prevLabel}
                onClick={() => {onValueChange(fieldname, items[pos-1].key, true)}}
            />
        }
        if(pos < items.length -1) {
            const nextLabel = items[pos+1].value
            rightSection = <div
                className={"mdi mdi-chevron-right"}
                style={{fontSize:11, cursor:"pointer"}}
                title={nextLabel}
                onClick={() => {onValueChange(fieldname, items[pos+1].key, true)}}
            />
        }
    }


    return (
        <Select
            label={label}
            value={value}
            error={errorText}
            onChange={v => onValueChange(fieldname, v, true)}
            data={items.map(i => {return {value: i.key, label: i.value}})}
            leftSection={leftSection}
            leftSectionPointerEvents="pointerEvents"
            rightSectionPointerEvents="pointerEvents"
            rightSection={rightSection}
            styles={leftSection?{input:{paddingLeft: 30}}:null}
            renderOption={handleColors?renderOptions:null}
        />
    )
    /*
        return (
            <div style={{display:'flex'}}>
                {steps && !search &&
                <div style={{...fillBlockV2Left, marginRight: 2, padding: '2px 4px'}}>
                    <IconButton
                        iconClassName={"mdi mdi-chevron-left"}
                        disabled={!prevLabel}
                        tooltip={prevLabel}
                        tooltipPosition={"bottom-right"}
                        onClick={()=>updateValue(keys[keys.indexOf(value)-1], true)}
                        style={{width: 28, padding:'12px 0'}}
                    />
                </div>
                }
                <div style={{flex:1}}>
                    <ModernSelectField
                        fullWidth={true}
                        value={value}
                        hintText={label}
                        errorText={errorText}
                        onChange={this.changeSelector.bind(this)}
                        {...selectProps}
                    >{menuItems}</ModernSelectField>
                </div>
                {steps && !search &&
                <div style={{...fillBlockV2Right, marginLeft: 2, padding: '2px 4px'}}>
                    <IconButton
                        iconClassName={"mdi mdi-chevron-right"}
                        tooltip={nextLabel}
                        disabled={!nextLabel}
                        tooltipPosition={"bottom-left"}
                        onClick={()=>updateValue(keys[keys.indexOf(value)+1], true)}
                        style={{width: 28, padding:'12px 0'}}
                    />
                </div>
                }
            </div>
        );*/

}