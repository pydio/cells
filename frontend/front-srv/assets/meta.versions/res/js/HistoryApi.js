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
const PydioApi = require('pydio/http/api');
const MetaNodeProvider = require('pydio/model/meta-node-provider');
const PydioDataModel = require('pydio/model/data-model');
const Node = require('pydio/model/node');

export default class HistoryApi{

    constructor(node){
        this.node = node;
    }

    getDataModel(){
        if(!this.versionsDm){
            const provider = new MetaNodeProvider({versions:'true',file:this.node.getPath()});
            this.versionsDm = new PydioDataModel(true);
            this.versionsDm.setAjxpNodeProvider(provider);
            this.versionsRoot = new Node("/", false, "Versions", "folder.png", provider);
            this.versionsDm.setRootNode(this.versionsRoot);
        }
        return this.versionsDm;
    }

    openVersion(versionNode){

        PydioApi.getClient().openVersion(this.node, versionNode.getMetadata().get('versionId'));

    }

    revertToVersion(versionNode, callback = null){

        if(!confirm(pydio.MessageHash["meta.versions.13"])){
            return;
        }
        PydioApi.getClient().revertToVersion(this.node, versionNode.getMetadata().get('versionId'), callback);

    }

}
