const useEmptyErrorStatesProps = ({pydio, dataModel, contextNode}) => {

    const messages = pydio.MessageHash;
    const canUpload = !contextNode.getMetadata().has('node_readonly') && pydio.Controller.getActionByName('upload');
    const writeOnly = contextNode.getMetadata().has('node_writeonly');
    const secondary = messages[canUpload ? '565' : '566'];
    const iconClassName = canUpload ? 'mdi mdi-cloud-upload' : 'mdi mdi-folder-outline';
    const errorStateProps = {
        style           : {backgroundColor: 'transparent'},
        iconStyle       : {fontSize: 80, padding: 20},
        buttonContainerStyle: {marginTop: 30},
        iconClassName   :"mdi mdi-alert-circle-outline",
        primaryTextId   :"Oops, something went wrong!",
        actionLabelId   : messages['149'],
        actionIconClassName:"mdi mdi-refresh",
        actionCallback: () => contextNode.reload()
    }

    let emptyStateProps = {
        style           : {backgroundColor: 'transparent'},
        buttonContainerStyle: {marginTop: 30},
        iconClassName   : iconClassName,
        primaryTextId   : messages['562'],
        secondaryTextId : secondary,
    };

    if(writeOnly) {

        emptyStateProps.primaryTextId = messages['ajax_gui.list.writeonly.emptystate.title']
        emptyStateProps.secondaryTextId = messages['ajax_gui.list.writeonly.emptystate.legend']

    } else if(contextNode.isRoot()){
        const isCell = (pydio.user && pydio.user.activeRepository) ? pydio.user.getRepositoriesList().get(pydio.user.activeRepository).getOwner() : false;
        const recyclePath = contextNode.getMetadata().get('repo_has_recycle');
        emptyStateProps = {...emptyStateProps,
            iconClassName   : iconClassName,
            primaryTextId   : isCell? messages['631'] : messages['563'],
            secondaryTextId : secondary,
        };
        if(canUpload) {
            emptyStateProps = {...emptyStateProps,
                actionLabelId: canUpload.options.text_id,
                actionIconClassName: canUpload.options.icon_class,
                actionCallback: () => {
                    pydio.Controller.fireAction('upload')
                }
            }
        }
        if(recyclePath){
            emptyStateProps = {
                ...emptyStateProps,
                checkEmptyState: (node) => { return (node.isLoaded() && node.getChildren().size === 1 && node.getChildren().get(recyclePath) )} ,
                actionLabelId: messages['567'],
                actionIconClassName: 'mdi mdi-delete',
                actionCallback: () => {
                    pydio.goTo(recyclePath);
                }
            };
        }
    }else{
        const recycle = dataModel.getRootNode().getMetadata().get('repo_has_recycle');
        if(contextNode.getPath() === recycle){
            emptyStateProps = {
                ...emptyStateProps,
                iconClassName   : 'mdi mdi-delete-empty',
                primaryTextId   : messages['564'],
                secondaryTextId : null,
            }
        }
    }

    return {emptyStateProps, errorStateProps}
}

export {useEmptyErrorStatesProps}