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
import Pydio from 'pydio'
import LangUtils from 'pydio/util/lang'
import Observable from 'pydio/lang/observable'
import PydioApi from 'pydio/http/api'
import ResourcesManager from 'pydio/http/resources-manager'
import {ConfigServiceApi, TreeNode, TreeNodeType} from 'cells-sdk'

class VirtualNode extends Observable {

    data;

    static loadNodes(callback){
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        Pydio.startLoading();
        api.listVirtualNodes().then(response => {
            Pydio.endLoading();
            let result = [];
            if(response.Children){
                response.Children.map(treeNode => {
                    result.push(new VirtualNode(treeNode));
                })
            }
            callback(result);
        }).catch(()=>{
            Pydio.endLoading();
        });
    };

    constructor(data){
        super();
        if (data) {
            this.data = data;
        } else {
            this.data = new TreeNode();
            this.data.Type = TreeNodeType.constructFromObject('COLLECTION');
            this.data.MetaStore = {
                name:"",
                resolution:"",
                onDelete:"",
                contentType:"text/javascript"
            };
        }
    }

    getName(){
        return this.data.MetaStore.name;
    }

    setName(name){
        this.data.MetaStore.name = name;
        const slug = LangUtils.computeStringSlug(name);
        this.data.Uuid = slug;
        this.data.Path = slug;
        this.notify('update');
    }

    getValue(){
        return this.data.MetaStore.resolution;
    }

    setValue(value){
        this.data.MetaStore.resolution = value;
        this.notify('update');
    }

    getOnDelete() {
        return this.data.MetaStore.onDelete
    }

    setOnDelete(value){
        this.data.MetaStore.onDelete = value;
        this.notify('update');
    }

    save(callback) {
        ResourcesManager.loadClass('EnterpriseSDK').then(sdk => {
            const api = new sdk.EnterpriseConfigServiceApi(PydioApi.getRestClient());
            api.putVirtualNode(this.data.Uuid, this.data).then(() => {
                callback();
            });
        });
    }

    remove(callback){

        ResourcesManager.loadClass('EnterpriseSDK').then(sdk => {
            const api = new sdk.EnterpriseConfigServiceApi(PydioApi.getRestClient());
            api.deleteVirtualNode(this.data.Uuid).then(() => {
                callback();
            });
        });

    }

}

export {VirtualNode as default}