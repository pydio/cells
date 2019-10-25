/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import {pydio} from '../globals'
import PydioApi from 'pydio/http/api'
import {UserMetaServiceApi, IdmUpdateUserMetaRequest, IdmUserMeta, ServiceResourcePolicy, IdmSearchUserMetaRequest, UpdateUserMetaRequestUserMetaOp} from 'pydio/http/rest-api'

export default function(){
    const selection = pydio.getContextHolder();
    if(selection.isEmpty() || !selection.isUnique()){
        return;
    }
    const node = selection.getUniqueNode();
    const isBookmarked = node.getMetadata().get('bookmark') === 'true';
    const nodeUuid = node.getMetadata().get('uuid');
    const userId = pydio.user.id;

    const api = new UserMetaServiceApi(PydioApi.getRestClient());
    let request = new IdmUpdateUserMetaRequest();
    if(isBookmarked) {
        const searchRequest = new IdmSearchUserMetaRequest();
        searchRequest.NodeUuids = [nodeUuid];
        searchRequest.Namespace = "bookmark";
        api.searchUserMeta(searchRequest).then(res => {
            if (res.Metadatas && res.Metadatas.length) {
                request.Operation = UpdateUserMetaRequestUserMetaOp.constructFromObject('DELETE');
                request.MetaDatas = res.Metadatas;
                api.updateUserMeta(request).then(() => {
                    selection.requireNodeReload(node);
                    pydio.notify("reload-bookmarks");
                });
            }
        });
    } else {
        request.Operation = UpdateUserMetaRequestUserMetaOp.constructFromObject('PUT');
        let userMeta = new IdmUserMeta();
        userMeta.NodeUuid = nodeUuid;
        userMeta.Namespace = "bookmark";
        userMeta.JsonValue = "\"true\"";
        userMeta.Policies = [
            ServiceResourcePolicy.constructFromObject({Resource:nodeUuid, Action:'OWNER', Subject:'user:' + userId, Effect:'allow'}),
            ServiceResourcePolicy.constructFromObject({Resource:nodeUuid, Action:'READ', Subject:'user:' + userId, Effect:'allow'}),
            ServiceResourcePolicy.constructFromObject({Resource:nodeUuid, Action:'WRITE', Subject:'user:' + userId, Effect:'allow'}),
        ];
        request.MetaDatas = [userMeta];
        api.updateUserMeta(request).then(() => {
            selection.requireNodeReload(node);
            pydio.notify("reload-bookmarks");
        });
    }

}