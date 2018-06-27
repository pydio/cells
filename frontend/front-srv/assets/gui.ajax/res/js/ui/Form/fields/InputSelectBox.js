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

import FormMixin from '../mixins/FormMixin'
const React = require('react')
const {SelectField, MenuItem, Chip} = require('material-ui')
const LangUtils = require('pydio/util/lang')
import FieldWithChoices from '../mixins/FieldWithChoices'

/**
 * Select box input conforming to Pydio standard form parameter.
 */
let InputSelectBox = React.createClass({
    mixins:[FormMixin],

    getDefaultProps:function(){
        return {
            skipBufferChanges:true
        };
    },

    onDropDownChange:function(event, index, value){
        this.onChange(event, value);
        this.toggleEditMode();
    },

    onMultipleSelect:function(event, index, newValue){
        if(newValue == -1) return;
        const currentValue = this.state.value;
        let currentValues = (typeof currentValue === 'string' ? currentValue.split(',') : currentValue);
        if(!currentValues.indexOf(newValue) !== -1){
            currentValues.push(newValue);
            this.onChange(event, currentValues.join(','));
        }
        this.toggleEditMode();
    },

    onMultipleRemove: function(value){
        const currentValue = this.state.value;
        let currentValues = (typeof currentValue === 'string' ? currentValue.split(',') : currentValue);
        if(currentValues.indexOf(value) !== -1 ){
            currentValues = LangUtils.arrayWithout(currentValues, currentValues.indexOf(value));
            this.onChange(null, currentValues.join(','));
        }
    },

    render:function(){
        let currentValue = this.state.value;
        let menuItems = [], multipleOptions = [], mandatory = true;
        if(!this.props.attributes['mandatory'] || this.props.attributes['mandatory'] != "true"){
            mandatory = false;
            menuItems.push(<MenuItem value={-1} primaryText={this.props.attributes['label'] +  '...'}/>);
        }
        const {choices} = this.props;
        choices.forEach(function(value, key){
            menuItems.push(<MenuItem value={key} primaryText={value}/>);
            multipleOptions.push({value:key, label:value});
        });
        if((this.isDisplayGrid() && !this.state.editMode) || this.props.disabled){
            let value = this.state.value;
            if(choices.get(value)) value = choices.get(value);
            return (
                <div
                    onClick={this.props.disabled?function(){}:this.toggleEditMode}
                    className={value?'':'paramValue-empty'}>
                    {!value?'Empty':value} &nbsp;&nbsp;<span className="icon-caret-down"></span>
                </div>
            );
        } else {
            let hasValue = false;
            if(this.props.multiple && this.props.multiple == true){
                let currentValues = currentValue;
                if(typeof currentValue === "string"){
                    currentValues = currentValue.split(",");
                }
                hasValue = currentValues.length ? true: false;
                return (
                    <span className={"multiple has-value"}>
                        <div style={{display:'flex', flexWrap:'wrap'}}>{currentValues.map((v) => {
                            return <Chip onRequestDelete={() => {this.onMultipleRemove(v)}}>{v}</Chip>;
                        })}</div>
                        <SelectField
                            value={-1}
                            onChange={this.onMultipleSelect}
                            fullWidth={true}
                            className={this.props.className}
                        >{menuItems}</SelectField>

                    </span>
                );
            }else{
                return(
                    <span>
                        <SelectField
                            floatingLabelText={this.props.attributes.label}
                            value={currentValue}
                            onChange={this.onDropDownChange}
                            fullWidth={true}
                            className={this.props.className}
                        >{menuItems}</SelectField>
                    </span>
                );
            }
        }
    }
});

InputSelectBox = FieldWithChoices(InputSelectBox);
export {InputSelectBox as default}