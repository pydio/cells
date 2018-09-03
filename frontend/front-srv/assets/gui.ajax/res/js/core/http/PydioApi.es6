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
import LangUtils from '../util/LangUtils'
import RestClient from './RestClient'
import AWS from 'aws-sdk'
import IdmUser from "./gen/model/IdmUser";

/**
 * API Client
 */
class PydioApi{

    constructor(){
    }

    /**
     * @return {JwtApiClient}
     */
    static getRestClient(){
        return new RestClient(this.getClient()._pydioObject);
    }


    setPydioObject(pydioObject){
        this._pydioObject = pydioObject;
        this._baseUrl = pydioObject.Parameters.get('serverAccessPath');
    }

    getPydioObject(){
        return this._pydioObject;
    }

    request(parameters, onComplete=null, onError=null, settings={}){
        // Connexion already handles secure_token
        let c = new Connexion();
        if(settings.discrete){
            c.discrete = true;
        }
        c.setParameters(parameters);
        if(settings.method){
            c.setMethod(settings.method);
        }
        if(!onComplete){
            onComplete = function(transport){
                if(transport.responseXML) return this.parseXmlMessage(transport.responseXML);
            }.bind(this);
        }
        c.onComplete = onComplete;
        if(settings.async === false){
            c.sendSync();
        }else{
            c.sendAsync();
        }
    }

    loadFile(filePath, onComplete=null, onError=null){
        let c = new Connexion(filePath);
        c.setMethod('GET');
        c.onComplete = onComplete;
        c.sendAsync();
    }

    /**
     * 
     * @param file
     * @param fileParameterName
     * @param queryStringParams
     * @param onComplete
     * @param onError
     * @param onProgress
     * @returns XHR Handle to abort transfer
     */
    uploadFile(file, fileParameterName, queryStringParams='', onComplete=function(){}, onError=function(){}, onProgress=function(){}, uploadUrl='', xhrSettings={}){

        if(!uploadUrl){
            uploadUrl = pydio.Parameters.get('ajxpServerAccess');
        }
        if(queryStringParams){
            uploadUrl += (uploadUrl.indexOf('?') === -1 ? '?' : '&') + queryStringParams;
        }

        if(window.Connexion){
            // Warning, avoid double error
            let errorSent = false;
            let localError = function(xhr){
                if(!errorSent) onError('Request failed with status :' + xhr.status);
                errorSent = true;
            };
            let c = new Connexion();
            return c.uploadFile(file, fileParameterName, uploadUrl, onComplete, localError, onProgress, xhrSettings);

        }

    }

    /**
     *
     * @param userSelection UserSelection A Pydio DataModel with selected files
     * @param dlActionName String Action name to trigger, download by default.
     * @param additionalParameters Object Optional set of key/values to pass to the download.
     */
    downloadSelection(userSelection, dlActionName='download', additionalParameters = {}){

        const agent = navigator.userAgent || '';
        const agentIsMobile = (agent.indexOf('iPhone')!==-1||agent.indexOf('iPod')!==-1||agent.indexOf('iPad')!==-1||agent.indexOf('iOs')!==-1);
        const hiddenForm = this._pydioObject && this._pydioObject.UI && this._pydioObject.UI.hasHiddenDownloadForm();

        if (userSelection.getSelectedNodes().length === 1 && Object.keys(additionalParameters).length === 0) {
            this.buildPresignedGetUrl(userSelection.getUniqueNode()).then(url => {
                if(agentIsMobile || !hiddenForm){
                    document.location.href = url;
                } else {
                    this._pydioObject.UI.sendDownloadToHiddenForm(userSelection, {presignedUrl: url});
                }
            });
        } else {
            throw new Error('Multiple selection download is not supported yet.');
        }

    }

    /**
     * Generate presigned and use it for uploads
     * @param file
     * @param path
     * @param onComplete
     * @param onError
     * @param onProgress
     * @return {Promise<any>}
     */
    uploadPresigned(file, path, onComplete=()=>{}, onError=()=>{}, onProgress=()=>{}){
        let targetPath = path;
        if (path.normalize){
            targetPath = path.normalize('NFC');
        }
        if(targetPath[0] === "/"){
            targetPath = targetPath.substring(1);
        }
        const url = this.getPydioObject().Parameters.get('ENDPOINT_S3_GATEWAY');
        const slug = this.getPydioObject().user.getActiveRepositoryObject().getSlug();
        const params = {
            Bucket: 'io',
            Key: slug + '/' + targetPath,
            ContentType: 'application/octet-stream'
        };

        return new Promise(resolve => {
            PydioApi.getRestClient().getOrUpdateJwt().then(jwt => {
                AWS.config.update({
                    accessKeyId: 'gateway',
                    secretAccessKey: 'gatewaysecret'
                });
                const s3 = new AWS.S3({endpoint:url.replace('/io', '')});
                const signed = s3.getSignedUrl('putObject', params);
                const xhr = this.uploadFile(file, '', '', onComplete, onError, onProgress, signed, {method: 'PUT', customHeaders: {'X-Pydio-Bearer': jwt, 'Content-Type': 'application/octet-stream'}});
                resolve(xhr);
            });
        });
    }

