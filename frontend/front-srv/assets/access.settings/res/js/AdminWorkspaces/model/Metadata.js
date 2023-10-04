/*
 * Copyright 2023 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import {UserMetaServiceApi, IdmUserMetaNamespace, IdmUpdateUserMetaNamespaceRequest, UpdateUserMetaNamespaceRequestUserMetaNsOp} from 'cells-sdk'

class Metadata {

    static loadNamespaces(){
        const api = new UserMetaServiceApi(PydioApi.getRestClient());
        return api.listUserMetaNamespace();
    }

    /**
     * @param namespace {IdmUserMetaNamespace}
     * @return {Promise}
     */
    static putNS(namespace) {
        const api = new UserMetaServiceApi(PydioApi.getRestClient());
        let request = new IdmUpdateUserMetaNamespaceRequest();
        request.Operation = UpdateUserMetaNamespaceRequestUserMetaNsOp.constructFromObject('PUT');
        request.Namespaces = [namespace];
        Metadata.clearLocalCache();
        return api.updateUserMetaNamespace(request)
    }

    /**
     * @param namespace {IdmUserMetaNamespace}
     * @return {Promise}
     */
    static deleteNS(namespace) {
        const api = new UserMetaServiceApi(PydioApi.getRestClient());
        let request = new IdmUpdateUserMetaNamespaceRequest();
        request.Operation = UpdateUserMetaNamespaceRequestUserMetaNsOp.constructFromObject('DELETE');
        request.Namespaces = [namespace];
        Metadata.clearLocalCache();
        return api.updateUserMetaNamespace(request)
    }

    /**
     * Clear ReactMeta cache if it exists
     */
    static clearLocalCache(){
        try{
            if(window.ReactMeta){
                ReactMeta.Renderer.getClient().clearConfigs();
            }
        }catch (e){
            //console.log(e)
        }
    }

}

Metadata.MetaTypes = {
    "string":       "Text",
    "textarea":     "Long Text",
    "integer":      "Number",
    "boolean":      "Boolean",
    "date":         "Date",
    "choice":       "Selection",
    "tags":         "Extensible Tags",
    "stars_rate":   "Stars Rating",
    "css_label":    "Color Labels",
    "json":         "JSON"
};

export {Metadata as default}