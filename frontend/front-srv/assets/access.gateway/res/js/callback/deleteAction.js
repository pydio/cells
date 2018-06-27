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

import PydioApi from 'pydio/http/api'

export default function (pydio) {

    const {MessageHash} = pydio;

    return function(){
        let move = false;
        let message = MessageHash[177];

        const repoHasRecycle = pydio.getContextHolder().getRootNode().getMetadata().get("repo_has_recycle") || pydio.getContextHolder().getRootNode().getChildren().has('/recycle_bin');
        if(repoHasRecycle && pydio.getContextNode().getAjxpMime() !== "ajxp_recycle"){
            move = true;
            message = MessageHash[176];
        }
        // Detect shared node
        if(pydio.getPluginConfigs('action.share').size){
            let shared = [];
            pydio.getContextHolder().getSelectedNodes().forEach((n) => {
                if(n.getMetadata().get('ajxp_shared')){
                    shared.push(n);
                }
            });
            if(shared.length){
                const n = shared[0];
                message = (
                    <div>
                        <div>{message}</div>
                        <div style={{color:'#D32F2F', marginTop: 10}}><span className="mdi mdi-alert"/>{MessageHash['share_center.' + (n.isLeaf()?'158':'157')]}</div>
                    </div>
                );
            }
        }
        pydio.UI.openComponentInModal('PydioReactUI', 'ConfirmDialog', {
            message:message,
            dialogTitleId: 7,
            validCallback:function(){
                const nodes = pydio.getContextHolder().getSelectedNodes();
                const slug = pydio.user.getActiveRepositoryObject().getSlug();
                const paths = nodes.map(n => slug + n.getPath());
                let jobName, jobParams, success;

                if (move) {
                    const target = slug + '/recycle_bin';
                    jobName = "move";
                    jobParams = {nodes:paths, target: target, targetParent: true};
                    success = "Moving to recycle bin in background";
                } else {
                    jobName = "delete";
                    jobParams = {nodes:paths};
                    success = "Deletion job sent to background";
                }

                PydioApi.getRestClient().userJob(jobName, jobParams).then(r => {
                    pydio.UI.displayMessage('SUCCESS', success);
                    pydio.getContextHolder().setSelectedNodes([]);
                });
            }
        });
    };

}