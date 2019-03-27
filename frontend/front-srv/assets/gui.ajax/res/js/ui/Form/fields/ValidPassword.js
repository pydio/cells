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
const PassUtils = require('pydio/util/pass')
const React = require('react')
const {TextField} = require('material-ui')

export default React.createClass({

    mixins:[FormMixin],

    isValid:function(){
        return this.state.valid;
    },

    checkMinLength:function(value){
        const minLength = parseInt(global.pydio.getPluginConfigs("core.auth").get("PASSWORD_MINLENGTH"));
        return !(value && value.length < minLength);
    },

    getMessage:function(messageId){
        if(this.context && this.context.getMessage){
            return this.context.getMessage(messageId, '');
        }else if(global.pydio && global.pydio.MessageHash){
            return global.pydio.MessageHash[messageId];
        }
    },

    updatePassState: function(){
        const prevStateValid = this.state.valid;
        const newState = PassUtils.getState(this.refs.pass.getValue(), this.refs.confirm ? this.refs.confirm.getValue() : '');
        this.setState(newState);
        if(prevStateValid !== newState.valid && this.props.onValidStatusChange){
            this.props.onValidStatusChange(newState.valid);
        }
    },

    onPasswordChange: function(event){
        this.updatePassState();
        this.onChange(event, event.target.value);
    },

    onConfirmChange:function(event){
        this.setState({confirmValue:event.target.value});
        this.updatePassState();
        this.onChange(event, this.state.value);
    },

    render:function(){
        if(this.isDisplayGrid() && !this.state.editMode){
            const value = this.state.value;
            return <div onClick={this.props.disabled?function(){}:this.toggleEditMode} className={value?'':'paramValue-empty'}>{!value?'Empty':value}</div>;
        }else{
            const overflow = {overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', width:'100%'};
            let className = this.state.valid ? '' : 'mui-error-as-hint' ;
            if(this.props.className){
                className = this.props.className + ' ' + className;
            }
            let confirm;
            if(this.state.value && !this.props.disabled){
                confirm = [
                    <div key="sep" style={{width: 20}}></div>,
                    <TextField
                        key="confirm"
                        ref="confirm"
                        floatingLabelText={this.getMessage(199)}
                        floatingLabelShrinkStyle={{...overflow, width:'130%'}}
                        floatingLabelStyle={overflow}
                        className={className}
                        value={this.state.confirmValue}
                        onChange={this.onConfirmChange}
                        type='password'
                        multiLine={false}
                        disabled={this.props.disabled}
                        fullWidth={true}
                        style={{flex:1}}
                        errorText={this.state.confirmErrorText}
                    />
                ];
            }
            return(
                <form autoComplete="off">
                    <div style={{display:'flex', marginTop:-16}}>
                        <TextField
                            ref="pass"
                            floatingLabelText={this.isDisplayForm()?this.props.attributes.label:null}
                            floatingLabelShrinkStyle={{...overflow, width:'130%'}}
                            floatingLabelStyle={overflow}
                            className={className}
                            value={this.state.value}
                            onChange={this.onPasswordChange}
                            onKeyDown={this.enterToToggle}
                            type='password'
                            multiLine={false}
                            disabled={this.props.disabled}
                            errorText={this.state.passErrorText}
                            fullWidth={true}
                            style={{flex:1}}
                        />
                        {confirm}
                    </div>
                </form>
            );
        }
    }

});