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
import PartItem from './PartItem'
import Pydio from 'pydio'
import PathUtils from 'pydio/util/path'
import PydioApi from 'pydio/http/api'
import Configs from './Configs'
import {TreeServiceApi, RestCreateNodesRequest, TreeNode, TreeNodeType} from 'pydio/http/rest-api'


class UploadItem extends StatusItem {

    constructor(file, targetNode, relativePath = null, parent = null){
        super('file', targetNode, parent);
        this._file = file;
        this._status = 'new';
        if(relativePath){
            this._label = PathUtils.getBasename(relativePath);
        } else {
            this._label = file.name;
        }
        if(!targetNode.getMetadata().has("datasource_encrypted")){
            this.createParts();
        }
        if(parent){
            parent.addChild(this);
        }
    }
    createParts(){
        const partSize = PydioApi.getMultipartPartSize();
        if(this._file.size > partSize) {
            this._parts = [];
            for(let i = 0 ; i < Math.ceil(this._file.size / partSize); i ++ ) {
                this._parts.push(new PartItem(this, i + 1));
            }
        }
    }
    getFile(){
        return this._file;
    }
    getSize(){
        return this._file.size;
    }
    setProgress(newValue, bytes = null){
        this._progress = newValue;
        this.notify('progress', newValue);
        if(bytes !== null) {
            this.notify('bytes', bytes);
        }
    }
    _parseXHRResponse(){
        if (this.xhr && this.xhr.responseText && this.xhr.responseText !== 'OK') {
            this.onError('Unexpected response: ' + this.xhr.responseText);
        }
    }
    _doProcess(completeCallback){
        this._userAborted = false;

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
            // Update multipart child if any
            if(this._parts && computableEvent.part && this._parts[computableEvent.part-1] && computableEvent.partLoaded && computableEvent.partTotal){
                this._parts[computableEvent.part-1].setProgress(Math.round((computableEvent.partLoaded * 100) / computableEvent.partTotal), computableEvent.partLoaded);
            }
        };

        const error = (e)=>{
            this.onError(Pydio.getInstance().MessageHash[210]+": " +e.message);
            completeCallback();
        };

        const MAX_RETRIES = 10;
        const retry = (count)=>{
            return (e)=>{
                if(this._userAborted){
                    if(e) error(e);
                    else error(new Error('Interrupted by user'));
                    return;
                }
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
                console.log('Should abort', this.getFullPath());
                this._userAborted = true;
                this.xhr.abort();
            }catch(e){}
        }
        this.setStatus('error');
    }

    uploadPresigned(completeCallback, progressCallback, errorCallback){

        let fullPath;
        try{
            fullPath = this.getFullPath();
        }catch (e) {
            this.setStatus('error');
            return;
        }
        // For encrypted datasource, do not use multipart!
        if (this._targetNode.getMetadata().has("datasource_encrypted")) {
            PydioApi.getClient().uploadPresigned(this._file, fullPath, completeCallback, errorCallback, progressCallback).then(xhr => {
                this.xhr = xhr;
            });
        } else {
            PydioApi.getClient().uploadMultipart(this._file, fullPath, completeCallback, errorCallback, progressCallback).then(managed => {
                this.xhr = managed;
            });
        }
    }
}

export {UploadItem as default}