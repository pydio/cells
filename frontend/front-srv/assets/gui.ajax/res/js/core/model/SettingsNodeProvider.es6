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

import PydioApi from '../http/PydioApi'
import LangUtils from '../util/LangUtils'
import AjxpNode from './AjxpNode'

const USERS_ROOT = '/idm/users';

/**
 * Implementation of the IAjxpNodeProvider interface based on a remote server access.
 * Default for all repositories.
 */
export default class SettingsNodeProvider{

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

        if(node.getPath().indexOf(USERS_ROOT) === 0) {
            const basePath = node.getPath().substring(USERS_ROOT.length);
            PydioApi.getRestClient().getIdmApi().listUsersGroups(basePath, recursive).then(collection => {
                let childrenNodes = [];
                if(collection.Groups){
                    collection.Groups.map(group => {
                        const label = (group.Attributes && group.Attributes['displayName']) ? group.Attributes['displayName'] : group.GroupLabel;
                        const gNode = new AjxpNode(USERS_ROOT + LangUtils.trimRight(group.GroupPath, '/') + '/' + group.GroupLabel, false, label);
                        gNode.getMetadata().set('IdmUser', group);
                        gNode.getMetadata().set('ajxp_mime', 'group');
                        childrenNodes.push(gNode)
                    })
                }
                if(collection.Users){
                    collection.Users.map(user => {
                        const label = (user.Attributes && user.Attributes['displayName']) ? user.Attributes['displayName'] : user.Login;
                        const uNode = new AjxpNode(USERS_ROOT + user.Login, true, label);
                        uNode.getMetadata().set('IdmUser', user);
                        uNode.getMetadata().set('ajxp_mime', 'user_editable');
                        childrenNodes.push(uNode)
                    })
                }
                childrenNodes.map(child => {
                    node.addChild(child);
                });
                if(nodeCallback !== null){
                    nodeCallback(node);
                }
            });
            return;
        }

        const client = PydioApi.getRestClient();
        client.callApi('/frontend/settings-menu', 'GET', '',
            [], [], [], null, null, ['application/json'], ['application/json'],
            null).then(r => {
                const data = r.response.body;
                let childrenNodes = [];
                if(data.__metadata__) {
                    for (let k in data.__metadata__) {
                        if (data.__metadata__.hasOwnProperty(k)) {
                            node.getMetadata().set(k, data.__metadata__[k]);
                        }
                    }
                    node.replaceBy(node);
                }
                if(data.Sections) {
                    data.Sections.map(section => {
                        const childNode = SettingsNodeProvider.parseSection('/', section, childCallback);
                        if(childCallback){
                            childCallback(childNode);
                        }
                        childrenNodes.push(childNode);
                    })
                }
                childrenNodes.map(child => {
                    node.addChild(child);
                });
                if(nodeCallback !== null){
                    nodeCallback(node);
                }
        });

    }

    /**
     * Load a node
     * @param node AjxpNode
     * @param nodeCallback Function On node loaded
     * @param aSync bool
     * @param additionalParameters object
     */
    loadLeafNodeSync (node, nodeCallback, aSync=false, additionalParameters={}){

        if(nodeCallback) {
            nodeCallback(node);
        }

    }

    refreshNodeAndReplace (node, onComplete){

        if (onComplete) {
            onComplete(node);
        }
    }

    static parseSection(parentPath, section, childCallback = null){
        let label = section.LABEL;
        if(pydio && pydio.MessageHash && pydio.MessageHash[label]){
            label = pydio.MessageHash[label];
        }
        let sectionNode = new AjxpNode(parentPath + section.Key, false, label, '', new SettingsNodeProvider());
        if (section.METADATA) {
            for (let k in section.METADATA) {
                if (section.METADATA.hasOwnProperty(k)) {
                    sectionNode.getMetadata().set(k, section.METADATA[k]);
                }
            }
        }
        if (section.CHILDREN) {
            section.CHILDREN.map(c => {
                sectionNode.addChild(SettingsNodeProvider.parseSection(parentPath + section.Key + '/', c, childCallback));
            });
        }
        if(sectionNode.getPath().indexOf(USERS_ROOT) === 0){
            sectionNode.setLoaded(false);
            sectionNode.getMetadata().set('ajxp_mime', 'group');
        }else{
            sectionNode.setLoaded(true);
        }
        return sectionNode
    }

}