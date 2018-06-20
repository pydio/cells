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

const React = require('react');
const {TextField} = require('material-ui');
const {ActionDialogMixin, CancelButtonProviderMixin, SubmitButtonProviderMixin} = require('pydio').requireLib('boot')
const PydioApi = require('pydio/http/api');

class Callbacks{
    static createLink(){
        pydio.UI.openComponentInModal('PydioBrowserActions', 'CreateLinkDialog');
    }
}

const CreateLinkDialog = React.createClass({

    mixins:[
        ActionDialogMixin,
        CancelButtonProviderMixin,
        SubmitButtonProviderMixin
    ],

    getDefaultProps: function(){
        return {
            dialogSize: 'sm',
            dialogTitleId: 'openbrowser.4'
        }
    },

    submit: function(){
        const name = this.refs.name.getValue();
        const url = this.refs.url.getValue();
        if(!name || !url) return;
        PydioApi.getClient().request({
            get_action: 'mkfile',
            dir       : this.props.pydio.getContextHolder().getContextNode().getPath(),
            filename  : name + '.url',
            content   : url
        }, () => {
            this.dismiss();
        });
    },

    render(){

        const mess = this.props.pydio.MessageHash;
        return (
            <div>
                <TextField ref="url" floatingLabelText={mess['openbrowser.6']} fullWidth={true} hintText="https://..."  onKeyDown={(e) => {this.submitOnEnterKey(e)}} />
                <TextField ref="name" floatingLabelText={mess['openbrowser.8']} fullWidth={true} onKeyDown={(e) => {this.submitOnEnterKey(e)}}/>
            </div>
        );
    }

});

window.PydioBrowserActions = {
    Callbacks,
    CreateLinkDialog
};
