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
const createReactClass = require('create-react-class');
const {ActionDialogMixin, CancelButtonProviderMixin} = require('pydio').requireLib('boot');
import WorkspacesListMaterial from './WorkspacesListMaterial'

const WorkspacePickerDialog = createReactClass({
    displayName: 'WorkspacePickerDialog',

    mixins: [
        ActionDialogMixin,
        CancelButtonProviderMixin
    ],

    getDefaultProps: function(){
        return {
            dialogTitleId: 'user_home.90',
            dialogSize: 'sm',
            dialogPadding: false,
            dialogIsModal: true,
            dialogScrollBody: true
        };
    },

    submit: function(){
        this.dismiss();
    },

    workspaceTouchTap: function(wsId){
        this.dismiss();
        UploaderModel.Store.getInstance().handleDropEventResults(this.props.items, this.props.files, new AjxpNode('/'), null, null, wsId);
        if(this.props.switchAtUpload){
            pydio.triggerRepositoryChange(wsId);
        }
    },

    render: function(){

        const {pydio, files} = this.props;
        const legend = (files && files[0] ? <div style={{fontSize:13, padding: 16, fontWeight:500}}>{pydio.MessageHash['user_home.89']}: {files[0].name}</div> : undefined)
        return (
            <div style={{width:'100%', height: '100%', display:'flex', flexDirection:'column'}}>
                {legend}
                <WorkspacesListMaterial
                    pydio={pydio}
                    workspaces={pydio.user ? pydio.user.getRepositoriesList() : []}
                    showTreeForWorkspace={false}
                    onWorkspaceTouchTap={this.workspaceTouchTap}
                    filterByType={'entries'}
                    sectionTitleStyle={{display:'none'}}
                    style={{flex:1, overflowY: 'auto', maxHeight:400}}
                />
            </div>
        );

    },
});

export {WorkspacePickerDialog as default}