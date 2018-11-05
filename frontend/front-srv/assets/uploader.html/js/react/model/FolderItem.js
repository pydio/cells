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

import StatusItem from './StatusItem'
import Pydio from 'pydio'
import PathUtils from 'pydio/util/path'
import LangUtils from 'pydio/util/lang'
import PydioApi from 'pydio/http/api'
import {TreeServiceApi, RestCreateNodesRequest, TreeNode, TreeNodeType} from 'pydio/http/rest-api'

class FolderItem extends StatusItem{

    constructor(path, targetNode){
        super('folder');
        this._new = true;
        this._path = path;
        this._targetNode =  targetNode;
    }

    isNew() {
        return this._new;
    }

    getPath(){
        return this._path;
    }

    getLabel(){
        return PathUtils.getBasename(this._path);
    }

    getFullPath(){
        const pydio = Pydio.getInstance();

        const repoList = pydio.user.getRepositoriesList();
        if(!repoList.has(this._repositoryId)){
            throw new Error("Repository disconnected?");
        }
        const slug = repoList.get(this._repositoryId).getSlug();
        let fullPath = this._targetNode.getPath();
        fullPath = LangUtils.trimRight(fullPath, '/') + '/' + LangUtils.trimLeft(this._path, '/');
        if (fullPath.normalize) {
            fullPath = fullPath.normalize('NFC');
        }
        fullPath = slug + fullPath;
        return fullPath;
    }

    _doProcess(completeCallback) {
        let fullPath;
        try{
            fullPath = this.getFullPath()
        } catch (e) {
            this.setStatus('error');
            return;
        }

        const api = new TreeServiceApi(PydioApi.getRestClient());
        const request = new RestCreateNodesRequest();
        const node = new TreeNode();

        node.Path = fullPath;
        node.Type = TreeNodeType.constructFromObject('COLLECTION');
        request.Nodes = [node];

        api.createNodes(request).then(collection => {
            this.setStatus('loaded');
            completeCallback();
        });
    }

    _doAbort(completeCallback){
        if(console) {
            console.log(pydio.MessageHash['html_uploader.6']);
        }
    }
}

export {FolderItem as default}