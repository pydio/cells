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
import Observable from '../lang/Observable'
import Logger from '../lang/Logger'
import AjxpNode from './AjxpNode'
import LangUtils from '../util/LangUtils'
import PathUtils from '../util/PathUtils'
import MetaNodeProvider from './MetaNodeProvider'
import EmptyNodeProvider from './EmptyNodeProvider'

/**
 * Full container of the data tree. Contains the SelectionModel as well.
 */
export default class PydioDataModel extends Observable{

	/**
	 * Constructor
     * > Warning, events are now LOCAL by default
	 */
	constructor(localEvents=true){
        super();
		this._currentRep = '/';
		this._selectedNodes = [];
		this._bEmpty = true;
        this._globalEvents = !localEvents;

        this._bFile= false;
        this._bDir= false;
        this._isRecycle= false;

        this._pendingSelection=null;
        this._selectionSource = {};

        this._rootNode = null;
        this._searchNode = null;

	}

	static RemoteDataModelFactory(providerProperties, rootLabel=''){
        let dataModel = new PydioDataModel(true);
        let rNodeProvider = new MetaNodeProvider(providerProperties);
        dataModel.setAjxpNodeProvider(rNodeProvider);
        const rootNode = new AjxpNode("/", false, rootLabel, '', rNodeProvider);
        dataModel.setRootNode(rootNode);
	    return dataModel;
    }

	/**
	 * Sets the data source that will feed the nodes with children.
	 * @param iAjxpNodeProvider IAjxpNodeProvider
	 */
	setAjxpNodeProvider (iAjxpNodeProvider){
		this._iAjxpNodeProvider = iAjxpNodeProvider;
	}

    /**
     * Return the current data source provider
     * @return IAjxpNodeProvider
     */
	getAjxpNodeProvider (){
		return this._iAjxpNodeProvider;
	}

	/**
	 * Changes the current context node.
	 * @param ajxpNode AjxpNode Target node, either an existing one or a fake one containing the target part.
	 * @param forceReload Boolean If set to true, the node will be reloaded even if already loaded.
	 */
	requireContextChange (ajxpNode, forceReload=false){
        if(ajxpNode === null) return;
        this.setSelectedNodes([]);
		const path = ajxpNode.getPath();
		if((path === "" || path === "/") && ajxpNode !== this._rootNode){
			ajxpNode = this._rootNode;
		}
		let paginationPage = null;
		if(ajxpNode.getMetadata().has('paginationData') && ajxpNode.getMetadata().get('paginationData').has('new_page')
			&& ajxpNode.getMetadata().get('paginationData').get('new_page') !== ajxpNode.getMetadata().get('paginationData').get('current')){
				paginationPage = ajxpNode.getMetadata().get('paginationData').get('new_page');
				forceReload = true;
		}
		if(ajxpNode !== this._rootNode && (!ajxpNode.getParent() || ajxpNode.fake)){
			// Find in arbo or build fake arbo
			let fakeNodes = [];
			ajxpNode = ajxpNode.findInArbo(this._rootNode, fakeNodes);
			if(fakeNodes.length){
				const firstFake = fakeNodes.shift();
				firstFake.observeOnce("first_load", (e) => {
					this.requireContextChange(ajxpNode);
				});
				firstFake.observeOnce("error", (message) => {
					Logger.error(message);
					firstFake.notify("node_removed");
					const parent = firstFake.getParent();
					parent.removeChild(firstFake);
					//delete(firstFake);
					this.requireContextChange(parent);
				});
				this.publish("context_loading");
				firstFake.load(this._iAjxpNodeProvider);
				return;
			}
		}
		ajxpNode.observeOnce("loaded", () => {
			this.setContextNode(ajxpNode, true);
			this.publish("context_loaded");
            if(this.getPendingSelection()){
                const selPath = ajxpNode.getPath() + (ajxpNode.getPath() === "/" ? "" : "/" ) +this.getPendingSelection();
                const selNode =  ajxpNode.findChildByPath(selPath);
                if(selNode) {
                    this.setSelectedNodes([selNode], this);
                }else if(ajxpNode.getMetadata().get("paginationData") && arguments.length < 3){
                    this.loadPathInfoSync(selPath, (foundNode) => {
                        ajxpNode.addChild(foundNode);
                        this.setSelectedNodes([foundNode], this);
                    });
                }
                this.clearPendingSelection();
            }
		});
		ajxpNode.observeOnce("error", (message) => {
            Logger.error(message);
			this.publish("context_loaded");
		});
		this.publish("context_loading");
		try{
			if(forceReload){
				if(paginationPage){
					ajxpNode.getMetadata().get('paginationData').set('current', paginationPage);
				}
				ajxpNode.reload(this._iAjxpNodeProvider, true);
			}else{
				ajxpNode.load(this._iAjxpNodeProvider);
			}
		}catch(e){
			this.publish("context_loaded");
		}
	}

