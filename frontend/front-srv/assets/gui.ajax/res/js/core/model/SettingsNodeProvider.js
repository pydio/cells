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
        if(properties) {
            this.initProvider(properties);
        }
    }
    /**
     * Initialize properties
     * @param properties Object
     */
    initProvider(properties){
        this.properties = new Map();
        Object.keys(properties).forEach(p => {
            this.properties.set(p, properties[p]);
        });
        if(this.properties && this.properties.has('connexion_discrete')){
            this.discrete = true;
            this.properties.delete('connexion_discrete');
        }
    }

    parseIdmUser(user){
        let uPath, uNode;
        if (user.IsGroup) {
            uPath = USERS_ROOT + LangUtils.trimRight(user.GroupPath, '/') + '/' + user.GroupLabel
            const label = (user.Attributes && user.Attributes['displayName']) ? user.Attributes['displayName'] : user.GroupLabel;
            uNode = new AjxpNode(uPath, false, label);
            uNode.getMetadata().set('ajxp_mime', 'group');

        } else {
            uPath = (USERS_ROOT + user.GroupPath + '/' + user.Login).replace('//', '/')
            const label = (user.Attributes && user.Attributes['displayName']) ? user.Attributes['displayName'] : user.Login;
            uNode = new AjxpNode(uPath, true, label);
            uNode.getMetadata().set('ajxp_mime', 'user_editable');
        }
        uNode.getMetadata().set('IdmUser', user);
        return uNode;
    }

    /**
     *
     * @param event websocket event
     * @param dm DataModel
     */
    idmEventToDataModel(event, dm) {
        const user = event.User;
        const uNode = this.parseIdmUser(user)
        const uPath = uNode.getPath();
        uNode.getMetadata().set('ajxp_im_time', (new Date())*1);
        uNode.getMetadata().set('original_path', uPath);

        //console.log('Should update datamodel with event', event, uNode)

        switch (event.Type) {
            case 'DELETE':
                dm.removeNodeByPath(uPath)
                break
            case 'UPDATE':
                if (event.Attributes && event.Attributes['original_group']) {
                    uNode.getMetadata().set('original_path', USERS_ROOT+event.Attributes['original_group'])
                }
                dm.updateNode(uNode, false)
                break
            default: // no value means CREATE
                dm.addNode(uNode, false)
                break
        }
    }

    findUsersRoot(node) {
        let parent = node;
        while(parent.getPath() !== USERS_ROOT) {
            parent = parent.getParent()
            if(!parent) {
                return null
            }
        }
        return parent;
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
            const isRootPath = basePath === '' || basePath === '/'
            let offset = 0, limit = 50;
            const pData = node.getMetadata().get('paginationData');
            let newPage = 1;
            if(pData && pData.has('new_page')){
                // recompute offset limit;
                newPage = pData.get('new_page');
                offset = (newPage - 1) * limit;
            }
            // Check if there is profile filter
            let profile;
            const usersRoot = this.findUsersRoot(node)
            if(usersRoot && usersRoot.getMetadata().has('userProfileFilter')){
                profile = usersRoot.getMetadata().get('userProfileFilter');
            }
            const idmAPI = PydioApi.getRestClient().getIdmApi()

            const usersCollectionParser = (collection, rootRole) => {
                Pydio.endLoading();
                let childrenNodes = [];
                let count = 0;
                if(rootRole && rootRole.PoliciesContextEditable) {
                    const rootGroup = new AjxpNode('ROLE:'+rootRole.Uuid, true, rootRole.Label)
                    rootGroup.getMetadata().set('ajxp_mime', 'role')
                    rootGroup.getMetadata().set('IdmRole', rootRole)
                    childrenNodes.push(rootGroup);
                }
                if(collection.Groups){
                    collection.Groups.map(group => {
                        childrenNodes.push(this.parseIdmUser(group))
                    })
                }
                if(collection.Users){
                    count = collection.Users.length;
                    collection.Users.map(user => {
                        childrenNodes.push(this.parseIdmUser(user))
                    })
                }
                if(collection.Total > count) {
                    const paginationData = new Map();
                    paginationData.set('total', Math.ceil(collection.Total / limit));
                    paginationData.set('current', newPage || 1);
                    node.getMetadata().set('paginationData', paginationData);
                }
                node.setChildren(childrenNodes);
                if(nodeCallback !== null){
                    node.replaceBy(node);
                    nodeCallback(node);
                }
            }


            Pydio.startLoading();
            if(isRootPath) {
                idmAPI.loadRole('ROOT_GROUP').then(idmRole => {
                    return idmAPI.listUsersGroups(basePath, recursive, offset, limit, profile).then(collection => usersCollectionParser(collection, idmRole))
                }).catch(e => {
                    return idmAPI.listUsersGroups(basePath, recursive, offset, limit, profile).then(collection => usersCollectionParser(collection, null))
                }).catch(e => {
                    Pydio.endLoading()
                })
            } else {
                idmAPI.listUsersGroups(basePath, recursive, offset, limit, profile).then(collection => usersCollectionParser(collection, null)).catch(e => Pydio.endLoading())
            }
            return;
        }

        SettingsNodeProvider.loadMenu().then(data => {
                // Check if a specific section path was required by navigation
                const parts = LangUtils.trim(node.getPath(), '/').split('/').filter(k => k !== "");
                let sectionPath;
                let pagePath;
                if(parts.length >= 1) {
                    sectionPath = '/' + parts[0];
                }
                if(parts.length >= 2) {
                    pagePath = node.getPath();
                }

                let childrenNodes = [];
                if(data.__metadata__ && (!sectionPath && !pagePath)) {
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
                        if(sectionPath && childNode.getPath() === sectionPath) {
                            if (pagePath) {
                                // We are looking for a specific child
                                const children = childNode.getChildren();
                                if(children.has(pagePath)) {
                                    node.replaceBy(children.get(pagePath));
                                    if (nodeCallback) {
                                        nodeCallback(node);
                                    }
                                    return
                                }
                            }
                            // We are looking for this section, return this as the parent node
                            node.setChildren(childNode.getChildren());
                            node.replaceBy(childNode);
                            if (nodeCallback) {
                                nodeCallback(node);
                            }
                            return
                        }
                        if(!sectionPath) {
                            if(childCallback){
                                childCallback(childNode);
                            }
                            childrenNodes.push(childNode);
                        }
                    })
                }
                node.setChildren(childrenNodes);
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
        const pydio = Pydio.getInstance();
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
        if(section.Description){
            sectionNode.getMetadata().set("description", section.Description);
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

    /**
     * @return {Promise}
     */
    static loadMenu(){
        return new Promise((resolve, reject) => {
            const client = PydioApi.getRestClient();
            client.callApi('/frontend/settings-menu', 'GET', '',
                [], [], [], null, null, ['application/json'], ['application/json'],
                null).then(r => {
                    resolve(r.response.body)
            }).catch(e => {
                reject(e);
            });

        })
    }

}