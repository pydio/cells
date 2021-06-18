
import PydioApi from 'pydio/http/api'
import ResourcesManager from 'pydio/http/resources-manager'
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