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

const LangUtils = require('pydio/util/lang');
const Observable = require('pydio/lang/observable');
const PydioApi = require('pydio/http/api');

class VirtualNode extends Observable {

    data;

    static loadNodes(callback){
        PydioApi.getClient().request({
            get_action:'virtualnodes_list'
        }, (t) => {
            const data = t.responseJSON;
            let result = [];
            Object.keys(data).forEach((k) => {
                const vNode = new VirtualNode(data[k]);
                result.push(vNode);
            });
            console.log(result);
            callback(result);
        })
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
        PydioApi.getClient().request({
            get_action:'virtualnodes_put',
            docId: this.data.Uuid,
            node: JSON.stringify(this.data)
        }, () => {callback();})
    }

    remove(callback){
        PydioApi.getClient().request({
            get_action:'virtualnodes_delete',
            docId: this.data.Uuid,
        }, () => {callback();})
    }

}

export {VirtualNode as default}