import Observable from "pydio/lang/observable"
import PydioApi from 'pydio/http/api'

class ServerConfigModel extends Observable {

    buildProxy(object){
        return new Proxy(object, {
            set:((target, p, value) => {
                target[p] = value;
                this.notify('update');
                return true;
            }),
            get:((target, p) => {
                let out = target[p];
                if (out instanceof Array) {
                    if(p === 'MappingRules'){
                        return out.map(rule => this.buildProxy(rule));
                    }
                    return out;
                } else if (out instanceof Object) {
                    return this.buildProxy(out);
                } else if (p === 'User'){
                    const filter = new EnterpriseSDK.AuthLdapSearchFilter();
                    target[p] = this.buildProxy(filter);
                    return target[p];
                } else {
                    return out;
                }
            })
        });
    }

    constructor(configId, config){
        super();
        //this.config = new AuthLdapServerConfig();
        //this.config.DomainName = 'New Directory';
        this.configId = configId;
        this.config = config;
        this.observableConfig = this.buildProxy(this.config);
    }

    /**
     *
     * @return {AuthLdapServerConfig}
     */
    getConfig(){
        return this.observableConfig;
    }

    isValid(){
        return true;
    }

    snapshot(){
        return EnterpriseSDK.AuthLdapServerConfig.constructFromObject(JSON.parse(JSON.stringify(this.config)));
    }

    revertTo(snapshot){
        this.config = EnterpriseSDK.AuthLdapServerConfig.constructFromObject(JSON.parse(JSON.stringify(snapshot)));
        this.observableConfig = this.buildProxy(this.config);
        return this.observableConfig;
    }

    /**
     * @return {Promise}
     */
    save(){
        const api = new EnterpriseSDK.EnterpriseConfigServiceApi(PydioApi.getRestClient());
        const request = new EnterpriseSDK.RestExternalDirectoryConfig();
        request.ConfigId = this.configId;
        request.Config = this.config;
        return api.putExternalDirectory(this.configId, request)
    }

    /**
     * @return {Promise}
     */
    static loadDirectories() {
        const api = new EnterpriseSDK.EnterpriseConfigServiceApi(PydioApi.getRestClient());
        return api.listExternalDirectories();
    }

    /**
     * @param configId
     * @return {Promise}
     */
    static deleteDirectory(configId){
        const api = new EnterpriseSDK.EnterpriseConfigServiceApi(PydioApi.getRestClient());
        return api.deleteExternalDirectory(configId);
    }

}

export {ServerConfigModel as default}