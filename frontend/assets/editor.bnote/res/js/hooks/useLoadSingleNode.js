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
import AjxpNode from 'pydio/model/node';
import PathUtils from 'pydio/util/path'
import {NodeServiceApiFactory} from "./NodeServiceApiFactory";

export const useResolveSingleNode = ({nodeUuid, setNode, setError}) => {
    useEffect(() => {
        if(!nodeUuid) {
            return
        }
        const pydio = Pydio.getInstance()
        NodeServiceApiFactory(pydio).then(api => {
            api.getByUuid(nodeUuid).then(res => {
                const fullPathParts = res.data.Path.split('/')
                const slug = fullPathParts.shift()
                const path = '/' + fullPathParts.join('/')
                let repositoryId;
                Pydio.getInstance().user.getRepositoriesList().forEach((r) => {
                    if(r.getSlug() === slug) {
                        repositoryId = r.getId()
                    }
                })
                if(!repositoryId) {
                    setError(new Error('repository not found'))
                    return
                }
                const node = new AjxpNode(path, res.data.Type === 'LEAF', PathUtils.getBasename(path))
                node.getMetadata().set('repository_id', repositoryId)
                setNode(node)
            }).catch((e) => {
                setError(e)
            })
        }).catch(e => {
            setError(e)
        })
    }, [nodeUuid, setNode, setError]);

}

export const useLoadSingleNode = ({dataModel, nodeUuid, setNode, setError}) => {
    const [resolvedNode, setResolvedNode] = useState(null)
    useEffect(() => {
        if(!resolvedNode) {
            return
        }
        dataModel.getAjxpNodeProvider().loadLeafNodeSync(resolvedNode, (n)=>{
            n.getMetadata().set('repository_id', resolvedNode.getMetadata().get('repository_id'))
            n.setParent(new AjxpNode()) // Add a fake parent to avoid errors when opening editors
            setNode(n)
        }, true, {}, (e)=>{setError(e || {message:'not found'})})
    }, [resolvedNode]);
    useResolveSingleNode({nodeUuid, setNode: setResolvedNode, setError})
}