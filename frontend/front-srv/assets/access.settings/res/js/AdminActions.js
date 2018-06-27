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

(function(global) {

    let pydio = global.pydio;
    let MessageHash = global.pydio.MessageHash;

    class Callbacks {

        static deleteAction(manager, args){

            var userSelection;
            if(args && args.length){
                userSelection = args[0];
            }else{
                userSelection =  pydio.getUserSelection();
            }

            let firstNode = userSelection.getUniqueNode();
            let meta = firstNode.getMetadata();
            let deleteMessageId, fieldName, fieldValues = [], metaAttribute = 'basename';

            if(meta.get("ajxp_mime") == "user_editable"){
                deleteMessageId = 'settings.34';
                fieldName = "user_id";
            }else if(meta.get("ajxp_mime") == "role"){
                deleteMessageId = 'settings.126';
                fieldName = "role_id";
            }else if(meta.get("ajxp_mime") == "group"){
                deleteMessageId = 'settings.126';
                fieldName = "group";
                metaAttribute = "filename"
            }else{
                deleteMessageId = 'settings.35';
                fieldName = "repository_id";
                metaAttribute = "repository_id";
            }
            fieldValues = userSelection.getSelectedNodes().map(function(node){
                if(metaAttribute === 'basename'){
                    return PathUtils.getBasename(node.getMetadata().get('filename'));
                }else{
                    return node.getMetadata().get(metaAttribute);
                }
            })

            const apply = function(){
                if(!fieldValues.length){
                    return;
                }
                var parameters = {
                    get_action:'delete'
                };
                if(fieldValues.length === 1){
                    parameters[fieldName] = fieldValues[0];
                }else{
                    parameters[fieldName + '[]'] = fieldValues;
                }
                PydioApi.getClient().request(parameters, function(transport){
                    if(firstNode.getParent()) {
                        firstNode.getParent().reload(null, true);
                    }
                }.bind(this));
            }.bind(this);

            pydio.UI.openComponentInModal('PydioReactUI', 'ConfirmDialog', {
                message:MessageHash[deleteMessageId],
                validCallback:apply
            });

        }

        static addSchedulerTask(){
            pydio.UI.openComponentInModal('AdminScheduler', 'TaskEditor', { node:null });
        }

        static editSchedulerTask(manager, args){
            console.log(arguments);
            var userSelection;
            if(args && args.length){
                userSelection = args[0];
            }else{
                userSelection =  pydio.getUserSelection();
            }
            pydio.UI.openComponentInModal('AdminScheduler', 'TaskEditor', { node:userSelection.getUniqueNode() });

        }
        
        static applyDND(manager, dndActionParameter){

            if(dndActionParameter.getStep() === PydioComponents.DNDActionParameter.STEP_CAN_DROP){

                AdminComponents.DNDActionsManager.canDropNodeOnNode(dndActionParameter.getSource(), dndActionParameter.getTarget());

            }else if(dndActionParameter.getStep() === PydioComponents.DNDActionParameter.STEP_END_DRAG){

                AdminComponents.DNDActionsManager.dropNodeOnNode(dndActionParameter.getSource(), dndActionParameter.getTarget());

            }

        }

    }


    let ns = global.AdminActions || {};
    ns.Callbacks = Callbacks;
    global.AdminActions = ns;

})(window);