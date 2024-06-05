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

import PydioApi from "pydio/http/api";
import {RestDeleteNodesRequest, TreeServiceApi, TreeNode} from 'cells-sdk'

export default function (pydio) {

    const {MessageHash} = pydio;
    return function(){

        pydio.UI.openComponentInModal('PydioReactUI', 'ConfirmDialog', {
            message:MessageHash[177],
            dialogTitleId: 220,
            validCallback:()=>{
                const slug = pydio.user.getActiveRepositoryObject().getSlug();
                const deleteRequest = new RestDeleteNodesRequest();
                const api = new TreeServiceApi(PydioApi.getRestClient());
                const n = new TreeNode();
                n.Path = slug + '/recycle_bin';
                deleteRequest.Nodes = [n];
                api.deleteNodes(deleteRequest).then(r => {
                    if (r.DeleteJobs){
                        r.DeleteJobs.forEach(j => {
                            pydio.UI.displayMessage('SUCCESS', j.Label);
                        })
                    }
                    pydio.getContextHolder().requireContextChange(pydio.getContextHolder().getRootNode());
                }).catch(e => {
                    pydio.UI.displayMessage('ERROR', e.Title || e.message);
                });
            }
        });

    }

}