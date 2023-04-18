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
import createReactClass from 'create-react-class';
import ProfilePane from './ProfilePane'
import Pydio from 'pydio'
import {CardTitle, FlatButton} from 'material-ui'
const { ActionDialogMixin, CancelButtonProviderMixin, SubmitButtonProviderMixin} = Pydio.requireLib('boot');

/**
 * Sample Dialog class used for reference only, ready to be
 * copy/pasted :-)
 */
export default createReactClass({
    displayName: 'WelcomeModal',

    mixins:[
        ActionDialogMixin,
        CancelButtonProviderMixin
    ],

    getDefaultProps: function(){
        return {
            dialogTitle: '',
            dialogIsModal: true,
            dialogSize:'sm',
            dialogPadding: 0
        };
    },

    close: function(skip){

        if(this.props.onRequestStart){
            this.props.onRequestStart(skip);
        }
        this.props.onDismiss();
    },

    getMessage: function(id){
        return this.props.pydio.MessageHash['ajax_gui.tour.welcomemodal.' + id];
    },

    getButtons: function(){
        return [
            <FlatButton label={this.getMessage('skip')} onClick={()=> {this.close(true)}}/>,
            <FlatButton label={this.getMessage('start')} primary={true} onClick={() => this.close(false)}/>,
        ];
    },

    render: function(){
        return (
            <div>
                <div style={{position:'relative', width:'100%', height: 200, overflow: 'hidden'}}>
                    <ProfilePane miniDisplay={true} {...this.props} saveOnChange={true} />
                </div>
                <CardTitle title={this.getMessage('title')} subtitle={this.getMessage('subtitle')}/>
            </div>
        );
    },
});

