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

import PathUtils from "pydio/util/path";
import LangUtils from "pydio/util/lang";
const {DNDActionParameter} = require('pydio').requireLib('components');

export default function (pydio) {

    const {MessageHash} = pydio;

    const comparePaths = (source, target) => {
        const otherRepo = target.getMetadata().has('repository_id');
        if(target.getMetadata().has('local:dropFunc')){
            if(target.getMetadata().has('local:canDropFunc')){
                target.getMetadata().get('local:canDropFunc')(source, target)
            }
            return
        }
        if(target.isLeaf() || target.getPath() === source.getPath() || (!otherRepo && LangUtils.trimRight(target.getPath(), "/") ===  PathUtils.getDirname(source.getPath()))) {
            throw new Error('Cannot drop on leaf or on same path');
        } else if (target.getMetadata().has("virtual_root")) {
            throw new Error('Cannot drop on virtual root');
        } else if (source.getMetadata().has("ws_root")){
            throw new Error('Cannot move roots around');
        } else if (target.getMetadata().get('node_readonly') === "true" || (target.getMetadata().has('workspaceEntry') && !target.getMetadata().get('workspaceEntry').allowCrossRepositoryCopy)) {
            throw new Error('Cannot drop on this branch (readonly)');
        }
    };

    return function(controller, dndActionParameter = null){

        if(dndActionParameter && dndActionParameter instanceof DNDActionParameter){

            if(dndActionParameter.getStep() === DNDActionParameter.STEP_CAN_DROP){

                const target = dndActionParameter.getTarget();
                const source = dndActionParameter.getSource();
                comparePaths(source, target);
                return false;

            }else if(dndActionParameter.getStep() === DNDActionParameter.STEP_END_DRAG){

                try {
                    comparePaths(dndActionParameter.getSource(), dndActionParameter.getTarget())
                }catch (e) {
                    return
                }

                let selection = controller.getDataModel();
                const targetPath = dndActionParameter.getTarget().getPath();
                let targetWsId = null;
                // Putting on a different repository_id
                if(dndActionParameter.getTarget().getMetadata().has('repository_id')){
                    targetWsId = dndActionParameter.getTarget().getMetadata().get('repository_id');
                    const ws = dndActionParameter.getTarget().getMetadata().get('workspaceEntry');
                    if(ws && ws.getRepositoryType() === "cell"){
                        pydio.UI.openComponentInModal('FSActions', 'CrossWsDropDialog', {
                            target: dndActionParameter.getTarget(),
                            source: dndActionParameter.getSource(),
                            dropEffect: dndActionParameter.getDropEffect() || 'move',
                            cellWs: ws
                        });
                        return;
                    }
                } else if(dndActionParameter.getTarget().getMetadata().has('local:dropFunc')){

                    dndActionParameter.getTarget().getMetadata().get('local:dropFunc')('dnd', dndActionParameter.getSource(), dndActionParameter.getTarget())
                    return;
                }
                const moveFunction = require('./applyCopyOrMove')(pydio);
                const sourceNode = dndActionParameter.getSource();
                const selectedNodes = selection.getSelectedNodes();
                if(selectedNodes.indexOf(sourceNode) === -1){
                    // Use source node instead of current datamodel selection
                    let newSel = new PydioDataModel();
                    newSel.setContextNode(selection.getContextNode());
                    newSel.setSelectedNodes([dndActionParameter.getSource()]);
                    moveFunction(dndActionParameter.getDropEffect() || 'move', newSel, targetPath, targetWsId);
                }else{
                    moveFunction(dndActionParameter.getDropEffect() || 'move', selection, targetPath, targetWsId);
                }

            }

            return;
        }

        let selection = pydio.getUserSelection();
        const submit = function(path, wsId = null){
            require('./applyCopyOrMove')(pydio)('move', selection, path, wsId);
        };

        pydio.UI.openComponentInModal('FSActions', 'TreeDialog', {
            isMove: true,
            dialogTitle:MessageHash[160],
            submitValue:submit
        });

    }

}