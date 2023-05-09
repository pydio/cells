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
import Observable from '../lang/Observable'
/**
 * API Client
 */
class MetaCacheService extends Observable{

    static getInstance(){
        if(!MetaCacheService.INSTANCE){
            MetaCacheService.INSTANCE = new MetaCacheService();
        }
        return MetaCacheService.INSTANCE;
    }

    constructor(){
        super();
        this._streams = new Map();
    }

    hasKey(streamName, keyName){
        if(!this._streams.get(streamName)){
            return false;
        }
        return this._streams.get(streamName).get('data').has(keyName);
    }

    getByKey(streamName, keyName){
        if(!this._streams.get(streamName)){
            return null;
        }
        return this._streams.get(streamName).get('data').get(keyName);
    }

    deleteKey(streamName, keyName){
        if(!this._streams.get(streamName)){
            return;
        }
        this._streams.get(streamName).get('data').delete(keyName);
    }

    setKey(streamName, keyName, value){
        if(!this._streams.get(streamName)){
            throw Error('Stream ' + streamName + ' not registered, please register first');
        }
        this._streams.get(streamName).get('data').set(keyName, value);
    }

    clearMetaStreamKeys(streamName){
        if(this._streams.has(streamName)){
            this._streams.get(streamName).set('data', new Map());
        }
    }

    registerMetaStream(streamName, expirationPolicy){
        if(this._streams.get(streamName)){
            return;
        }
        let data = new Map();
        data.set('expirationPolicy', expirationPolicy);
        data.set('data', new Map());
        this._streams.set(streamName, data);
        pydio.observeOnce("repository_list_refreshed", function(){
            // Always keep the cache at workspace scope
            this._streams.delete(streamName);
            this.registerMetaStream(streamName, expirationPolicy); // Re-register directly
        }.bind(this));
    }

    metaForNode(streamName, ajxpNode, loaderCallback, remoteParser, cacheLoader){
        if(!this._streams.has(streamName)){
            throw new Error('Cannot find meta stream ' + streamName + ', please register it before using it');
        }
        let def = this._streams.get(streamName);
        let key = ajxpNode.getPath();
        let expirationPolicy = def.get('expirationPolicy');
        if(def.get('data').has(key)){
            cacheLoader(def.get('data').get(key));
        }else{
            let clearValueObserver = function(){
                def.get('data').delete(key);
            }.bind(this);

            // Cache response if success
            let cacheCallback = function(transport){
                let newData = remoteParser(transport);
                if(newData !== null){
                    let cachedData = newData;
                    if(newData instanceof AjxpNode){
                        cachedData = new AjxpNode();
                        cachedData.replaceBy(newData);
                    }
                    def.get('data').set(key, cachedData);
                    if(expirationPolicy == MetaCacheService.EXPIRATION_LOCAL_NODE){
                        ajxpNode.observeOnce("node_removed", clearValueObserver);
                        ajxpNode.observeOnce("node_replaced", clearValueObserver);
                    }
                }
            };
            loaderCallback(ajxpNode, cacheCallback);
        }
    }

    invalidateMetaForKeys(streamName, keyPattern){
        if(!this._streams.has(streamName)){
            throw new Error('Cannot find meta stream ' + streamName + ', please register it before using it');
        }
        let data = this._streams.get(streamName).get('data');
        data.forEach(function(value, key){
            if(key.match(keyPattern)){
                data.delete(key);
            }
        });
    }
    
}

MetaCacheService.EXPIRATION_LOCAL_NODE = 'LOCAL_NODE';
MetaCacheService.EXPIRATION_MANUAL_TRIGGER = 'MANUAL_TRIGGER';

export {MetaCacheService as default}