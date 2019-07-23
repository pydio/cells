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
import XMLUtils from '../util/XMLUtils'
import PydioApi from '../http/PydioApi'
import User from './User'
import Logger from '../lang/Logger'
import ResourcesManager from '../http/ResourcesManager'

export default class Registry{

    constructor(pydioObject){
        this._registry = null;
        this._extensionsRegistry = {"editor":[], "uploader":[]};
        this._resourcesRegistry = {};
        this._pydioObject = pydioObject;
        this._xPathLoading = false;
        this._globalLoading = false;
    }

    /**
     * Parse XML String directly
     * @param s
     */
    loadFromString(s){
        if(this._fileExtensions) this._fileExtensions = null;
        this._registry = XMLUtils.parseXml(s).documentElement;
    }

    /**
     *
     */
    loadXML(documentElement){
        if(this._fileExtensions) this._fileExtensions = null;
        this._registry = documentElement;
        console.log("Registry loading XML")
        this._pydioObject.fire("registry_loaded", this._registry);
    }

    /**
     * Load registry from server
     * @param xPath
     * @param completeFunc
     * @param repositoryId
     */
    load(xPath = null, completeFunc = null, repositoryId = null){
        if(this._globalLoading) {
            return;
        }
        console.log("Registry loading")
        this._globalLoading = true;
        PydioApi.getRestClient().getOrUpdateJwt().then(jwt => {
            const {user, Parameters} = this._pydioObject;
            let url = Parameters.get('ENDPOINT_REST_API') + '/frontend/state/';
            let headers = {};
            if(jwt){
                headers = {Authorization: 'Bearer ' + jwt};
                if (user || repositoryId) {
                    url += '?ws=' + (repositoryId ? repositoryId : user.getActiveRepository())
                }
            }
            if(Parameters.has('MINISITE')) {
                headers["X-Pydio-Minisite"] = Parameters.get('MINISITE')
            }
            if (user && user.getPreference('lang')){
                const lang = user.getPreference('lang');
                if (url.indexOf('?') > 0) {
                    url += '&lang=' + lang;
                } else {
                    url += '?lang=' + lang;
                }
            }
            window.fetch(url, {
                method:'GET',
                credentials:'same-origin',
                headers:headers,
            }).then((response) => {
                this._globalLoading = false;
                response.text().then((text) => {
                    this._registry = XMLUtils.parseXml(text).documentElement;
                    if (completeFunc) {
                        completeFunc(this._registry);
                    } else {
                        this._pydioObject.fire("registry_loaded", this._registry);
                    }
                });
            }).catch(e=> {
                this._globalLoading = false;
            });

        })

    }

    /**
     * Inserts a document fragment retrieved from server inside the full tree.
     * The node must contains the xPath attribute to locate it inside the registry.
     * @param documentElement DOMNode
     */
    refreshXmlRegistryPart (documentElement){
        const xPath = documentElement.getAttribute("xPath");
        const existingNode = XMLUtils.XPathSelectSingleNode(this._registry, xPath);
        let parentNode;
        if(existingNode && existingNode.parentNode){
            parentNode = existingNode.parentNode;
            parentNode.removeChild(existingNode);
            if(documentElement.firstChild){
                parentNode.appendChild(documentElement.firstChild.cloneNode(true));
            }
        }else if(xPath.indexOf("/") > -1){
            // try selecting parentNode
            const parentPath = xPath.substring(0, xPath.lastIndexOf("/"));
            parentNode = XMLUtils.XPathSelectSingleNode(this._registry, parentPath);
            if(parentNode && documentElement.firstChild){
                parentNode.appendChild(documentElement.firstChild.cloneNode(true));
            }
        }else{
            if(documentElement.firstChild) this._registry.appendChild(documentElement.firstChild.cloneNode(true));
        }
        this._pydioObject.fire("registry_part_loaded", xPath);
    }

    /**
     * Translate the XML answer to a new User object
     */
    parseUser(){
        let user = null, userNode;
        if(this._registry){
            userNode = XMLUtils.XPathSelectSingleNode(this._registry, "user");
        }
        if(userNode){
            const userId = userNode.getAttribute('id');
            const children = userNode.childNodes;
            if(userId){
                user = new User(userId, children, this._pydioObject);
            }
        }
        return user;
    }

    /**
     *
     * @returns {Element|*|null}
     */
    getXML(){
        return this._registry;
    }

