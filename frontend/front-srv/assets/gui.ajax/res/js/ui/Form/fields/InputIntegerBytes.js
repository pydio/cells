/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import Pydio from 'pydio';
import asFormField from "../hoc/asFormField";
const {ModernTextField, ModernSelectField} = Pydio.requireLib('hoc');
import {MenuItem} from 'material-ui'

class InputIntegerBytes extends React.Component{

    divide(initialValue) {
        // Find lowest unit
        const uu = ["k", "M", "G", "T", "P"];
        let res = {bytesValue: initialValue, unit: ''};
        for (let i=0;i<uu.length;i++) {
            const check = this.multiple(1, uu[i]);
            if(initialValue >= check && initialValue % check === 0){
                res = {bytesValue: initialValue / check, unit: uu[i]};
            }
        }
        return res;
    }

    multiple(v, u){
        const iV = parseFloat(v);
        switch(u){
            case "k":
                return iV * 1024;
            case "M":
                return iV * 1024 * 1024;
            case "G":
                return iV * 1024 * 1024 * 1024;
            case "T":
                return iV * 1024 * 1024 * 1024 * 1024;
            case "P":
                return iV * 1024 * 1024 * 1024 * 1024 * 1024;
            default:
                return iV
        }
    }

    render() {
        const sizeUnit = Pydio.getMessages()['byte_unit_symbol'] || 'B';
        const {value, onChange, isDisplayGrid, isDisplayForm, editMode, disabled, toggleEditMode, attributes, variant} = this.props;

        let bytesValue = 0, unit = '';
        if(value){
            const {bytesValue:b, unit:u} = this.divide(parseInt(value))
            bytesValue = b
            unit = u
        }

        if(isDisplayGrid() && !editMode) {
            return <div onClick={disabled?function(){}:toggleEditMode} className={value?'':'paramValue-empty'}>{value ? bytesValue + unit + sizeUnit : 'Empty'}</div>;
        }
        return (
            <div>
                <div style={{display:'flex', height:variant==='v2'?66:null}}>
                    <ModernTextField
                        value={bytesValue}
                        hintText={isDisplayForm()?attributes.label:null}
                        style={{flex: 2}}
                        type={"number"}
                        variant={variant}
                        hasRightBlock={true}
                        disabled={disabled}
                        onChange={(e,v) => {
                            const bv = Math.max(0, v) || 0;
                            onChange(e, this.multiple(bv, unit));
                        }}
                    />
                    <ModernSelectField
                        value={unit||'b'}
                        variant={variant}
                        hintText={"Unit"}
                        hasLeftBlock={true}
                        disabled={disabled}
                        onChange={(e,i,v) => {
                            onChange(e, this.multiple(bytesValue, v));
                        }}
                        style={{flex: 1}}
                    >
                        <MenuItem value={'b'} primaryText={sizeUnit}/>
                        <MenuItem value={'k'} primaryText={'K' + sizeUnit}/>
                        <MenuItem value={'M'} primaryText={'M' + sizeUnit}/>
                        <MenuItem value={'G'} primaryText={'G' + sizeUnit}/>
                        <MenuItem value={'T'} primaryText={'T' + sizeUnit}/>
                        <MenuItem value={'P'} primaryText={'P' + sizeUnit}/>
                    </ModernSelectField>
                </div>
            </div>
        );
    }

}

export default asFormField(InputIntegerBytes);