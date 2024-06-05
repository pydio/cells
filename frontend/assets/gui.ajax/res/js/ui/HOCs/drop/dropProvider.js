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

import ResourcesManager from 'pydio/http/resources-manager'
import NativeFileDropProvider from './NativeFileDropProvider'

export default function(PydioComponent, filterFunction = null ){

    return NativeFileDropProvider(PydioComponent, (items, files) => {

        const {pydio, UploaderModel} = global;
        if(!pydio.user || !UploaderModel){
            pydio.UI.displayMessage('ERROR', pydio.MessageHash['html_uploader.upload.forbidden']);
            return;
        }

        if(pydio.user.activeRepository === 'homepage'){
            // limit to files only
            const filtered = Array.prototype.slice.call(files || [], 0).filter((f) => {return !!f.type});
            if (filtered.length){
                ResourcesManager.loadClass('PydioWorkspaces').then(()=>{
                    pydio.UI.openComponentInModal('PydioWorkspaces', 'WorkspacePickerDialog', {files: filtered, switchAtUpload: true, pydio});
                });
            }
            return;
        }
        const ctxNode = pydio.getContextHolder().getContextNode();
        if(ctxNode.getMetadata().get('node_readonly') === 'true' || ctxNode.getMetadata().get('level_readonly') === 'true'){
            pydio.UI.displayMessage('ERROR', 'You are not allowed to upload files here');
            return;
        }
        const storeInstance = UploaderModel.Store.getInstance();

        storeInstance.handleDropEventResults(items, files, ctxNode, null, filterFunction);

        if(!storeInstance.getAutoStart() || pydio.Parameters.get('MINISITE')){
            pydio.getController().fireAction('upload');
        }
    });

}