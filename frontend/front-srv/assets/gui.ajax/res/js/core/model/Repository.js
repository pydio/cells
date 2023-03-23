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
import Pydio from '../Pydio'
import ResourcesManager from '../http/ResourcesManager'
import CellModel from './CellModel'
import AjxpNode from "./AjxpNode";
import EmptyNodeProvider from "./EmptyNodeProvider";

/** 
 * Container for a Repository.
 */
export default class Repository {

	/**
	 * Constructor
	 * @param id String
	 * @param xmlDef XMLNode
	 */
	constructor(id, xmlDef){
        this.label = '';
		this.id = id;
        this.accessType = '';
        this.nodeProviderDef = undefined;
        this.allowCrossRepositoryCopy= false;
        this.userEditable = false;
        this.slug = '';
        this.owner = '';
        this.description = '';
        this._hasContentFilter = false;
        this._hasUserScope = false;
        this._repositoryType = 'local';
        this._accessStatus = null;
        this._lastConnection = null;
        this.icon = '';
		this.resourcesManager = new ResourcesManager();
		this.loadedCell = null;
		if(xmlDef) this.loadFromXml(xmlDef);
	}

	static isInternal(driverName){
	    return (driverName === 'settings' || driverName === 'homepage' || driverName === 'directory');
    }

	/**
	 * @returns String
	 */
	getId(){
		return this.id;
	}

	/**
	 * @returns String
	 */
	getShareId(){
		return this.id.replace(/ocs_remote_share_/, '');

	}

    /**
     * @return {Promise<CellModel>}
     */
	asCell(){
        if(!this.getOwner()) {
            return Promise.resolve(null);
        } else if(this.loadedCell) {
            return Promise.resolve(this.loadedCell);
        } else {
            const cell = new CellModel();
            return new Promise((resolve, reject) => {
                cell.load(this.getId()).then(res => {
                    this.loadedCell = cell;
                    resolve(cell);
                }).catch(reason => {
                    reject(reason);
                })
            })
        }
    }

	/**
	 * @returns String
	 */
	getLabel(){
	    if(this.accessType === 'homepage'){
	        return Pydio.getMessages()['user_home.title'] || 'Homepage'
        } else if(this.accessType === 'settings'){
            return Pydio.getMessages()['165'] || 'Settings'
        }
		return this.label;
	}
	/**
	 * @param label String
	 */
	setLabel(label){
		this.label = label;
	}

    getLettersBadge(){
        if(!this.label) return '';
        return this.label.split(" ").map(function(word){return word.substr(0,1)}).slice(0,2).join("");
    }

    /**
     * @return String
     */
    getDescription(){
        return this.description;
    }

	/**
	 * @returns String
	 */
	getIcon(){
		return this.icon;
	}
	/**
	 * @param icon String
	 */
	setIcon(icon){
		this.icon = icon;
	}

    /**
     * @return String
     */
    getOwner(){
        return this.owner;
    }

	/**
	 * @returns String
	 */
	getAccessType(){
		return this.accessType;
	}
	/**
	 * @param access String
	 */
	setAccessType(access){
		this.accessType = access;
	}
	
	/**
	 * Triggers ResourcesManager.load
	 */
	loadResources(){
		this.resourcesManager.load(null, true);
	}
	
	/**
	 * @returns Object
	 */
	getNodeProviderDef(){
		return this.nodeProviderDef;
	}
	
	/**
	 * @param slug String
	 */
	setSlug(slug){
		this.slug = slug;
	}
	
	/**
	 * @returns String
	 */
	getSlug(){
		return this.slug;
	}

    getOverlay(){
        return (this.getOwner() ? ResourcesManager.resolveImageSource("shared.png", "overlays/ICON_SIZE", 8):"");
    }

    /**
     * @returns {boolean}
     */
    hasContentFilter(){
        return this._hasContentFilter;
    }

    /**
     * @returns {boolean}
     */
    hasUserScope(){
        return this._hasUserScope;
    }

    /**
     * @returns {string}
     */
    getRepositoryType(){
        return this._repositoryType;
    }

    /**
     * @returns {string}
     */
    getAccessStatus(){
        return this._accessStatus;
    }

    setAccessStatus(status) {
    	this._accessStatus = status;
    }

    getLastConnection(){
        return this._lastConnection;
    }

	/**
	 * Parses XML Node
	 * @param repoNode XMLNode
	 */
	loadFromXml(repoNode){
		if(repoNode.getAttribute('allowCrossRepositoryCopy') && repoNode.getAttribute('allowCrossRepositoryCopy') == "true"){
			this.allowCrossRepositoryCopy = true;
		}
		if(repoNode.getAttribute('hasContentFilter') && repoNode.getAttribute('hasContentFilter') == "true"){
			this._hasContentFilter = true;
		}
		if(repoNode.getAttribute('userScope') && repoNode.getAttribute('userScope') == "true"){
			this._hasUserScope = true;
		}
		if(repoNode.getAttribute('repository_type')){
			this._repositoryType = repoNode.getAttribute('repository_type');
		}
		if(repoNode.getAttribute('access_status')){
			this._accessStatus = repoNode.getAttribute('access_status');
		}
        if(repoNode.getAttribute('last_connection')){
            this._lastConnection = repoNode.getAttribute('last_connection');
        }

		if(repoNode.getAttribute('user_editable_repository') && repoNode.getAttribute('user_editable_repository') === "true"){
			this.userEditable = true;
		}
		if(repoNode.getAttribute('access_type')){
			this.setAccessType(repoNode.getAttribute('access_type'));
		}
		if(repoNode.getAttribute('repositorySlug')){
			this.setSlug(repoNode.getAttribute('repositorySlug'));
		}
		if(repoNode.getAttribute('owner')){
			this.owner = repoNode.getAttribute('owner');
		}
		for(let i=0;i<repoNode.childNodes.length;i++){
			const childNode = repoNode.childNodes[i];
            if(childNode.nodeName === "label"){
                this.setLabel(childNode.firstChild.nodeValue);
            }else if(childNode.nodeName === "description"){
                this.description = childNode.firstChild.nodeValue;
            }else if(childNode.nodeName === "client_settings"){
                this.setIcon(childNode.getAttribute('icon'));
                for(let j=0; j<childNode.childNodes.length;j++){
                    const subCh = childNode.childNodes[j];
                    if(subCh.nodeName === 'resources'){
                        this.resourcesManager.loadFromXmlNode(subCh);
                    }else if(subCh.nodeName === 'node_provider'){
                        const nodeProviderName = subCh.getAttribute("ajxpClass");
                        const nodeProviderOptions = JSON.parse(subCh.getAttribute("ajxpOptions"));
                        this.nodeProviderDef = {name:nodeProviderName, options:nodeProviderOptions};
                    }
                }
            }
        }
    }
}
