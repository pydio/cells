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
import MetaNodeProvider from 'pydio/model/meta-node-provider'
import {AdminTreeServiceApi,TreeListNodesRequest,TreeNode} from 'pydio/http/rest-api'

/**
 * Implementation of the IAjxpNodeProvider interface based on a remote server access.
 * Default for all repositories.
 */
export default class MaskNodesProvider extends MetaNodeProvider{

    /**
     * Load a node
     * @param node AjxpNode
     * @param nodeCallback Function On node loaded
     * @param childCallback Function On child added
     * @param recursive
     * @param depth
     * @param optionalParameters
     */
    loadNode (node, nodeCallback=null, childCallback=null, recursive=false, depth=-1, optionalParameters=null){

        //console.log('MaskNodes', node);
        const api = new AdminTreeServiceApi(PydioApi.getRestClient());

        let listRequest = new TreeListNodesRequest();
        listRequest.Node = TreeNode.constructFromObject({Path: node.getPath()});
        api.listAdminTree(listRequest).then(nodesColl => {
            const children = nodesColl.Children || [];
            children.forEach(c => {
                let nodeChild;
                try{
                    nodeChild = MetaNodeProvider.parseTreeNode(c, null);
                }catch(e){
                    console.log(e);
                    return;
                }
                if(childCallback){
                    childCallback(nodeChild);
                }
                node.addChild(nodeChild);
            });
            if(nodeCallback !== null){
                nodeCallback(node);
            }
        }).catch(() => {
        });

    }

}