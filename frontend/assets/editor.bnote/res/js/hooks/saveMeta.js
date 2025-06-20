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

import PydioApi from 'pydio/http/api'
import {UserMetaServiceApi, IdmUpdateUserMetaRequest, IdmUserMeta, ServiceResourcePolicy} from 'cells-sdk'

export const saveMeta = (blocks, contentMeta, nodeUuid, setDirty = () => {
}) => {
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