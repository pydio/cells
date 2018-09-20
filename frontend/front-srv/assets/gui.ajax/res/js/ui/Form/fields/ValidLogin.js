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
import PassUtils from 'pydio/util/pass'
import {TextField} from 'material-ui'

/**
 * Text input, can be single line, multiLine, or password, depending on the
 * attributes.type key.
 */
export default React.createClass({

    mixins:[FormMixin],

    textValueChanged(event, value){
        const err = PassUtils.isValidLogin(value);
        const prevStateValid = this.state.valid;
        const valid = !err;
        if(prevStateValid !== valid && this.props.onValidStatusChange){
            this.props.onValidStatusChange(valid);
        }
        this.setState({valid, err});

        this.onChange(event, value);
    },

    render(){
        if(this.isDisplayGrid() && !this.state.editMode){
            let value = this.state.value;
            if(this.props.attributes['type'] === 'password' && value){
                value = '***********';
            }else{
                value = this.state.value;
            }
            return <div onClick={this.props.disabled?function(){}:this.toggleEditMode} className={value?'':'paramValue-empty'}>{!value?'Empty':value}</div>;
        }else{
            const {err} = this.state;
            let field = (
                <TextField
                    floatingLabelText={this.isDisplayForm()?this.props.attributes.label:null}
                    value={this.state.value || ""}
                    onChange={(e,v) => this.textValueChanged(e,v)}
                    onKeyDown={this.enterToToggle}
                    type={this.props.attributes['type'] === 'password'?'password':null}
                    multiLine={this.props.attributes['type'] === 'textarea'}
                    disabled={this.props.disabled}
                    errorText={this.props.errorText || err}
                    autoComplete="off"
                    fullWidth={true}
                />
            );
            if(this.props.attributes['type'] === 'password'){
                return (
                    <form autoComplete="off" style={{display:'inline'}}>{field}</form>
                );
            }else{
                return(
                    <span>{field}</span>
                );
            }
        }
    }

});
