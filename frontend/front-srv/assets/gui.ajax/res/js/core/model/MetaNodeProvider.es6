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

import MetaCacheService from '../http/MetaCacheService'
import PydioApi from '../http/PydioApi'
import PathUtils from '../util/PathUtils'
import XMLUtils from '../util/XMLUtils'
import Logger from '../lang/Logger'
import AjxpNode from './AjxpNode'
import MetaServiceApi from "../http/gen/api/MetaServiceApi";
import RestGetBulkMetaRequest from "../http/gen/model/RestGetBulkMetaRequest";


/**
 * Implementation of the IAjxpNodeProvider interface based on a remote server access.
 * Default for all repositories.
 */
export default class MetaNodeProvider{

    /**
     * Constructor
     */
    constructor(properties = null){
        this.discrete = false;
        if(properties) this.initProvider(properties);
    }
    /**
     * Initialize properties
     * @param properties Object
     */
    initProvider(properties){
        this.properties = new Map();
        for (let p in properties){
            if(properties.hasOwnProperty(p)) this.properties.set(p, properties[p]);
        }
        if(this.properties && this.properties.has('connexion_discrete')){
            this.discrete = true;
            this.properties.delete('connexion_discrete');
        }
        if(this.properties && this.properties.has('cache_service')){
            this.cacheService = this.properties.get('cache_service');
            this.properties.delete('cache_service');
            MetaCacheService.getInstance().registerMetaStream(
                this.cacheService['metaStreamName'],
                this.cacheService['expirationPolicy']
            );
        }
    }

    /**
     * Load a node
     * @param node AjxpNode
     * @param nodeCallback Function On node loaded
     * @param childCallback Function On child added
     * @param recursive
     * @param depth
     * @param optionalParameters
     */
    loadNode (node, nodeCallback=null, childCallback=null, recursive=false, depth=-1, optionalParameters=null){

        const api = new MetaServiceApi(PydioApi.getRestClient());
        let request = new RestGetBulkMetaRequest();
        let slug = '';
        if(pydio.user){
            slug = pydio.user.getActiveRepositoryObject().getSlug();
        }
        request.NodePaths = [slug + node.getPath(), slug + node.getPath() + '/*'];
        api.getBulkMeta(request).then(res => {
            let origNode;
            let childrenNodes = [];
            res.Nodes.map(n => {
                const newNode = MetaNodeProvider.parseTreeNode(n, slug);
                if(newNode.getLabel() === '.pydio'){
                    return;
                } else if(newNode.getPath() === node.getPath()){
                    origNode = newNode;
                } else {
                    if(childCallback){
                        childCallback(newNode);
                    }
                    childrenNodes.push(newNode);
                }
            });
            if(origNode !== null){
                node.replaceBy(origNode);
            }
            childrenNodes.map(child => {
                node.addChild(child);
            });
            if(nodeCallback !== null){
                nodeCallback(node);
            }
            //console.log("Bulk Meta Request Result", origNode, childrenNodes);
        }).catch(e => {
            console.log(e);
        });

        /*
        let params = {
            get_action:'ls',
            options:'al'
        };
        if(recursive){
            params['recursive'] = true;
            params['depth'] = depth;
        }
        let path = node.getPath();
        // Double encode # character
        let paginationHash;
        if(node.getMetadata().has("paginationData")){
            paginationHash = "%23" + node.getMetadata().get("paginationData").get("current");
            path += paginationHash;
            params['remote_order'] = 'true';
            let remoteOrderData = node.getMetadata().get("remote_order");
            if(remoteOrderData){
                if(remoteOrderData._object) remoteOrderData = ProtoCompat.hash2map(remoteOrderData);
                remoteOrderData.forEach(function(value, key){
                    params[key] = value;
                });
            }
        }
        params['dir'] = path;
        if(this.properties){
            this.properties.forEach(function(value, key){
                params[key] = value + (key == 'dir' && paginationHash ? paginationHash :'');
            });
        }
        if(optionalParameters){
            params = {...params, ...optionalParameters};
        }
        let parser = function (transport){
            this.parseNodes(node, transport, nodeCallback, childCallback);
            return node;
        }.bind(this);
        if(this.cacheService){
            let loader = function(ajxpNode, cacheCallback){
                PydioApi.getClient().request(params, cacheCallback, null, {discrete:this.discrete});
            }.bind(this);
            let cacheLoader = function(newNode){
                node.replaceBy(newNode);
                nodeCallback(node);
            }.bind(this);
            MetaCacheService.getInstance().metaForNode(this.cacheService['metaStreamName'], node, loader, parser, cacheLoader);
        }else{
            PydioApi.getClient().request(params, parser, null, {discrete:this.discrete});
        }
        */
    }

