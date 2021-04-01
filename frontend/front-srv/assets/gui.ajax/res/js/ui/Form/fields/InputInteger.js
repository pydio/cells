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

import React from 'react'
import Pydio from 'pydio'
import asFormField from "../hoc/asFormField";
const {ModernTextField} = Pydio.requireLib('hoc');


/**
 * Text input that is converted to integer, and
 * the UI can react to arrows for incrementing/decrementing values
 */
class InputInteger extends React.Component{

    keyDown(event){
        let inc = 0, multiple=1;
        if(event.key === 'Enter'){
            this.props.toggleEditMode();
            return;
        }else if(event.key === 'ArrowUp'){
            inc = +1;
        }else if(event.key === 'ArrowDown'){
            inc = -1;
        }
        if(event.shiftKey){
            multiple = 10;
        }
        let parsed = parseInt(this.props.value);
        if(isNaN(parsed)) {
            parsed = 0;
        }
        const value = parsed + (inc * multiple);
        this.props.onChange(null, value);
    }

    render(){
        const {value, isDisplayGrid, isDisplayForm, editMode, disabled, toggleEditMode, attributes, variant} = this.props;
        if(isDisplayGrid() && !editMode){
            return <div onClick={disabled?function(){}:toggleEditMode} className={value?'':'paramValue-empty'}>{value ? value : 'Empty'}</div>;
        }else{
            let intval;
            if(value){
                intval = parseInt(value) + '';
                if(isNaN(intval)) {
                    intval = value + '';
                }
            }else{
                intval = '0';
            }
            return(
                <span className="integer-input">
                    <ModernTextField
                        value={intval}
                        onChange={(e,v)=> this.props.onChange(e,v)}
                        onKeyDown={(e) => this.keyDown(e)}
                        disabled={disabled}
                        fullWidth={true}
                        variant={variant}
                        hintText={isDisplayForm()?attributes.label:null}
                    />
                </span>
            );
        }
    }

}

export default asFormField(InputInteger);