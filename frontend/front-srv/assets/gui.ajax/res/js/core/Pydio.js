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
import Repository from './model/Repository'
import Controller from './model/Controller'
import XMLUtils from './util/XMLUtils'
import PathUtils from './util/PathUtils'
import LangUtils from './util/LangUtils'
import ActivityMonitor from './util/ActivityMonitor'
import PydioWebSocket from './http/PydioWebSocket'
import EmptyNodeProvider from "./model/EmptyNodeProvider";
import ResourcesManager from './http/ResourcesManager'

import qs from 'query-string'
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
        Pydio.instance = this;
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
        if(window.MessageHash) {
            this.MessageHash = window.MessageHash;
        }
        this.ApiClient = PydioApi.getClient();
        this.ApiClient.setPydioObject(this);
        this.ActivityMonitor = new ActivityMonitor(this);
        this.Registry = new Registry(this);
        this._rootNode = new AjxpNode("/", "Root");
        this._contextHolder = new PydioDataModel(false);
        this._dataModel = this._contextHolder;
        this._dataModel.setAjxpNodeProvider(new EmptyNodeProvider());
        this._dataModel.setRootNode(this._rootNode);
        // Must happen AFTER datamodel initization.
        this.Controller = new Controller(this);
        this.WebSocketClient = new PydioWebSocket(this);
        this.WebSocketClient.observe("status", (e) => {
            this.notify("ws_status", e);
        })
        if (this.repositoryId) {
            this.WebSocketClient.currentRepo = this.repositoryId;
            this.WebSocketClient.open();
        }
        if(!this.Parameters.has('START_REPOSITORY')){
            const uri = this.getFrontendUrl().pathname;
            const loadUriParts = LangUtils.trim(uri, '/').split('/');
            if(loadUriParts.length){
                let [loadWs, ...other] = loadUriParts;
                if(loadWs.indexOf('ws-') === 0){
                    loadWs = loadWs.substr(3);
                }
                if (loadWs === "login") {
                    return
                }
                this.Parameters.set('START_REPOSITORY', loadWs);
                if (other.length){
                    this.Parameters.set('START_FOLDER', '/' + other.join('/'));
                }
            }
        }
    }

    fire(eventName, data){
        this.notify(eventName, data);
    }

    /**
     *
     * @param {User|null} userObject
     * @param skipEvent bool
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
        this.Registry.load();
    }

    /**
     * Real initialisation sequence. Will Trigger the whole GUI building.
     */
    init(){
        this.observe("registry_loaded", () => {
            this.Registry.refreshExtensionsRegistry();
            this.updateUser(this.Registry.parseUser(), false);
            if(this.user){
                const repId = this.user.getActiveRepository();
                const repList = this.user.getRepositoriesList();
                const repositoryObject = repList.get(repId);
                if(repositoryObject) {
                    repositoryObject.loadResources();
                }
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

        const starterFunc = () => {
            return ResourcesManager.loadClassesAndApply(["React", "PydioReactUI"], () => {
                this.UI = new window.PydioReactUI.Builder(this);
                this.UI.initTemplates();

                this.fire("registry_loaded", this.Registry.getXML());
                // this.fire('loaded');
                setTimeout(() => { this.fire('loaded'); }, 200);
            });
        };

        // Prelogged user
        if(this.Parameters.has("PRELOG_USER") && !this.user) {
            const login = this.Parameters.get("PRELOG_USER");
            const pwd = login + "#$!Az1";

            PydioApi.getRestClient().sessionLoginWithCredentials(login, pwd)
                .then(() => {
                    return this.loadXmlRegistry(this.Parameters.get("START_REPOSITORY"))
                }).catch(() => {
                    return this.loadXmlRegistry(null)
                }).then(() => {
                    return starterFunc()
                })
        } else {
            PydioApi.getRestClient().getOrUpdateJwt().
                then(jwt => {
                    // Logged in
                    return this.loadXmlRegistry(this.Parameters.get("START_REPOSITORY")).then(() => starterFunc())
                }).
                catch((e) => {
                    if (!this.Parameters.has("PRELOADED_REGISTRY")) {
                        return this.loadXmlRegistry(this.Parameters.get("START_REPOSITORY")).then(() => starterFunc())
                        //this.loadXmlRegistry(null, starterFunc, this.Parameters.get("START_REPOSITORY"))
                    } else {
                        // Not logged, used prefeteched registry to speed up login screen
                        this.Registry.loadFromString(this.Parameters.get("PRELOADED_REGISTRY"));
                        this.Parameters.delete("PRELOADED_REGISTRY");
                        return starterFunc();
                    }
                })
        }

        this.observe("server_message", (xml) => {
            const reload = XMLUtils.XPathSelectSingleNode(xml, "tree/require_registry_reload");
            if(reload){
                if(reload.getAttribute("repositoryId") !== this.repositoryId){
                    this.loadXmlRegistry(reload.getAttribute("repositoryId"));
                    this.repositoryId = null;
                }
            }
        });
    }

    /**
     * Loads the XML Registry, an image of the application in its current state
     * sent by the server.
     * @param targetRepositoryId
     */
    loadXmlRegistry (targetRepositoryId = null){
        return this.Registry.load(targetRepositoryId);
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

        if(this.user === null){
            const repositoryObject = new Repository(null);
            this.loadRepository(repositoryObject);
            this.fire("repository_list_refreshed", {list:false,active:false});
            this.Controller.fireAction("login");
            return;
        }

        const repId             = this.user.getActiveRepository();
        const repList           = this.user.getRepositoriesList();
        const repositoryObject  = repList.get(repId);

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

        if(this.user.getPreference("pending_folder") && this.user.getPreference("pending_folder") !== "-1"){

            this._initLoadRep = this.user.getPreference("pending_folder");
            this.user.setPreference("pending_folder", "-1");
            this.user.savePreference("pending_folder");

        } else if(this.user && this.Parameters.has('START_FOLDER')) {
            this._initLoadRep = this.Parameters.get('START_FOLDER');
            this.Parameters.delete('START_FOLDER');
        }

        this.loadRepository(repositoryObject);
        this.fire("repository_list_refreshed", {list:repList,active:repId});

    }

    /**
     * Refresh the repositories list for the current user
     */
    reloadRepositoriesList (){
        if(!this.user) {
            return;
        }
        this.Registry.load(null, true);
    }

    /**
     * Load a Repository instance
     * @param repository Repository
     */
    loadRepository(repository){

        if(this.repositoryId != null && this.repositoryId === repository.getId()){
            Logger.debug('Repository already loaded, do nothing');
            return;
        }
        this._contextHolder.setSelectedNodes([]);
        if(repository === null) {
            return;
        }

        repository.loadResources();
        const repositoryId = repository.getId();
        const newIcon = repository.getIcon();

        const providerDef = repository.getNodeProviderDef();
        let rootNode;
        if (providerDef == null) {
            rootNode = new AjxpNode("/", false, repository.getLabel(), newIcon);
            // Default
            this._contextHolder.setAjxpNodeProvider(new EmptyNodeProvider());
        } else {
            const providerClass = window[providerDef.name];
            const provider = new providerClass();
            if (providerDef.options) {
                provider.initProvider(providerDef.options);
            }
            this._contextHolder.setAjxpNodeProvider(provider);
            rootNode = new AjxpNode("/", false, repository.getLabel(), newIcon, provider);
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
        if(typeof(nodeOrPath) === "string"){
            path = nodeOrPath;
            gotoNode = new AjxpNode(nodeOrPath);
        }else{
            gotoNode = nodeOrPath;
            path = gotoNode.getPath();
            if(nodeOrPath.getMetadata().has("repository_id") && nodeOrPath.getMetadata().get("repository_id") !== this.repositoryId
                && nodeOrPath.getAjxpMime() !== "repository" && nodeOrPath.getAjxpMime() !== "repository_editable"){
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
        if(current && current.getPath() === path){
            return;
        }
        if(path === "" || path === "/") {
            this._contextHolder.requireContextChange(this._contextHolder.getRootNode());
            return;
        }else{
            gotoNode = gotoNode.findInArbo(this._contextHolder.getRootNode());
            if(gotoNode){
                // Node is already here
                if (gotoNode.isBrowsable()) {
                    this._contextHolder.requireContextChange(gotoNode);
                } else {
                    this._contextHolder.setPendingSelection(PathUtils.getBasename(path));
                    this._contextHolder.requireContextChange(gotoNode.getParent());
                }
            }else{
                // Check on server if it does exist, then load
                this._contextHolder.loadPathInfoAsync(path, function(foundNode){
                    if (foundNode.isBrowsable()) {
                        gotoNode = foundNode;
                    } else {
                        this._contextHolder.setPendingSelection(PathUtils.getBasename(path));
                        gotoNode = new AjxpNode(PathUtils.getDirname(path));
                    }
                    this._contextHolder.requireContextChange(gotoNode);
                }.bind(this));
            }
        }
    }

    /**
     * Change the repository of the current user and reload list and current.
     * @param repositoryId String Id of the new repository
     * @return Promise
     */
    triggerRepositoryChange(repositoryId){
        this.fire("trigger_repository_switch");
        return this.Registry.load(repositoryId)
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
     * @param reloadRegistry bool
     */
    loadI18NMessages(newLanguage, reloadRegistry = true){
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
                if(reloadRegistry){
                    this.loadXmlRegistry();
                }
                this.UI.refreshTemplateParts();
                this.fireContextRefresh();
                this.currentLanguage = newLanguage;
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
     * @returns {URL}
     */
    getFrontendUrl(){
        return window.location;
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
        if(messageType === 'ERROR') Logger.error(message);
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
        if(promise){
            return ResourcesManager.requireLib(module, promise).then(res => {
                if(res.default && typeof res.default === 'object'){
                    return res.default
                }
                return res
            });
        } else {
            const res = ResourcesManager.requireLib(module, promise);
            if(res.default && typeof res.default === 'object'){
                return res.default
            }
            return res
        }
    }

    /**
     * Return unique instance of pydio object
     * @return {*|null}
     */
    static getInstance(){
        return Pydio.instance;
    }

    /**
     * Return current pydio version
     * @return {*}
     */
    static getVersion(){
        if(Pydio.instance && Pydio.instance.Parameters && Pydio.instance.Parameters.get("backend")){
            return Pydio.instance.Parameters.get("backend")["Version"];
        }
        return "";
    }

    /**
     * Direct access to unique instance MessageHash
     * @return {{}}
     */
    static getMessages(){
        return Pydio.instance ? Pydio.instance.MessageHash : {};
    }

    /**
     * Send notification to display loader
     */
    static startLoading(){
        Pydio.instance.notify("connection-start");
    }

    /**
     * Send notification to hide loader
     */
    static endLoading(){
        Pydio.instance.notify("connection-end");
    }

}

Pydio.instance = null;

export {Pydio as default}
