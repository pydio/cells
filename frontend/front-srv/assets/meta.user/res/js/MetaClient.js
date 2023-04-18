/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import PydioApi from 'pydio/http/api'

import {UserMetaServiceApi, IdmUpdateUserMetaRequest, RestPutUserMetaTagRequest, IdmUserMeta, ServiceResourcePolicy} from 'cells-sdk'

class MetaClient{

    static getInstance() {
        if (!MetaClient.Instance){
            MetaClient.Instance = new MetaClient();
        }
        return MetaClient.Instance;
    }

    constructor(){
        this.client = PydioApi.getRestClient();
    }

    /**
     * Save metas to server
     * @param nodes [{Node}]
     * @param values {Object}
     */
    saveMeta(nodes, values){
        const api = new UserMetaServiceApi(this.client);
        return new Promise((resolve, reject) => {
            this.loadConfigs().then((configs) => {
                let proms = [];
                nodes.map(node => {
                    let request = new IdmUpdateUserMetaRequest();
                    request.MetaDatas = [];
                    request.Operation = 'PUT';
                    configs.forEach((cData, cName) => {
                        if(!values.has(cName)){
                            return;
                        }
                        const meta = new IdmUserMeta();
                        meta.NodeUuid = node.getMetadata().get("uuid");
                        meta.Namespace = cName;
                        meta.JsonValue = JSON.stringify(values.get(cName));
                        meta.Policies = [
                            ServiceResourcePolicy.constructFromObject({
                                Action: 'READ',
                                Subject: '*',
                                Effect: 'allow'
                            }),
                            ServiceResourcePolicy.constructFromObject({
                                Action: 'WRITE',
                                Subject: '*',
                                Effect: 'allow'
                            }),
                        ];
                        request.MetaDatas.push(meta);
                    });
                    proms.push(api.updateUserMeta(request));
                });
                Promise.all(proms).then(() => {
                    resolve();
                }).catch(e => {
                    reject(e);
                });
            });
        });
    }

    clearConfigs() {
        this.configs = null;
    }

    /**
     * @return {Promise<Map>}
     */
    loadConfigs(){

        if(this.configs) {
            return Promise.resolve(this.configs);
        }

        if(this.promise){
            return this.promise;
        }

        this.promise = new Promise(resolve => {
            let defs = {};
            let configMap = new Map();
            const api = new UserMetaServiceApi(this.client);
            api.listUserMetaNamespace().then(result => {
                result.Namespaces.map(ns => {
                    const name = ns.Namespace;
                    let base = {
                        label: ns.Label,
                        indexable: ns.Indexable,
                        order: ns.Order,
                        visible: true,
                        readonly: !ns.PoliciesContextEditable,
                    };
                    if (ns.JsonDefinition){
                        const jDef = JSON.parse(ns.JsonDefinition);
                        Object.keys(jDef).map(k => {
                            if(k === 'hide') {
                                base['visible'] = !jDef[k];
                            } else {
                                base[k] = jDef[k];
                            }
                        })
                    }
                    defs[name] = base;
                });
                let arrConfigs = Object.entries(defs).map(entry => {
                    entry[1].ns = entry[0];
                    return entry[1];
                });
                arrConfigs.sort((a,b) => {
                    const orderA = a.order || 0;
                    const orderB = b.order || 0;
                    return orderA > orderB ? 1 : orderA === orderB ? 0 : -1;
                });
                arrConfigs.map((value) => {
                    const type = value.type;
                    if(type === 'choice' && value.data && value.data.split){
                        // Convert old format to new format
                        const items = value.data.split(',').map(i => {
                            const [key, value] = i.split('|')
                            return {key, value};
                        });
                        value.data = {items};
                    }
                    configMap.set(value.ns, value);
                });
                this.configs = configMap;
                resolve(configMap);
                this.promise = null;
            }).catch(() => {
                resolve(new Map());
                this.promise = null;
            });
        });

        return this.promise;

    }

    /**
     * @param namespace String
     * @return {Promise<Array>}
     */
    listTags(namespace){

        return new Promise((resolve) => {

            const api = new UserMetaServiceApi(this.client);
            api.listUserMetaTags(namespace).then(response => {
                if(response.Tags){
                    resolve(response.Tags);
                } else {
                    resolve([]);
                }
            }).catch(e => {
                resolve([])
            })

        });

    }

    /**
     *
     * @param namespace string
     * @param newTag string
     * @return {Promise}
     */
    createTag(namespace, newTag){

        const api = new UserMetaServiceApi(this.client);
        return api.putUserMetaTag(namespace, RestPutUserMetaTagRequest.constructFromObject({
            Namespace: namespace,
            Tag: newTag
        }))

    }

}

export {MetaClient as default}