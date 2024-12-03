/*
 * Copyright 2007-2019 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

const Observable = require('pydio/lang/observable');
const PydioApi = require('pydio/http/api');
import LangUtils from 'pydio/util/lang'
import {ConfigServiceApi, HealthServiceApi, ObjectDataSource, ObjectEncryptionMode, ObjectStorageType,
    JobsServiceApi, RestUserJobRequest,EncryptionAdminListKeysRequest, RestListStorageBucketsRequest, RestCreateStorageBucketRequest} from 'cells-sdk';

class DataSource extends Observable {

    buildProxy(object){
        return new Proxy(object, {
            set:((target, p, value) => {
                let val = value;
                if(p === 'StorageType') {
                    const internal = target.StorageConfiguration && target.StorageConfiguration.cellsInternal=== 'true'
                    target.StorageConfiguration = internal?{cellsInternal: 'true'}:{};
                    if(val === 'LOCAL'){
                        target.StorageConfiguration = {"folder":"", "normalize":"false", ...target.StorageConfiguration}
                    } else if(val === 'S3'){
                        target.StorageConfiguration = {"customEndpoint":"", ...target.StorageConfiguration}
                    } else if(val === 'GCS') {
                        target.StorageConfiguration = {"jsonCredentials": "", ...target.StorageConfiguration}
                    }
                    this.internalInvalid = false;
                    target['ApiKey'] = target['ApiSecret'] = ''; // reset values
                } else if(p === 'Name') {
                    // Limit Name to 33 chars
                    val = LangUtils.computeStringSlug(val).replace("-", "").substr(0, 33);
                    if(this.existingNames && this.existingNames.indexOf(val) > -1) {
                        this.nameInvalid = true;
                    } else {
                        this.nameInvalid = false;
                    }
                } else if(p === 'folder') {
                    if (val[0] !== '/') {
                        val = '/' + val;
                    }
                } else if(p === 'invalid') {
                    this.internalInvalid = value;
                    this.notify('update');
                    return true;
                } else if (p === 'PeerAddress') {
                    if(value === 'ANY'){
                        val = '';
                    }
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
                } else if (p === 'PeerAddress') {
                    return out || 'ANY';
                } else {
                    return out;
                }
            })
        });
    }

    constructor(model, existingNames = [], createStructure = 'flat'){
        super();
        this.internalInvalid = false;
        this.nameInvalid = false;
        this.existingNames = existingNames;
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
            switch (createStructure) {
                case "flat":
                    this.model.StorageConfiguration = {"folder":"", "normalize":"false"};
                    this.model.FlatStorage = true;
                    break;
                case "structured":
                    this.model.StorageConfiguration = {"folder":"", "normalize":"false"};
                    this.model.FlatStorage = false;
                    break;
                case "internal":
                    this.model.StorageConfiguration = {"folder":"", "normalize":"false", "cellsInternal":"true"};
                    this.model.FlatStorage = true;
                    break;
            }
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
        if(this.internalInvalid || this.nameInvalid){
            return false;
        }
        if(this.model.StorageType === 'S3' || this.model.StorageType === 'AZURE') {
            return this.model.ApiKey && this.model.ApiSecret && this.model.Name && (this.model.ObjectsBucket || this.model.StorageConfiguration.bucketsRegexp);
        } else if(this.model.StorageType === 'GCS') {
            return this.model.Name && this.model.ObjectsBucket && this.model.StorageConfiguration && this.model.StorageConfiguration['jsonCredentials'];
        } else {
            return this.model.Name && this.model.StorageConfiguration && this.model.StorageConfiguration['folder'];
        }
    }

    /**
     *
     * @param translateFunc {Function} Translate function
     * @return {*}
     */
    getNameError(translateFunc){
        if(this.nameInvalid){
            return translateFunc('name.inuse')
        } else {
            return null;
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

    static datasourceReady(dsName) {
        const api = new HealthServiceApi(PydioApi.getRestClient({silent: true}));
        return api.serviceReady(dsName)
    }

    static loadEncryptionKeys(){
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        return api.listEncryptionKeys(new EncryptionAdminListKeysRequest());
    }

    static loadBuckets(model, regexp = '') {
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        const request = new RestListStorageBucketsRequest();
        request.DataSource = model;
        if(regexp) {
            request.BucketsRegexp = regexp;
        }
        return api.listStorageBuckets(request);
    }

    static createBucket(model, bucketName) {
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        const request = new RestCreateStorageBucketRequest();
        request.DataSource = model;
        return api.createStorageBucket(bucketName, request)
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