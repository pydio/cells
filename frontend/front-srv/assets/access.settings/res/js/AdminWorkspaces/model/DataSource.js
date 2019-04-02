const Observable = require('pydio/lang/observable');
const PydioApi = require('pydio/http/api');
import LangUtils from 'pydio/util/lang'
import {ConfigServiceApi, ObjectDataSource, ObjectEncryptionMode, ObjectStorageType,
    JobsServiceApi, RestUserJobRequest,EncryptionAdminListKeysRequest} from 'pydio/http/rest-api';

class DataSource extends Observable {

    buildProxy(object){
        return new Proxy(object, {
            set:((target, p, value) => {
                let val = value;
                if(p === 'StorageType') {
                    target['StorageConfiguration'] = {};
                    if(val === 'LOCAL'){
                        target['StorageConfiguration'] = {"folder":"", "normalize":"false"}
                    } else if(val === 'S3'){
                        target['StorageConfiguration'] = {"customEndpoint":""}
                    } else if(val === 'GCS') {
                        target['StorageConfiguration'] = {"jsonCredentials": ""}
                    }
                    this.internalInvalid = false;
                    target['ApiKey'] = target['ApiSecret'] = ''; // reset values
                } else if(p === 'Name') {
                    val = LangUtils.computeStringSlug(val).replace("-", "").substr(0, 33);
                } else if(p === 'folder') {
                    if (val[0] !== '/') {
                        val = '/' + val;
                    }
                } else if(p === 'invalid') {
                    this.internalInvalid = value;
                    this.notify('update');
                    return true;
                }
                target[p] = val;
                this.notify('update');
                return true;
            }),
            get:((target, p) => {
                let out = target[p];
                if (out instanceof Array) {
                    return out;
                } else if (out instanceof Object) {
                    return this.buildProxy(out);
                } else if (p === 'StorageType') {
                    return out || 'LOCAL';
                } else {
                    return out;
                }
            })
        });
    }

    constructor(model){
        super();
        this.internalInvalid = false;
        if (model) {
            this.model = model;
            if(!model.StorageConfiguration){
                model.StorageConfiguration = {};
            }
            this.snapshot = JSON.parse(JSON.stringify(model));
        } else {
            this.model = new ObjectDataSource();
            this.model.EncryptionMode = ObjectEncryptionMode.constructFromObject('CLEAR');
            this.model.StorageType = ObjectStorageType.constructFromObject('LOCAL');
            this.model.StorageConfiguration = {"folder":"", "normalize":"false"};
        }
        this.observableModel = this.buildProxy(this.model);

    }

    /**
     * @return {ObjectDataSource}
     */
    getModel(){
        return this.observableModel;
    }

    isValid(){
        if(this.internalInvalid){
            return false;
        }
        if(this.model.StorageType === 'S3' || this.model.StorageType === 'AZURE') {
            return this.model.ApiKey && this.model.ApiSecret && this.model.Name && this.model.ObjectsBucket;
        } else if(this.model.StorageType === 'GCS') {
            return this.model.Name && this.model.ObjectsBucket && this.model.StorageConfiguration && this.model.StorageConfiguration['jsonCredentials'];
        } else {
            return this.model.Name && this.model.StorageConfiguration && this.model.StorageConfiguration['folder'];
        }
    }

    static loadDatasources(){
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        return api.listDataSources();
    }

    static loadVersioningPolicies(){
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        return api.listVersioningPolicies()
    }

    static loadStatuses(){
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        return api.listServices('STARTED');
    }

    static loadEncryptionKeys(){
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        return api.listEncryptionKeys(new EncryptionAdminListKeysRequest());
    }

    deleteSource(){
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        return api.deleteDataSource(this.model.Name);
    }

    resyncSource(){
        const api = new JobsServiceApi(PydioApi.getRestClient());
        let req = new RestUserJobRequest();
        req.JobName = "datasource-resync";
        req.JsonParameters = JSON.stringify({dsName:this.model.Name});
        return api.userCreateJob("datasource-resync", req);
    }

    revert(){
        this.model = this.snapshot;
        this.observableModel = this.buildProxy(this.model);
        this.snapshot = JSON.parse(JSON.stringify(this.model));
        return this.observableModel;
    }

    saveSource(){
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        return api.putDataSource(this.model.Name, this.model).then((res) => {
            this.snapshot = JSON.parse(JSON.stringify(this.model));
            this.notify('update');
        });
    }

    stripPrefix(data, prefix = ''){
        if(!prefix) {
            return data;
        }
        let obj = {};
        Object.keys(data).map((k) => {
            obj[k.replace(prefix, '')] = data[k];
        });
        return obj;

    }

    getDataWithPrefix(prefix = ''){
        if (prefix === '') {
            return this.model;
        }
        let data = {};
        Object.keys(this.model).forEach((k) => {
            data[prefix + k] = this.model[k];
            if(k === 'EncryptionMode' && !this.model[k]){
                data[prefix + k] = 'CLEAR';
            }
        });
        return data;
    }

}

export {DataSource as default};