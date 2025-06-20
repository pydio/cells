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

import {useEffect, useState} from 'react'
import Pydio from 'pydio'
import {NodeServiceApiFactory} from "./NodeServiceApiFactory";
import {HeaderSpecType} from "../specs/Header";
import {saveMeta} from "./saveMeta";

const renameFolder = (node, newName) => {
    const pydio = Pydio.getInstance()
    NodeServiceApiFactory(pydio).then(api => {
        const fullPath = pydio.user.getActiveRepositoryObject().getSlug() + node.getPath()
        const pp = fullPath.split('/')
        pp.pop()
        pp.push(newName)
        const req = {
            Nodes: [{Path: fullPath}],
            JsonParameters: '{"targetParent":false}',
            CopyMoveOptions: {TargetPath: pp.join('/')}
        }
        pydio.UI.displayMessage('SUCCESS', 'Renaming page to ' + newName + '...')
        return api.performAction("move", req)
    }).catch(e => {
        console.error(e)
    })
}

const abstractFolder = (abstractMeta, node, newAbstract) => {
    saveMeta(newAbstract, abstractMeta, node.getMetadata().get('uuid'))
}

const renameCell = (node, newName) => {}

export const useNodeTitle = ({node}) => {

    const {title, description, isRoot} = getPageTitleFromNode(node)
    const [_title, _setTitle] = useState(title)
    const [_desc, _setDesc] = useState(description)

    useEffect(() => {
        if(!node) {
            return
        }
        const obs = () => {
            const {title, description} = getPageTitleFromNode(node)
            if(title !== _title) {
                _setTitle(title)
            }
            if(description !== _desc) {
                _setDesc(description)
            }
        }
        if(isRoot) {
            const pydio = Pydio.getInstance()
            pydio.observe('repository_list_refreshed', obs)
            return () => pydio.stopObserving('repository_list_refreshed', obs)
        }else {
            node.observe('node_replaced', obs)
            return () => node.stopObserving('node_replaced', obs)
        }
    }, [node]);

    const renameCallback = isRoot ? null : renameFolder

    const abstractMeta = Pydio.getInstance().getPluginConfigs('editor.bnote').get('BNOTE_ABSTRACT_META')
    let abstractCallback;
    if (!isRoot && abstractMeta) {
        abstractCallback = (n, nA) => abstractFolder(abstractMeta, n, nA)
    }

    return {
        title: _title,
        description:_desc,
        isRoot,
        renameCallback,
        abstractCallback
    }
}

export const getPageTitleFromNode = (node) => {
    let title = node.getLabel()
    let description
    let isRoot = false
    const activeRepo = Pydio.getInstance().user.getActiveRepositoryObject()
    const abstractMeta = Pydio.getInstance().getPluginConfigs('editor.bnote').get('BNOTE_ABSTRACT_META')
    if (node.getMetadata().has('ws_root')) {
        title = Pydio.getInstance().user.getActiveRepositoryObject().getLabel() || title
        description = activeRepo.getDescription() || '';
        isRoot = true
    } else if(abstractMeta && node.getMetadata().get(abstractMeta)){
        description = node.getMetadata().get(abstractMeta)
    }
    return {title, description, isRoot}
}

export const findExistingHeader = (contents=[])=> {
    return contents.find(block => block.type === HeaderSpecType)
}

export const defaultHeaderBlocks = () => {
    return [
        {
            "type": HeaderSpecType
        },
        {
            "type": "paragraph",
            "content": [{"type": "text", "text": "", "styles": {}}]
        }
    ]
}