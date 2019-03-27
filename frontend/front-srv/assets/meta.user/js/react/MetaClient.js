import PydioApi from 'pydio/http/api'
import Node from 'pydio/model/node'
import {UserMetaServiceApi, IdmUpdateUserMetaRequest, RestPutUserMetaTagRequest, IdmUserMeta, ServiceResourcePolicy} from 'pydio/http/rest-api'

class MetaClient{

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
                        node.getMetadata().set(cName, values.get(cName));
                    });
                    proms.push(api.updateUserMeta(request).then(resp => {
                        node.notify('node_replaced');
                    }));
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
                        visible: true
                    };
                    if (ns.JsonDefinition){
                        const jDef = JSON.parse(ns.JsonDefinition);
                        Object.keys(jDef).map(k => {
                            base[k] = jDef[k];
                        })
                    }
                    if(ns.Policies){
                        ns.Policies.map(p => {
                            if(p.Action === 'READ'){
                                base['readSubject'] = p.Subject;
                            } else if(p.Action === 'WRITE'){
                                base['writeSubject'] = p.Subject;
                            }
                        });
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
                    if(type === 'json') {
                        return;
                    }
                    if(type === 'choice' && value.data){
                        let values = new Map();
                        value.data.split(",").map(function(keyLabel){
                            const parts = keyLabel.split("|");
                            values.set(parts[0], parts[1]);
                        });
                        value.data = values;
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