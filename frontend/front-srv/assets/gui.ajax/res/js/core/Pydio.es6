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

import Observable from './lang/Observable'
import Logger from './lang/Logger'
import PydioApi from './http/PydioApi'
import Registry from './model/Registry'
import AjxpNode from './model/AjxpNode'
import PydioDataModel from './model/PydioDataModel'
import RemoteNodeProvider from './model/RemoteNodeProvider'
import Repository from './model/Repository'
import Controller from './model/Controller'
import XMLUtils from './util/XMLUtils'
import PathUtils from './util/PathUtils'
import LangUtils from './util/LangUtils'
import ActivityMonitor from './util/ActivityMonitor'
import PydioWebSocket from './http/PydioWebSocket'
import EmptyNodeProvider from "./model/EmptyNodeProvider";

/**
 * This is the main class for launching the whole framework,
 * with or without a UI.
 * It can be launched by PydioBootstrap or directly by giving the right parameters.
 */
class Pydio extends Observable{

    /**
     * Pydio Constructor takes a Map of start parameters.
     *
     * @param parameters {Map}
     */
    constructor(parameters){
        super();
        this.Parameters = parameters;
        this._initLoadRep = parameters.get('initLoadRep') || null;
        this.usersEnabled = parameters.get('usersEnabled') || null;
        this.currentLanguage = parameters.get('currentLanguage') || null;
        this.appTitle = "Pydio";
        if(this.Parameters.has("customWording")){
            this.appTitle = this.Parameters.get("customWording").title || "Pydio";
        }
        this.user = null;
        this.MessageHash = {};
        if(window.MessageHash) this.MessageHash = window.MessageHash;
        this.ApiClient = PydioApi.getClient();
        this.ApiClient.setPydioObject(this);
        this.ActivityMonitor = new ActivityMonitor(this);
        this.Registry = new Registry(this);
        this._rootNode = new AjxpNode("/", "Root");
        this._dataModel = this._contextHolder = new PydioDataModel(false);
        this._dataModel.setAjxpNodeProvider(new RemoteNodeProvider());
        this._dataModel.setRootNode(this._rootNode);
        // Must happen AFTER datamodel initization.
        this.Controller = new Controller(this);
        this.WebSocketClient = new PydioWebSocket(this);
        if (this.repositoryId) {
            this.WebSocketClient.currentRepo = this.repositoryId;
            this.WebSocketClient.open();
        }

    }

    fire(eventName, data){
        this.notify(eventName, data);
    }

    /**
     *
     * @param {User|null} userObject
     */
    updateUser(userObject, skipEvent = false){
        this.user = userObject;
        if(!skipEvent){
            this.notify('user_logged', userObject);
        }
    }

    /**
     *
     * @returns {null|User}
     */
    getUser(){
        return this.user;
    }

    /**
     * Refresh user/preferences registry part
     */
    refreshUserData(){
        this.observeOnce("registry_part_loaded", (event) => {
            if(event !== "user/preferences") return;
            this.updateUser(this.Registry.parseUser(), false);
        });
        this.Registry.load("user/preferences");
    }