    /**
     * Load a node
     * @param node AjxpNode
     * @param nodeCallback Function On node loaded
     * @param aSync bool
     * @param additionalParameters object
     */
    loadLeafNodeSync (node, nodeCallback, aSync=false, additionalParameters={}){

        const api = new MetaServiceApi(PydioApi.getRestClient());
        let request = new RestGetBulkMetaRequest();
        let slug = '';
        let path = node.getPath();
        if(pydio.user){
            slug = pydio.user.getActiveRepositoryObject().getSlug();
        }
        if(path && path[0] !== '/') {
            path = '/' + path;
        }
        request.NodePaths = [slug + path];
        api.getBulkMeta(request).then(res => {
            if(res.Nodes && res.Nodes.length){
                nodeCallback(MetaNodeProvider.parseTreeNode(res.Nodes[0], slug));
            }
        });

    }

    refreshNodeAndReplace (node, onComplete){

        const nodeCallback = function(newNode){
            node.replaceBy(newNode, "override");
            if(onComplete) {
                onComplete(node);
            }
        };
        this.loadLeafNodeSync(node, nodeCallback);

    }

    /**
     * Parse the answer and create AjxpNodes
     * @param origNode AjxpNode
     * @param transport Ajax.Response
     * @param nodeCallback Function
     * @param childCallback Function
     * @param childrenOnly
     */
    parseNodes (origNode, transport, nodeCallback, childCallback, childrenOnly){

        if(!transport.responseXML || !transport.responseXML.documentElement) {
            Logger.debug('Loading node ' + origNode.getPath() + ' has wrong response: ' + transport.responseText);
            if(nodeCallback) nodeCallback(origNode);
            origNode.setLoaded(false);
            if(!transport.responseText){
                throw new Error('Empty response!');
            }
            throw new Error('Invalid XML Document (see console)');
        }
        const rootNode = transport.responseXML.documentElement;
        if(!childrenOnly){
            const contextNode = this.parseAjxpNode(rootNode);
            origNode.replaceBy(contextNode, "merge");
        }

        // CHECK FOR MESSAGE OR ERRORS
        let errorNode = XMLUtils.XPathSelectSingleNode(rootNode, "error|message");
        if(errorNode){
            let type;
            if(errorNode.nodeName == "message") {
                type = errorNode.getAttribute('type');
            }
            if(type == "ERROR"){
                origNode.notify("error", errorNode.firstChild.nodeValue + '(Source:'+origNode.getPath()+')');
            }
        }

        // CHECK FOR AUTH PROMPT REQUIRED
        const authNode = XMLUtils.XPathSelectSingleNode(rootNode, "prompt");
        if(authNode && pydio && pydio.UI && pydio.UI.openPromptDialog){
            let jsonData = XMLUtils.XPathSelectSingleNode(authNode, "data").firstChild.nodeValue;
            pydio.UI.openPromptDialog(JSON.parse(jsonData));
            return false;
        }

        // CHECK FOR PAGINATION DATA
        const paginationNode = XMLUtils.XPathSelectSingleNode(rootNode, "pagination");
        if(paginationNode){
            let paginationData = new Map();
            Array.from(paginationNode.attributes).forEach(function(att){
                paginationData.set(att.nodeName, att.value);
            }.bind(this));
            origNode.getMetadata().set('paginationData', paginationData);
        }else if(origNode.getMetadata().get('paginationData')){
            origNode.getMetadata().delete('paginationData');
        }

        // CHECK FOR COMPONENT CONFIGS CONTEXTUAL DATA
        const configs = XMLUtils.XPathSelectSingleNode(rootNode, "client_configs");
        if(configs){
            origNode.getMetadata().set('client_configs', configs);
        }

        // NOW PARSE CHILDREN
        const children = XMLUtils.XPathSelectNodes(rootNode, "tree");
        children.forEach(function(childNode){
            const child = this.parseAjxpNode(childNode);
            if(!childrenOnly) {
                origNode.addChild(child);
            }
            let cLoaded;
            if(XMLUtils.XPathSelectNodes(childNode, 'tree').length){
                XMLUtils.XPathSelectNodes(childNode, 'tree').forEach(function(c){
                    const newChild = this.parseAjxpNode(c);
                    if(newChild){
                        child.addChild(newChild);
                    }
                }.bind(this));
                cLoaded = true;
            }
            if(childCallback){
                childCallback(child);
            }
            if(cLoaded) child.setLoaded(true);
        }.bind(this) );

        if(nodeCallback){
            nodeCallback(origNode);
        }
    }


