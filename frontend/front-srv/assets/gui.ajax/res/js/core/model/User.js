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
import Logger from '../lang/Logger'
import PydioApi from '../http/PydioApi'
import Repository from './Repository'
import {UserServiceApi, IdmUserSingleQuery, RestSearchUserRequest} from 'cells-sdk';
import HasherUtils from "../util/HasherUtils";

/**
 * Abstraction of the currently logged user. Can be a "fake" user when users management
 * system is disabled
 */
export default class User{

    id;
    activeRepository;
    read;
    write;
    crossRepositoryCopy;
    preferences;
    repositories;
    crossRepositories;
    isAdmin;
    lock;

    _pydioObject;
    _parsedJSONCache;

	/**
	 * Constructor
	 * @param id String The user unique id
	 * @param xmlDef XMLNode Registry Fragment
     * @param pydioObject Pydio
	 */
	constructor(id, xmlDef, pydioObject){

        /**
         * @var String
         */
        this.id = id;
        /**
         * @var Pydio
         */
        this._pydioObject = pydioObject;
        /**
         * @var String
         */
        this.activeRepository=undefined;
        /**
         * @var Boolean
         */
        this.crossRepositoryCopy=false;
        /**
         * @var Map()
         */
        this.preferences=new Map();
        /**
         * @var Map()
         */
        this.repositories=new Map();
        /**
         * @var Map()
         */
        this.crossRepositories=new Map();
        /**
         * @var Boolean
         */
        this.isAdmin=false;
        /**
         * @var String
         */
        this.lock = false;
        /**
         *
         * @type Map
         * @private
         */
        this._parsedJSONCache= new Map();

        if(xmlDef) {
            this.loadFromXml(xmlDef);
        }
	}

	/**
	 * Set current repository
	 * @param id String
	 */
	setActiveRepository(id){
		this.activeRepository = id;
		if(this.repositories.has(id)){
			this.crossRepositoryCopy = this.repositories.get(id).allowCrossRepositoryCopy;
		}
		if(this.crossRepositories.has(id)){
			this.crossRepositories.delete(id);
		}
	}
	/**
	 * Gets the current active repository
	 * @returns String
	 */
	getActiveRepository(){
		return this.activeRepository;
	}
	/**
	 * Whether current repo is allowed to be read
	 * @returns Boolean
	 */
	canRead(){
	    /*
	    try{
            // TODO: get "read" property from root node metadata
    	    const metaRoot = this._pydioObject.getContextHolder().getRootNode().getMetadata();
        } catch(e){

        }
        //return this.read;
        */
        return true;
	}
	
	/**
	 * Whether current repo is allowed to be written
     * @param node {AjxpNode}
	 * @returns Boolean
	 */
	canWrite(node = undefined){
        try{
            let meta;
            if(node) {
                meta = node.getMetadata();
            } else{
                meta = this._pydioObject.getContextHolder().getRootNode().getMetadata();
            }
            return !meta.has("node_readonly") || !meta.get("node_readonly")
        } catch(e){
            return false;
        }
	}
	
	/**
	 * Whether current repo is allowed to be cross-copied
	 * @returns Boolean
	 */
	canCrossRepositoryCopy(){
		return this.crossRepositoryCopy;
	}

    /**
     * Get all user gui preferences as an object
     * @return {Object}
     */
    getGUIPreferences() {
        return this.getPreference('gui_preferences', true) || {}
    }

    /**
     * Set user gui preferences as a bunch
     * @param prefs
     */
    setGUIPreferences(prefs, save = false) {
        this.setPreference('gui_preferences', prefs, true)
        if(save) {
            this.savePreference();
        }
    }

    /**
     * Find one user gui preference
     * @param name
     * @return {*}
     */
    getGUIPreference(name) {
        const pref = this.getPreference('gui_preferences', true) || {}
        return pref[name]
    }

    /**
     * Set one user GUI preference
     * @param name
     * @param value
     */
    setGUIPreference(name, value, save = false) {
        const pref = this.getPreference('gui_preferences', true) || {}
        pref[name] = value
        this.setPreference('gui_preferences', pref, true)
        if(save) {
            this.savePreference();
        }
    }

	/**
	 * Get a user preference by its name
	 * @returns Mixed
	 */
	getPreference(prefName, fromJSON){
        if(fromJSON){
            const test = this._parsedJSONCache.get(prefName);
            if(test) {
                return test;
            }
        }
	    const value = this.preferences.get(prefName);
	    if(fromJSON){
	        if(value){
                try{
                    if(typeof value === "object") {
                        return value;
                    }
                    const parsed = JSON.parse(value);
                    this._parsedJSONCache.set(prefName, parsed);
                    if(!parsed) {
                        return {};
                    }
                    return parsed;
                }catch(e){
                    if(window.console){
                        Logger.log("Error parsing JSON in preferences ("+prefName+"). You should contact system admin and clear user preferences.");
                    }else{
                        alert("Error parsing JSON in preferences. You should contact system admin and clear user preferences.");
                    }
                }
            }
            return {};
	    }
	    return value;
	}
	
	/**
	 * Get all repositories 
	 * @returns {Map}
	 */
	getRepositoriesList(){
		return this.repositories;
	}
	