    /**
     * Real initialisation sequence. Will Trigger the whole GUI building.
     */
    init(){
        if(!this.Parameters.has('SECURE_TOKEN')){
            PydioApi.getClient().getBootConf(function(){
                this.init();
            }.bind(this));
            return;
        }

        this.observe("registry_loaded", () => {

            this.Registry.refreshExtensionsRegistry();
            this.updateUser(this.Registry.parseUser(), false);
            if(this.user){
                const repId = this.user.getActiveRepository();
                const repList = this.user.getRepositoriesList();
                const repositoryObject = repList.get(repId);
                if(repositoryObject) repositoryObject.loadResources();
            }
            if(this.UI.guiLoaded) {
                this.UI.refreshTemplateParts();
                this.Registry.refreshExtensionsRegistry();
                this.Controller.loadActionsFromRegistry(this.getXmlRegistry());
            } else {
                this.observe("gui_loaded", () => {
                    this.UI.refreshTemplateParts();
                    this.Registry.refreshExtensionsRegistry();
                    this.Controller.loadActionsFromRegistry(this.getXmlRegistry());
                });
            }
            this.loadActiveRepository();
            if(this.Parameters.has("USER_GUI_ACTION")){
                const a = this.Parameters.get("USER_GUI_ACTION");
                this.Parameters.delete("USER_GUI_ACTION");
                setTimeout(() => {
                    this.Controller.fireAction(a);
                }, 1000);
            }

        });

        const starterFunc = function(){

            ResourcesManager.loadClassesAndApply(["React", "PydioReactUI"], () => {
                this.UI = new window.PydioReactUI.Builder(this);
                this.UI.initTemplates();
                if(!this.user) {
                    PydioApi.getClient().tryToLogUserFromRememberData();
                }
                this.fire("registry_loaded", this.Registry.getXML());
                setTimeout(() => { this.fire('loaded'); }, 200);
            });

        }.bind(this);


        if(this.Parameters.get("PRELOADED_REGISTRY")){

            this.Registry.loadFromString(this.Parameters.get("PRELOADED_REGISTRY"));
            this.Parameters.delete("PRELOADED_REGISTRY");
            starterFunc();

        }else{

            this.loadXmlRegistry(false, null, starterFunc);

        }

        this.observe("server_message", (xml) => {
            const reload = XMLUtils.XPathSelectSingleNode(xml, "tree/require_registry_reload");
            if(reload){
                if(reload.getAttribute("repositoryId") != this.repositoryId){
                    this.loadXmlRegistry(false, null, null, reload.getAttribute("repositoryId"));
                    this.repositoryId = null;
                }
            }
        });
    }

    /**
     * Loads the XML Registry, an image of the application in its current state
     * sent by the server.
     * @param sync Boolean Whether to send synchronously or not.
     * @param xPath String An XPath to load only a subpart of the registry
     * @param completeFunc
     * @param targetRepositoryId
     */
    loadXmlRegistry (sync, xPath = null, completeFunc = null, targetRepositoryId = null){
        this.Registry.load(xPath, completeFunc, targetRepositoryId);
    }

    /**
     * Get the XML Registry
     * @returns Document
     */
    getXmlRegistry (){
        return this.Registry.getXML();
    }

    /**
     * Find the current repository (from the current user) and load it.
     */
    loadActiveRepository (){

        let repositoryObject = new Repository(null);
        if(this.user === null){
            this.loadRepository(repositoryObject);
            this.fire("repository_list_refreshed", {list:false,active:false});
            this.Controller.fireAction("login");
            return;
        }

        const repId         = this.user.getActiveRepository();
        const repList       = this.user.getRepositoriesList();
        repositoryObject    = repList.get(repId);

        if(!repositoryObject){
            if(this.user.lock){
                this.Controller.loadActionsFromRegistry(this.getXmlRegistry());
                let lock = this.user.lock.split(",").shift();
                window.setTimeout(() => {
                    this.Controller.fireAction(lock);
                }, 150);
            }else{
                alert("No active repository found for user!");
                this.Controller.fireAction("logout");
            }
            return;
        }

        if(this.user.getPreference("pending_folder") && this.user.getPreference("pending_folder") != "-1"){

            this._initLoadRep = this.user.getPreference("pending_folder");
            this.user.setPreference("pending_folder", "-1");
            this.user.savePreference("pending_folder");

        }

        this.loadRepository(repositoryObject);
        this.fire("repository_list_refreshed", {list:repList,active:repId});

    }

    /**
     * Refresh the repositories list for the current user
     */
    reloadRepositoriesList (){
        if(!this.user) return;
        this.observeOnce("registry_part_loaded", (data) => {
            if(data != "user/repositories") return;
            this.updateUser(this.Registry.parseUser());
            if(this.user.getRepositoriesList().size === 0){
                this.loadXmlRegistry();// User maybe locket out Reload full registry now!
            }
            this.fire("repository_list_refreshed", {
                list:this.user.getRepositoriesList(),
                active:this.user.getActiveRepository()
            });
        });
        this.loadXmlRegistry(false, "user/repositories");
    }

