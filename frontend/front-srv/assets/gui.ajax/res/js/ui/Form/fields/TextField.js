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
 * Text input, can be single line, multiLine, or password, depending on the
 * attributes.type key.
 */
class TextField extends React.Component{

    render(){
        const {editMode, value} = this.props;

        if(this.props.isDisplayGrid() && !editMode){
            let val = value;
            if(this.props.attributes['type'] === 'password' && value){
                val = '***********';
            }
            return <div onClick={this.props.disabled?function(){}:this.props.toggleEditMode} className={val?'':'paramValue-empty'}>{val ? val : 'Empty'}</div>;
        }else{
            let field = (
                <ModernTextField
                    hintText={this.props.isDisplayForm()?this.props.attributes.label:null}
                    value={value || ""}
                    onChange={this.props.onChange}
                    onKeyDown={this.props.enterToToggle}
                    type={this.props.attributes['type'] === 'password'?'password':null}
                    multiLine={this.props.attributes['type'] === 'textarea'}
                    disabled={this.props.disabled}
                    errorText={this.props.errorText}
                    autoComplete="off"
                    fullWidth={true}
                />
            );
            if(this.props.attributes['type'] === 'password'){
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

export default asFormField(TextField);