    /**
     * Send a request to the server to get a usable presigned url.
     *
     * @param node AjxpNode
     * @param callback Function
     * @param presetType String
     * @param bucketParams
     * @return {Promise}|null Return a Promise if callback is null, or call the callback
     */
    buildPresignedGetUrl(node, callback = null, presetType = '', bucketParams = null) {
        const url = this.getPydioObject().Parameters.get('ENDPOINT_S3_GATEWAY');
        const slug = this.getPydioObject().user.getActiveRepositoryObject().getSlug();
        let cType = '', cDisposition;

        switch (presetType){
            case 'image/png':
            case 'image/jpeg':
            case 'image/bmp':
            case 'text/plain':
                cType = presetType;
                cDisposition = 'inline';
                break;
            case 'image/jpg':
                cType = 'image/jpeg';
                cDisposition = 'inline';
                break;
            case 'audio/mp3':
                cType = presetType;
                break;
            case 'video/mp4':
                cType = presetType;
                break;
            case 'detect':
                cType = node.getAjxpMimeType();
                cDisposition = 'inline';
            default:
                break;
        }

        let params = {
            Bucket: 'io',
            Key: slug + node.getPath()
        };
        if (bucketParams !== null) {
            params = bucketParams;
        }
        if(cType) {
            params['ResponseContentType'] = cType;
        }
        if(cDisposition) {
            params['ResponseContentDisposition'] = cDisposition;
        }

        const resolver = (jwt, cb) => {
            let meta = node.getMetadata().get('presignedUrls');
            const cacheKey = jwt + params.Key;
            const cached = meta ? meta.get(cacheKey) : null;
            if(cached){
                cb(cached);
                return;
            }
            if(!meta) {
                meta = new Map();
            }

            AWS.config.update({
                accessKeyId: 'gateway',
                secretAccessKey: 'gatewaysecret'
            });
            const s3 = new AWS.S3({endpoint:url.replace('/io', '')});
            const signed = s3.getSignedUrl('getObject', params);
            const output = signed + '&pydio_jwt=' + jwt;
            cb(output);
            meta.set(cacheKey, output);
            node.getMetadata().set('presignedUrls', meta);
        };

        if (callback === null) {
            return new Promise((resolve) => {
                PydioApi.getRestClient().getOrUpdateJwt().then(jwt => {
                    resolver(jwt, resolve);
                });
            });
        } else {
            PydioApi.getRestClient().getOrUpdateJwt().then(jwt => {
                resolver(jwt, callback);
            });
            return null;
        }

    }

    getPlainContent(node, contentCallback) {
        PydioApi.getRestClient().getOrUpdateJwt().then(jwt => {
            const url = this.getPydioObject().Parameters.get('ENDPOINT_S3_GATEWAY');
            const slug = this.getPydioObject().user.getActiveRepositoryObject().getSlug();

            AWS.config.update({
                accessKeyId: jwt,
                secretAccessKey: 'gatewaysecret'
            });
            const params = {
                Bucket: "io",
                Key: slug + node.getPath(),
                ResponseContentType: 'text/plain'
            };
            const s3 = new AWS.S3({endpoint:url.replace('/io', '')});
            s3.getObject(params, (err,data) => {
                if (!err) {
                    contentCallback(data.Body.toString('utf-8'));
                } else {
                    this.getPydioObject().UI.displayMessage('ERROR', err.message);
                }
            })
        });

    }

    postPlainTextContent(nodePath, content, finishedCallback){

        PydioApi.getRestClient().getOrUpdateJwt().then(jwt => {
            const url = this.getPydioObject().Parameters.get('ENDPOINT_S3_GATEWAY');
            const slug = this.getPydioObject().user.getActiveRepositoryObject().getSlug();

            AWS.config.update({
                accessKeyId: jwt,
                secretAccessKey: 'gatewaysecret'
            });
            const params = {
                Bucket: "io",
                Key: slug + nodePath,
                Body: content,
            };
            const s3 = new AWS.S3({endpoint:url.replace('/io', '')});
            s3.putObject(params, (err) => {
                if (!err) {
                    finishedCallback('Ok');
                }  else {
                    this.getPydioObject().UI.displayMessage('ERROR', err.message);
                    finishedCallback(false);
                }
            })
        });

    }

