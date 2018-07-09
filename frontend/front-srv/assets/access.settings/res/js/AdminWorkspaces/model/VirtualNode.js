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

import LangUtils from 'pydio/util/lang'
import Observable from 'pydio/lang/observable'
import PydioApi from 'pydio/http/api'
import {DocStoreServiceApi, RestListDocstoreRequest, DocstorePutDocumentRequest, DocstoreDocument, DocstoreDeleteDocumentsRequest} from 'pydio/http/rest-api'

class VirtualNode extends Observable {

    data;

    static loadNodes(callback){
        const api = new DocStoreServiceApi(PydioApi.getRestClient());
        const request = new RestListDocstoreRequest();
        request.StoreID = "virtualnodes";
        api.listDocs("virtualnodes", request).then(response => {
            let result = [];
            if(response.Docs){
                response.Docs.map(doc => {
                    result.push(new VirtualNode(JSON.parse(doc.Data)));
                })
            }
            callback(result);
        });
    };

    constructor(data){
        super();
        if (data) {
            this.data = data;
        } else {
            this.data = {
                Uuid: "",
                Path: "",
                Type: "COLLECTION",
                MetaStore: {
                    name:"",
                    resolution:"",
                    contentType:"text/javascript"
                }
            }
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

    save(callback) {
        const api = new DocStoreServiceApi(PydioApi.getRestClient());
        const request = new DocstorePutDocumentRequest();
        request.StoreID = "virtualnodes";
        request.DocumentID = this.data.Uuid;
        const doc = new DocstoreDocument();
        doc.ID = this.data.Uuid;
        doc.Data = JSON.stringify(this.data);
        request.Document = doc;

        api.putDoc("virtualnodes", this.data.Uuid, request).then(() => {
            callback();
        });

    }

    remove(callback){

        const api = new DocStoreServiceApi(PydioApi.getRestClient());
        const request = new DocstoreDeleteDocumentsRequest();
        request.StoreID = "virtualnodes";
        request.DocumentID = this.data.Uuid;
        api.deleteDoc("virtualnodes", request).then(() => {
            callback();
        })

    }

}

export {VirtualNode as default}