    requireNodeReload(nodeOrPath, completeCallback){
        if(nodeOrPath instanceof String){
            nodeOrPath = new AjxpNode(nodeOrPath);
        }
        let onComplete = null;
        if(this._selectedNodes.length) {
            let found = -1;
            this._selectedNodes.map(function(node, key){
                if(node.getPath() === nodeOrPath.getPath()) found = key;
            });
            if(found !== -1){
                // MAKE SURE SELECTION IS OK AFTER RELOAD
                this._selectedNodes = LangUtils.arrayWithout(this._selectedNodes, found);
                this.publish("selection_changed", this);
                onComplete = function(newNode){
                    this._selectedNodes.push(newNode);
                    this._selectionSource = {};
                    this.publish("selection_changed", this);
                    if(completeCallback) completeCallback(newNode);
                }.bind(this);
            }
        }
        this._iAjxpNodeProvider.refreshNodeAndReplace(nodeOrPath, onComplete);
    }

    loadPathInfoSync (path, callback, additionalParameters = {}){
        this._iAjxpNodeProvider.loadLeafNodeSync(new AjxpNode(path), callback, false, additionalParameters);
    }

    loadPathInfoAsync (path, callback){
        this._iAjxpNodeProvider.loadLeafNodeSync(new AjxpNode(path), callback, true);
    }

	/**
	 * Sets the root of the data store
	 * @param ajxpRootNode AjxpNode The parent node
	 */
	setRootNode (ajxpRootNode){
		this._rootNode = ajxpRootNode;
		this._rootNode.setRoot();
		this._rootNode.observe("child_added", function(c){
				//console.log(c);
		});
		this.publish("root_node_changed", this._rootNode);
		this.setContextNode(this._rootNode);
	}

	/**
	 * Gets the current root node
	 * @returns AjxpNode
	 */
	getRootNode (){
		return this._rootNode;
	}

	getSearchNode() {
	    if(!this._searchNode) {
            this._searchNode = new AjxpNode("/", false, "Search Results", 'mdi mdi-magnify', new EmptyNodeProvider());
            this._searchNode.setRoot();
            this._searchNode.getMetadata().set('search_root', true);
            this._searchNode.getMetadata().set('node_readonly', 'true');
        }
	    return this._searchNode;
    }

	/**
	 * Sets the current context node
	 * @param ajxpDataNode AjxpNode
	 * @param forceEvent Boolean If set to true, event will be triggered even if the current node is already the same.
	 */
	setContextNode (ajxpDataNode, forceEvent){
		if(this._contextNode && this._contextNode === ajxpDataNode && this._currentRep  === ajxpDataNode.getPath() && !forceEvent){
			return; // No changes
		}
        if(!ajxpDataNode) {
            return;
        }
        if(this._contextNodeReplacedObserver && this._contextNode){
            this._contextNode.stopObserving("node_replaced", this._contextNodeReplacedObserver);
        }
        this._contextNode = ajxpDataNode;
		this._currentRep = ajxpDataNode.getPath();
        this.publish("context_changed", ajxpDataNode);
        if(!this._contextNodeReplacedObserver) {
            this._contextNodeReplacedObserver = this.contextNodeReplaced.bind(this);
        }
        ajxpDataNode.observe("node_replaced", this._contextNodeReplacedObserver);
	}

