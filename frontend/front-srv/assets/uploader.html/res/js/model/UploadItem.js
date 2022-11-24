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


class UploadItem extends StatusItem {

    constructor(file, targetNode, relativePath = null, parent = null, userMeta = undefined){
        super('file', targetNode, parent);
        this._file = file;
        this._status = 'new';
        this._userMeta = userMeta;
        if(relativePath){
            this._label = PathUtils.getBasename(relativePath);
        } else {
            this._label = file.name;
        }
        if(file.size > PydioApi.getMultipartThreshold()){
            this.createParts();
        }
        if(parent){
            parent.addChild(this);
        }
    }
    createParts(){
        const partSize = PydioApi.getMultipartPartSize();
        this._parts = [];
        for(let i = 0 ; i < Math.ceil(this._file.size / partSize); i ++ ) {
            this._parts.push(new PartItem(this, i + 1));
        }
    }

    setRetry(retry){
        this._retry = retry
    }

    getRetry() {
        return this._retry || 0
    }

    // Override onError to set all parts on error
    onError(errorMessage){
        super.onError(errorMessage)
        if(this._parts){
            this._parts.filter(p => p.getStatus() === StatusItem.StatusLoading).forEach(p => p.onError(errorMessage))
        }
    }

    getFile(){
        return this._file;
    }
    getSize(){
        return this._file.size;
    }
    getHumanSize(){
        return PathUtils.roundFileSize(this._file.size);
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
            this.setStatus(StatusItem.StatusLoaded);
            this._parseXHRResponse();
            completeCallback();
        };

        const progress = (computableEvent)=>{
            if (this._status === StatusItem.StatusError) {
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
                const part = this._parts[computableEvent.part-1];
                const progress = Math.round((computableEvent.partLoaded * 100) / computableEvent.partTotal);
                if(computableEvent.error) {
                    part.onError(computableEvent.error.message)
                    part.setProgress(0, 0);
                } else if(progress < 100) {
                    if(part.getStatus() !== StatusItem.StatusCannotPause){
                        part.setStatus(StatusItem.StatusLoading);
                        part.setRetry(computableEvent.partRetry)
                    }
                } else {
                    const checkPause = part.getStatus() === StatusItem.StatusCannotPause;
                    part.setStatus(StatusItem.StatusLoaded);
                    if(checkPause){
                        if(this._parts.filter(p => part.getStatus() === StatusItem.StatusCannotPause).length === 0){
                            this.setStatus(StatusItem.StatusPause);
                        }
                    }
                }
                part.setProgress(progress, computableEvent.partLoaded);
            }
        };

        const messages = Pydio.getMessages();
        const error = (e)=>{
            this.onError(messages[210]+": " +e.message);
            completeCallback();
        };

        const MAX_RETRIES = 2;
        const BACK_OFF = 150;
        const retry = (count)=>{
            this.setRetry(count-1)
            return (e)=>{
                if (e && e.indexOf) {
                    if(e.indexOf('422') >= 0){
                        error(new Error(messages['html_uploader.status.error.422'] + ' (422)'));
                        return;
                    } else if(e.indexOf('403') >= 0) {
                        error(new Error(messages['html_uploader.status.error.403'] + ' (403)'));
                        return
                    }
                }
                if(this._userAborted){
                    if(e) {
                        error(e);
                    } else {
                        error(new Error(messages['html_uploader.status.error.aborted']));
                    }
                    return;
                }
                if (count >= MAX_RETRIES) {
                    error(e)
                } else {
                    window.setTimeout(()=>{
                        this.uploadPresigned(complete, progress, retry(++count));
                    }, BACK_OFF * count);
                }
            };
        };

        this.setStatus(StatusItem.StatusLoading);
        addEventListener('unload', () => {
            if(this._status === StatusItem.StatusLoading){
                console.error("Page unloaded during upload, try to abort upload!")
                this._doAbort();
            }
        })

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
        if(this._status === StatusItem.StatusLoaded) {
            return
        }
        if(this.xhr){
            try{
                //console.log('Should abort', this.getFullPath());
                this._userAborted = true;
                this.xhr.abort();
            }catch(e){}
        }
        this.setStatus(StatusItem.StatusError);
        this.setProgress(0)
    }

    _doPause(){
        if(this.xhr){
            if(this.xhr.pause){
                this.xhr.pause();
                if(this._parts && this._parts.length){
                    this._parts.filter(p => p.getStatus() === StatusItem.StatusLoading).forEach(p => p.setStatus(StatusItem.StatusCannotPause));
                }
                return StatusItem.StatusMultiPause;
            } else {
                return StatusItem.StatusCannotPause;
            }
        }
        return StatusItem.StatusNew;
    }

    _doResume(){
        if(this.xhr && this.xhr.resume){
            this.xhr.resume();
        }
    }

    uploadPresigned(completeCallback, progressCallback, errorCallback){

        let fullPath;
        try{
            fullPath = this.getFullPath();
        }catch (e) {
            this.setStatus(StatusItem.StatusError);
            this.setProgress(0)
            return;
        }
        // For encrypted datasource, do not use multipart!
        if (this.getSize() < PydioApi.getMultipartThreshold()) {
            PydioApi.getClient().uploadPresigned(this._file, fullPath, completeCallback, errorCallback, progressCallback, this._userMeta).then(xhr => {
                this.xhr = xhr;
            });
        } else {
            PydioApi.getClient().uploadMultipart(this._file, fullPath, completeCallback, errorCallback, progressCallback, this._userMeta).then(managed => {
                this.xhr = managed;
            });
        }
    }
}

export {UploadItem as default}