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

import XMLUtils from '../util/XMLUtils'
import Pydio from '../Pydio'
import SystemJS from "systemjs";
if (SystemJS._nodeRequire) {
    //console.warn("Monkey-patchings SystemJS._nodeRequire to undefined...");
    SystemJS._nodeRequire = undefined;
}

function SystemJSImportDefault(ns){
    return SystemJS.import(ns).then((result) => {
        if(result && result[ns]) {
            result = result[ns]
        }
        if(result.__esModule && result.default){
            result = result.default
        }
        return result
    })
}


/**
 * A manager that can handle the loading of JS, CSS and checks dependencies
 */
class ResourcesManager{

	/**
	 * Constructor
	 */
	constructor(){
		this.mainFormContainerId = 'all_forms';
		this.resources = {};
		this.loaded = false;
	}	
	/**
	 * Adds a Javascript resource
	 * @param fileName String
	 * @param className String
	 */
	addJSResource(fileName, className){
		if(!this.resources.js){
			this.resources.js = [];
		}
		this.resources.js.push({
            fileName:fileName,
            className:className,
            autoload:false
        });
	}
	/**
	 * Adds a CSS resource
	 * @param fileName String
	 */
	addCSSResource(fileName){
		if(!this.resources.css){
			this.resources.css = [];
		}
		this.resources.css.push(fileName);
	}
	/**
	 * Adds a FORM from html snipper
	 * @param formId String
	 * @param htmlSnippet String
	 */
	addGuiForm(formId, htmlSnippet){
		if(!this.resources.forms){
			this.resources.forms = new Map();
		}
		this.resources.forms.set(formId,htmlSnippet);
	}
	/**
	 * Add a dependency to another plugin
	 * @param data Object
	 */
	addDependency(data){
		if(!this.resources.dependencies){
			this.resources.dependencies = [];
		}
		this.resources.dependencies.push(data);
	}
	/**
	 * Check if some dependencies must be loaded before
	 * @returns Boolean
	 */
	hasDependencies(){
		return (this.resources.dependencies || false);
	}
	/**
	 * Load resources
	 * @param resourcesRegistry Pydio resources registry
	 */
	load(resourcesRegistry, jsAutoloadOnly=false, callback = FuncUtils.Empty){
		if(this.loaded) {
            callback();
            return;
        }
		if(this.hasDependencies() && !this.dependenciesLoaded){
			this.resources.dependencies.forEach(function(el){
				if(resourcesRegistry[el]){
                    // Load dependencies and try again
					resourcesRegistry[el].load(resourcesRegistry, false, function(){
                        this.dependenciesLoaded = true;
                        this.load(resourcesRegistry, false, callback);
                    }.bind(this));
				}
			}.bind(this) );
		}
		if(this.resources.forms){
			this.resources.forms.forEach(function(value,key){
                // REMOVED
				//this.loadGuiForm(key, value);
			}.bind(this) );
		}
        if(this.resources.js){
            let it = this.resources.js.values();
            let cb = function(){
                let object = it.next();
                if(object.value){
                    if(jsAutoloadOnly && !object.value.autoload) {
                        cb();
                        return;
                    }
                    this.loadJSResource(object.value.fileName, object.value.className, cb, true);
                }else{
                    this.loaded = true;
                    callback();
                }
            }.bind(this);
            cb();
        }else{
            this.loaded = true;
            callback();
        }
		if(this.resources.css){
			this.resources.css.forEach(function(value){
				this.loadCSSResource(value);
			}.bind(this));
		}
	}
	/**
	 * Load a javascript file
	 * @param fileName String
	 * @param className String
     * @param callback Function
     * @param aSync Boolean
	 */
	loadJSResource(fileName, className, callback, aSync = true){

	    if(!ResourcesManager.__configsParsed) {
	        ResourcesManager.loadAutoLoadResources();
        }
	    SystemJSImportDefault(className).then(callback);
	}

