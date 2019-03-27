import PydioApi from 'pydio/http/api'

class Callbacks {

    static deleteAction(manager, args){

        let userSelection;
        if(args && args.length){
            userSelection = args[0];
        }else{
            userSelection =  pydio.getUserSelection();
        }

        let firstNode = userSelection.getUniqueNode();
        let meta = firstNode.getMetadata();
        let deleteMessageId;

        switch (meta.get('ajxp_mime')){
            case 'user_editable':
                deleteMessageId = 'settings.34';
                break;
            case 'group':
                deleteMessageId = 'settings.126';
                break;
            default:
                break;
        }

        const callback = () => {
            const proms = userSelection.getSelectedNodes().map(n => {
                return PydioApi.getRestClient().getIdmApi().deleteIdmUser(n.getMetadata().get('IdmUser'));
            });
            Promise.all(proms).then(() => {
                if(firstNode.getParent()) {
                    firstNode.getParent().reload(null, true);
                }
            });
        };

        pydio.UI.openComponentInModal('PydioReactUI', 'ConfirmDialog', {
            message:MessageHash[deleteMessageId],
            validCallback:callback
        });

    }

    static applyDND(manager, dndActionParameter){

        if(dndActionParameter.getStep() === PydioComponents.DNDActionParameter.STEP_CAN_DROP){

            AdminComponents.DNDActionsManager.canDropNodeOnNode(dndActionParameter.getSource(), dndActionParameter.getTarget());

        }else if(dndActionParameter.getStep() === PydioComponents.DNDActionParameter.STEP_END_DRAG){

            AdminComponents.DNDActionsManager.dropNodeOnNode(dndActionParameter.getSource(), dndActionParameter.getTarget());

        }

    }

}

export {Callbacks as default}