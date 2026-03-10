/*
 * Copyright 2025 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React, { useCallback, useContext, useEffect, useState } from 'react';
import Pydio from 'pydio';
import DataModel from 'pydio/model/data-model';
import { useResolveSingleNode } from '../hooks/useLoadSingleNode';
import { PydioContext } from '../hooks/context';

import './styles/ChildrenListStyles.less';
import { FilesList } from './FilesList';

export const ChildrenList = ({ block }) => {
    const pydio = Pydio.getInstance();
    const { nodeUuid, path } = block.props;
    const { dataModel: ctxDataModel } = useContext(PydioContext);
    const [dataModel, setDataModel] = useState(ctxDataModel);
    const [contextNode, setContextNode] = useState(
        !nodeUuid && ctxDataModel.getContextNode(),
    );
    const [resolvedNode, setResolvedNode] = useState(null);
    const [error, setError] = useState(null);

    // Resolve uuidNode if set, otherwise will fallback to current context node
    const setNode = useCallback(
        (rootNode) => {
            const providerProps = {};
            if (rootNode.getMetadata().has('repository_id')) {
                providerProps.tmp_repository_id = rootNode
                    .getMetadata()
                    .get('repository_id');
            }
            const dm = DataModel.RemoteDataModelFactory(providerProps);
            setDataModel(dm);
            setContextNode(dm.getRootNode());
            setResolvedNode(rootNode);
        },
        [nodeUuid],
    );

    useResolveSingleNode({ nodeUuid, setNode, setError });

    // Handle contextNode
    useEffect(() => {
        if (!dataModel) {
            return;
        }
        const observer = () => setContextNode(dataModel.getContextNode());
        dataModel.observe('context_changed', observer);
        if (resolvedNode) {
            dataModel.requireContextChange(resolvedNode);
        }
        return () => {
            dataModel.stopObserving('context_changed', observer);
        };
    }, [dataModel, resolvedNode]);

    // Bind local dataModel selection to global datamodel in both ways
    useEffect(() => {
        if (!dataModel || dataModel === ctxDataModel) {
            return;
        }
        const observerUp = () => {
            const nodes = dataModel.getSelectedNodes();
            if (nodes && nodes.length) {
                ctxDataModel.setSelectedNodes(
                    dataModel.getSelectedNodes(),
                    dataModel,
                );
            }
        };
        const observerDown = () => {
            if (ctxDataModel.getSelectionSource() !== dataModel) {
                dataModel.setSelectedNodes([]);
            }
        };
        dataModel.observe('selection_changed', observerUp);
        ctxDataModel.observe('selection_changed', observerDown);
        return () => {
            dataModel.stopObserving('selection_changed', observerUp);
            ctxDataModel.stopObserving('selection_changed', observerDown);
        };
        // Map selection to global DM
    }, [dataModel]);

    return (
        <FilesList
            pydio={pydio}
            dataModel={dataModel}
            contextNode={contextNode}
            nodePath={path}
            resolvedNode={resolvedNode}
            resolveError={error}
            emptyStateKey={nodeUuid ? 'empty-state.folder' : 'empty-state.toc'}
            block={block}
        />
    );
};
