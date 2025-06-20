import {useEffect, useState} from 'react'
import Pydio from 'pydio'
import {NodeServiceApiFactory} from "./NodeServiceApiFactory";
import {saveNow} from "../hooks";

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
    saveNow(newAbstract, abstractMeta, node.getMetadata().get('uuid'))
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
    return contents.find(block => block.type === 'header')
}

export const defaultHeaderBlocks = () => {
    return [
        {
            "type": "header"
        },
        {
            "type": "paragraph",
            "content": [{"type": "text", "text": "", "styles": {}}]
        }
    ]
}