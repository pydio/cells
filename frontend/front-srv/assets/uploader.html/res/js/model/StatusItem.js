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

import Observable from 'pydio/lang/observable'
import Pydio from 'pydio'

class StatusItem extends Observable {

    /**
     *
     * @param type string
     * @param targetNode {Node}
     * @param parent {StatusItem}
     */
    constructor(type, targetNode, parent = null){
        super();
        this._status = StatusItem.StatusNew;
        this._type = type;
        this._id = Math.random();
        this._errorMessage = null;
        const pydio = Pydio.getInstance();
        this._repositoryId = parent ? parent.getRepositoryId() : pydio.user.activeRepository;
        this._exists = false;
        this._progress = 0;
        this.children = {folders: [], files: [], pg: {}};
        this._targetNode = targetNode;
        if(parent){
            this._parent = parent;
            if(type === StatusItem.TypeFolder) {
                parent.children.folders.push(this);
            } else {
                parent.children.files.push(this);
            }
        }
    }
    getId(){
        return this._id;
    }
    getParent(){
        return this._parent;
    }
    getLabel(){
        if(this._label.normalize){
            return this._label.normalize('NFC')
        } else {
            return this._label;
        }
    }
    updateLabel(label){
        this._label = label;
    }
    getFullPath(){
        return this._parent.getFullPath() + '/' + this.getLabel();
    }
    getProgress(){
        return this._progress;
    }
    setExists(){
        this._exists = true;
    }
    getExists(){
        return this._exists;
    }
    getType(){
        return this._type;
    }
    getStatus(){
        return this._status;
    }
    setStatus(status){
        this._status = status;
        this.notify('status', status);
    }
    updateRepositoryId(repositoryId){
        this._repositoryId = repositoryId;
    }
    getRepositoryId(){
        return this._repositoryId;
    }
    getErrorMessage(){
        return this._errorMessage || '';
    }
    onError(errorMessage){
        this._errorMessage = errorMessage;
        this.setStatus(StatusItem.StatusError);
    }
    process(completeCallback){
        this._doProcess(completeCallback);
    }
    abort(completeCallback){
        if(this._doAbort){
            this._doAbort(completeCallback);
        }
    }
    pause(){
        if(this._doPause){
            const status = this._doPause();
            this.setStatus(status);
        }
    }
    resume(){
        if(this._doResume){
            this._doResume();
            this.setStatus(StatusItem.StatusLoading)
        }
    }

    addChild(child){
        this.children.pg[child.getId()] = 0;
        child.observe('progress', (progress)=>{
            this.children.pg[child.getId()] = progress;
            this.recomputeProgress();
        });
    }

    recomputeProgress(){
        const accu = Object.keys(this.children.pg).map(k=>this.children.pg[k]);
        if(accu.length){
            const sum = accu.reduce(function(a, b) { return a + b; });
            this._progress = sum / accu.length;
            this.notify('progress', this._progress);
        }
    }

    removeChild(child){

        child.abort();
        child.walk((c)=>{c.abort()}, ()=>true, StatusItem.TypeFile);

        const id = child.getId();
        const folderIndex = this.children.folders.indexOf(child);
        const fileIndex = this.children.files.indexOf(child);

        let removed = false;
        if(folderIndex > -1){
            this.children.folders = LangUtils.arrayWithout(this.children.folders, folderIndex);
            removed = true;
        } else if(fileIndex > -1){
            this.children.files = LangUtils.arrayWithout(this.children.files, fileIndex);
            removed = true;
        }
        if(removed){
            child.stopObserving('progress');
            // Abort all processes
            delete this.children.pg[id];
            this.recomputeProgress();
            this.notify('children');
        }
    }

    getChildren(){
        return [...this.children.folders, ...this.children.files];
    }

    /**
     *
     * @param callback Function callback to be applied
     * @param filter Function filter item before calling callback
     * @param type String both|file|folder
     * @param stop Function stopper callback before going to next level
     */
    walk(callback, filter=()=>true, type = StatusItem.TypeBoth, stop=(item)=>false){
        let stopped = false;
        if(type === StatusItem.TypeBoth || type === StatusItem.TypeFile){
            const files = this.children.files;
            for(let i = 0; i < files.length; i++){
                if(stop(files[i])){
                    stopped = true;
                    break;
                }
                if(filter(files[i])) {
                    callback(files[i]);
                }
            }
        }
        if(stopped){
            return;
        }
        this.children.folders.forEach(child => {
            if((type === StatusItem.TypeFolder || type === StatusItem.TypeBoth) && filter(child)) {
                callback(child);
            }
            if (!stop(child)) {
                child.walk(callback, filter, type, stop);
            }
        });
    }

    /**
     *
     * @param limit integer
     * @param filter Function
     * @param type String both|file|folder
     * @return {Array}
     */
    collectWithLimit(limit, filter=()=>true, type = 'both'){
        const accu = [];
        const callback = (item) => {
            accu.push(item);
        };
        const stop = (item)=>{
            return accu.length >= limit;
        };
        this.walk(callback, filter, type, stop);
        return accu;
    }

}

StatusItem.StatusNew = 'new';
StatusItem.StatusAnalyze = 'analyse';
StatusItem.StatusFolders = 'folders';
StatusItem.StatusLoading = 'loading';
StatusItem.StatusLoaded = 'loaded';
StatusItem.StatusError = 'error';
StatusItem.StatusPause = 'pause';
StatusItem.StatusCannotPause = 'cannot-pause';
StatusItem.StatusMultiPause = 'multi-pause';

StatusItem.TypeFolder = 'folder';
StatusItem.TypeFile = 'file';
StatusItem.TypeBoth = 'both';

export {StatusItem as default}