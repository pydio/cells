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

import dayjs from "dayjs";

const React = require('react');
const ReactDOM = require('react-dom');
const XMLUtils = require('pydio/util/xml');
const PathUtils = require('pydio/util/path');
const FuncUtils = require('pydio/util/func');
const ResourcesManager = require('pydio/http/resources-manager');
import PydioContextProvider from './PydioContextProvider'
import ThemeBuilder from "./ThemeBuilder";
import moment from './Moment'

export default class Builder{

    constructor(pydio){
        this._pydio = pydio;
        this.guiLoaded = false;
        this._componentsRegistry = new Map();
        this._pydio.observe('repository_list_refreshed', this.pageTitleObserver.bind(this));
        this._pydio.getContextHolder().observe('context_loaded', this.pageTitleObserver.bind(this));
        if (this._pydio.currentLanguage) {
            this.updateMomentLocale(this._pydio.currentLanguage)
        }
        this._pydio.observe('language', (lang) => {
            this.updateMomentLocale(lang)
        });
        this.themeBuilder = ThemeBuilder.getInstance(pydio, () => this.refreshTemplateParts())
    }

    updateMomentLocale(lang) {
        moment.locale(lang);
        const mess = Pydio.getMessages()
        const realLangs = {
            'es-es' : 'es',
            'fr-ca': 'fr',
            'pt-pt': 'pt',
            'sv-se': 'sv',
            'en-us': 'en'
        }
        if(realLangs[lang]){
            lang = realLangs[lang]
        }
        dayjs.updateLocale(lang, {
            calendar:{
                lastDay: mess['date_relative_yesterday'],
                sameDay: mess['date_relative_today'],
                nextDay: mess['date_relative_tomorrow'],
                lastWeek: mess['date_relative_lastweek'],
                nextWeek: mess['date_relative_nextWeek'],
                sameElse: function(){return this.fromNow()}
            }
        })
    }

    pageTitleObserver(){
        const ctxNode = this._pydio.getContextNode();
        let title = this._pydio.Parameters.get('customWording').title;
        if (ctxNode.getLabel()){
            title += ' - ' + ctxNode.getLabel();
        }
        document.title = title;
    }

    initTemplates(){

        if(!this._pydio.getXmlRegistry()) return;

        const tNodes = XMLUtils.XPathSelectNodes(this._pydio.getXmlRegistry(), "client_configs/template[@component]");
        for(let i=0;i<tNodes.length;i++){

            let target = tNodes[i].getAttribute("element");
            let themeSpecific = tNodes[i].getAttribute("theme");
            let props = {};
            if(tNodes[i].getAttribute("props")){
                props = JSON.parse(tNodes[i].getAttribute("props"));
            }
            props.pydio = this._pydio;

            let containerId = props.containerId;
            let namespace = tNodes[i].getAttribute("namespace");
            let component = tNodes[i].getAttribute("component");

            if(themeSpecific && this._pydio.Parameters.get("theme") && this._pydio.Parameters.get("theme") !== themeSpecific){
                continue;
            }
            let targetObj = document.getElementById(target);
            if(!targetObj){
                let tags = document.getElementsByTagName(target);
                if(tags.length) targetObj = tags[0];
            }
            if(targetObj){
                let position = tNodes[i].getAttribute("position");
                let name = tNodes[i].getAttribute('name');
                if((position === 'bottom' && name) || target === 'body'){
                    let newDiv = document.createElement('div');
                    if(tNodes[i].getAttribute("style")){
                        newDiv.setAttribute('style', tNodes[i].getAttribute("style"));
                    }
                    if(target === 'body') {
                        targetObj.appendChild(newDiv);
                    } else {
                        targetObj.parentNode.appendChild(newDiv);
                    }
                    newDiv.id = name;
                    target = name;
                    targetObj = newDiv;
                }
                ResourcesManager.loadClass(namespace).then(ns => {
                    if(!ns[component]){
                        if(console) {
                            console.error('Cannot find component ['+namespace+']['+component+']. Did you forget to export it? ')
                        }
                        return;
                    }
                    const element = React.createElement(PydioContextProvider(ns[component], this._pydio, this.themeBuilder), props);
                    const el = ReactDOM.render(element, targetObj);
                    this._componentsRegistry.set(target, el);
                });

            }
        }
        this.guiLoaded = true;
        this._pydio.notify("gui_loaded");

    }

    refreshTemplateParts(){

        this._componentsRegistry.forEach(function(reactElement){
            reactElement.forceUpdate();
        });

    }

    updateHrefBase(cdataContent){
        return cdataContent;
    }

