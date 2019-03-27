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
const ReactMUI = require('material-ui-legacy')

/**
 * Text input that is converted to integer, and
 * the UI can react to arrows for incrementing/decrementing values
 */
export default React.createClass({

    mixins:[FormMixin],

    keyDown: function(event){
        let inc = 0, multiple=1;
        if(event.key == 'Enter'){
            this.toggleEditMode();
            return;
        }else if(event.key == 'ArrowUp'){
            inc = +1;
        }else if(event.key == 'ArrowDown'){
            inc = -1;
        }
        if(event.shiftKey){
            multiple = 10;
        }
        let parsed = parseInt(this.state.value);
        if(isNaN(parsed)) parsed = 0;
        const value = parsed + (inc * multiple);
        this.onChange(null, value);
    },

    render:function(){
        if(this.isDisplayGrid() && !this.state.editMode){
            const value = this.state.value;
            return <div onClick={this.props.disabled?function(){}:this.toggleEditMode} className={value?'':'paramValue-empty'}>{!value?'Empty':value}</div>;
        }else{
            let intval;
            if(this.state.value){
                intval = parseInt(this.state.value) + '';
                if(isNaN(intval)) intval = this.state.value + '';
            }else{
                intval = '0';
            }
            return(
                <span className="integer-input">
                    <ReactMUI.TextField
                        value={intval}
                        onChange={this.onChange}
                        onKeyDown={this.keyDown}
                        disabled={this.props.disabled}
                        floatingLabelText={this.isDisplayForm()?this.props.attributes.label:null}
                    />
                </span>
            );
        }
    }

});