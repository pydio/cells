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
import PathUtils from 'pydio/util/path'
import Observable from 'pydio/lang/observable'

class Configs extends Observable{

    static getInstance(){
        if(!Configs.__INSTANCE) {
            Configs.__INSTANCE = new Configs();
        }
        return Configs.__INSTANCE;
    }

    constructor(){
        super();
        Pydio.getInstance().observe("registry_loaded", function(){
            this._global = null;
        }.bind(this));
    }

    _loadOptions(){
        if(!this._global){
            this._global = Pydio.getInstance().getPluginConfigs("uploader");
        }
    }

    getOptionAsBool(name, userPref = '', defaultValue = undefined){
        let o = this.getOption(name, userPref, defaultValue);
        return (o === true  || o === 'true');
    }

    getOption(name, userPref = '', defaultValue = undefined){
        this._loadOptions();
        if(userPref){
            let test = Configs.getUserPreference('originalUploadForm_XHRUploader', userPref);
            if(test !== undefined && test !== null) {
                return test;
            }
        }
        if(this._global.has(name)){
            return this._global.get(name);
        }
        if(defaultValue !== undefined){
            return defaultValue;
        }
        return null;
    }

    getAutoStart(){
        return this.getOptionAsBool("DEFAULT_AUTO_START", "upload_auto_send");
    }

    getAutoClose(){
        return this.getOptionAsBool("DEFAULT_AUTO_CLOSE", "upload_auto_close");
    }

    updateOption(name, value, isBool = false){
        if(isBool){
            value = value? "true" : "false";
        }
        Configs.setUserPreference('originalUploadForm_XHRUploader', name, value);
        this.notify("change");
    }

    extensionAllowed(uploadItem){
        let extString = this.getOption("ALLOWED_EXTENSIONS", '', '');
        if(!extString) {
            return;
        }
        let extDescription = this.getOption("ALLOWED_EXTENSIONS_READABLE", '', '');
        if(extDescription) {
            extDescription = ' (' + extDescription + ')';
        }
        let itemExt = PathUtils.getFileExtension(uploadItem.getLabel());
        if(extString.split(',').indexOf(itemExt) === -1){
            throw new Error(Pydio.getInstance().MessageHash[367] + extString + extDescription);
        }
    }

    static getUserPreference(guiElementId, prefName){
        let pydio = Pydio.getInstance();
        if(!pydio.user) {
            return null;
        }
        var gui_pref = pydio.user.getPreference("gui_preferences", true);
        if(!gui_pref || !gui_pref[guiElementId]) {
            return null;
        }
        if(pydio.user.activeRepository && gui_pref[guiElementId]['repo-'+pydio.user.activeRepository]){
            return gui_pref[guiElementId]['repo-'+pydio.user.activeRepository][prefName];
        }
        return gui_pref[guiElementId][prefName];
    }

    static setUserPreference(guiElementId, prefName, prefValue){
        let pydio = Pydio.getInstance();
        if(!pydio || !pydio.user) {
            return;
        }
        var guiPref = pydio.user.getPreference("gui_preferences", true);
        if(!guiPref) {
            guiPref = {};
        }
        if(!guiPref[guiElementId]) {
            guiPref[guiElementId] = {};
        }
        if(pydio.user.activeRepository ){
            var repokey = 'repo-'+pydio.user.activeRepository;
            if(!guiPref[guiElementId][repokey]) {
                guiPref[guiElementId][repokey] = {};
            }
            if(guiPref[guiElementId][repokey][prefName] && guiPref[guiElementId][repokey][prefName] === prefValue){
                return;
            }
            guiPref[guiElementId][repokey][prefName] = prefValue;
        }else{
            if(guiPref[guiElementId][prefName] && guiPref[guiElementId][prefName] === prefValue){
                return;
            }
            guiPref[guiElementId][prefName] = prefValue;
        }
        pydio.user.setPreference("gui_preferences", guiPref, true);
        pydio.user.savePreference("gui_preferences");
    }
}

export {Configs as default}