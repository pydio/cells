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

import {useState, useEffect, useMemo} from 'react';
import {debounce} from "lodash";
import PydioApi from 'pydio/http/api'
import {UserMetaServiceApi, IdmUpdateUserMetaRequest, IdmUserMeta, ServiceResourcePolicy} from 'cells-sdk'


const saveNow = (blocks, contentMeta, nodeUuid, setDirty)=>{
    const api = new UserMetaServiceApi(PydioApi.getRestClient());

    const bb = blocks.map(b => {
        if(b.type === 'childrenList') {
            return {type:'childrenList', props:{}}
        }
        return b;
    });

    let request = new IdmUpdateUserMetaRequest();
    request.MetaDatas = [];
    request.Operation = 'PUT';
    const meta = new IdmUserMeta();
    meta.NodeUuid = nodeUuid;
    meta.Namespace = contentMeta;
    meta.JsonValue = JSON.stringify(bb);
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
    api.updateUserMeta(request).then(() => {
        console.log('Saved to Metadata')
        setDirty(false)
    }).catch(e => {
        console.error('Cannot save metadata', e)
    })
}

export const useNodeContent = (node, contentMeta) => {

    const [loaded, setLoaded] = useState(false)
    const [trigger, trig] = useState(0)
    const [content, setContent] = useState('')
    const [dirty, setDirty] = useState(false)

    const nodeLoaded = node.isLoaded()
    const nodeUUID = node.getMetadata().get('uuid')

    const save = useMemo(
        () =>
            debounce((blocks) => saveNow(blocks, contentMeta, nodeUUID, setDirty), 1500), [nodeUUID])

    useEffect(()=> {
        setLoaded(false)
        setContent([])
        trig(trigger+1)
    }, [node, nodeLoaded, nodeUUID])

    useEffect(()=>{
        if(loaded) {
            return
        }
        if(node && node.getMetadata().has(contentMeta)) {
            setContent(node.getMetadata().get(contentMeta))
            setLoaded(true)
        } else {
            setLoaded(true)
        }
    }, [loaded, trigger]);


    return {loaded, content, save, dirty, setDirty}

}