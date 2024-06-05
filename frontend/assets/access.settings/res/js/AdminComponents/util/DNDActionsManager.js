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
import PathUtils from 'pydio/util/path'
import LangUtils from 'pydio/util/lang'
import PydioApi from 'pydio/http/api'

class DNDActionsManager{

    /**
     * Check if a source can be dropped on a target.
     * Throws an exception if not allowed
     *
     * @param source AjxpNode
     * @param target AjxpNode
     */
    static canDropNodeOnNode(source, target){
        const sourceMime = source.getAjxpMime();
        const targetMime = target.getAjxpMime();
        if(sourceMime === "role" && source.getMetadata().get("role_id") === "PYDIO_GRP_/"){
            throw new Error('Cannot drop this!');
        }
        let result;
        if(sourceMime === "role" && targetMime === "user_editable") {
            result = true;
        }
        if(sourceMime === "user_editable" && targetMime === "group"){
            result = true;
        }
        if(!result){
            throw new Error('Cannot drop this!');
        }
    }

    /**
     * Apply a successful drop of Source on Target
     * @param source AjxpNode
     * @param target AjxpNode
     */
    static dropNodeOnNode(source, target){
        const sourceMime = source.getAjxpMime();
        const targetMime = target.getAjxpMime();
        if(sourceMime === "user_editable" && targetMime === "group"){
            if(PathUtils.getDirname(source.getPath()) === target.getPath()){
                alert('Please drop user in a different group!');
                return;
            }
            // update_user_group
            const idmUser = source.getMetadata().get('IdmUser');
            const idmGroup = target.getMetadata().get('IdmUser');
            if(!idmGroup && target.getPath() === '/idm/users'){
                idmUser.GroupPath = '/';
            } else {
                idmUser.GroupPath = LangUtils.trimRight(idmGroup.GroupPath, '/') + '/' + idmGroup.GroupLabel;
            }
            PydioApi.getRestClient().getIdmApi().updateIdmUser(idmUser).then((res) => {
                if(source.getParent()){
                    source.getParent().reload();
                }
                target.reload();
            });
        }else if(sourceMime === "role" && targetMime === "user_editable"){
            // TODO : Apply role to user
        }
    }

}

export {DNDActionsManager as default}