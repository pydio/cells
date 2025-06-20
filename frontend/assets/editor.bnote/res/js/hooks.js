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

import {useState, useEffect, useMemo, useCallback} from 'react';
import {debounce} from "lodash";
import Pydio from 'pydio'
import PydioApi from 'pydio/http/api'
import {UserMetaServiceApi, IdmUpdateUserMetaRequest, IdmUserMeta, ServiceResourcePolicy} from 'cells-sdk'
import {defaultHeaderBlocks, findExistingHeader, getPageTitleFromNode} from "./hooks/useNodeTitle";

export const useHover = () => {
    const [hover, setHover] = useState(false)
    const onMouseEnter = useCallback(() => {
        setHover(true)
    }, [hover])
    const onMouseLeave = useCallback(() => {
        setHover(false)
    }, [hover])
    return {
        hover,
        hoverProps: {onMouseEnter, onMouseLeave},
        hoverMoreStyle: {opacity:hover?0.77:0}
    }
}

export const saveNow = (blocks, contentMeta, nodeUuid, setDirty = () => {})=>{
    const api = new UserMetaServiceApi(PydioApi.getRestClient());

    let request = new IdmUpdateUserMetaRequest();
    request.MetaDatas = [];
    request.Operation = 'PUT';
    const meta = new IdmUserMeta();
    meta.NodeUuid = nodeUuid;
    meta.Namespace = contentMeta;
    meta.JsonValue = JSON.stringify(blocks);
    meta.Policies = [
        ServiceResourcePolicy.constructFromObject({
            Action: 'READ',
            Subject: '*',
            Effect: 'allow'
        }),
        ServiceResourcePolicy.constructFromObject({
            Action: 'WRITE',
            Subject: '*',
            Effect: 'allow'
        }),
    ];
    request.MetaDatas.push(meta);
    return api.updateUserMeta(request).then(() => {
        setDirty(false)
    }).catch(e => {
        console.error('Cannot save metadata', e)
    })
}

export const useNodeContent = (node, contentMeta, withDefaultHeader) => {

    const [loaded, setLoaded] = useState(false)
    const [trigger, trig] = useState(0)
    const [content, setContent] = useState([])
    const [dirty, setDirty] = useState(false)

    const nodeLoaded = node.isLoaded()
    const nodeUUID = node.getMetadata().get('uuid')

    const save = useMemo(
        () =>
            debounce((blocks) => saveNow(blocks, contentMeta, nodeUUID, setDirty), 1500), [nodeUUID])

    const saveImmediate = useMemo(() => (blocks) => saveNow(blocks, contentMeta, nodeUUID, setDirty), [nodeUUID])

    useEffect(()=> {
        setLoaded(false)
        setContent([])
        trig(trigger+1)
    }, [node, nodeLoaded, nodeUUID])

    useEffect(()=>{
        if(loaded) {
            return
        }
        let ct = []
        if(node && node.getMetadata().has(contentMeta)) {
            ct = node.getMetadata().get(contentMeta)
        }
        if(withDefaultHeader) {
            if(!findExistingHeader(ct)) {
                ct = [...defaultHeaderBlocks(), ...ct]
            }
        }
        setContent(ct)
        setLoaded(true)
    }, [loaded, trigger]);

    return {loaded, content, save, saveNow: saveImmediate, dirty, setDirty}

}