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

const {DNDActionParameter} = require('pydio').requireLib('components')

export default function (pydio) {

    const {MessageHash} = pydio;
    return function(controller, dndActionParameter = null){

        if(dndActionParameter && dndActionParameter instanceof DNDActionParameter){

            if(dndActionParameter.getStep() === DNDActionParameter.STEP_CAN_DROP){

                if(dndActionParameter.getTarget().isLeaf() || dndActionParameter.getTarget().getPath() === dndActionParameter.getSource().getPath()){
                    throw new Error('Cannot drop');
                }else {
                    return false;
                }

            }else if(dndActionParameter.getStep() === DNDActionParameter.STEP_END_DRAG){
                let selection = controller.getDataModel();
                const targetPath = dndActionParameter.getTarget().getPath();
                const moveFunction = require('./applyCopyOrMove')(pydio);
                const sourceNode = dndActionParameter.getSource();
                const selectedNodes = selection.getSelectedNodes();
                if(selectedNodes.indexOf(sourceNode) === -1){
                    // Use source node instead of current datamodel selection
                    let newSel = new PydioDataModel();
                    newSel.setContextNode(selection.getContextNode());
                    newSel.setSelectedNodes([dndActionParameter.getSource()]);
                    selection = newSel;
                    moveFunction('move', newSel, targetPath);
                }else{
                    moveFunction('move', selection, targetPath);
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