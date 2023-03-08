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

import docReady from "doc-ready";
import Connexion from "./http/Connexion";

/**
 * Main BootLoader.
 */
export default class PydioBootstrap{

    /**
     * Constructor
     * @param startParameters Object The options
     */
    constructor(startParameters){
        this.parameters = new Map();
        for(var i in startParameters){
            if(startParameters.hasOwnProperty(i)) {
                this.parameters.set(i, startParameters[i]);
            }
        }
        this.detectBaseParameters();

        if(this.parameters.get("ALERT")){
            window.setTimeout(() => {window.alert(this.parameters.get("ALERT"));},0);
        }

        docReady(function(){

            var startedFromOpener = false;
            try{
                if(window.opener && window.opener.pydioBootstrap && this.parameters.get('serverAccessPath') === window.opener.pydioBootstrap.parameters.get('serverAccessPath')){
                    this.parameters = window.opener.pydioBootstrap.parameters;
                    // Handle queryString case, as it's not passed via get_boot_conf
                    var qParams = document.location.href.toQueryParams();
                    if(qParams['external_selector_type']){
                        this.parameters.set('SELECTOR_DATA', {type:qParams['external_selector_type'], data:qParams});
                    }else{
                        if(this.parameters.get('SELECTOR_DATA')) {
                            this.parameters.unset('SELECTOR_DATA');
                        }
                    }
                    this.refreshContextVariablesAndInit(new Connexion());
                    startedFromOpener = true;
                }
            }catch(e){
                if(window.console && console.log) console.log(e);
            }
            if(!startedFromOpener){
                this.loadBootConfig();
            }

        }.bind(this));

        window.Connexion = Connexion;
        window.pydioBootstrap = this;
    }

    /**
     * Real loading action
     */
    loadBootConfig(){
        if(this.parameters.get('PRELOADED_BOOT_CONF')){
            const preloaded = this.parameters.get('PRELOADED_BOOT_CONF');
            for(let k in preloaded){
                if(preloaded.hasOwnProperty(k)){
                    this.parameters.set(k, preloaded[k]);
                }
            }
            this.refreshContextVariablesAndInit(new Connexion());
            return;
        }

        var url = this.parameters.get('BOOTER_URL')+(this.parameters.get("debugMode")?'&debug=true':'');
        if(this.parameters.get('SERVER_PREFIX_URI')){
            url += '&server_prefix_uri=' + this.parameters.get('SERVER_PREFIX_URI').replace(/\.\.\//g, "_UP_/");
        }
        var connexion = new Connexion(url);
        connexion.onComplete = (transport) => {
            let data;
            if(transport.responseJSON) {
                data = transport.responseJSON;
            }
            if(typeof data === "object"){
                Object.keys(data).forEach(key => {
                    this.parameters.set(key, data[key])
                })

            }
            this.refreshContextVariablesAndInit(connexion);
        };
        connexion.send();

    }

    refreshContextVariablesAndInit(connexion){

        //Connexion.updateServerAccess(this.parameters);

        let cssRes = this.parameters.get("cssResources");
        if(cssRes) {
            cssRes.map(this.loadCSSResource.bind(this));
        }

        if(this.parameters.get('ajxpResourcesFolder')){
            connexion._libUrl = this.parameters.get('ajxpResourcesFolder') + "/dist";
            window.ajxpResourcesFolder = this.parameters.get('ajxpResourcesFolder') + "/themes/" + this.parameters.get("theme");
        }

        if(this.parameters.get('additional_js_resource')){
            connexion.loadLibrary(this.parameters.get('additional_js_resource?v='+this.parameters.get("ajxpVersion")), null, true);
        }

        //this.insertLoaderProgress();
        window.MessageHash = this.parameters.get("i18nMessages");
        if(!Object.keys(MessageHash).length){
            alert('Ooups, this should not happen, your message file is empty!');
        }
        Object.keys(MessageHash).forEach(key => {
            MessageHash[key] = MessageHash[key].replace("\\n", "\n");
        });
        window.zipEnabled = this.parameters.get("zipEnabled");
        window.multipleFilesDownloadEnabled = this.parameters.get("multipleFilesDownloadEnabled");

        const masterClassLoaded = function(){

            let pydio = new Pydio(this.parameters);
            window.pydio = pydio;

            pydio.observe("actions_loaded", function(){
                if(!this.parameters.get("SELECTOR_DATA") && pydio.getController().actions.get("ext_select")){
                    if(pydio.getController().actions._object){
                        pydio.getController().actions.unset("ext_select");
                    }else{
                        pydio.getController().actions['delete']("ext_select");
                    }
                    pydio.getController().fireContextChange();
                    pydio.getController().fireSelectionChange();
                }else if(this.parameters.get("SELECTOR_DATA")){
                    pydio.getController().defaultActions.set("file", "ext_select");
                }
            }.bind(this));

            pydio.observe("loaded", function(e){
                if(this.parameters.get("SELECTOR_DATA")){
                    pydio.getController().defaultActions.set("file", "ext_select");
                    pydio.getController().selectorData = this.parameters.get("SELECTOR_DATA");
                }
            }.bind(this));

            if(this.parameters.get("currentLanguage")){
                pydio.currentLanguage = this.parameters.get("currentLanguage");
            }

            pydio.init();

        }.bind(this);

        if (this.parameters.get("debugMode")) {
            masterClassLoaded();
        } else {
            connexion.loadLibrary("core/pydio.min.js?v=" + this.parameters.get("ajxpVersion"), masterClassLoaded, true);
        }

    }

    /**
     * Detect the base path of the javascripts based on the script tags
     */
    detectBaseParameters(){

        const scripts = document.getElementsByTagName('script');
        for(let i=0; i<scripts.length; i++){
            const scriptTag = scripts[i];
            if(scriptTag.src.match("/dist/boot/pydio.boot.min.js") || scriptTag.src.match("/dist/boot.prod.js")){
                if(scriptTag.src.match("/dist/boot/pydio.boot.min.js")){
                    this.parameters.set("debugMode", false);
                }else{
                    this.parameters.set("debugMode", true);
                }
                let src = scriptTag.src.replace('/dist/boot/boot.prod.js','').replace('/dist/boot/pydio.boot.min.js', '');
                if(src.indexOf("?")!==-1) {
                    src = src.split("?")[0];
                }
                this.parameters.set("ajxpResourcesFolder", src);
            }
        }
        if(this.parameters.get("ajxpResourcesFolder")){
            window.ajxpResourcesFolder = this.parameters.get("ajxpResourcesFolder");
        }else{
            alert("Cannot find resource folder");
        }
        let booterUrl = this.parameters.get("BOOTER_URL");
        if(booterUrl.indexOf("?") > -1){
            booterUrl = booterUrl.substring(0, booterUrl.indexOf("?"));
        }
        this.parameters.set('ajxpServerAccessPath', booterUrl);
        this.parameters.set('serverAccessPath', booterUrl);
        window.ajxpServerAccessPath = booterUrl;
    }

    /**
     * Loads a CSS file
     * @param fileName String
     */
    loadCSSResource(fileName){
        const head = document.getElementsByTagName('head')[0];
        let cssNode = document.createElement('link');
        cssNode.type = 'text/css';
        cssNode.rel  = 'stylesheet';
        cssNode.href = this.parameters.get("ajxpResourcesFolder") + '/' + fileName;
        cssNode.media = 'screen';
        head.appendChild(cssNode);
    }

}