	/**
	 * Set a preference value
	 * @param prefName String
	 * @param prefValue Mixed
	 * @param toJSON Boolean Whether to convert the value to JSON representation
	 */
	setPreference(prefName, prefValue, toJSON=false){
		if(toJSON){
            this._parsedJSONCache.delete(prefName);
            try{
    			prefValue = JSON.stringify(prefValue);
            }catch (e){
                if(console) {
                    function isCyclic (obj) {
                        let seenObjects = [];

                        function detect (obj) {
                            if (obj && typeof obj === 'object') {
                                if (seenObjects.indexOf(obj) !== -1) {
                                    return true;
                                }
                                seenObjects.push(obj);
                                for (let key in obj) {
                                    if (obj.hasOwnProperty(key) && detect(obj[key])) {
                                        console.log(obj, 'cycle at ' + key);
                                        return true;
                                    }
                                }
                            }
                            return false;
                        }
                        return detect(obj);
                    }
                    console.log("Caught toJSON error " + e.message, prefValue, isCyclic(prefValue));

                }
                return;
            }
		}
		this.preferences.set(prefName, prefValue);
	}
	
	/**
	 * Set the repositories as a bunch
	 * @param repoHash Map
	 */
	setRepositoriesList(repoHash){
		this.repositories = repoHash;
		// filter repositories once for all
		this.crossRepositories = new Map();
		this.repositories.forEach((value, key) => {
			if(value.allowCrossRepositoryCopy){
				this.crossRepositories.set(key, value);
			}
		});
	}
	/**
	 * Whether there are any repositories allowing crossCopy
	 * @returns Boolean
	 */
	hasCrossRepositories(){
		return (this.crossRepositories.size);
	}
	/**
	 * Get repositories allowing cross copy
	 * @returns {Map}
	 */
	getCrossRepositories(){
		return this.crossRepositories;
	}
	/**
	 * Get the current repository Icon
	 * @param repoId String
	 * @returns String
	 */
	getRepositoryIcon(repoId){
		return this.repoIcon.get(repoId);
	}
	/**
	 * Send the preference to the server for saving
	 */
	savePreference(){
		if(!this.preferences.has('gui_preferences')) {
		    return;
        }
        const guiPrefs = this.preferences.get('gui_preferences');
        const stringPref = HasherUtils.base64_encode(guiPrefs);
        this.getIdmUser().then(idmUser => {
            idmUser.Attributes['preferences'] = JSON.stringify({gui_preferences: stringPref});
            // Use a silent client to avoid displaying errors
            const api = new UserServiceApi(PydioApi.getRestClient({silent: true}));
            api.putUser(idmUser.Login, idmUser).then(ok => {
                this.idmUser = idmUser;
            })
        });
	}

    /**
     * @return {Promise<IdmUser>}
     */
	getIdmUser() {
	    if(this.idmUser) {

	        return Promise.resolve(this.idmUser);

        } else {

            const api = new UserServiceApi(PydioApi.getRestClient());
            let request = new RestSearchUserRequest();
            let query = new IdmUserSingleQuery();
            query.Login = this.id;
            request.Queries = [query];
            return new Promise((resolve, reject) => {
                api.searchUsers(request).then((result) => {
                    if (result.Total === 0 || !result.Users) {
                        reject(new Error('Cannot find user'));
                    }
                    this.idmUser = result.Users[0];
                    resolve(result.Users[0]);
                }).catch((error) => {
                    reject(error);
                })
            });
        }
    }

    /**
     * @return {Promise<CellModel>}
     */
    getActiveRepositoryAsCell(){
	    return this.repositories.get(this.activeRepository).asCell();
    }

    /**
     * Return active repository object
     * @return {Repository}
     */
    getActiveRepositoryObject(){
        return this.repositories.get(this.activeRepository);
    }

	/**
	 * Parse the registry fragment to load this user
	 * @param userNodes DOMNode
	 */
	loadFromXml(userNodes){
	
		let repositories = new Map(), activeNode;
        let i,j;
		for(i=0; i<userNodes.length;i++)
		{
			if(userNodes[i].nodeName === "active_repo")
			{
				activeNode = userNodes[i];
			}
			else if(userNodes[i].nodeName === "repositories")
			{
				for(j=0;j<userNodes[i].childNodes.length;j++)
				{
					const repoChild = userNodes[i].childNodes[j];
					if(repoChild.nodeName === "repo") {
						const repository = new Repository(repoChild.getAttribute("id"), repoChild);
						repositories.set(repoChild.getAttribute("id"), repository);
					}
				}
				this.setRepositoriesList(repositories);
			}
			else if(userNodes[i].nodeName === "preferences")
			{
				for(j=0;j<userNodes[i].childNodes.length;j++)
				{
					const prefChild = userNodes[i].childNodes[j];
					if(prefChild.nodeName === "pref") {
						let value = prefChild.getAttribute("value");
						if(!value && prefChild.firstChild){
							// Retrieve value from CDATA
							value = prefChild.firstChild.nodeValue;
						}
						this.setPreference(prefChild.getAttribute("name"), value);
					}
				}					
			}
			else if(userNodes[i].nodeName === "special_rights")
			{
				const attr = userNodes[i].getAttribute("is_admin");
				if(attr && attr === "1") {
				    this.isAdmin = true;
                }
                if(userNodes[i].getAttribute("lock")){
                    this.lock = userNodes[i].getAttribute("lock");
                }
			}
		}
		// Make sure it happens at the end
		if(activeNode){
			this.setActiveRepository(activeNode.getAttribute('id'));
		}
			
	}
}