    /**
     * Load a Repository instance
     * @param repository Repository
     */
    loadRepository(repository){

        if(this.repositoryId != null && this.repositoryId == repository.getId()){
            Logger.debug('Repository already loaded, do nothing');
        }
        this._contextHolder.setSelectedNodes([]);
        if(repository == null) return;

        repository.loadResources();
        const repositoryId = repository.getId();
        const newIcon = repository.getIcon();

        const providerDef = repository.getNodeProviderDef();
        let rootNode;
        if(providerDef != null){
            let provider = eval('new '+providerDef.name+'()');
            if(providerDef.options){
                provider.initProvider(providerDef.options);
            }
            this._contextHolder.setAjxpNodeProvider(provider);
            rootNode = new AjxpNode("/", false, repository.getLabel(), newIcon, provider);
        }else{
            rootNode = new AjxpNode("/", false, repository.getLabel(), newIcon);
            // Default
            this._contextHolder.setAjxpNodeProvider(new EmptyNodeProvider());
        }

        const initLoadRep = (this._initLoadRep && this._initLoadRep !== '/') ? this._initLoadRep.valueOf() : null;
        let firstLoadObs = () => {};
        if(initLoadRep){
            firstLoadObs = () => {
                this.goTo(initLoadRep);
                this._initLoadRep = null;
            }
        }

        this._contextHolder.setRootNode(rootNode);
        rootNode.observeOnce('first_load', function(){
            this._contextHolder.notify('context_changed', rootNode);
            this.Controller.fireContextChange();
            firstLoadObs();
        }.bind(this));
        this.repositoryId = repositoryId;
        rootNode.load();
    }

    /**
     * Require a context change to the given path
     * @param nodeOrPath AjxpNode|String A node or a path
     */
    goTo(nodeOrPath){
        let gotoNode;
        let path;
        if(typeof(nodeOrPath) == "string"){
            path = nodeOrPath;
            gotoNode = new AjxpNode(nodeOrPath);
        }else{
            gotoNode = nodeOrPath;
            path = gotoNode.getPath();
            if(nodeOrPath.getMetadata().has("repository_id") && nodeOrPath.getMetadata().get("repository_id") != this.repositoryId
                && nodeOrPath.getAjxpMime() != "repository" && nodeOrPath.getAjxpMime() != "repository_editable"){
                if(this.user){
                    this.user.setPreference("pending_folder", nodeOrPath.getPath());
                    this._initLoadRep = nodeOrPath.getPath();
                }
                this.triggerRepositoryChange(nodeOrPath.getMetadata().get("repository_id"));
                return;
            }
        }
        if(this._repositoryCurrentlySwitching && this.user){
            this.user.setPreference("pending_folder", gotoNode.getPath());
            this._initLoadRep = gotoNode.getPath();
            return;
        }
        const current = this._contextHolder.getContextNode();
        if(current && current.getPath() == path){
            return;
        }
        if(path === "" || path === "/") {
            this._contextHolder.requireContextChange(this._contextHolder.getRootNode());
            return;
        }else{
            gotoNode = gotoNode.findInArbo(this._contextHolder.getRootNode());
            if(gotoNode){
                // Node is already here
                if(!gotoNode.isBrowsable()){
                    this._contextHolder.setPendingSelection(PathUtils.getBasename(path));
                    this._contextHolder.requireContextChange(gotoNode.getParent());
                }else{
                    this._contextHolder.requireContextChange(gotoNode);
                }
            }else{
                // Check on server if it does exist, then load
                this._contextHolder.loadPathInfoAsync(path, function(foundNode){
                    if(!foundNode.isBrowsable()) {
                        this._contextHolder.setPendingSelection(PathUtils.getBasename(path));
                        gotoNode = new AjxpNode(PathUtils.getDirname(path));
                    }else{
                        gotoNode = foundNode;
                    }
                    this._contextHolder.requireContextChange(gotoNode);
                }.bind(this));
            }
        }
    }

    /**
     * Change the repository of the current user and reload list and current.
     * @param repositoryId String Id of the new repository
     * @param callback Function
     */
    triggerRepositoryChange(repositoryId, callback){
        this.fire("trigger_repository_switch");
        this.Registry.load(null, null, repositoryId)

        /*
        //this._repositoryCurrentlySwitching = true;
        const onComplete = (transport) => {
            let loaded = false;
            if(transport.responseXML){
                this.ApiClient.parseXmlMessage(transport.responseXML);
                if(transport.responseXML.documentElement.nodeName === 'pydio_registry'){
                    loaded = true;
                    this.Registry.loadXML(transport.responseXML.documentElement);
                    this.repositoryId = repositoryId;
                }
            }
            if(!loaded){
                this.loadXmlRegistry(false,  null, null, repositoryId);
                this.repositoryId = null;
            }

            if (typeof callback === "function") callback();
            this._repositoryCurrentlySwitching = false;
        };

        const root = this._contextHolder.getRootNode();
        if(root){
            root.clear();
        }
        this.ApiClient.switchRepository(repositoryId, onComplete);
        */
    }

