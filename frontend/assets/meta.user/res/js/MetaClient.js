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
                    configs.forEach((_, cName) => {
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
                Promise.all(proms).then((res) => {
                    resolve(res);
                }).catch(e => {
                    reject(e);
                });
            });
        });
    }

    async getNamespaceSchema() {
        const api = new UserMetaServiceApi(this.client);
        return api.getNamespaceSchema();
    }

    clearConfigs() {
        this.configs = null;
    }

    namespacesAsPanelConfig(nss) {
        let defs = {};
        let configMap = new Map();


        nss.map(ns => {
            const name = ns.Namespace;

            const { JsonSchema = {} } = ns;
            let base = {
                label: ns.Label,
                indexable: ns.Indexable,
                order: ns.Order,
                visible: true,
                readonly: !ns.PoliciesContextEditable,
                description: ns.Description,
                jsonSchema: JsonSchema,
                required: JsonSchema.required && JsonSchema.required.length > 0
            };
            if (ns.JsonDefinition){
                const jDef = JSON.parse(ns.JsonDefinition);
                const {hide, type, ...rest} = jDef;
                base = {...base, type, ...rest, visible:!hide};
                if(type === 'choice' && base.data && base.data.split){
                    // Convert old format to new format
                    const items = base.data.split(',').map(i => {
                        const [key, value] = i.split('|')
                        return {key, value};
                    });
                    base.data = {items};
                }
            }
            defs[name] = base;
        });

        // Resort map by order flag
        const arrConfigs = Object.entries(defs).map(([ns, cfg]) => {return {ns, ...cfg}});
        arrConfigs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        for (const cfg of arrConfigs) {
            configMap.set(cfg.ns, cfg);
        }
        return configMap;
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
            this.listNamespaces().then(namespaces => {
                this.configs = this.namespacesAsPanelConfig(namespaces);
                resolve(this.configs);
                this.promise = null;
            }).catch(() => {
                resolve(new Map());
                this.promise = null;
            });
        });

        return this.promise;

    }

    listNamespaces() {
        const api = new UserMetaServiceApi(this.client);
        return api.listUserMetaNamespace().then(result => {
            return result.Namespaces || []
        })
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