    openVersion(node, versionId){

        const pydio = this.getPydioObject();
        const agent = navigator.userAgent || '';
        const agentIsMobile = (agent.indexOf('iPhone')!=-1||agent.indexOf('iPod')!=-1||agent.indexOf('iPad')!=-1||agent.indexOf('iOs')!=-1);
        const hiddenForm = pydio && pydio.UI && pydio.UI.hasHiddenDownloadForm();
        const slug = pydio.user.getActiveRepositoryObject().getSlug();

        this.buildPresignedGetUrl(node, (url) => {
            if(agentIsMobile || !hiddenForm){
                document.location.href = url;
            } else {
                pydio.UI.sendDownloadToHiddenForm(null, {presignedUrl: url});
            }
        }, '', {
            Bucket: 'io',
            Key: slug + node.getPath(),
            VersionId: versionId
        });

    }


    revertToVersion(node, versionId, callback){
        PydioApi.getRestClient().getOrUpdateJwt().then(jwt => {
            const url = this.getPydioObject().Parameters.get('ENDPOINT_S3_GATEWAY');
            const slug = this.getPydioObject().user.getActiveRepositoryObject().getSlug();

            AWS.config.update({
                accessKeyId: jwt,
                secretAccessKey: 'gatewaysecret'
            });
            const params = {
                Bucket: "io",
                Key: slug + node.getPath(),
                CopySource:encodeURIComponent('io/' + slug + node.getPath() + '?versionId=' + versionId)
            };
            const s3 = new AWS.S3({endpoint:url.replace('/io', '')});
            s3.copyObject(params, (err) => {
                if (err) {
                    this.getPydioObject().UI.displayMessage('ERROR', err.message);
                } else if (callback) {
                    callback('Copy version to original node');
                }
            })
        });

    }

    /**
     * Detect a minisite_session parameter in the URL
     * @param serverAccess
     * @returns string|bool
     */
    static detectMinisiteSession(serverAccess){
        const regex = new RegExp('.*?[&\\?]' + 'minisite_session' + '=(.*?)&?.*?');
        const val = serverAccess.replace(regex, "$1");
        return ( val === serverAccess ? false : val );
    }

    /**
     * Detects if current browser supports HTML5 Upload.
     * @returns boolean
     */
    static supportsUpload(){
        if(window.Connexion){
            return (window.FormData || window.FileReader);
        }else if(window.jQuery){
            return window.FormData;
        }
        return false;
    }

    /**
     * Instanciate a PydioApi client if it's not already instanciated and return it.
     * @returns PydioApi
     */
    static getClient(){
        if(PydioApi._PydioClient) {
            return PydioApi._PydioClient;
        }
        const client = new PydioApi();
        PydioApi._PydioClient = client;
        return client;
    }

    /**
     * Load a javascript library
     * @param fileName String
     * @param onLoadedCode Function Callback
     * @param aSync Boolean load library asynchroneously
     */
    static loadLibrary(fileName, onLoadedCode, aSync){
        if(window.pydio && pydio.Parameters.get("ajxpVersion") && fileName.indexOf("?")===-1){
            fileName += "?v="+ pydio.Parameters.get("ajxpVersion");
        }
        PydioApi._libUrl = false;
        if(window.pydio && pydio.Parameters.get('SERVER_PREFIX_URI')){
            PydioApi._libUrl = pydio.Parameters.get('SERVER_PREFIX_URI');
        }

        let conn = new Connexion();
        conn._libUrl = false;
        if(pydio.Parameters.get('SERVER_PREFIX_URI')){
            conn._libUrl = pydio.Parameters.get('SERVER_PREFIX_URI');
        }
        conn.loadLibrary(fileName, onLoadedCode, aSync);


    }

    switchLanguage(lang, completeCallback){

        let url = pydio.Parameters.get('ENDPOINT_REST_API') + '/frontend/messages/' + lang;
        window.fetch(url, {
            method:'GET',
            credentials:'same-origin',
        }).then((response) => {
            response.json().then((data) => {
                completeCallback(data);
            });
        });

    }

    applyCheckHook(node, hookName, hookArg, completeCallback, additionalParams){
        let params = {
            get_action : "apply_check_hook",
            file       : node.getPath(),
            hook_name  : hookName,
            hook_arg   : hookArg
        };
        if(additionalParams){
            params = LangUtils.objectMerge(params, additionalParams);
        }
        this.request(params, completeCallback, null, {async:false});
    }

