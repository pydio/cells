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

import Pydio from 'pydio'
const React = require('react')
const createReactClass = require('create-react-class');
const BootUI = require('pydio/http/resources-manager').requireLib('boot');
const {ActionDialogMixin, AsyncComponent} = BootUI;
import {FlatButton} from 'material-ui'

const PasswordDialog = createReactClass({
    displayName: 'PasswordDialog',

    mixins:[
        ActionDialogMixin
    ],

    getInitialState: function(){
        return {passValid: false};
    },

    getDefaultProps: function(){
        return {
            dialogTitle: Pydio.getMessages()[194],
            dialogIsModal: true,
            dialogSize: 'sm'
        };
    },

    getButtons: function(updater = null){
        if(updater) this._updater = updater;
        let buttons = [];
        if(!this.props.locked){
            buttons.push(<FlatButton label={this.props.pydio.MessageHash[54]} onClick={() => this.dismiss()}/>);
        }
        buttons.push(<FlatButton label={this.props.pydio.MessageHash[48]} onClick={this.submit.bind(this)} disabled={!this.state.passValid}/>);
        return buttons;
    },

    submit(){
        if(!this.state.passValid){
            return false;
        }
        this.refs.passwordForm.instance.post(function(value){
            if(value) this.dismiss();
        }.bind(this));
    },

    passValidStatusChange: function(status){
        this.setState({passValid: status}, ()=>{
            this._updater(this.getButtons());
        });
    },

    render: function(){

        return (
            <AsyncComponent
                namespace="UserAccount"
                componentName="PasswordForm"
                pydio={this.props.pydio}
                ref="passwordForm"
                onValidStatusChange={this.passValidStatusChange}
            />
        );
    },
});

export default PasswordDialog