    /**
     *
     * @param component
     */
    registerEditorOpener(component){
        this._editorOpener = component;
    }

    unregisterEditorOpener(component){
        if(this._editorOpener === component) {
            this._editorOpener = null;
        }
    }

    getEditorOpener(){
        return this._editorOpener;
    }

    openCurrentSelectionInEditor(editorData, forceNode){
        const selectedNode =  forceNode ? forceNode : this._pydio.getContextHolder().getUniqueNode();
        if(!selectedNode) return;
        if(!editorData){
            const selectedMime = PathUtils.getAjxpMimeType(selectedNode);
            const editors = this._pydio.Registry.findEditorsForMime(selectedMime, false);
            if(editors.length && editors[0].openable && (editors[0].mimes && (editors[0].mimes[0] !== '*' || editors[0].mimes.indexOf(selectedMime) !== -1))
                && !(editors[0].write && selectedNode.getMetadata().get("node_readonly") === "true")){
                editorData = editors[0];
            }
        }
        if(editorData){
            this._pydio.Registry.loadEditorResources(editorData.resourcesManager, function(){
                const editorOpener = this.getEditorOpener();
                if(!editorOpener || editorData.modalOnly){
                    modal.openEditorDialog(editorData);
                }else{
                    editorOpener.openEditorForNode(selectedNode, editorData);
                }
            }.bind(this));
        }else{
            if(this._pydio.Controller.getActionByName("download")){
                this._pydio.Controller.getActionByName("download").apply();
            }
        }
    }

    registerModalOpener(component){
        this._modalOpener = component;
    }

    unregisterModalOpener(){
        this._modalOpener = null;
    }

    openComponentInModal(namespace, componentName, props){
        if(!this._modalOpener){
            Logger.error('Cannot find any modal opener for opening component ' + namespace + '.' + componentName);
            return;
        }
        // Collect modifiers
        let modifiers = [];
        let namespaces = [];
        props = props || {};
        props['pydio'] = this._pydio;
        XMLUtils.XPathSelectNodes(this._pydio.getXmlRegistry(), '//client_configs/component_config[@component="'+namespace + '.' + componentName +'"]/modifier').map(function(node){
            const module = node.getAttribute('module');
            modifiers.push(module);
            namespaces.push(module.split('.').shift());
        });
        if(modifiers.length){
            ResourcesManager.loadClassesAndApply(namespaces, function(){
                let modObjects = [];
                modifiers.map(function(mString){
                    try{
                        let classObject = FuncUtils.getFunctionByName(mString, window);
                        modObjects.push(new classObject());
                    }catch(e){
                        console.log(e);
                    }
                });
                props['modifiers'] = modObjects;
                this._modalOpener.open(namespace, componentName, props);
            }.bind(this));
        }else{
            this._modalOpener.open(namespace, componentName, props);
        }
    }

    /**
     *
     * @param component
     */
    registerMessageBar(component){
        this._messageBar = component;
    }

    unregisterMessageBar(){
        this._messageBar = null;
    }

    messageReady() {
        return !!this._messageBar
    }

    displayMessage(type, message, actionLabel = null, actionCallback = null){
        if(!this._messageBar){
            Logger.error('Cannot find any messageBar for displaying message ' + message);
            return;
        }
        if(type === 'ERROR'){
            if(message instanceof Object && message.Title){
                message = message.Title;
            }
            this._messageBar.error(message, actionLabel, actionCallback);
        }else{
            this._messageBar.info(message, actionLabel, actionCallback);
        }
    }

    hasHiddenDownloadForm(){
        return this._hiddenDownloadForm;
    }

    registerHiddenDownloadForm(component){
        this._hiddenDownloadForm = component;
    }

    unRegisterHiddenDownloadForm(component){
        this._hiddenDownloadForm = null;
    }

    sendDownloadToHiddenForm(selection, parameters){
        if(this._hiddenDownloadForm){
            this._hiddenDownloadForm.triggerDownload(selection, parameters);
        }
    }

    openPromptDialog(json){

        if(!this._modalOpener){
            if(console){
                console.error('Cannot find modalOpener! Received serverPromptDialog with data', json);
            }
            return;
        }
        this._modalOpener.open('PydioReactUI', 'ServerPromptDialog', json);

    }

    openConfirmDialog(props) {
        const {validCallback, skipNext} = props;
        if(validCallback && skipNext && localStorage.getItem('confirm.skip.' + skipNext)) {
            validCallback();
            return;
        }
        this.openComponentInModal('PydioReactUI', 'ConfirmDialog', props);
    }


}