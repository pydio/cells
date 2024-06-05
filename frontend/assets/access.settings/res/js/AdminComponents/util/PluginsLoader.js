import PydioApi from 'pydio/http/api'
import XMLUtils from 'pydio/util/xml'
import LangUtils from 'pydio/util/lang'
import Pydio from 'pydio'
import {ConfigServiceApi, RestConfiguration} from 'cells-sdk';
const {Manager} = Pydio.requireLib('form');

class PluginsLoader {

    static getInstance(pydio){
        if(!PluginsLoader.INSTANCE){
            PluginsLoader.INSTANCE = new PluginsLoader(pydio);
        }
        return PluginsLoader.INSTANCE;
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
                    lang = this.pydio.user.getPreference('lang');
                }
                const url = this.pydio.Parameters.get('ENDPOINT_REST_API') + '/frontend/plugins/' + lang;
                Pydio.startLoading();
                window.fetch(url, {
                    method:'GET',
                    credentials:'same-origin',
                    headers:headers,
                }).then((response) => {
                    Pydio.endLoading();
                    this.loading = false;
                    response.text().then((text) => {
                        this.plugins = XMLUtils.parseXml(text).documentElement;
                        this.pLoad = null;
                        resolve(this.plugins);
                    });
                }).catch(e=> {
                    Pydio.endLoading();
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

        api.getConfig(fullPath).then(response => response.Data).then((data = "{}") => {
            const currentData = JSON.parse(data) || {};
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

    loadServiceConfigs(serviceName){
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        return api.getConfig("services/" + serviceName).then(data => data || {}).then((restConfig) => {
            if(restConfig.Data){
                return JSON.parse(restConfig.Data) || {};
            } else {
                return {}
            }
        });
    }

    saveServiceConfigs(serviceName, data){
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        let body = new RestConfiguration();
        body.FullPath = "services/" + serviceName;
        body.Data = JSON.stringify(data);
        return api.putConfig(body.FullPath, body);
    }

    loadPluginConfigs(pluginId){
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        const fullPath = "frontend/plugin/" + pluginId;
        return new Promise((resolve, reject) => {
            api.getConfig(fullPath).then(response => response.Data).then((data = "{}") => {
                const currentData = JSON.parse(data) || {};
                resolve(currentData);
            }).catch(e => {
                reject(e);
            });
        });
    }

    savePluginConfigs(pluginId, values, callback){

        const api = new ConfigServiceApi(PydioApi.getRestClient());
        const fullPath = "frontend/plugin/" + pluginId;

        api.getConfig(fullPath).then(response => response.Data).then((data = "{}") => {
            const currentData = JSON.parse(data) || {};
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

    /**
     *
     * @return {*|Promise|PromiseLike<T>|Promise<T>}
     */
    allPluginsActionsAndParameters(){
        return this.loadPlugins().then((plugins) => {
            const xmlActions = XMLUtils.XPathSelectNodes(plugins, "//action");
            const xmlParameters = XMLUtils.XPathSelectNodes(plugins, "//global_param|//param");
            const ACTIONS = {};
            const PARAMETERS = {};
            xmlActions.map(action => {
                const pluginId = action.parentNode.parentNode.parentNode.getAttribute("id");
                if(!ACTIONS[pluginId]) {
                    ACTIONS[pluginId] = [];
                }
                ACTIONS[pluginId].push({
                    action: action.getAttribute('name'),
                    label : action.getAttribute('name'),
                    xmlNode: action
                });
            });
            xmlParameters.map(parameter => {
                if(parameter.parentNode.nodeName !== 'server_settings') {
                    return;
                }
                const pluginId = parameter.parentNode.parentNode.getAttribute("id");
                if(!PARAMETERS[pluginId]) {
                    PARAMETERS[pluginId] = [];
                }
                PARAMETERS[pluginId].push({
                    parameter: parameter.getAttribute('name'),
                    label : parameter.getAttribute('name'),
                    xmlNode: parameter
                });
            });
            return {ACTIONS, PARAMETERS};
        });
    }

    /**
     * @param xPath string
     * @return {Promise}
     */
    formParameters(xPath){
        return this.loadPlugins().then(registry => {
            return XMLUtils.XPathSelectNodes(registry, xPath).filter(node => {
                return (node.parentNode.nodeName === 'server_settings');
            }).map(function(node){
                const params = Manager.parameterNodeToHash(node);
                const pluginId = node.parentNode.parentNode.getAttribute("id");
                params['pluginId'] = pluginId;
                params['aclKey'] = 'parameter:' + pluginId + ':' + node.getAttribute("name");
                return params;
            }.bind(this));
        })
    }

    loadSites(filter = '*'){
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        return api.listSites(filter);
    }

}

export {PluginsLoader as default}