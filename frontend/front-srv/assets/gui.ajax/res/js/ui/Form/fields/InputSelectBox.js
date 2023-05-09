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

import asFormField from "../hoc/asFormField";
import React, {Fragment} from 'react'
const {MenuItem, Chip} = require('material-ui')
const LangUtils = require('pydio/util/lang')
import withChoices from '../hoc/withChoices'
import Pydio from 'pydio'
const {ModernSelectField} = Pydio.requireLib('hoc');

/**
 * Select box input conforming to Pydio standard form parameter.
 */
class InputSelectBox extends React.Component{

    onDropDownChange(event, index, value){
        this.props.onChange(event, value);
        this.props.toggleEditMode();
    }

    onMultipleSelect(event, index, newValue){
        if(newValue === -1) {
            return;
        }
        const currentValue = this.props.value;
        let currentValues = (typeof currentValue === 'string' ? currentValue.split(',') : currentValue);
        if(currentValues.indexOf(newValue) === -1){
            currentValues.push(newValue);
            this.props.onChange(event, currentValues.join(','));
        }
        this.props.toggleEditMode();
    }

    onMultipleRemove(value){
        const currentValue = this.props.value;
        let currentValues = (typeof currentValue === 'string' ? currentValue.split(',') : currentValue);
        if(currentValues.indexOf(value) !== -1 ){
            currentValues = LangUtils.arrayWithout(currentValues, currentValues.indexOf(value));
            this.props.onChange(null, currentValues.join(','));
        }
    }

    render(){
        let currentValue = this.props.value;
        let menuItems = [];
        const {attributes, isDisplayGrid, toggleEditMode, editMode, disabled, multiple, className, variant} = this.props;
        if(!attributes['mandatory'] || attributes['mandatory'] !== "true"){
            menuItems.push(<MenuItem value={-1} primaryText={<Fragment>{attributes['label']}{"..."}</Fragment>}/>);
        }
        const {choices} = this.props;
        choices.forEach(function(value, key){
            menuItems.push(<MenuItem value={key} primaryText={value}/>);
        });
        if(isDisplayGrid() && !editMode){
            let value = this.props.value;
            if(choices.get(value)) {
                value = choices.get(value);
            }
            return (
                <div
                    onClick={disabled?function(){}:toggleEditMode}
                    className={value?'':'paramValue-empty'}>
                    {value ? value : 'Empty'} &nbsp;&nbsp;<span className="mdi mdi-chevron-down"></span>
                </div>
            );
        } else {
            if(multiple && multiple === true){
                let currentValues = currentValue;
                if(typeof currentValue === "string"){
                    currentValues = currentValue.split(",");
                }
                const chips = (
                    <div style={{display:'flex', flexWrap:'wrap', marginTop:variant==='v2'?22:8}}>{currentValues.map((v) => {
                        return <Chip style={{marginRight: 8}} onRequestDelete={() => {this.onMultipleRemove(v)}}>{choices.get(v) || v}</Chip>;
                    })}</div>
                );
                const props = {};
                if(variant === 'v2'){
                    // Rebuild Menu Items
                    menuItems = [<MenuItem value={-1} primaryText={chips}/>]
                    choices.forEach(function(value, key){
                        menuItems.push(<MenuItem value={key} primaryText={value}/>);
                    });
                    props.hintText=attributes.label;
                    props.style={height: 72};
                    props.dropDownMenuProps={iconStyle:{fill: '#9e9e9e', top: 22, right: 0}};
                }
                return (
                    <span className={"multiple has-value"}>
                        {variant !== 'v2' && chips}
                        <ModernSelectField
                            value={-1}
                            onChange={(e,i,v) => this.onMultipleSelect(e,i,v)}
                            fullWidth={true}
                            className={className}
                            variant={variant}
                            disabled={disabled}
                            {...props}
                        >{menuItems}</ModernSelectField>

                    </span>
                );
            }else{
                return(
                    <span>
                        <ModernSelectField
                            hintText={attributes.label}
                            value={currentValue}
                            onChange={(e,i,v) => this.onDropDownChange(e,i,v)}
                            fullWidth={true}
                            className={className}
                            variant={variant}
                            disabled={disabled}
                        >{menuItems}</ModernSelectField>
                    </span>
                );
            }
        }
    }
}

InputSelectBox = asFormField(InputSelectBox, true);
InputSelectBox = withChoices(InputSelectBox);
export {InputSelectBox as default}