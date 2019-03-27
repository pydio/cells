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
const {Toggle} = require('material-ui')

/**
 * Boolean input
 */
export default React.createClass({

    mixins:[FormMixin],

    getDefaultProps:function(){
        return {
            skipBufferChanges:true
        };
    },

    onCheck:function(event, newValue){
        this.props.onChange(newValue, this.state.value);
        this.setState({
            dirty:true,
            value:newValue
        });
    },

    getBooleanState:function(){
        let boolVal = this.state.value;
        if(typeof boolVal  === 'string'){
            boolVal = (boolVal == "true");
        }
        return boolVal;
    },

    render:function(){
        const boolVal = this.getBooleanState();
        return(
            <span>
                <Toggle
                    toggled={boolVal}
                    onToggle={this.onCheck}
                    disabled={this.props.disabled}
                    label={this.isDisplayForm()?this.props.attributes.label:null}
                    labelPosition={this.isDisplayForm()?'left':'right'}
                />
            </span>
        );
    }

});
