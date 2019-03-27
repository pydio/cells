import PydioApi from 'pydio/http/api'
import XMLUtils from 'pydio/util/xml'
import LangUtils from 'pydio/util/lang'
import {ConfigServiceApi, RestConfiguration} from "pydio/http/rest-api";

class Loader {

    static getInstance(pydio){
        return AdminComponents.PluginsLoader.getInstance(pydio);
    }

}

export {Loader as default}