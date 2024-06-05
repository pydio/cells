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

import Observable from '../lang/Observable'
import PathUtils from '../util/PathUtils'

export default class AjxpNode extends Observable{

    /**
     *
     * @param path String
     * @param isLeaf Boolean
     * @param label String
     * @param icon String
     * @param iNodeProvider IAjxpNodeProvider
     */
        constructor(path, isLeaf=false, label='', icon='', iNodeProvider=null){
        super();
        this._path = path;
        if(this._path && this._path.length && this._path.length > 1){
            if(this._path[this._path.length-1] === "/"){
                this._path = this._path.substring(0, this._path.length-1);
            }
        }
        this._isLeaf = isLeaf;
        this._label = label;
        this._icon = icon;
        this._isRoot = false;

        this._metadata = new Map();
        this._children = new Map();

        this._isLoaded = false;
        this.fake = false;
        this._iNodeProvider = iNodeProvider;

    }


    /**
     * The node is loaded or not
     * @returns Boolean
     */
     isLoaded(){
        return this._isLoaded;
    }

    /**
     * The node is currently loading
     * @returns Boolean
     */
     isLoading(){
        return this._isLoading;
    }

    /**
     * Changes loaded status
     * @param bool Boolean
     */
    setLoaded(bool){
        this._isLoaded = bool;
    }

    /**
     * Manually change loading status
     * @param bool
     */
    setLoading(bool){
        this._isLoading = bool;
    }

    /**
     * Update node provider
     * @param iAjxpNodeProvider
     */
    updateProvider(iAjxpNodeProvider){
        this._iNodeProvider = iAjxpNodeProvider;
    }

    /**
     * Loads the node using its own provider or the one passed
     * @param iAjxpNodeProvider IAjxpNodeProvider Optionnal
     * @param additionalParameters Object of optional parameters
     */
    load(iAjxpNodeProvider, additionalParameters=null){
        if(this._isLoading) {
            return;
        }
        if(!iAjxpNodeProvider){
            if(this._iNodeProvider){
                iAjxpNodeProvider = this._iNodeProvider;
            }else{
                iAjxpNodeProvider = new EmptyNodeProvider();
            }
        }
        this._isLoading = true;
        this.notify("loading");
        if(this._isLoaded){
            this._isLoading = false;
            this.notify("loaded");
            return;
        }
        iAjxpNodeProvider.loadNode(this, function(node){
            this._isLoaded = true;
            this._isLoading = false;
            this.notify("loaded");
            this.notify("first_load");
        }.bind(this), null, false, -1, additionalParameters);
    }
    /**
     * Remove children and reload node
     * @param iAjxpNodeProvider IAjxpNodeProvider Optionnal
     * @param silentClear do not send notification
     */
    reload(iAjxpNodeProvider, silentClear = false){
        this._isLoaded = false;
        this._children.forEach(function(child,key){
            if(!silentClear) {
                child.notify("node_removed");
            }
            child._parentNode = null;
            this._children.delete(key);
            if(!silentClear) {
                this.notify("child_removed", child);
            }
        }, this);
        this.load(iAjxpNodeProvider);
    }
    /**
     * Unload child and notify "force_clear"
     */
    clear(){
        this._children.forEach(function(child,key){
            child.notify("node_removed");
            child._parentNode = null;
            this._children.delete(key);
            this.notify("child_removed", child);
        }, this);
        this._isLoaded = false;
        this.notify("force_clear");
    }
    /**
     * Sets this AjxpNode as being the root parent
     */
    setRoot(){
        this._isRoot = true;
    }
    /**
     * Set the node children as a bunch
     * @param ajxpNodes AjxpNodes[]
     */
    setChildren(ajxpNodes){
        this._children = new Map();
        ajxpNodes.forEach(function(value){
            this._children.set(value.getPath(), value);
            value.setParent(this);
        }.bind(this));
    }
    /**
     * Get all children as a bunch
     * @returns AjxpNode[]
     */
    getChildren(){
        return this._children;
    }

    getFirstChildIfExists(){
        if(this._children.size){
            return this._children.values().next().value;
        }
        return null;
    }

    isMoreRecentThan(otherNode){
        return otherNode.getMetadata().get("ajxp_im_time") && this.getMetadata().get("ajxp_im_time")
            && parseInt(this.getMetadata().get("ajxp_im_time")) >= parseInt(otherNode.getMetadata().get("ajxp_im_time"));
    }

