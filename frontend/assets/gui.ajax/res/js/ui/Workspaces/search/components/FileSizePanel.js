/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React from 'react';
import Pydio from 'pydio';
import {muiThemeable} from 'material-ui/styles';
import {chipsStyles} from "./AdvancedChipsStyles";

import {Button, Menu, NumberInput} from '@mantine/core'

const {PydioContextConsumer} = Pydio.requireLib('boot');

class SearchFileSizePanel extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            from:null,
            to: null,
            fromUnit: 'k',
            toUnit: 'k',
            ...this.propsToState(this.props)
        }
    }

    propsToState(pp) {
        const {values, name} = pp;
        const s = {}
        if(values[name] && values[name].from) {
            const {size, unit} = this.roundFileSize(values[name].from)
            s.fromInt = parseInt(values[name].from)
            s.from = size;
            s.fromUnit = unit || 'k'
        }
        if(values[name] && values[name].to) {
            const {size, unit} = this.roundFileSize(values[name].to)
            s.toInt = parseInt(values[name].to)
            s.to = size;
            s.toUnit = unit || 'k';
        }
        return s
    }

    update(data) {
        const {onChange, name} = this.props;
        const newState = {...this.propsToState(this.props), ...data}
        onChange({
            [name]: {
                from: Math.round(this.multiple(newState.from, newState.fromUnit)),
                to: Math.round(this.multiple(newState.to, newState.toUnit))
            }
        })
    }

    multiple(v, u){
        if(!v) {
            return 0
        }
        switch(u){
            case "k":
                return v * 1024;
            case "M":
                return v * 1024 * 1024;
            case "G":
                return v * 1024 * 1024 * 1024;
            case "T":
                return v * 1024 * 1024 * 1024 * 1024;
            default:
                return v
        }
    }

    roundFileSize(filesize){
        let size = filesize;
        let unit = ''
        if (filesize >= 1024 * 1024 * 1024 * 1024) {size=Math.round(filesize / (1024 * 1024 * 1024 * 1024) * 100) / 100; unit='T';}
        else if (filesize >= 1073741824) {size=Math.round(filesize / 1073741824 * 100) / 100; unit='G';}
        else if (filesize >= 1048576) {size = Math.round(filesize / 1048576 * 100) / 100; unit='M'}
        else if (filesize >= 1024) {size = Math.round(filesize / 1024 * 100) / 100; unit='k'}
        return {size, unit};
    }

    unitPicker(sizeUnit, value, onChange) {
        const items = [
            {value:'', label:sizeUnit},
            {value:'k', label:'k'+sizeUnit},
            {value:'M', label:'M'+sizeUnit},
            {value:'G', label:'G'+sizeUnit},
            {value:'T', label:'T'+sizeUnit},
        ]
        const current = items.find((i) => i.value === value) || items[0];

        return (
            <Menu withinPortal={false} zIndex={1000} position={'bottom-end'}>
                <Menu.Target>
                    <Button style={{padding:0, height:26, width:30, marginRight: 4}} variant={"filled"} size={"sm"}>{current.label}</Button>
                </Menu.Target>
                <Menu.Dropdown>
                    {items.map(item => (
                        <Menu.Item onClick={()=>onChange(item.value)}>{item.label}</Menu.Item>)
                    )}
                </Menu.Dropdown>
            </Menu>
        )
    }

    render() {
        const sizeUnit = Pydio.getMessages()['byte_unit_symbol'] || 'B';
        const {getMessage, mode} = this.props;
        let {from, to, fromUnit, toUnit, fromInt, toInt} = this.propsToState(this.props)
        let blockStyle={paddingTop:10};

        if(mode === 'popover') {
            blockStyle = {...blockStyle, ...chipsStyles({}).popoverBlockStyle}
        }

        const startUnitPicker = this.unitPicker(sizeUnit, fromUnit, (v) => {
            if(from && toInt && Math.round(this.multiple(to, v)) > toInt) {
                v = toUnit
            }
            this.update({fromUnit: v})
        });

        const endUnitPicker = this.unitPicker(sizeUnit, toUnit, (v) => {
            if(to && fromInt && Math.round(this.multiple(from, v)) < fromInt) {
                v = fromUnit
            }
            this.update({toUnit: v})
        });

        return (
            <div style={blockStyle}>
                <NumberInput
                    rightSection={from && startUnitPicker}
                    rightSectionWidth={30}
                    value={from || ''}
                    placeholder={getMessage(613)}
                    useDecimal={false}
                    clearable={true}
                    onChange={(v)=> {
                        if(v && toInt && Math.round(this.multiple(v, fromUnit)) > toInt) {
                            v = to
                        }
                        this.update({from:v || 0})
                    }}
                />
                <NumberInput
                    value={to || ''}
                    placeholder={getMessage(614)}
                    useDecimal={false}
                    clearable={true}
                    rightSection={to && endUnitPicker}
                    rightSectionWidth={30}
                    onChange={(v)=> {
                        if(v && fromInt && Math.round(this.multiple(v, toUnit)) < fromInt) {
                            v = from
                        }
                        this.update({to:v || 0})
                    }}
                />
            </div>
        );
    }
}

SearchFileSizePanel = PydioContextConsumer(muiThemeable()(SearchFileSizePanel));
export default SearchFileSizePanel