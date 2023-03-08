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

require('whatwg-fetch');
import XMLUtils from '../util/XMLUtils'
/**
 * Pydio encapsulation of XHR / Fetch
 */
class Connexion{

	/**
	 * Constructor
	 * @param baseUrl String The base url for services
	 */
	constructor(baseUrl)
	{
        this._pydio = window.pydio;
		this._baseUrl = baseUrl || window.ajxpServerAccessPath;
		this._libUrl = window.ajxpResourcesFolder+'/dist';
		this._parameters = new Map();
		this._method = 'post';
        this.discrete = false;
    }

    static log(action, syncStatus){
        if(!Connexion.PydioLogs){
            Connexion.PydioLogs = [];
        }
        Connexion.PydioLogs.push({action:action, sync:syncStatus});
    }

	/**
	 * Set the query method (get post)
	 * @param method String
	 */
	setMethod(method){
		this._method = method;
	}

    /**
     * Show a small loader
     */
    showLoader(){
        if(this.discrete || !this._pydio) return;
        this._pydio.notify("connection-start");
    }

    /**
     * Hide a small loader
     */
    hideLoader(){
        if(this.discrete || !this._pydio) return;
        this._pydio.notify("connection-end");
    }

    send(){

        this.showLoader();
        let oThis = this;
        let options = {
            method:this._method,
            credentials:'same-origin',
        };
        let url = this._baseUrl;
        let bodyParts = [];
        this._parameters.forEach(function(value, key){
            if(value instanceof Array){
                value.map(function(oneV){
                    bodyParts.push( key + '=' + encodeURIComponent(oneV) );
                })
            }else{
                bodyParts.push( key + '=' + encodeURIComponent(value) );
            }
        });
        const queryString = bodyParts.join('&');
        if(this._method === 'post'){
            options.headers = { "Content-type": "application/x-www-form-urlencoded; charset=UTF-8" };
            options.body = queryString;
        }else{
            url += (url.indexOf('?') > -1 ? '&' : '?') + queryString;
        }
        window.fetch(url, options).then(function(response){

            let h = response.headers.get('Content-type');
            if(h.indexOf('/json') !== -1) {
                response.json().then(function (json) {
                    oThis.applyComplete({responseJSON: json}, response);
                });
            } else if(h.indexOf('/xml') !== -1){
                response.text().then(function(text){
                    oThis.applyComplete({responseXML: XMLUtils.parseXml(text)}, response);
                });
            }else{
                response.text().then(function(text){
                    oThis.applyComplete({responseText: text}, response);
                });
            }
            return response;

        }).catch((error) => {
            if(this._pydio){
                this._pydio.displayMessage('ERROR', 'Network error ' + error.message);
            }
        });

    }


	/**
	 * Apply the complete callback, try to grab maximum of errors
	 * @param parsedBody Transpot
	 */
	applyComplete(parsedBody, response){
        this.hideLoader();
        const pydio = this._pydio;
		let message, tokenMessage;
        let tok1 = "Ooops, it seems that your security token has expired! Please %s by hitting refresh or F5 in your browser!";
        let tok2 =  "reload the page";
        if(window.MessageHash && window.MessageHash[437]){
            tok1 = window.MessageHash[437];
            tok2 = window.MessageHash[438];
        }
        tokenMessage = tok1.replace("%s", "<a href='javascript:document.location.reload()' style='text-decoration: underline;'>"+tok2+"</a>");

        let ctype = response.headers.get('Content-type');
		if(parsedBody.responseXML && parsedBody.responseXML.documentElement && parsedBody.responseXML.documentElement.nodeName=="parsererror"){

			message = "Parsing error : \n" + parsedBody.responseXML.documentElement.firstChild.textContent;

		} else if(parsedBody.responseXML && parsedBody.responseXML.parseError && parsedBody.responseXML.parseError.errorCode != 0){

			message = "Parsing Error : \n" + parsedBody.responseXML.parseError.reason;

		} else if(ctype.indexOf("text/xml")>-1 && parsedBody.responseXML == null) {

			message = "Expected XML but got empty response!";

		} else if(ctype.indexOf("text/xml") == -1 && ctype.indexOf("application/json") == -1 && parsedBody.responseText.indexOf("<b>Fatal error</b>") > -1) {

			message = parsedBody.responseText.replace("<br />", "");

		} else if(response.status == 500) {

            message = "Internal Server Error: you should check your web server logs to find what's going wrong!";

        }
		if(message){

            if(message.startsWith("You are not allowed to access this resource.")) {
                message = tokenMessage;
            }
			if(pydio) {
                pydio.displayMessage("ERROR", message);
            } else {
                alert(message);
            }

		}
		if(parsedBody.responseXML && parsedBody.responseXML.documentElement){

			const authNode = XMLUtils.XPathSelectSingleNode(parsedBody.responseXML.documentElement, "require_auth");
			if(authNode && pydio){
				const root = pydio.getContextHolder().getRootNode();
				if(root){
					pydio.getContextHolder().setContextNode(root);
					root.clear();
                }
				pydio.getController().fireAction('logout');
				pydio.getController().fireAction('login');
			}

			const messageNode = XMLUtils.XPathSelectSingleNode(parsedBody.responseXML.documentElement, "message");
			if(messageNode){
				const messageType = messageNode.getAttribute("type").toUpperCase();
				let messageContent = XMLUtils.getDomNodeText(messageNode);
                if(messageContent.startsWith("You are not allowed to access this resource.")) {
                    messageContent = tokenMessage;
                }
				if(pydio){
					pydio.displayMessage(messageType, messageContent);
				}else{
					if(messageType == "ERROR"){
						alert(messageType+":"+messageContent);
					}
				}
                if(messageType == "SUCCESS") messageNode.parentNode.removeChild(messageNode);
			}

		}
		if(this.onComplete){

            parsedBody.status = response.status;
            parsedBody.responseObject = response;
			this.onComplete(parsedBody);

		}
		if(pydio){
    		pydio.fire("server_answer", this);
        }
	}

