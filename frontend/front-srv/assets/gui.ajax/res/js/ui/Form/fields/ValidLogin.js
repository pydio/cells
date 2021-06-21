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
import asFormField from "../hoc/asFormField";
import PassUtils from 'pydio/util/pass'

const {ModernTextField} = Pydio.requireLib('hoc');

/**
 * Text input, can be single line, multiLine, or password, depending on the
 * attributes.type key.
 */
class ValidLogin extends React.Component{

    constructor(props) {
        super(props);
        this.state = {};
        if(props.value) {
            const err = PassUtils.isValidLogin(props.value);
            this.state = {valid: !err, err};
        }
    }

    textValueChanged(event, value){
        const err = PassUtils.isValidLogin(value);
        const prevStateValid = this.state && this.state.valid;
        const valid = !err;
        if(prevStateValid !== valid && this.props.onValidStatusChange){
            this.props.onValidStatusChange(valid);
        }
        this.setState({valid, err});

        this.props.onChange(event, value);
    }

    isValid() {
        return this.state && this.state.valid;
    }

    render(){
        const {isDisplayGrid, isDisplayForm, editMode, disabled, errorText, enterToToggle, toggleEditMode, attributes, variant} = this.props;
        let {value} = this.props;
        if(isDisplayGrid() && !editMode){
            if(attributes['type'] === 'password' && value){
                value = '***********';
            }
            return <div onClick={disabled?function(){}:toggleEditMode} className={value?'':'paramValue-empty'}>{value ? value : 'Empty'}</div>;
        }else{
            const err = this.state && this.state.err;
            let field = (
                <ModernTextField
                    floatingLabelText={isDisplayForm()?attributes.label:null}
                    value={value || ""}
                    onChange={(e,v) => this.textValueChanged(e,v)}
                    onKeyDown={enterToToggle}
                    type={attributes['type'] === 'password'?'password':null}
                    multiLine={attributes['type'] === 'textarea'}
                    disabled={disabled}
                    errorText={errorText || err}
                    autoComplete="off"
                    fullWidth={true}
                    variant={variant}
                />
            );
            if(attributes['type'] === 'password'){
                return (
                    <form autoComplete="off" onSubmit={(e)=>{e.stopPropagation(); e.preventDefault()}} style={{display:'inline'}}>{field}</form>
                );
            }else{
                return(
                    <span>{field}</span>
                );
            }
        }
    }

}

export default asFormField(ValidLogin);
