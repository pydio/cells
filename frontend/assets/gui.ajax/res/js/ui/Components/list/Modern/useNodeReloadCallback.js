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

import {useEffect} from "react";
import PropTypes from "prop-types";
const PydioDataModel = require('pydio/model/data-model')
const PydioNode = require('pydio/model/node')

const UseNodeReloadCallbackProps = {
    dataModel: PropTypes.instanceOf(PydioDataModel),
    node: PropTypes.instanceOf(PydioNode),
    autoLoadNode: PropTypes.bool,
    observeNodeReload: PropTypes.bool,
    setIsLoading: PropTypes.func,
    setError: PropTypes.func,
    callback: PropTypes.func
}

const useNodeReloadCallback = ({dataModel, node, autoLoadNode = true, observeNodeReload=true, setIsLoading, setError, callback=()=>{}}) => {

    // Node Event Observation (useEffect)
    useEffect(() => {
        if (!dataModel || !node || !observeNodeReload || typeof node.observe !== 'function' || typeof node.stopObserving !== 'function') {
            return;
        }

        const loadingListener = () => setIsLoading(true);
        const loadedListener = () => {
            if(node.getLoadError()){
                setError(node.getLoadError())
            }
            callback(); // This already sets isLoading to false
        };

        node.observe("loading", loadingListener);
        node.observe("loaded", loadedListener);
        node.observe("child_added", callback);
        node.observe("child_removed", callback);
        node.observe("child_replaced", callback);

        return () => {
            node.stopObserving("loading", loadingListener);
            node.stopObserving("loaded", loadedListener);
            node.stopObserving("child_added", callback);
            node.stopObserving("child_removed", callback);
            node.stopObserving("child_replaced", callback);
        };
    }, [dataModel, node, callback, observeNodeReload]);


    // Initial Data Load (useEffect)
    useEffect(() => {
        if (!dataModel || !node || !autoLoadNode ) {
            setIsLoading(false);
            return;
        }

        if (typeof node.isLoaded !== 'function' || typeof node.load !== 'function') {
            console.warn("Node object does not have isLoaded/load methods", node);
            setIsLoading(false);
            return;
        }

        if (node.isLoaded()) {
            if(node.getLoadError()){
                setError(node.getLoadError())
            }
            callback();
        } else {
            setIsLoading(true);
            setError(null);
            node.load()
        }
    }, [dataModel, node, callback, autoLoadNode]);

}

export {useNodeReloadCallback, UseNodeReloadCallbackProps}