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
import Configs from './Configs'
import {TreeServiceApi, RestCreateNodesRequest, TreeNode, TreeNodeType} from 'pydio/http/rest-api'


class UploadItem extends StatusItem {

    constructor(file, targetNode, relativePath = null){
        super('file');
        this._file = file;
        this._status = 'new';
        this._progress = 0;
        this._targetNode = targetNode;
        this._repositoryId = Pydio.getInstance().user.activeRepository;
        this._relativePath = relativePath;
    }
    getFile(){
        return this._file;
    }
    getSize(){
        return this._file.size;
    }
    getLabel(){
        return this._relativePath ? this._relativePath : this._file.name;
    }
    getProgress(){
        return this._progress;
    }
    setProgress(newValue, bytes = null){
        this._progress = newValue;
        this.notify('progress', newValue);
        if(bytes !== null) {
            this.notify('bytes', bytes);
        }
    }
    getRelativePath(){
        return this._relativePath;
    }
    _parseXHRResponse(){
        if (this.xhr && this.xhr.responseText && this.xhr.responseText !== 'OK') {
            this.onError('Unexpected response: ' + this.xhr.responseText);
        }
    }
    _doProcess(completeCallback){
        const complete = ()=>{
            this.setStatus('loaded');
            this._parseXHRResponse();
            completeCallback();
        };

        const progress = (computableEvent)=>{
            if (this._status === 'error') {
                return;
            }
            let percentage = Math.round((computableEvent.loaded * 100) / computableEvent.total);
            let bytesLoaded = computableEvent.loaded;
            this.setProgress(percentage, bytesLoaded);
        };

        const error = (e)=>{
            this.onError(Pydio.getInstance().MessageHash[210]+": " +e.message);
            completeCallback();
        };

        const MAX_RETRIES = 10;
        const retry = (count)=>{
            return (e)=>{
                if (count >= MAX_RETRIES) {
                    error(e)
                } else {
                    this.uploadPresigned(complete, progress, retry(++count));
                }
            };
        };

        this.setStatus('loading');

        try{
            Configs.getInstance().extensionAllowed(this);
        }catch(e){
            this.onError(e.message);
            completeCallback();
            return;
        }

        retry(0)()
    }

    _doAbort(completeCallback){
        if(this.xhr){
            try{
                this.xhr.abort();
            }catch(e){}
        }
        this.setStatus('error');
    }

    file_newpath(fullpath) {
        return new Promise(async (resolve) => {
            const lastSlash = fullpath.lastIndexOf('/');
            const pos = fullpath.lastIndexOf('.');
            let path = fullpath;
            let ext = '';

            // NOTE: the position lastSlash + 1 corresponds to hidden files (ex: .DS_STORE)
            if (pos  > -1 && lastSlash < pos && pos > lastSlash + 1) {
                path = fullpath.substring(0, pos);
                ext = fullpath.substring(pos);
            }

            let newPath = fullpath;
            let counter = 1;

            let exists = await this._fileExists(newPath);
            while (exists) {
                newPath = path + '-' + counter + ext;
                counter++;
                exists = await this._fileExists(newPath)
            }

            resolve(newPath);
        });
    }

    _fileExists(fullpath) {
        return new Promise(resolve => {
            const api = new TreeServiceApi(PydioApi.getRestClient());

            api.headNode(fullpath).then(node => {
                if (node.Node) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch(() => resolve(false))
        })
    }

    async uploadPresigned(completeCallback, progressCallback, errorCallback){

        const repoList = Pydio.getInstance().user.getRepositoriesList();
        if(!repoList.has(this._repositoryId)){
            errorCallback(new Error('Unauthorized workspace!'));
            return;
        }
        const slug = repoList.get(this._repositoryId).getSlug();

        let fullPath = this._targetNode.getPath();
        if(this._relativePath) {
            fullPath = LangUtils.trimRight(fullPath, '/') + '/' + LangUtils.trimLeft(PathUtils.getDirname(this._relativePath), '/');
        }
        fullPath = slug + '/' + LangUtils.trim(fullPath, '/');
        fullPath = LangUtils.trimRight(fullPath, '/') + '/' + PathUtils.getBasename(this._file.name);
        if (fullPath.normalize) {
            fullPath = fullPath.normalize('NFC');
        }

        // Checking file already exists or not
        let overwriteStatus = Configs.getInstance().getOption("DEFAULT_EXISTING", "upload_existing");

        if (overwriteStatus === 'rename') {
            fullPath = await this.file_newpath(fullPath)
        } else if (overwriteStatus === 'alert') {
            if (!global.confirm(Pydio.getInstance().MessageHash[124])) {
                errorCallback(new Error(Pydio.getInstance().MessageHash[71]));
                return;
            }
        }

        PydioApi.getClient().uploadPresigned(this._file, fullPath, completeCallback, errorCallback, progressCallback).then(xhr => {
            this.xhr = xhr;
        });
    }
}

export {UploadItem as default}