    contextNodeReplaced(newNode){
        this.setContextNode(newNode, true);
    }

    /**
     *
     */
    publish(eventName, optionalData){
        let args = [];
        if(this._globalEvents){
            if(Pydio.getInstance()){
                args.push(eventName);
                if(optionalData) {
                    args.push(optionalData);
                }
                Pydio.getInstance().fire.apply(Pydio.getInstance(),args);
            }else if(document.fire) {
                args.push("pydio:"+eventName);
                if(optionalData) {
                    args.push(optionalData);
                }
                document.fire.apply(document, args);
            }
                if(optionalData){
                    args = [eventName, {memo:optionalData}];
                }else{
                    args = [eventName];
                }
                this.notify.apply(this,args);
        }else{
            if(optionalData){
                args = [eventName, {memo:optionalData}];
            }else{
                args = [eventName];
            }
            this.notify.apply(this,args);
        }
    }

	/**
	 * Get the current context node
	 * @returns AjxpNode
	 */
	getContextNode (){
		return this._contextNode;
	}

	/**
	 * After a copy or move operation, many nodes may have to be reloaded
	 * This function tries to reload them in the right order and if necessary.
	 * @param nodes AjxpNodes[] An array of nodes
	 */
	multipleNodesReload (nodes){
		for(var i=0;i<nodes.length;i++){
			var nodePathOrNode = nodes[i];
			var node;
			if(nodePathOrNode instanceof String){
				node = new AjxpNode(nodePathOrNode);
				if(node.getPath() == this._rootNode.getPath()) node = this._rootNode;
				else node = node.findInArbo(this._rootNode, []);
			}else{
				node = nodePathOrNode;
			}
			nodes[i] = node;
		}
		var children = [];
		nodes.sort(function(a,b){
			if(a.isParentOf(b)){
				children.push(b);
				return -1;
			}
			if(a.isChildOf(b)){
				children.push(a);
				return +1;
			}
			return 0;
		});
		children.map(function(c){
			nodes = LangUtils.arrayWithout(nodes, c);
		});
		nodes.map(this.queueNodeReload.bind(this));
		this.nextNodeReloader();
	}

	/**
	 * Add a node to the queue of nodes to reload.
	 * @param node AjxpNode
	 */
	queueNodeReload (node){
		if(!this.queue) this.queue = [];
		if(node){
			this.queue.push(node);
		}
	}

	/**
	 * Queue processor for the nodes to reload
	 */
	nextNodeReloader (){
		if(!this.queue.length) {
			window.setTimeout(function(){
				this.publish("context_changed", this._contextNode);
			}.bind(this), 200);
			return;
		}
		var next = this.queue.shift();
		var observer = this.nextNodeReloader.bind(this);
		next.observeOnce("loaded", observer);
		next.observeOnce("error", observer);
		if(next === this._contextNode || next.isParentOf(this._contextNode)){
			this.requireContextChange(next, true);
		}else{
			next.reload(this._iAjxpNodeProvider);
		}
	}

    /**
     * Insert a node somewhere in the datamodel
     * @param node AjxpNode
     * @param setSelectedAfterAdd bool
     */
    addNode(node, setSelectedAfterAdd=false){
        // If it already exists, replace it
        const existing = node.findInArbo(this.getRootNode(), undefined);
        if(existing){
            existing.replaceBy(node, "override");
            if(setSelectedAfterAdd && this.getContextNode() === existing.getParent()) {
                this.setSelectedNodes([existing], {});
            }
        }

        const parentFake = new AjxpNode(PathUtils.getDirname(node.getPath()));
        let parent = parentFake.findInArbo(this.getRootNode(), undefined);
        if(!parent && PathUtils.getDirname(node.getPath()) === "") {
            parent = this.getRootNode();
        }
        if(parent){
            let addedNode = parent.addChild(node);
            if(addedNode && setSelectedAfterAdd && this.getContextNode() === parent){
                this.setSelectedNodes([addedNode], {});
            }
        }

    }

