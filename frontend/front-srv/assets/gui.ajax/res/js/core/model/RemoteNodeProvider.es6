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


/**
 * Implementation of the IAjxpNodeProvider interface based on a remote server access.
 * Default for all repositories.
 */
export default class RemoteNodeProvider{

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
    }

    /**
     * Load a node
     * @param node AjxpNode
     * @param nodeCallback Function On node loaded
     * @param aSync bool
     * @param additionalParameters object
     */
    loadLeafNodeSync (node, nodeCallback, aSync=false, additionalParameters={}){
        let params = {
            get_action  :'ls',
            options     :'al',
            dir         : PathUtils.getDirname(node.getPath()),
            file        : PathUtils.getBasename(node.getPath()),
            ...additionalParameters
        };
        if(this.properties){
            params = {...params, ...this.properties};
        }
        const complete = function (transport){
            try{
                if(node.isRoot()){
                    this.parseNodes(node, transport, nodeCallback, null, true);
                }else{
                    this.parseNodes(node, transport, null, nodeCallback, true);
                }
            }catch(e){
                Logger.error('Loading error :'+e.message);
            }
        }.bind(this);
        PydioApi.getClient().request(params,  complete, null, {async: aSync});
    }

    refreshNodeAndReplace (node, onComplete){

        let params = {
            get_action  :'ls',
            options     :'al',
            dir         : PathUtils.getDirname(node.getPath()),
            file        : PathUtils.getBasename(node.getPath())
        };

        if(this.properties){
            params = {...params, ...this.properties};
        }

        const nodeCallback = function(newNode){
            node.replaceBy(newNode, "override");
            if(onComplete) onComplete(node);
        };
        PydioApi.getClient().request(
            params,
            function (transport){
                try{
                    if(node.isRoot()){
                        this.parseNodes(node, transport, nodeCallback, null, true);
                    }else{
                        this.parseNodes(node, transport, null, nodeCallback, true);
                    }
                }catch(e){
                    Logger.error(e);
                }
            }.bind(this)
        );
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

    parseAjxpNodesDiffs(xmlElement, targetDataModel, targetRepositoryId, setContextChildrenSelected=false){
        let removes = XMLUtils.XPathSelectNodes(xmlElement, "remove/tree");
        let adds = XMLUtils.XPathSelectNodes(xmlElement, "add/tree");
        let updates = XMLUtils.XPathSelectNodes(xmlElement, "update/tree");
        let notifyServerChange = [];
        if(removes && removes.length){
            removes.forEach(function(r){
                const p = r.getAttribute("filename");
                if(r.getAttribute("node_repository_id") && r.getAttribute("node_repository_id") !== targetRepositoryId){
                    return;
                }
                const imTime = parseInt(r.getAttribute("ajxp_im_time"));
                targetDataModel.removeNodeByPath(p, imTime);
                notifyServerChange.push(p);
            });
        }
        if(adds && adds.length && targetDataModel.getAjxpNodeProvider().parseAjxpNode){
            adds.forEach(function(tree){
                if(tree.getAttribute("node_repository_id") && tree.getAttribute("node_repository_id") !== targetRepositoryId){
                    return;
                }
                const newNode = targetDataModel.getAjxpNodeProvider().parseAjxpNode(tree);
                targetDataModel.addNode(newNode, setContextChildrenSelected);
                notifyServerChange.push(newNode.getPath());
            });
        }
        if(updates && updates.length && targetDataModel.getAjxpNodeProvider().parseAjxpNode){
            updates.forEach(function(tree){
                if(tree.getAttribute("node_repository_id") && tree.getAttribute("node_repository_id") !== targetRepositoryId){
                    return;
                }
                const newNode = targetDataModel.getAjxpNodeProvider().parseAjxpNode(tree);
                let original = newNode.getMetadata().get("original_path");
                targetDataModel.updateNode(newNode, setContextChildrenSelected);
                notifyServerChange.push(newNode.getPath());
                if(original) notifyServerChange.push(original);
            });
        }
        if(notifyServerChange.length){
            targetDataModel.notify("server_update", notifyServerChange);
        }
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