    /**
     * Find Extension initialisation nodes (activeCondition, onInit, etc), parses
     * the XML and execute JS.
     * @param xmlNode {Element} The extension node
     * @param extensionDefinition Object Information already collected about this extension
     * @returns Boolean
     */
    initExtension (xmlNode, extensionDefinition){
        const activeCondition = XMLUtils.XPathSelectSingleNode(xmlNode, 'processing/activeCondition');
        if(activeCondition && activeCondition.firstChild){
            try{
                const func = new Function(activeCondition.firstChild.nodeValue.trim());
                if(func() === false) return false;
            }catch(e){}
        }
        if(xmlNode.nodeName === 'editor'){

            Object.assign(extensionDefinition,
            {
                openable            : (xmlNode.getAttribute("openable") === "true"),
                modalOnly           : (xmlNode.getAttribute("modalOnly") === "true"),
                previewProvider     : (xmlNode.getAttribute("previewProvider") === "true"),
                order               : (xmlNode.getAttribute("order")?parseInt(xmlNode.getAttribute("order")):0),
                formId              : xmlNode.getAttribute("formId") || null,
                text                : this._pydioObject.MessageHash[xmlNode.getAttribute("text")],
                title               : this._pydioObject.MessageHash[xmlNode.getAttribute("title")],
                icon                : xmlNode.getAttribute("icon"),
                icon_class          : xmlNode.getAttribute("iconClass"),
                editorActions       : xmlNode.getAttribute("actions"),
                editorClass         : xmlNode.getAttribute("className"),
                mimes               : xmlNode.getAttribute("mimes").split(","),
                write               : (xmlNode.getAttribute("write") && xmlNode.getAttribute("write")==="true"?true:false),
                canWrite            : (xmlNode.getAttribute("canWrite") && xmlNode.getAttribute("canWrite")==="true"?true:false)
            });

        }else if(xmlNode.nodeName === 'uploader'){

            const th = this._pydioObject.Parameters.get('theme');
            let clientForm = XMLUtils.XPathSelectSingleNode(xmlNode, 'processing/clientForm[@theme="'+th+'"]');
            if(!clientForm){
                clientForm = XMLUtils.XPathSelectSingleNode(xmlNode, 'processing/clientForm');
            }
            if(clientForm && clientForm.getAttribute('module')){
                extensionDefinition.moduleName = clientForm.getAttribute('module');
            }
            if(xmlNode.getAttribute("order")){
                extensionDefinition.order = parseInt(xmlNode.getAttribute("order"));
            }else{
                extensionDefinition.order = 0;
            }
            const extensionOnInit = XMLUtils.XPathSelectSingleNode(xmlNode, 'processing/extensionOnInit');
            if(extensionOnInit && extensionOnInit.firstChild){
                try{
                    // @TODO: THIS WILL LIKELY TRIGGER PROTOTYPE CODE
                    eval(extensionOnInit.firstChild.nodeValue);
                }catch(e){
                    Logger.error("Ignoring Error in extensionOnInit code:");
                    Logger.error(extensionOnInit.firstChild.nodeValue);
                    Logger.error(e.message);
                }
            }
            const dialogOnOpen = XMLUtils.XPathSelectSingleNode(xmlNode, 'processing/dialogOnOpen');
            if(dialogOnOpen && dialogOnOpen.firstChild){
                extensionDefinition.dialogOnOpen = dialogOnOpen.firstChild.nodeValue;
            }
            const dialogOnComplete = XMLUtils.XPathSelectSingleNode(xmlNode, 'processing/dialogOnComplete');
            if(dialogOnComplete && dialogOnComplete.firstChild){
                extensionDefinition.dialogOnComplete = dialogOnComplete.firstChild.nodeValue;
            }
        }
        return true;
    }

    /**
     * Refresh the currently active extensions
     * Extensions are editors and uploaders for the moment.
     */
    refreshExtensionsRegistry (){

        this._extensionsRegistry = {"editor":[], "uploader":[]};
        let extensions = XMLUtils.XPathSelectNodes(this._registry, "plugins/editor|plugins/uploader");
        for(let i=0;i<extensions.length;i++){

            let extensionDefinition = {
                id : extensions[i].getAttribute("id"),
                xmlNode : extensions[i],
                resourcesManager : new ResourcesManager()
            };
            this._resourcesRegistry[extensionDefinition.id] = extensionDefinition.resourcesManager;
            const resourceNodes = XMLUtils.XPathSelectNodes(extensions[i], "client_settings/resources|dependencies|clientForm");
            for(let j=0;j<resourceNodes.length;j++){
                extensionDefinition.resourcesManager.loadFromXmlNode(resourceNodes[j]);
            }
            if(this.initExtension(extensions[i], extensionDefinition)){
                this._extensionsRegistry[extensions[i].nodeName].push(extensionDefinition);
            }
        }
        ResourcesManager.loadAutoLoadResources(this._registry);

    }