    getPluginConfigs (pluginQuery){
        return this.Registry.getPluginConfigs(pluginQuery);
    }

    listLanguagesWithCallback(callback){
        let langs = this.Parameters.get("availableLanguages") || {"en":"Default"};
        let current = this.currentLanguage;
        Object.keys(langs).sort().map(function(key){
            callback(key, langs[key], (current === key));
        });
    }

    /**
     * Reload all messages from server and trigger updateI18nTags
     * @param newLanguage String
     * @param callback Function
     */
    loadI18NMessages(newLanguage, callback = null){
        this.ApiClient.switchLanguage(newLanguage, function(data){
            if(data){
                this.MessageHash = data;
                if(window && window.MessageHash) {
                    window.MessageHash = this.MessageHash;
                }
                for(let key in this.MessageHash){
                    if(this.MessageHash.hasOwnProperty(key)){
                        this.MessageHash[key] = this.MessageHash[key].replace("\\n", "\n");
                    }
                }
                this.notify("language", newLanguage);
                this.Controller.refreshGuiActionsI18n();
                this.loadXmlRegistry();
                this.fireContextRefresh();
                this.currentLanguage = newLanguage;
                if(callback) callback();
            }

        }.bind(this));
    }

    /**
     * Get the main controller
     * @returns ActionManager
     */
    getController(){
        return this.Controller;
    }

    /**
     * Display an information or error message to the user
     * @param messageType String ERROR or SUCCESS
     * @param message String the message
     */
    displayMessage(messageType, message){
        const urls = LangUtils.parseUrl(message);
        if(urls.length && this.user && this.user.repositories){
            urls.forEach(function(match){
                const repo = this.user.repositories.get(match.host);
                if(!repo) return;
                message = message.replace(match.url, repo.label+":" + match.path + match.file);
            }.bind(this));
        }
        if(messageType == 'ERROR') Logger.error(message);
        else Logger.log(message);
        if(this.UI) {
            this.UI.displayMessage(messageType, message);
        }
    }


    /*************************************************
     *
     *          PROXY METHODS FOR DATAMODEL
     *
     ************************************************/

    /**
     * Accessor for updating the datamodel context
     * @param ajxpContextNode AjxpNode
     * @param ajxpSelectedNodes AjxpNode[]
     * @param selectionSource String
     */
    updateContextData (ajxpContextNode, ajxpSelectedNodes, selectionSource){
        if(ajxpContextNode){
            this._contextHolder.requireContextChange(ajxpContextNode);
        }
        if(ajxpSelectedNodes){
            this._contextHolder.setSelectedNodes(ajxpSelectedNodes, selectionSource);
        }
    }

    /**
     * @returns PydioDataModel
     */
    getContextHolder (){
        return this._contextHolder;
    }

    /**
     * @returns AjxpNode
     */
    getContextNode (){
        return this._contextHolder.getContextNode() || new AjxpNode("");
    }

    /**
     * @returns PydioDataModel
     */
    getUserSelection (){
        return this._contextHolder;
    }

    /**
     * Accessor for datamodel.requireContextChange()
     */
    fireContextRefresh (){
        this.getContextHolder().requireContextChange(this.getContextNode(), true);
    }

    /**
     * Accessor for datamodel.requireContextChange()
     */
    fireNodeRefresh (nodePathOrNode, completeCallback){
        this.getContextHolder().requireNodeReload(nodePathOrNode, completeCallback);
    }

    /**
     * Accessor for datamodel.requireContextChange()
     */
    fireContextUp (){
        if(this.getContextNode().isRoot()) return;
        this.updateContextData(this.getContextNode().getParent());
    }

    /**
     * Proxy to ResourcesManager.requireLib for ease of writing
     * @param module
     * @param promise
     * @returns {*}
     */
    static requireLib(module, promise = false){
        return require('pydio/http/resources-manager').requireLib(module, promise);
    }

}

export {Pydio as default}