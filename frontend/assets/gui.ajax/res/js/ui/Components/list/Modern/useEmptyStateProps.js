import {useCallback}  from "react";

const useEmptyStateProps = ({emptyStateProps, errorStateProps, node, items, openFolder}) => {
    const updatedProps = useCallback(() => {
        let emptyState;
        const parent = items.find(it => it.isParent)
        const woParent = items.filter(it => !it.isParent)
        if(emptyStateProps && node.isLoaded() && !node.isLoading() && !woParent.length ){

            let actionProps = {};
            if(parent){
                actionProps = {
                    actionLabelId: 'react.1',
                    actionIconClassName: 'mdi mdi-chevron-left',
                    actionCallback: (e) => {
                        if(openFolder) {
                            openFolder(parent, e)
                        }
                    }
                }
            }
            emptyState = {...emptyStateProps, ...actionProps}

        }else if(emptyStateProps && emptyStateProps.checkEmptyState && emptyStateProps.checkEmptyState(node)){

            emptyState = {...emptyStateProps} ;

        } else if(errorStateProps && !node.isLoading() && node.getLoadError()) {

            emptyState = {
                ...errorStateProps,
                secondaryTextId: node.getLoadError().message,
                actionCallback: () => this.reload()
            }
        }
        return emptyState
    }, [emptyStateProps, errorStateProps, node, items, openFolder])

    return updatedProps()
}

export {useEmptyStateProps}