    /**
     * Adds a child to children
     * @param ajxpNode AjxpNode The child
     * @param customKey String replace default key (ajxpNode.getPath())
     */
    addChild(ajxpNode, customKey = undefined){
        ajxpNode.setParent(this);
        if(this._iNodeProvider) {
            ajxpNode._iNodeProvider = this._iNodeProvider;
        }
        if(this.getMetadata().get('search_root')){
            ajxpNode.getMetadata().set('search_result', true);
        }
        const existingNode = this.findChildByPath(ajxpNode.getPath());
        if(existingNode && !(existingNode instanceof String)){
            if (existingNode.isMoreRecentThan(ajxpNode)) {
                return false;
            }
            existingNode.replaceBy(ajxpNode, "override");
            return existingNode;
        } else {
            const key = customKey || ajxpNode.getPath()
            this._children.set(key, ajxpNode);
            this.notify("child_added", ajxpNode.getPath());
        }
        return ajxpNode;
    }
    /**
     * Removes the child from the children
     * @param ajxpNode AjxpNode
     */
    removeChild(ajxpNode){
        const removePath = ajxpNode.getPath();
        ajxpNode.notify("node_removed");
        ajxpNode._parentNode = null;
        this._children.delete(ajxpNode.getPath());
        this.notify("child_removed", removePath);
    }

    replaceMetadata(newMeta, eventNodeReplaced = false){
        this._metadata = newMeta;
        if(eventNodeReplaced) {
            this.notify("node_replaced", this);
        }
        this.notify("meta_replaced", this);
        if(this.getParent()){
            this.getParent().notify("child_replaced", this);
        }
    }

    /**
     * Replaces the current node by a new one. Copy all properties deeply
     * @param ajxpNode AjxpNode
     * @param metaMerge
     */
    replaceBy(ajxpNode, metaMerge){
        this._isLeaf = ajxpNode._isLeaf;
        let pathChanged = false;
        if(ajxpNode.getPath() && this._path !== ajxpNode.getPath()){
            const originalPath = this._path;
            if(this.getParent()){
                const parentChildrenIndex = this.getParent()._children;
                parentChildrenIndex.set(ajxpNode.getPath(), this);
                parentChildrenIndex.delete(originalPath);
            }
            this._path = ajxpNode.getPath();
            pathChanged = true;
        }
        if(ajxpNode._label){
            this._label = ajxpNode._label;
        }
        if(ajxpNode._icon){
            this._icon = ajxpNode._icon;
        }
        if(ajxpNode._iNodeProvider){
            this._iNodeProvider = ajxpNode._iNodeProvider;
        }
        //this._isRoot = ajxpNode._isRoot;
        this._isLoaded = ajxpNode._isLoaded;
        this.fake = ajxpNode.fake;
        const meta = ajxpNode.getMetadata();
        if(metaMerge === "override") {
            const newMeta = new Map();
            // Do not override local: metadata
            this._metadata.forEach((v, k) =>{
                if(k.indexOf('local:') === 0) {
                    newMeta.set(k, v)
                }
            })
            this._metadata = newMeta;
        }
        meta.forEach(function(value, key){
            if(metaMerge === "override"){
                this._metadata.set(key, value);
            }else{
                if(this._metadata.has(key) && value === ""){
                    return;
                }
                this._metadata.set(key, value);
            }
        }.bind(this) );
        if(pathChanged && !this._isLeaf && this.getChildren().size){
            this.getChildren().forEach((c) => {
                this.removeChild(c);
            });
            this.setLoaded(false);
        } else {
            ajxpNode.getChildren().forEach((child)=>{
                this.addChild(child);
            });
        }
        this.notify("node_replaced", this);
        if(this.getParent()){
            this.getParent().notify("child_replaced", this);
        }
    }
    /**
     * Finds a child node by its path
     * @param path String
     * @returns AjxpNode
     */
    findChildByPath(path){
        return this._children.get(path);
    }
    /**
     * Sets the metadata as a bunch
     * @param data Map A Map
     * @param notify bool Trigger a notification
     */
    setMetadata(data, notify = false){
        this._metadata = data;
        if(notify){
            this.notify("node_replaced", this);
        }
    }
    /**
     * Gets the metadat
     * @returns Map
     */
    getMetadata(){
        return this._metadata;
    }
    /**
     * Is this node a leaf
     * @returns Boolean
     */
    isLeaf(){
        return this._isLeaf;
    }

    isBrowsable(){
        return !this._isLeaf || this.getAjxpMime() === 'ajxp_browsable_archive';
    }

