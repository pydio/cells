
import PydioApi from 'pydio/http/api'
import {UserMetaServiceApi, IdmUserMetaNamespace, IdmUpdateUserMetaNamespaceRequest, UpdateUserMetaNamespaceRequestUserMetaNsOp} from 'pydio/http/rest-api'

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
        return api.updateUserMetaNamespace(request)
    }

}

Metadata.MetaTypes = {
    "string":"Text",
    "textarea":"Long Text",
    "stars_rate": "Stars Rating",
    "css_label": "Color Labels",
    "tags": "Extensible Tags",
    "choice": "Selection"
};

export {Metadata as default}