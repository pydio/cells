/*
 * Copyright 2025 Abstrium SAS <team (at) pyd.io>
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

import {useCallback}  from "react";

const useEmptyStateProps = ({emptyStateProps, errorStateProps, node, items, error, openFolder}) => {
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

        } else if(errorStateProps && !node.isLoading() && (error || node.getLoadError())) {

            emptyState = {
                ...errorStateProps,
                secondaryTextId: node.getLoadError() ? node.getLoadError().message : (error.message || String(error)),
                actionCallback: () => this.reload()
            }
        }
        return emptyState
    }, [emptyStateProps, errorStateProps, node, items, openFolder])

    return updatedProps()
}

export {useEmptyStateProps}