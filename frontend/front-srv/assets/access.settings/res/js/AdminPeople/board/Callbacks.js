import Pydio from 'pydio'
import PydioApi from 'pydio/http/api'
const {DNDActionParameter} = Pydio.requireLib('components')

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

        let reload = () => {}
        if(firstNode.getParent()) {
            const parent = firstNode.getParent();
            reload = () => {parent.reload(null, true)}
        }
        const callback = () => {
            const selection = userSelection.getSelectedNodes();
            const next = () => {
                if(!selection.length) {
                    return;
                }
                const n = selection.shift();
                PydioApi.getRestClient().getIdmApi().deleteIdmUser(n.getMetadata().get('IdmUser')).then(() => {
                    reload();
                    next();
                }).catch(e => {
                    Pydio.getInstance().UI.displayMessage('ERROR', e.message);
                    next();
                });
            };
            next();
        };

        pydio.UI.openConfirmDialog({
            message:MessageHash[deleteMessageId],
            validCallback:callback
        });

    }

    static applyDND(manager, dndActionParameter){

        if(dndActionParameter.getStep() === DNDActionParameter.STEP_CAN_DROP){

            AdminComponents.DNDActionsManager.canDropNodeOnNode(dndActionParameter.getSource(), dndActionParameter.getTarget());

        }else if(dndActionParameter.getStep() === DNDActionParameter.STEP_END_DRAG){

            AdminComponents.DNDActionsManager.dropNodeOnNode(dndActionParameter.getSource(), dndActionParameter.getTarget());

        }

    }

    static bulkMoveAction(manager, args) {
        const pydio = Pydio.getInstance();
        const userSelection = args[0];
        const selection = userSelection.getSelectedNodes();

        pydio.UI.openComponentInModal('AdminPeople', 'TreeGroupsDialog', {
            pydio: pydio,
            dataModel: pydio.getContextHolder(),
            submitValue: (value, targetNode) => {
                const next = () => {
                    if(!selection.length) {
                        return;
                    }
                    const source = selection.shift();
                    AdminComponents.DNDActionsManager.dropNodeOnNode(source, targetNode);
                    next();
                };
                next();
            }
        })
    }

}

export {Callbacks as default}