    /**
     * @return AjxpNode | null
     * @param obj
     * @param workspaceSlug string
     */
    static parseTreeNode(obj, workspaceSlug) {

        if (!obj){
            return null;
        }

        let nodeName;
        if (obj.MetaStore.name){
            nodeName = JSON.parse(obj.MetaStore.name);
        } else{
            nodeName = PathUtils.getBasename(obj.Path);
        }
        // Strip workspace slug
        obj.Path = obj.Path.substr(workspaceSlug.length + 1);

        let node = new AjxpNode('/' + obj.Path, obj.Type === "LEAF", nodeName, '', null);

        let meta = obj.MetaStore;
        for (let k in meta){
            if (meta.hasOwnProperty(k)) {
                let metaValue = JSON.parse(meta[k]);
                node.getMetadata().set(k, metaValue);
                if (typeof metaValue === 'object') {
                    for (let kSub in metaValue) {
                        if (metaValue.hasOwnProperty(kSub)) {
                            node.getMetadata().set(kSub, metaValue[kSub]);
                        }
                    }
                }
            }
        }
        node.getMetadata().set('filename', node.getPath());
        if(node.getPath() === '/recycle_bin'){
            node.getMetadata().set('fonticon', 'delete');
            node.getMetadata().set('mimestring_id', '122');
            node.getMetadata().set('ajxp_mime', 'ajxp_recycle');
            if(pydio) node.setLabel(pydio.MessageHash[122]);
        }
        if(node.isLeaf() && pydio && pydio.Registry){
            const ext = PathUtils.getFileExtension(node.getPath());
            const registered = pydio.Registry.getFilesExtensions();
            if(registered.has(ext)){
                const {messageId, fontIcon} = registered.get(ext);
                node.getMetadata().set('fonticon',fontIcon);
                node.getMetadata().set('mimestring_id',messageId);
            }
        }
        if (obj.Size !== undefined){
            node.getMetadata().set('bytesize', obj.Size);
        }
        if (obj.MTime !== undefined){
            node.getMetadata().set('ajxp_modiftime', obj.MTime);
        }
        if (obj.Etag !== undefined){
            node.getMetadata().set('etag', obj.Etag);
        }
        if (obj.Uuid !== undefined){
            node.getMetadata().set('uuid', obj.Uuid);
        }
        MetaNodeProvider.overlays(node);
        return node;

    }

    /**
     * Update metadata for specific overlays
     * @param node AjxpNode
     */
    static overlays(node){
        let meta = node.getMetadata();
        let overlays = [];

        // SHARES
        if(meta.has('workspaces_shares')){
            const wsRoot = meta.get('ws_root');
            meta.set('pydio_is_shared', "true");
            meta.set('pydio_shares', JSON.stringify(meta.get('workspaces_shares')));
            if(!wsRoot){
                overlays.push('mdi mdi-share-variant');
            } else if(!node.isLeaf()){
                meta.set('fonticon', 'folder-star');
            }
        }

        // WATCHES
        if(meta.has('user_subscriptions')){
            const subs = meta.get('user_subscriptions');
            const read = subs.indexOf('read');
            const changes = subs.indexOf('change');
            let value = '';
            if(read && changes){
                value = 'META_WATCH_BOTH';
            } else if(read){
                value = 'META_WATCH_READ';
            } else if(changes){
                value = 'META_WATCH_CHANGES';
            }
            if(value){
                meta.set('meta_watched', value);
                overlays.push('icon-eye-open');
            }
        }

        // BOOKMARKS
        if(meta.has('bookmark')){
            meta.set('ajxp_bookmarked', 'true');
            overlays.push('mdi mdi-bookmark-outline');
        }

        // LOCKS
        if(meta.has('content_lock')){
            const lockUser = meta.get('content_lock');
            overlays.push('icon-lock');
            meta.set('sl_locked', 'true');
            if(pydio && pydio.user && lockUser === pydio.user.id){
                meta.set('sl_mylock', 'true');
            }
        }

        if(overlays.length) {
            meta.set('overlay_class', overlays.join(','));
        }
        node.setMetadata(meta);
    }


    /**
     * Parses XML Node and create AjxpNode
     * @param xmlNode XMLNode
     * @returns AjxpNode
     */
    parseAjxpNode (xmlNode){
        let node = new AjxpNode(
            xmlNode.getAttribute('filename'),
            (xmlNode.getAttribute('is_file') == "1" || xmlNode.getAttribute('is_file') == "true"),
            xmlNode.getAttribute('text'),
            xmlNode.getAttribute('icon'));
        let metadata = new Map();
        for(let i=0;i<xmlNode.attributes.length;i++)
        {
            metadata.set(xmlNode.attributes[i].nodeName, xmlNode.attributes[i].value);
        }
        node.setMetadata(metadata);
        return node;
    }
}