/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import StatusItem from './StatusItem'
import PathUtils from 'pydio/util/path'
import PydioApi from 'pydio/http/api'
import {TreeServiceApi, RestCreateNodesRequest, TreeNode, TreeNodeType} from 'cells-sdk'

class FolderItem extends StatusItem{

    constructor(path, targetNode, parent = null){
        super('folder', targetNode, parent);
        this._new = true;
        this._label = PathUtils.getBasename(path);
        this.children.pg[this.getId()] = 0;
        if(parent){
            parent.addChild(this);
        }
    }

    isNew() {
        return this._new;
    }

    setIgnore(){
        this.setStatus(StatusItem.StatusLoaded);
        this.children.pg[this.getId()] = 100;
        this.recomputeProgress();
        this._new = false;
    }

    _doProcess(completeCallback) {
        if(!this._new) {
            completeCallback();
            return;
        }

        let fullPath;
        try{
            fullPath = this.getFullPath()
        } catch (e) {
            this.setStatus(StatusItem.StatusError);
            return;
        }

        const api = new TreeServiceApi(PydioApi.getRestClient());
        const request = new RestCreateNodesRequest();
        const node = new TreeNode();

        node.Path = fullPath;
        node.Type = TreeNodeType.constructFromObject('COLLECTION');
        request.Nodes = [node];

        api.createNodes(request).then(collection => {
            this.setStatus(StatusItem.StatusLoaded);
            this.children.pg[this.getId()] = 100;
            this.recomputeProgress();
            completeCallback();
        });
    }

}

export {FolderItem as default}