    /**
     * Standard parser for server XML answers
     * @param xmlResponse DOMDocument
     */
    parseXmlMessage(xmlResponse)
    {
        if(xmlResponse == null || xmlResponse.documentElement == null) {
            return null;
        }
        const childs = xmlResponse.documentElement.childNodes;
        let reloadNodes = [], error = false;
        this.LAST_ERROR_ID = null;
        this.LAST_ERROR = null;

        for(let i=0; i<childs.length;i++)
        {
            const child = childs[i];
            if(child.tagName === "message")
            {
                let messageTxt = "No message";
                if(child.firstChild) messageTxt = child.firstChild.nodeValue;
                if(child.getAttribute('type') == 'ERROR') {
                    Logger.error(messageTxt);
                    this.LAST_ERROR = messageTxt;
                    error = true;
                }else{
                    Logger.log(messageTxt);
                }

            } else if(child.tagName === "prompt") {

                if(pydio && pydio.UI && pydio.UI.openPromptDialog){
                    let jsonData = XMLUtils.XPathSelectSingleNode(childs[i], "data").firstChild.nodeValue;
                    pydio.UI.openPromptDialog(JSON.parse(jsonData));
                }
                return false;

            } else if(child.tagName === "reload_instruction") {

                const obName = child.getAttribute('object');
                if(obName === 'data') {
                    const node = child.getAttribute('node');
                    if(node){
                        reloadNodes.push(node);
                    }else{
                        const file = child.getAttribute('file');
                        if(file){
                            this._pydioObject.getContextHolder().setPendingSelection(file);
                        }
                        reloadNodes.push(this._pydioObject.getContextNode());
                    }
                } else if(obName === 'repository_list') {
                    this._pydioObject.reloadRepositoriesList();
                }

            } else if(child.nodeName === 'nodes_diff') {

                const dm = this._pydioObject.getContextHolder();
                if(dm.getAjxpNodeProvider().parseAjxpNodesDiffs){
                    dm.getAjxpNodeProvider().parseAjxpNodesDiffs(childs[i], dm, this._pydioObject.user.activeRepository, !window.currentLightBox);
                }

            } else if(child.tagName === "logging_result") {

                if(child.getAttribute("secure_token")){

                    this._pydioObject.Parameters.set('SECURE_TOKEN', child.getAttribute("secure_token"));
                    Connexion.updateServerAccess(this._pydioObject.Parameters);
                    
                }
                const result = child.getAttribute('value');
                let errorId = false;
                switch(result){
                    case '1':
                        this._pydioObject.loadXmlRegistry();
                        break;
                    case '0':
                    case '-1':
                        errorId = 285;
                        break;
                    case '2':
                        this._pydioObject.loadXmlRegistry();
                        break;
                    case '-2':
                        errorId = 285;
                        break;
                    case '-3':
                        errorId = 366;
                        break;
                    case '-4':
                        errorId = 386;
                        break;
                }
                if(errorId){
                    error = true;
                    this.LAST_ERROR_ID = errorId;
                    Logger.error(this._pydioObject.MessageHash[errorId]);
                }

            } else if(child.tagName === "trigger_bg_action") {

                const name = child.getAttribute("name");
                const messageId = child.getAttribute("messageId");
                let parameters = {};
                let callback;
                for(let j=0;j<child.childNodes.length;j++){
                    const paramChild = child.childNodes[j];
                    if(paramChild.tagName === 'param'){

                        parameters[paramChild.getAttribute("name")] = paramChild.getAttribute("value");

                    }else if(paramChild.tagName === 'clientCallback' && paramChild.firstChild && paramChild.firstChild.nodeValue){

                        const callbackCode = paramChild.firstChild.nodeValue;
                        callback = new Function(callbackCode);

                    }
                }
                if(name === "javascript_instruction" && callback){
                    callback();
                }
            }

        }
        this._pydioObject.notify("response.xml", xmlResponse);
        if(reloadNodes.length){
            this._pydioObject.getContextHolder().multipleNodesReload(reloadNodes);
        }
        return !error;
    }

    postSelectionWithAction(actionName, callback=null, selectionModel=null, additionalParameters=null){
        if(!selectionModel){
            selectionModel = this._pydioObject.getContextHolder();
        }
        let params = {
            get_action:actionName,
            dir: selectionModel.getContextNode().getPath()
        };
        params['nodes[]'] = selectionModel.getFileNames();
        if(additionalParameters){
            params = Object.assign(params, additionalParameters);
        }
        this.request(params, callback);

    }

}

export {PydioApi as default}