    /**
     * Remove a node by path somewhere
     * @param path string
     * @param imTime integer|null
     */
    removeNodeByPath(path, imTime = null){
        const fake = new AjxpNode(path);
        const n = fake.findInArbo(this.getRootNode(), undefined);
        if(n){
            if(imTime && n.getMetadata() && n.getMetadata().get("ajxp_im_time") && parseInt(n.getMetadata().get("ajxp_im_time")) >= imTime){
                return false;
            }
            n.getParent().removeChild(n);
            return true;
        }
        return false;
    }

    /**
     * Update a node somewhere in the datamodel
     * @param node AjxpNode
     * @param setSelectedAfterUpdate bool
     */
    updateNode(node, setSelectedAfterUpdate=false){
        const original = node.getMetadata().get("original_path");
        let fake, n;
        if(original && original !== node.getPath()
            && PathUtils.getDirname(original) !== PathUtils.getDirname(node.getPath())){
            // Node was really moved to another folder
            fake = new AjxpNode(original);
            n = fake.findInArbo(this.getRootNode(), undefined);
            if(n){
                n.getParent().removeChild(n);
            }
            var parentFake = new AjxpNode(PathUtils.getDirname(node.getPath()));
            var parent = parentFake.findInArbo(this.getRootNode(), undefined);
            if(!parent && PathUtils.getDirname(node.getPath()) === "") parent = this.getRootNode();
            if(parent){
                node.getMetadata().set("original_path", undefined);
                parent.addChild(node);
            }
        }else{
            if(node.getMetadata().get("original_path") === "/" && node.getPath() === "/"){
                n = this.getRootNode();
                n.replaceMetadata(node.getMetadata());
                if(setSelectedAfterUpdate && this.getContextNode() === n) {
                    this.setSelectedNodes([n], {});
                }
                return;
            }
            fake = new AjxpNode(original);
            n = fake.findInArbo(this.getRootNode(), undefined);
            if(n && !n.isMoreRecentThan(node)){
                node._isLoaded = n._isLoaded;
                n.replaceBy(node, "override");
                if(setSelectedAfterUpdate && this.getContextNode() === n.getParent()) {
                    this.setSelectedNodes([n], {});
                }
            }
            if(this._searchNode) {
                const resNode = this._searchNode.findChildByPath(node.getPath())
                if(resNode) {
                    const initMeta = resNode.getMetadata()
                    const newMeta = new Map()
                    newMeta.set('search_result', true);
                    newMeta.set('repository_id', initMeta.get('repository_id'))
                    newMeta.set('repository_display', initMeta.get('repository_display'))
                    node.getMetadata().forEach((v,k) => {
                        newMeta.set(k, v)
                    })
                    resNode.replaceMetadata(newMeta, true);
                }
            }
        }
    }

	/**
	 * Sets an array of nodes to be selected after the context is (re)loaded
	 * @param selection AjxpNode[]
	 */
	setPendingSelection (selection){
		this._pendingSelection = selection;
	}

	/**
	 * Gets the array of nodes to be selected after the context is (re)loaded
	 * @returns AjxpNode[]
	 */
	getPendingSelection (){
		return this._pendingSelection;
	}

	/**
	 * Clears the nodes to be selected
	 */
	clearPendingSelection (){
		this._pendingSelection = null;
	}