	/**
	 * Load a CSS file
	 * @param fileName String
	 */
	loadCSSResource(fileName){

        if(Pydio.getInstance().Parameters.get('SERVER_PREFIX_URI')){
            fileName = Pydio.getInstance().Parameters.get('SERVER_PREFIX_URI')+fileName;
        }
        fileName = fileName+"?v="+Pydio.getVersion();

        let found = false;
        const links = document.getElementsByTagName('link');
        for(let i=0; i<links.length; i++){
            let link = links[i];
            if(link.rel === 'stylesheet' &&  link.href.endsWith(fileName)){
                found = true; break;
            }
        }
        if(!found){
            let head = document.getElementsByTagName('head')[0];
            let cssNode = document.createElement('link');
            cssNode.type = 'text/css';
            cssNode.rel  = 'stylesheet';
            cssNode.href = fileName;
            cssNode.media = 'screen';
            head.appendChild(cssNode);
        }

	}
	/**
	 * Load the resources from XML
	 * @param node XMLNode
	 */
	loadFromXmlNode(node){
        let clForm = {}, k;
		if(node.nodeName === "resources"){
			for(k=0;k<node.childNodes.length;k++){
				if(node.childNodes[k].nodeName === 'js'){
					this.addJSResource(
                        ResourcesManager.getFileOrFallback(node.childNodes[k]),
                        node.childNodes[k].getAttribute('className')
                    );
				}else if(node.childNodes[k].nodeName === 'css'){
					this.addCSSResource(ResourcesManager.getFileOrFallback(node.childNodes[k]));
				}else if(node.childNodes[k].nodeName === 'img_library'){
					ResourcesManager.addImageLibrary(node.childNodes[k].getAttribute('alias'), node.childNodes[k].getAttribute('path'));
				}
			}		
		}else if(node.nodeName === "dependencies"){
			for(k=0;k<node.childNodes.length;k++){
				if(node.childNodes[k].nodeName === "pluginResources"){
					this.addDependency(node.childNodes[k].getAttribute("pluginName"));
				}
			}
		}else if(node.nodeName === "clientForm" && node.firstChild){
            if(!node.getAttribute("theme") || node.getAttribute("theme") === Pydio.getInstance().Parameters.get("theme")){
                clForm = {formId:node.getAttribute("id"), formCode:node.firstChild.nodeValue};
            }
		}
        if(clForm.formId){
            this.addGuiForm(clForm.formId, clForm.formCode);
        }
	}

    /**
     *
     * @param aliasName
     * @param aliasPath
     * @todo MOVE OUTSIDE?
     */
    static addImageLibrary(aliasName, aliasPath){
        if(!window.AjxpImageLibraries) window.AjxpImageLibraries = {};
        window.AjxpImageLibraries[aliasName] = aliasPath;
    }

    /**
     * Find the default images path
     * @param src Icon source
     * @param defaultPath Default path, can contain ICON_SIZE
     * @param size Integer size optional
     * @returns string
     */
    static resolveImageSource(src, defaultPath, size){
        if(!src) return "";
        let imagesFolder = ajxpResourcesFolder + '/images';
        if(pydioBootstrap.parameters.get('ajxpImagesCommon')){
            imagesFolder = imagesFolder.replace('/'+pydioBootstrap.parameters.get('theme')+'/', '/common/');
        }

        if(defaultPath && defaultPath[0] !== '/') {
            defaultPath = '/' + defaultPath;
        }

        if(!window.AjxpImageLibraries || src.indexOf("/")==-1){
            return imagesFolder + (defaultPath?(size?defaultPath.replace("ICON_SIZE", size):defaultPath):'')+ '/' +  src;
        }
        var radic = src.substring(0,src.indexOf("/"));
        if(window.AjxpImageLibraries[radic]){
            src = src.replace(radic, window.AjxpImageLibraries[radic]);
            if(pydioBootstrap.parameters.get("SERVER_PREFIX_URI")){
                src = pydioBootstrap.parameters.get("SERVER_PREFIX_URI") + src;
            }
            return (size?src.replace("ICON_SIZE", size):src);
        }else{
            return imagesFolder + (defaultPath?(size?defaultPath.replace("ICON_SIZE", size):defaultPath):'')+ '/' +  src;
        }
    }

