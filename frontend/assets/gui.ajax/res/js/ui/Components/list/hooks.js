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

import {useEffect, useState} from "react";

const useDataModelSelection = (dataModel, node) => {
    const [selected, setSelected] = useState(dataModel.getSelectedNodes().indexOf(node) > -1)
    useEffect(() => {
        const handler = () => {
            setSelected(dataModel.getSelectedNodes().indexOf(node) > -1);
        }
        dataModel.observe('selection_changed', handler);
        return () => {
            dataModel.stopObserving('selection_changed', handler);
        }
    }, [selected, node]);
    return selected
}

const useDataModelContextNodeAsItems = (dataModel, callback = (node) => {return []}) => {

    const [items, setItems] = useState(callback(dataModel.getContextNode()))
    const [node, setNode] = useState(dataModel.getContextNode());

    useEffect(() => {
        const handler = () => {
            const node = dataModel.getContextNode();
            if(node.isLoaded()){
                setNode(node);
            } else{
                node.observeOnce("loaded", () => setNode(node));
            }
        };
        dataModel.observe('context_changed', handler);
        return () => {
            dataModel.stopObserving('context_changed', handler);
        }
    }, [dataModel]);

    useEffect(() => {
        if(!node) {
            return
        }
        if(!node.isLoaded()){
            node.observeOnce("loaded", () => {
                setItems(callback(node, true))
            });
            node.load();
        } else {
            setItems(callback(node, true))
        }

        setItems(callback(dataModel.getContextNode()));
        const childrenObserver = () => {
            setItems(callback(node, false))
        }
        const childrenObserverResize = () => {
            setItems(callback(node, true))
        }
        node.observe("child_added", childrenObserverResize);
        node.observe("child_removed", childrenObserverResize);
        node.observe("child_replaced", childrenObserver);
        return () => {
            node.stopObserving("child_added", childrenObserverResize);
            node.stopObserving("child_removed", childrenObserverResize);
            node.stopObserving("child_replaced", childrenObserver);
        }
    }, [node])

    return {node, items};
}

export {useDataModelSelection, useDataModelContextNodeAsItems}