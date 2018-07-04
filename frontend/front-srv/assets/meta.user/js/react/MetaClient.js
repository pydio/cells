import PydioApi from 'pydio/http/api'
import {UserMetaServiceApi} from 'pydio/http/rest-api'

class MetaClient{

    constructor(){
        this.client = PydioApi.getRestClient();
    }

    loadConfigs(){

        let defs = {};
        const api = new UserMetaServiceApi(this.client);
        api.listUserMetaNamespace().then(result => {
            console.log(result);
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
            console.log(defs);
        });
        console.log(defs);
        return defs;

    }

}

export {MetaClient as default}