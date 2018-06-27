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

export default class Observable {

    _objectEventSetup(event_name){
        this._observers = this._observers || {};
        this._observers[event_name] = this._observers[event_name] || [];
    }

    observe(event_name,observer){
        if(typeof(event_name) == 'string' && typeof(observer) != 'undefined'){
            this._objectEventSetup(event_name);
            if(this._observers[event_name].indexOf(observer) == -1)
                this._observers[event_name].push(observer);
        }else{
            for(var e in event_name) {
                if(event_name.hasOwnProperty(e)){
                    this.observe(e,event_name[e]);
                }
            }
        }
    }

    stopObserving(event_name,observer){
        this._objectEventSetup(event_name);
        if(event_name && observer)
            this._observers[event_name] = this._observers[event_name].filter(function(o){
                return o!=observer;
            });
        else if(event_name){
            this._observers[event_name] = [];
        }else{
            this._observers = {};
        }
    }

    observeOnce(event_name,outer_observer){
        var inner_observer = function(){
            outer_observer.apply(this,arguments);
            this.stopObserving(event_name,inner_observer);
        }.bind(this);
        this._objectEventSetup(event_name);
        this._observers[event_name].push(inner_observer);
    }

    notify(event_name){
        this._objectEventSetup(event_name);
        var collected_return_values = [];
        var args = Array.from(arguments).slice(1);
        var observersCopy = this._observers[event_name].slice(0);
        for(var i = 0; i < observersCopy.length; ++i){
            collected_return_values.push(observersCopy[i].apply(observersCopy[i],args) || null);
        }
        return collected_return_values;
    }

    hasObservers() {
        return this._observers.length;
    }

}