    uploadFile(file, fileParameterName, uploadUrl, onComplete=()=>{}, onError=()=>{}, onProgress=()=>{}, xhrSettings={}){

        const xhr = this.initializeXHRForUpload(uploadUrl, onComplete, onError, onProgress, xhrSettings);
        if (xhrSettings && xhrSettings.method === 'PUT') {
            xhr.send(file);
            return xhr;
        }
        if(window.FormData){
            this.sendFileUsingFormData(xhr, file, fileParameterName);
        }else if(window.FileReader){
            const fileReader = new FileReader();
            fileReader.onload = (e)=>{
                this.xhrSendAsBinary(xhr, file.name, e.target.result, fileParameterName);
            };
            fileReader.readAsBinaryString(file);
        }else if(file.getAsBinary){
            this.xhrSendAsBinary(xhr, file.name, file.getAsBinary(), fileParameterName)
        }
        return xhr;

    }

    initializeXHRForUpload(url, onComplete, onError, onProgress, xhrSettings = {}){

        const xhr = new XMLHttpRequest();
        const upload = xhr.upload;
        if(xhrSettings.withCredentials){
            xhr.withCredentials = true;
        }
        upload.addEventListener("progress", function(e){
            if (!e.lengthComputable){
                return;
            }
            onProgress(e);
        }, false);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    onComplete(xhr);
                } else {
                    onError(xhr);
                }
            }
        }.bind(this);
        upload.onerror = function(){
            onError(xhr);
        };
        let method = 'POST';
        if (xhrSettings.method){
            method = xhrSettings.method;
        }
        xhr.open(method, url, true);
        if(xhrSettings.customHeaders){
            Object.keys(xhrSettings.customHeaders).forEach(function(k){
                xhr.setRequestHeader(k, xhrSettings.customHeaders[k]);
            });
        }

        return xhr;
    }

    sendFileUsingFormData(xhr, file, fileParameterName){
        const formData = new FormData();
        formData.append(fileParameterName, file);
        xhr.send(formData);
    }

    xhrSendAsBinary(xhr, fileName, fileData, fileParameterName){
        const boundary = '----MultiPartFormBoundary' + (new Date()).getTime();
        xhr.setRequestHeader("Content-Type", "multipart/form-data, boundary="+boundary);

        let body = "--" + boundary + "\r\n";
        body += "Content-Disposition: form-data; name='"+fileParameterName+"'; filename='" + unescape(encodeURIComponent(fileName)) + "'\r\n";
        body += "Content-Type: application/octet-stream\r\n\r\n";
        body += fileData + "\r\n";
        body += "--" + boundary + "--\r\n";

        xhr.sendAsBinary(body);
    }

	/**
	 * Load a javascript library
	 * @param fileName String
	 * @param onLoadedCode Function Callback
     * @param aSync Boolean load library asynchroneously
	 */
	loadLibrary(fileName, onLoadedCode, aSync){

        if(window.pydioBootstrap && window.pydioBootstrap.parameters.get("ajxpVersion") && fileName.indexOf("?")===-1){
            fileName += "?v="+window.pydioBootstrap.parameters.get("ajxpVersion");
        }
        const url = (this._libUrl?this._libUrl+'/'+fileName:fileName);
        const pydio = this._pydio;

        let scriptLoaded = function(script){
            try{
                if (window.execScript){
                    window.execScript( script );
                } else {
                    window.my_code = script;
                    const head = document.getElementsByTagName('head')[0];
                    let script_tag = document.createElement('script');
                    script_tag.type = 'text/javascript';
                    script_tag.innerHTML = 'eval(window.my_code)';
                    head.appendChild(script_tag);
                    delete window.my_code;
                    head.removeChild(script_tag);
                }
                if(onLoadedCode != null) onLoadedCode();
            }catch(e){
                alert('error loading '+fileName+':'+ e.message);
                if(console) console.error(e);
            }
            if(pydio) pydio.fire("server_answer");
        }

        if(aSync){
            window.fetch(url, {
                method:'GET',
                credentials:'same-origin'
            }).then(function(response){
                return response.text();
            }).then(function(script){
                scriptLoaded(script);
            });
        }else{
            // SHOULD BE REMOVED!!
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    if (xhr.status === 200) {
                        scriptLoaded(xhr.responseText);
                    } else {
                        alert('error loading '+fileName+': Status code was '+ xhr.status);
                    }
                }
            }.bind(this);
            xhr.open("GET", url, false);
            xhr.send();
        }

	}
}

export {Connexion as default}
