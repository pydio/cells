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
    setRelativePath(newPath){
        this._relativePath = newPath;
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
            if(!computableEvent.total){
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

    /**
     * @return {String}
     */
    getFullPath(){
        const repoList = Pydio.getInstance().user.getRepositoriesList();
        if(!repoList.has(this._repositoryId)){
            throw new Error('repository.unknown');
        }
        const slug = repoList.get(this._repositoryId).getSlug();

        let fullPath = this._targetNode.getPath();
        let baseName = PathUtils.getBasename(this._file.name);
        if(this._relativePath) {
            fullPath = LangUtils.trimRight(fullPath, '/') + '/' + LangUtils.trimLeft(PathUtils.getDirname(this._relativePath), '/');
            baseName = PathUtils.getBasename(this._relativePath);
        }
        fullPath = slug + '/' + LangUtils.trim(fullPath, '/');
        fullPath = LangUtils.trimRight(fullPath, '/') + '/' + baseName;
        if (fullPath.normalize) {
            fullPath = fullPath.normalize('NFC');
        }
        return fullPath;
    }

    uploadPresigned(completeCallback, progressCallback, errorCallback){

        let fullPath;
        try{
            fullPath = this.getFullPath();
        }catch (e) {
            this.setStatus('error');
            return;
        }
        /*
        PydioApi.getClient().uploadPresigned(this._file, fullPath, completeCallback, errorCallback, progressCallback).then(xhr => {
            this.xhr = xhr;
        });
        */
        PydioApi.getClient().uploadMultipart(this._file, fullPath, completeCallback, errorCallback, progressCallback).then(managed => {
            this.xhr = managed;
        });

    }
}

export {UploadItem as default}