    /**
     * Find the currently active extensions by type
     * @param extensionType String "editor" or "uploader"
     * @returns {array}
     */
    getActiveExtensionByType (extensionType){
        return this._extensionsRegistry[extensionType];
    }

    /**
     * Find a given editor by its id
     * @param editorId String
     * @returns AbstractEditor
     */
    findEditorById (editorId){
        return this._extensionsRegistry.editor.find(function(el){return(el.id == editorId);});
    }

    /**
     * Find Editors that can handle a given mime type
     * @param mime String
     * @returns AbstractEditor[]
     * @param restrictToPreviewProviders
     */
    findEditorsForMime (mime, restrictToPreviewProviders){

        const user = this._pydioObject.user;
        let editors = [], checkWrite = false;

        if(user != null && !user.canWrite()){
            checkWrite = true;
        }
        this._extensionsRegistry.editor.forEach(function(el){
            if(el.mimes.indexOf(mime) !==-1 || el.mimes.indexOf('*') !==-1 ) {
                if(restrictToPreviewProviders && !el.previewProvider) return;
                if(!checkWrite || !el.write) editors.push(el);
            }
        });
        if(editors.length && editors.length > 1){
            editors = editors.sort(function(a,b){
                return (a.order||0)-(b.order||0);
            });
        }
        return editors;

    }

    /**
     * Trigger the load method of the resourcesManager.
     * @param resourcesManager ResourcesManager
     * @param callback triggered after JS loaded
     */
    loadEditorResources (resourcesManager, callback){
        resourcesManager.load(this._resourcesRegistry, false, callback);
    }

    /**
     *
     * @param pluginQuery
     * @returns {Map}
     */
    getPluginConfigs (pluginQuery){

        let xpath = 'plugins/*[@id="core.'+pluginQuery+'"]/plugin_configs/property | plugins/*[@id="'+pluginQuery+'"]/plugin_configs/property';
        if(pluginQuery.indexOf('.') === -1){
            xpath = 'plugins/'+pluginQuery+'/plugin_configs/property |' + xpath;
        }
        const properties = XMLUtils.XPathSelectNodes(this._registry, xpath);
        let configs = new Map();
        properties.forEach(function(propNode){
            configs.set(propNode.getAttribute("name"), JSON.parse(propNode.firstChild.nodeValue));
        });
        return configs;

    }

    /**
     *
     * @param pluginId
     * @param paramName
     * @returns {string}
     */
    getDefaultImageFromParameters(pluginId, paramName){
        const node = XMLUtils.XPathSelectSingleNode(this._registry, "plugins/*[@id='"+pluginId+"']/server_settings/global_param[@name='"+paramName+"']");
        if(!node) return '';
        return node.getAttribute("defaultImage") || '';
    }

    /**
     *
     * @param type
     * @param name
     * @returns {bool}
     */
    hasPluginOfType (type, name){
        let node;
        if(name == null){
            node = XMLUtils.XPathSelectSingleNode(this._registry, 'plugins/plugin[contains(@id, "'+type+'.")] | plugins/' + type + '[@id]');
        }else{
            node = XMLUtils.XPathSelectSingleNode(this._registry, 'plugins/plugin[@id="'+type+'.'+name+'"] | plugins/' + type + '[@id="'+type+'.'+name+'"]');
        }
        return (node !== undefined);
    }

    /**
     * @return {Map|Map<string, object>}
     */
    getFilesExtensions(){
        if(this._fileExtensions) {
            return this._fileExtensions;
        }
        this._fileExtensions = new Map();
        const nodes = XMLUtils.XPathSelectNodes(this._registry, 'extensions/*');
        nodes.forEach((node) => {
            this._fileExtensions.set(node.getAttribute('mime'), {messageId: node.getAttribute('messageId'), fontIcon: node.getAttribute('font')})
        });
        return this._fileExtensions;
    }

}