	/**
	 * Set an array of nodes as the current selection
	 * @param nodes AjxpNode[] The nodes to select
	 * @param source String The source of this selection action
	 */
	setSelectedNodes (nodes, source){
        const filtered = nodes.filter(n => !n.getMetadata().has('local:notSelectable'));
        if(nodes.length && !filtered.length) {
            return
        }
        nodes = filtered;
        if(this._selectedNodes.length === nodes.length){
            if(nodes.length === 0) {
                return;
            }
            if (nodes.map((n, i) => this._selectedNodes[i] !== n).length === 0){
                Pydio.getInstance().fire("selection_reloaded", this);
                return;
            }
        }
		if (source) {
            this._selectionSource = source;
        } else {
            this._selectionSource = {};
        }
		this._selectedNodes = nodes;
		this._bEmpty = !(nodes && nodes.length);
		this._bFile = this._bDir = this._isRecycle = false;
		if(!this._bEmpty)
		{
            nodes.forEach(node => {
                if(node.isLeaf()) {
                    this._bFile = true;
                } else {
                    this._bDir = true;
                }
                if(node.isRecycle()) {
                    this._isRecycle = true;
                }
            })
		}
		this.publish("selection_changed", this);
	}

	/**
	 * Gets the currently selected nodes
	 * @returns AjxpNode[]
	 */
	getSelectedNodes (){
		return this._selectedNodes;
	}

	/**
	 * Gets the source of the last selection action
	 * @returns String
	 */
	getSelectionSource (){
		return this._selectionSource;
	}

    /**
     * Manually sets the source of the selection
     * @param object
     */
    setSelectionSource (object){
        this._selectionSource = object;
    }

	/**
	 * Select all the children of the current context node
	 */
	selectAll (){
        var nodes = [];
        var childrenMap = this._contextNode.getChildren();
        childrenMap.forEach(function(child){nodes.push(child)});
		this.setSelectedNodes(nodes, "dataModel");
	}

	/**
	 * Whether the selection is empty
	 * @returns Boolean
	 */
	isEmpty  (){
		return (this._selectedNodes?(this._selectedNodes.length===0):true);
	}

    hasReadOnly (){
        var test = false;
        try{
            this._selectedNodes.forEach(function(node){
                if(node.getMetadata().get("node_readonly") === "true") {
                    test = true;
                    throw $break;
                }
            });
        }catch(e){}
        return test;
    }

    selectionHasRootNode (){
        var found = false;
        try{
            this._selectedNodes.forEach(function(el){
                if(el.isRoot()) {
                    found = true;
                    throw new Error();
                }
            });
        }catch(e){}
        return found;
    }

	/**
	 * Whether the selection is unique
	 * @returns Boolean
	 */
	isUnique  (){
		return this._selectedNodes && this._selectedNodes.length === 1;
	}

	/**
	 * Whether the selection has a file selected.
	 * Should be hasLeaf
	 * @returns Boolean
	 */
	hasFile  (){
		return this._bFile;
	}

	/**
	 * Whether the selection has a dir selected
	 * @returns Boolean
	 */
	hasDir  (){
		return this._bDir;
	}

	/**
	 * Whether the current context is the recycle bin
	 * @returns Boolean
	 */
	isRecycle  (){
		return this._isRecycle;
	}

	/**
	 * Whether the selection has more than one node selected
	 * @returns Boolean
	 */
	isMultiple (){
		return this._selectedNodes && this._selectedNodes.length > 1;
	}

	/**
	 * Whether the selection has a file with one of the mimes
	 * @param mimeTypes Array Array of mime types
	 * @returns Boolean
	 */
	hasMime (mimeTypes){
		if(mimeTypes.length===1 && mimeTypes[0] === "*") return true;
		var has = false;
		mimeTypes.map(function(mime){
			if(has) return;
            for(let i=0; i<this._selectedNodes.length; i++){
                if(PathUtils.getAjxpMimeType(this._selectedNodes[i]) === mime){
                    has = true;
                    break;
                }
            }
		}.bind(this) );
		return has;
	}

