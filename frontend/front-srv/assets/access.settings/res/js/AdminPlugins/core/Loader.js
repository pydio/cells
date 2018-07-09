import PydioApi from 'pydio/http/api'
import XMLUtils from 'pydio/util/xml'
import LangUtils from 'pydio/util/lang'
import {ConfigServiceApi, RestConfiguration} from "pydio/http/rest-api";

class Loader {

    static getInstance(pydio){
        if(!Loader.INSTANCE){
            Loader.INSTANCE = new Loader(pydio);
        }
        return Loader.INSTANCE;
    }

    constructor(pydio){
        this.pydio = pydio;
        this.pLoad = null;
        this.plugins = null;
    }

    loadPlugins(forceReload = false){

        if(this.plugins && !forceReload){
            return Promise.resolve(this.plugins);
        }

        if(this.pLoad !== null){
            return this.pLoad;
        }

        this.pLoad = new Promise((resolve, reject) => {

            PydioApi.getRestClient().getOrUpdateJwt().then(jwt => {
                const headers = {Authorization: 'Bearer ' + jwt};
                let lang = 'en';
                if (this.pydio.user && this.pydio.user.getPreference('lang')){
                    lang = this.pydio.user.getPreference('lang', true);
                }
                const url = this.pydio.Parameters.get('ENDPOINT_REST_API') + '/frontend/plugins/' + lang;
                window.fetch(url, {
                    method:'GET',
                    credentials:'same-origin',
                    headers:headers,
                }).then((response) => {
                    this.loading = false;
                    response.text().then((text) => {
                        this.plugins = XMLUtils.parseXml(text).documentElement;
                        this.pLoad = null;
                        resolve(this.plugins);
                    });
                }).catch(e=> {
                    this.pLoad = null;
                    reject(e);
                });

            });

        });

        return this.pLoad;

    }

    /**
     *
     * @param pluginNode DOMNode
     * @param enabled boolean
     * @param callback Function
     */
    toggleEnabled(pluginNode, enabled, callback){

        const api = new ConfigServiceApi(PydioApi.getRestClient());
        const fullPath = "frontend/plugin/" + pluginNode.getAttribute('id');
        // Load initial config

        api.getConfig(fullPath).then((response) => {
            const currentData = JSON.parse(response.Data) || {};
            currentData["PYDIO_PLUGIN_ENABLED"] = enabled;
            const config = RestConfiguration.constructFromObject({
                FullPath: fullPath,
                Data: JSON.stringify(currentData)
            });
            api.putConfig(config.FullPath, config).then(() => {
                callback();
            })
        });
    }

    loadPluginConfigs(pluginId){
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        const fullPath = "frontend/plugin/" + pluginId;
        return new Promise((resolve, reject) => {
            api.getConfig(fullPath).then((response) => {
                const currentData = JSON.parse(response.Data) || {};
                resolve(currentData);
            }).catch(e => {
                reject(e);
            });
        });
    }

    savePluginConfigs(pluginId, values, callback){

        const api = new ConfigServiceApi(PydioApi.getRestClient());
        const fullPath = "frontend/plugin/" + pluginId;

        api.getConfig(fullPath).then((response) => {
            const currentData = JSON.parse(response.Data) || {};
            const newData = LangUtils.mergeObjectsRecursive(currentData, values);
            const config = RestConfiguration.constructFromObject({
                FullPath: fullPath,
                Data: JSON.stringify(newData)
            });
            api.putConfig(config.FullPath, config).then(() => {
                callback(newData);
            })
        });

    }

}

export {Loader as default}