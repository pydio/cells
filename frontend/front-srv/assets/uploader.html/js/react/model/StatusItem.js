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

class StatusItem extends Observable {
    constructor(type){
        super();
        this._status = 'new';
        this._type = type;
        this._id = Math.random();
        this._errorMessage = null;
    }
    getId(){
        return this._id;
    }
    getLabel(){

    }
    getType(){
        return this._type;
    }
    getStatus(){
        return this._status;
    }
    setStatus(status){
        this._status = status;
        this.notify('status');
    }
    updateRepositoryId(repositoryId){
        this._repositoryId = repositoryId;
    }
    getErrorMessage(){
        return this._errorMessage || '';
    }
    onError(errorMessage){
        this._errorMessage = errorMessage;
        this.setStatus('error');
    }
    process(completeCallback){
        this._doProcess(completeCallback);
    }
    abort(completeCallback){
        if(this._status !== 'loading') {
            return;
        }
        this._doAbort(completeCallback);
    }
}

export {StatusItem as default}