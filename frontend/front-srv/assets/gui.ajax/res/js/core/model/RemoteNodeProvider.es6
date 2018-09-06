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
    loadNode (node, nodeCallback=null, childCallback=null, recursive=false, depth=-1, optionalParameters=null){}

    /**
     * Load a node
     * @param node AjxpNode
     * @param nodeCallback Function On node loaded
     * @param aSync bool
     * @param additionalParameters object
     */
    loadLeafNodeSync (node, nodeCallback, aSync=false, additionalParameters={}){}

    refreshNodeAndReplace (node, onComplete){}

    /**
     * Parse the answer and create AjxpNodes
     * @param origNode AjxpNode
     * @param transport Ajax.Response
     * @param nodeCallback Function
     * @param childCallback Function
     * @param childrenOnly
     */
    parseNodes (origNode, transport, nodeCallback, childCallback, childrenOnly){

    }

    parseAjxpNodesDiffs(xmlElement, targetDataModel, targetRepositoryId, setContextChildrenSelected=false){}

    /**
     * Parses XML Node and create AjxpNode
     * @param xmlNode XMLNode
     */
    parseAjxpNode (xmlNode){}
}