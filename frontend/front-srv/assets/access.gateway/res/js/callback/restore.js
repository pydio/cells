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
import {RestRestoreNodesRequest, TreeServiceApi,TreeNode} from 'cells-sdk';

export default function (pydio) {

    return function(){

        const nodes = pydio.getContextHolder().getSelectedNodes();
        const slug = pydio.user.getActiveRepositoryObject().getSlug();
        const restoreRequest = new RestRestoreNodesRequest();
        const api = new TreeServiceApi(PydioApi.getRestClient());
        restoreRequest.Nodes = nodes.map(n => {
            const t = new TreeNode();
            t.Path = slug + n.getPath();
            return t;
        });
        api.restoreNodes(restoreRequest).then(r => {
            if (r.RestoreJobs && r.RestoreJobs.length){
                nodes.forEach(n => {
                    r.RestoreJobs.forEach(j=>{
                        if(j.NodeUuid === n.getMetadata().get('uuid')){
                            n.getMetadata().set('pending_operation', j.Label);
                            n.getMetadata().set('pending_operation_uuid', j.Uuid);
                            n.notify('meta_replaced', n);
                        }
                    })
                })
            }
            pydio.getContextHolder().setSelectedNodes([]);
        });


    }

}