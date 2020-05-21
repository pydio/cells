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
import {RestDeleteNodesRequest, TreeServiceApi,TreeNode} from 'pydio/http/rest-api';

export default function (pydio) {

    const {MessageHash} = pydio;

    return function(){
        let message = MessageHash[176];
        if (pydio.getContextHolder().getContextNode().getPath().indexOf('/recycle_bin') === 0) {
            message = MessageHash[177];
        }
        // Detect shared node - Disabled for now as this is NOT disabled by the delete action
        /*
        if(pydio.getPluginConfigs('action.share').size){
            let shared = [];
            pydio.getContextHolder().getSelectedNodes().forEach((n) => {
                if(n.getMetadata().get('pydio_is_shared')){
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
        */
        pydio.UI.openComponentInModal('PydioReactUI', 'ConfirmDialog', {
            message:message,
            dialogTitleId: 7,
            validCallback: () => {
                const nodes = pydio.getContextHolder().getSelectedNodes();
                const slug = pydio.user.getActiveRepositoryObject().getSlug();
                const deleteRequest = new RestDeleteNodesRequest();
                const api = new TreeServiceApi(PydioApi.getRestClient());
                deleteRequest.Nodes = nodes.map(n => {
                    const t = new TreeNode();
                    t.Path = slug + n.getPath();
                    return t;
                });
                api.deleteNodes(deleteRequest).then(r => {
                    if (r.DeleteJobs && r.DeleteJobs.length){
                        nodes.forEach(n => {
                            n.getMetadata().set('pending_operation', r.DeleteJobs[0].Label);
                            n.getMetadata().set('pending_operation_uuid', r.DeleteJobs[0].Uuid);
                            n.notify('meta_replaced', n);
                        })
                    }
                    pydio.getContextHolder().setSelectedNodes([]);
                }).catch(e => {
                    pydio.UI.displayMessage('ERROR', e.Title || e.message);
                });
            }
        });
    };

}