	/**
	 * Get all selected filenames as an array.
	 * @param separator String Is a separator, will return a string joined
	 * @returns Array|String|bool
	 */
	getFileNames (separator){
		if(!this._selectedNodes.length)
		{
			alert('Please select a file!');
			return false;
		}
		var tmp = new Array(this._selectedNodes.length);
		for(var i=0;i<this._selectedNodes.length;i++)
		{
			tmp[i] = this._selectedNodes[i].getPath();
		}
		if(separator){
			return tmp.join(separator);
		}else{
			return tmp;
		}
	}

	/**
	 * Get all the filenames of the current context node children
	 * @param separator String If passed, will join the array as a string
	 * @return Array|String|bool
	 */
	getContextFileNames (separator){
		var allItems = this._contextNode.getChildren();
		if(!allItems.length)
		{
			return false;
		}
		var names = [];
		for(var i=0;i<allItems.length;i++)
		{
			names.push(PathUtils.getBasename(allItems[i].getPath()));
		}
		if(separator){
			return names.join(separator);
		}else{
			return names;
		}
	}

    /**
     * Whether the context node has a child with this basename
     * @param newFileName String The name to check
     * @returns Boolean
     * @param local
     * @param contextNode
     */
	fileNameExists(newFileName, local, contextNode)
	{
        if(!contextNode){
            contextNode = this._contextNode;
        }
        if(local){
            var test = (contextNode.getPath()==="/"?"":contextNode.getPath()) + "/" + newFileName;
            var found = false;
            try{
                contextNode.getChildren().forEach(function(c){
                    if(c.getPath() === test) {
                        found = true;
                        throw new Error();
                    }
                });
            }catch(e){}
            return found;
        }else{
            var nodeExists = false;
            this.loadPathInfoSync(contextNode.getPath() + "/" + newFileName, function(foundNode){
                nodeExists = true;
            });
            return nodeExists;
        }

	}

	/**
	 * Gets the first name of the current selection
	 * @returns String
	 */
	getUniqueFileName (){
		if(this.getFileNames().length) {
		    return this.getFileNames()[0];
        }
		return null;
	}

	/**
	 * Gets the first node of the selection, or Null
	 * @returns AjxpNode
	 */
	getUniqueNode (){
		if(this._selectedNodes.length){
			return this._selectedNodes[0];
		}
		return null;
	}

    /**
     * Gets a node from the current selection
     * @param i Integer the node index
     * @returns AjxpNode
     */
    getNode (i) {
        return this._selectedNodes[i];
    }

    /**
     * Will add the current selection nodes as serializable data to the element passed :
     * either as hidden input elements if it's a form, or as query parameters if it's an url
     * @param oFormElement HTMLForm The form
     * @param sUrl String An url to complete
     * @returns String
     */
	updateFormOrUrl  (oFormElement, sUrl){
		// CLEAR FROM PREVIOUS ACTIONS!
		if(oFormElement)
		{
			$(oFormElement).select('input[type="hidden"]').map(function(element){
				if(element.name === "nodes[]" || element.name === "file"){
				    element.remove();
                }
			});
		}
		// UPDATE THE 'DIR' FIELDS
		if(oFormElement && oFormElement['rep']) {
		    oFormElement['rep'].value = this._currentRep;
        }
		sUrl += '&dir='+encodeURIComponent(this._currentRep);

		// UPDATE THE 'file' FIELDS
		if(this.isEmpty()) {
		    return sUrl;
        }
		var fileNames = this.getFileNames();
        for(var i=0;i<fileNames.length;i++)
        {
            sUrl += '&'+'nodes[]='+encodeURIComponent(fileNames[i]);
            if(oFormElement) {
                this._addHiddenField(oFormElement, 'nodes[]', fileNames[i]);
            }
        }
        if(fileNames.length === 1){
            sUrl += '&'+'file='+encodeURIComponent(fileNames[0]);
            if(oFormElement) {
                this._addHiddenField(oFormElement, 'file', fileNames[0]);
            }
        }
		return sUrl;
	}

	_addHiddenField (oFormElement, sFieldName, sFieldValue){
        oFormElement.insert(new Element('input', {type:'hidden', name:sFieldName, value:sFieldValue}));
	}
}