    /**
	 * Check if resources are tagged autoload and load them
	 * @param registry DOMDocument XML Registry
	 */
	static loadAutoLoadResources(registry = null){
	    if(!registry){
	        registry = Pydio.getInstance().Registry.getXML();
        }
        const version = Pydio.getVersion();
        const manager = new ResourcesManager();
		const jsNodes = XMLUtils.XPathSelectNodes(registry, 'plugins/*/client_settings/resources/js');
        let node;

        let sysjsMap = {};
        let sysjsMeta = {
            '*': { authorization: true }
        };

        for(node of jsNodes){
            const namespace = node.getAttribute('className');
            const filepath  = ResourcesManager.getFileOrFallback(node);
            let deps = [];
            if(node.getAttribute('depends')){
                deps = node.getAttribute('depends').split(',');
            }
            if(node.getAttribute('expose')){
                ResourcesManager.__requires[node.getAttribute('expose')] = namespace;
            }
            sysjsMap[namespace] = filepath + "?v=" + version;
            sysjsMeta[namespace] = {format: 'global', deps: deps};
        }
        SystemJS.config({map: sysjsMap, meta:sysjsMeta});
        ResourcesManager.__configsParsed = true;

		const imgNodes = XMLUtils.XPathSelectNodes(registry, 'plugins/*/client_settings/resources/img_library');
        for(node of imgNodes){
            ResourcesManager.addImageLibrary(node.getAttribute('alias'), node.getAttribute('path'));
        }
		const cssNodes = XMLUtils.XPathSelectNodes(registry, 'plugins/*/client_settings/resources/css[@autoload="true"]');
        for(node of cssNodes){
			manager.loadCSSResource(ResourcesManager.getFileOrFallback(node));
        }
	}

    static getFileOrFallback(node){
        if(node.getAttribute('fallbackCondition') && eval(node.getAttribute('fallbackCondition'))){
            return node.getAttribute('fallbackFile');
        }else{
            return node.getAttribute('file');
        }
    }

    static requireLib(module, promise=false){

        if(window[module]) {
            return window[module];
        }
        if(ResourcesManager.__requires && ResourcesManager.__requires[module]){
            const globalNS = ResourcesManager.__requires[module];
            if(promise){
                return SystemJSImportDefault(globalNS);
            }
            if(window[globalNS]){
                return window[globalNS];
            }else{
                throw new Error('Requiring a remote lib that was not previously loaded ('+globalNS+'). You may be missing a dependency declaration in manifest, or you can use requireLib(moduleName, true) to receive a Promise.');
            }
        }else{
            throw new Error('Cannot find any reference to lib ' + module);
        }

    }

    /**
     * Check if a module is registered (not necessarily loaded yet)
     * @param className
     * @returns {Map|boolean}
     */
    static moduleIsAvailable(className){
        const config = SystemJS.getConfig();
        return config.map && config.map[className];
    }

    static loadClassesAndApply(classNames, callbackFunc, autoload = true){
        if(autoload && !ResourcesManager.__configsParsed){
            ResourcesManager.loadAutoLoadResources();
        }
        Promise.all(classNames.map((c) => {return SystemJSImportDefault(c)})).then((res) => {
            callbackFunc();
            return res
        }).catch((reason) => {
            console.error('Failed Loading ' + classNames.join(', ') + ' : ', reason);
        });
    }

    /**
     * Load class and return as a promise - do not catch error
     * @param className
     * @return {*|Promise|PromiseLike<T>|Promise<T>}
     */
    static loadClass(className) {
        if(!ResourcesManager.__configsParsed){
            ResourcesManager.loadAutoLoadResources();
        }
        return SystemJSImportDefault(className);
    }

    static detectModuleToLoadAndApply(callbackString, callbackFunc, async = true){
        if(!ResourcesManager.__configsParsed){
            ResourcesManager.loadAutoLoadResources();
        }
        const className = callbackString.split('.',1).shift();
        if(async){
            SystemJSImportDefault(className).then(callbackFunc);
        }else{
            ResourcesManager.loadScriptSync(className, callbackFunc);
        }
    }

    static async loadScriptSync(name, callback){
        await SystemJSImportDefault(name);
        callback();
    }
}

ResourcesManager.__configsParsed = false;
ResourcesManager.__requires = {};

export {ResourcesManager as default}