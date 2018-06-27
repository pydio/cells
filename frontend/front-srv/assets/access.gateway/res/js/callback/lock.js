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

import PydioApi from 'pydio/http/api'
import {ACLServiceApi, IdmACL, IdmACLAction} from 'pydio/http/rest-api'

export default function (pydio) {
    return function(){
        const api = new ACLServiceApi(PydioApi.getRestClient());
        let acl = new IdmACL();
        const node = pydio.getContextHolder().getUniqueNode();
        acl.NodeID = node.getMetadata().get('uuid');
        acl.Action = IdmACLAction.constructFromObject({Name:"content_lock", Value:pydio.user.id});
        let p;
        const wasLocked = node.getMetadata().get("sl_locked");
        if(wasLocked){
            p = api.deleteAcl(acl);
        }else {
            p = api.putAcl(acl);
        }
        p.then(res => {
            pydio.getContextHolder().requireNodeReload(node);
        });
    }
}