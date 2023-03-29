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
import React from "react";
import Pydio from 'pydio'
import PassUtils from "pydio/util/pass";
import asFormField from "../hoc/asFormField";
import {TextField} from 'material-ui'
const {ModernTextField} = Pydio.requireLib("hoc");

class ValidPassword extends React.Component{

    constructor(props) {
        super(props);
        this.state = {};
    }

    isValid(){
        return this.state.valid;
    }

    checkMinLength(value){
        const minLength = parseInt(Pydio.getInstance().getPluginConfigs("core.auth").get("PASSWORD_MINLENGTH"));
        return !(value && value.length < minLength);
    }

    getMessage(messageId){
        return Pydio.getMessages()[messageId] || messageId;
    }

    updatePassState(){
        const prevStateValid = this.state.valid;
        const newState = PassUtils.getState(this.refs.pass.getValue(), this.refs.confirm ? this.refs.confirm.getValue() : '');
        newState.value = this.refs.pass.getValue();
        this.setState(newState);
        if(prevStateValid !== newState.valid && this.props.onValidStatusChange){
            this.props.onValidStatusChange(newState.valid);
        }
    }

    onPasswordChange(event, value){
        this.updatePassState();
        this.props.onChange(event, value);
    }

    onConfirmChange(event, value){
        this.setState({confirmValue:value});
        this.updatePassState();
        this.props.onChange(event, this.state.value);
    }

    render(){
        const {disabled, className, attributes, dialogField} = this.props;
        const {isDisplayGrid, isDisplayForm, editMode, value, toggleEditMode, enterToToggle, variant} = this.props;

        if(isDisplayGrid() && !editMode){
            return <div onClick={disabled?function(){}:toggleEditMode} className={value?'':'paramValue-empty'}>{value ? value : 'Empty'}</div>;
        }else{
            const overflow = {overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', width:'100%'};
            let cName = this.state.valid ? '' : 'mui-error-as-hint' ;
            if(className){
                cName = className + ' ' + cName;
            }
            let confirm;
            const TextComponent = dialogField ? TextField : ModernTextField;
            if(value && !disabled){
                confirm = [
                    <div key="sep" style={{width: 8}}></div>,
                    <TextComponent
                        key="confirm"
                        ref="confirm"
                        floatingLabelText={this.getMessage(199)}
                        floatingLabelShrinkStyle={{...overflow, width:'130%'}}
                        floatingLabelStyle={overflow}
                        className={cName}
                        value={this.state.confirmValue}
                        onChange={this.onConfirmChange.bind(this)}
                        type='password'
                        multiLine={false}
                        disabled={disabled}
                        fullWidth={true}
                        style={{flex:1}}
                        errorText={this.state.confirmErrorText}
                        errorStyle={dialogField?{bottom: 15}:null}
                        variant={variant}
                    />
                ];
            }
            let style = {display:'flex'}
            if(variant === 'v2') {
                style.height = 66
                if(attributes['direction'] === 'column') {
                    style.flexDirection = 'column'
                    style.paddingBottom = 4;
                    if(confirm) {
                        style.height *= 2
                    }
                }
            }
            return(
                <form autoComplete="off" onSubmit={(e)=>{e.stopPropagation(); e.preventDefault()}}>
                    <div style={style}>
                        <TextComponent
                            ref="pass"
                            floatingLabelText={isDisplayGrid()?null:attributes.label}
                            floatingLabelShrinkStyle={{...overflow, width:'130%'}}
                            floatingLabelStyle={overflow}
                            className={cName}
                            value={this.state.value}
                            onChange={this.onPasswordChange.bind(this)}
                            onKeyDown={enterToToggle}
                            type='password'
                            multiLine={false}
                            disabled={disabled}
                            errorText={this.state.passErrorText}
                            fullWidth={true}
                            style={{flex:1}}
                            errorStyle={dialogField?{bottom: 15}:null}
                            variant={variant}
                        />
                        {confirm}
                    </div>
                </form>
            );
        }
    }

}

export default asFormField(ValidPassword)