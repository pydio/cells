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
const React = require('react')
const {SelectField, MenuItem, Chip} = require('material-ui')
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
        if(!currentValues.indexOf(newValue) !== -1){
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
        let menuItems = [], multipleOptions = [];
        if(!this.props.attributes['mandatory'] || this.props.attributes['mandatory'] !== "true"){
            menuItems.push(<MenuItem value={-1} primaryText={this.props.attributes['label'] +  '...'}/>);
        }
        const {choices} = this.props;
        choices.forEach(function(value, key){
            menuItems.push(<MenuItem value={key} primaryText={value}/>);
            multipleOptions.push({value:key, label:value});
        });
        if((this.props.isDisplayGrid() && !this.props.editMode) || this.props.disabled){
            let value = this.props.value;
            if(choices.get(value)) {
                value = choices.get(value);
            }
            return (
                <div
                    onClick={this.props.disabled?function(){}:this.props.toggleEditMode}
                    className={value?'':'paramValue-empty'}>
                    {value ? value : 'Empty'} &nbsp;&nbsp;<span className="icon-caret-down"></span>
                </div>
            );
        } else {
            if(this.props.multiple && this.props.multiple === true){
                let currentValues = currentValue;
                if(typeof currentValue === "string"){
                    currentValues = currentValue.split(",");
                }
                return (
                    <span className={"multiple has-value"}>
                        <div style={{display:'flex', flexWrap:'wrap'}}>{currentValues.map((v) => {
                            return <Chip onRequestDelete={() => {this.onMultipleRemove(v)}}>{v}</Chip>;
                        })}</div>
                        <ModernSelectField
                            value={-1}
                            onChange={(e,i,v) => this.onMultipleSelect(e,i,v)}
                            fullWidth={true}
                            className={this.props.className}
                        >{menuItems}</ModernSelectField>

                    </span>
                );
            }else{
                return(
                    <span>
                        <ModernSelectField
                            hintText={this.props.attributes.label}
                            value={currentValue}
                            onChange={(e,i,v) => this.onDropDownChange(e,i,v)}
                            fullWidth={true}
                            className={this.props.className}
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