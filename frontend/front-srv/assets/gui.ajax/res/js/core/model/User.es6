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
import CellModel from './CellModel'
import {UserServiceApi, IdmUserSingleQuery, RestSearchUserRequest} from '../http/gen/index';

/**
 * Abstraction of the currently logged user. Can be a "fake" user when users management
 * system is disabled
 */
export default class User{

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
        this.read=false;
        /**
         * @var Boolean
         */
        this.write=false;
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
         * @var Map()
         */
        this.repoSearchEngines= new Map();
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
	    try{
            // TODO: get "read" property from root node metadata
    	    const metaRoot = this._pydioObject.getContextHolder().getRootNode().getMetadata();
        } catch(e){

        }
	    return true;
		//return this.read;
	}
	
	/**
	 * Whether current repo is allowed to be written
	 * @returns Boolean
	 */
	canWrite(){
        try{
            const metaRoot = this._pydioObject.getContextHolder().getRootNode().getMetadata();
            return !metaRoot.has("node_readonly") || !metaRoot.get("node_readonly")
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
	 * Get a user preference by its name
	 * @returns Mixed
	 */
	getPreference(prefName, fromJSON){
        if(fromJSON){
            const test = this._parsedJSONCache.get(prefName);
            if(test) return test;
        }
	    const value = this.preferences.get(prefName);
	    if(fromJSON){
	        if(value){
                try{
                    if(typeof value == "object") return value;
                    const parsed = JSON.parse(value);
                    this._parsedJSONCache.set(prefName, parsed);
                    if(!parsed) return {};
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
	 * @returns Map
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
		this.repositories.forEach(function(value, key){
			if(value.allowCrossRepositoryCopy && value.accessType != 'inbox'){
				this.crossRepositories.set(key, value);
			}
		}.bind(this) );
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
	 * Get the repository search engine
	 * @param repoId String
	 * @returns String
	 */
	getRepoSearchEngine(repoId){
		return this.repoSearchEngines.get(repoId);
	}
	/**
	 * Send the preference to the server for saving
	 * @param prefName String
	 */
	savePreference(prefName){
		if(!this.preferences.has(prefName)) return;
        const prefValue = this.preferences.get(prefName);
        window.setTimeout( function(){
            PydioApi.getClient().userSavePreference(prefName, prefValue);
        } , 250);
	}

	/**
	 * Send all preferences to the server. If oldPass, newPass and seed are set, also save pass.
	 * @param oldPass String
	 * @param newPass String
	 * @param seed String
	 * @param onCompleteFunc Function
	 */
	savePreferences(oldPass, newPass, seed, onCompleteFunc){
        if(oldPass && newPass){
            PydioApi.getClient().userSavePassword(oldPass, newPass, seed, onCompleteFunc);
        }else{
            PydioApi.getClient().userSavePreferences(this.preferences, onCompleteFunc);
        }
	}

    /**
     * @return Promise
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
			if(userNodes[i].nodeName == "active_repo")
			{
				activeNode = userNodes[i];
			}
			else if(userNodes[i].nodeName == "repositories")
			{
				for(j=0;j<userNodes[i].childNodes.length;j++)
				{
					const repoChild = userNodes[i].childNodes[j];
					if(repoChild.nodeName == "repo") {	
						const repository = new Repository(repoChild.getAttribute("id"), repoChild);
						repositories.set(repoChild.getAttribute("id"), repository);
					}
				}
				this.setRepositoriesList(repositories);
			}
			else if(userNodes[i].nodeName == "preferences")
			{
				for(j=0;j<userNodes[i].childNodes.length;j++)
				{
					const prefChild = userNodes[i].childNodes[j];
					if(prefChild.nodeName == "pref") {
						let value = prefChild.getAttribute("value");
						if(!value && prefChild.firstChild){
							// Retrieve value from CDATA
							value = prefChild.firstChild.nodeValue;
						}
						this.setPreference(prefChild.getAttribute("name"), value);
					}
				}					
			}
			else if(userNodes[i].nodeName == "special_rights")
			{
				const attr = userNodes[i].getAttribute("is_admin");
				if(attr && attr === "1") this.isAdmin = true;
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