    /**
     * @returns String
     */
    getPath(){
        return this._path;
    }
    /**
     * @returns String
     */
    getLabel(){
        return this._label || "";
    }
    /**
     * @param l string
     */
    setLabel(l){
        this._label = l;
    }
    /**
     * @returns String
     */
    getIcon(){
        return this._icon;
    }
    /**
     * @returns Boolean
     */
    isRecycle(){
        return (this.getAjxpMime() === 'ajxp_recycle');
    }
    /**
     * @returns String
     */
    getSvgSource() {
        return this.getMetadata().get("fonticon");
    }

    /**
     * Search the mime type in the parent branch
     * @param ajxpMime String
     * @returns Boolean
     */
    hasAjxpMimeInBranch(ajxpMime){
        if(this.getAjxpMime() === ajxpMime.toLowerCase()) return true;
        let parent, crt = this;
        while(parent =crt._parentNode){
            if(parent.getAjxpMime() === ajxpMime.toLowerCase()){return true;}
            crt = parent;
        }
        return false;
    }
    /**
     * Search the mime type in the parent branch
     * @returns Boolean
     * @param metadataKey
     * @param metadataValue
     */
    hasMetadataInBranch(metadataKey, metadataValue){
        if(this.getMetadata().has(metadataKey)) {
            if(metadataValue) {
                return this.getMetadata().get(metadataKey) === metadataValue;
            }else {
                return true;
            }
        }
        let parent, crt = this;
        while(parent = crt._parentNode){
            if(parent.getMetadata().has(metadataKey)){
                if(metadataValue){
                    return (parent.getMetadata().get(metadataKey) === metadataValue);
                }else{
                    return true;
                }
            }
            crt = parent;
        }
        return false;
    }
    /**
     * Sets a reference to the parent node
     * @param parentNode AjxpNode
     */
    setParent(parentNode){
        this._parentNode = parentNode;
    }
    /**
     * Gets the parent Node
     * @returns AjxpNode
     */
    getParent(){
        return this._parentNode;
    }
    /**
     * Finds this node by path if it already exists in arborescence
     * @param rootNode AjxpNode
     * @param fakeNodes AjxpNode[]
     * @returns AjxpNode|undefined
     */
    findInArbo(rootNode, fakeNodes=undefined){
        if(!this.getPath()) {
            return;
        }
        const pathParts = this.getPath().split("/");
        let crtPath = "", crtNode, crtParentNode = rootNode;
        for(let i=0;i<pathParts.length;i++){
            if(pathParts[i] === "") {
                continue;
            }
            crtPath = crtPath + "/" + pathParts[i];
            const node = crtParentNode.findChildByPath(crtPath);
            if(node && !(node instanceof String)){
                crtNode = node;
            }else{
                if(fakeNodes === undefined) {
                    return undefined;
                }
                crtNode = new AjxpNode(crtPath, false, PathUtils.getBasename(crtPath));
                crtNode.fake = true;
                crtNode.getMetadata().set("text", PathUtils.getBasename(crtPath));
                fakeNodes.push(crtNode);
                crtParentNode.addChild(crtNode);
            }
            crtParentNode = crtNode;
        }
        return crtNode;
    }
    /**
     * @returns Boolean
     */
    isRoot(){
        return this._isRoot;
    }
    /**
     * Check if it's the parent of the given node
     * @param node AjxpNode
     * @returns Boolean
     */
    isParentOf(node){
        const childPath = node.getPath();
        const parentPath = this.getPath();
        return (childPath.substring(0,parentPath.length) === parentPath);
    }
    /**
     * Check if it's a child of the given node
     * @param node AjxpNode
     * @returns Boolean
     */
    isChildOf(node){
        const childPath = this.getPath();
        const parentPath = node.getPath();
        return (childPath.substring(0,parentPath.length) === parentPath);
    }
    /**
     * Gets the current's node mime type, either by ajxp_mime or by extension.
     * @returns String
     */
    getAjxpMime(){
        if(this._metadata && this._metadata.has("ajxp_mime")) {
            return this._metadata.get("ajxp_mime").toLowerCase();
        }
        if(this._metadata && this.isLeaf()) {
            return PathUtils.getAjxpMimeType(this._metadata).toLowerCase();
        }
        return "";
    }

    buildRandomSeed(ajxpNode) {
       let mtimeString = "&time_seed=" + this._metadata.get("ajxp_modiftime");
       if (this.getParent()){
           const preview_seed = this.getParent().getMetadata().get('preview_seed');
           if(preview_seed){
               mtimeString += "&rand="+preview_seed;
           }
       }
       return mtimeString;
   }

}
