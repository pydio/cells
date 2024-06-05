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

import React from 'react'
import XMLUtils from "pydio/util/xml";

import ValidLogin from '../fields/ValidLogin'
import AltText from "../fields/AltText";
import InputIntegerBytes from "../fields/InputIntegerBytes";
import InputBoolean from "./../fields/InputBoolean";
import InputText from "./../fields/TextField";
import ValidPassword from "./../fields/ValidPassword";
import InputInteger from "./../fields/InputInteger";
import InputImage from "./../fields/InputImage";
import SelectBox from "./../fields/InputSelectBox";
import AutocompleteBox from "./../fields/AutocompleteBox";
import AutocompleteTree from "./../fields/AutocompleteTree";

/**
 * Utility class to parse / handle pydio standard form definitions/values.
 */
export default class Manager{

    static hasHelper(pluginId, paramName){

        const helpers = Manager.getHelpersCache();
        return (helpers[pluginId] && helpers[pluginId]['parameters'][paramName]);
    }

    static getHelpersCache(){
        if(!Manager.HELPERS_CACHE){
            let helperCache = {};
            const helpers = XMLUtils.XPathSelectNodes(window.pydio.Registry.getXML(), 'plugins/*/client_settings/resources/js[@type="helper"]');
            for(let i = 0; i<helpers.length; i++){
                const helperNode = helpers[i];
                const plugin = helperNode.getAttribute("plugin");
                helperCache[plugin] = {namespace:helperNode.getAttribute('className'), parameters:{}};
                const paramNodes = XMLUtils.XPathSelectNodes(helperNode, 'parameter');
                for(let k=0; k<paramNodes.length;k++){
                    const paramNode = paramNodes[k];
                    helperCache[plugin]['parameters'][paramNode.getAttribute('name')] = true;

                }
            }
            Manager.HELPERS_CACHE = helperCache;
        }
        return Manager.HELPERS_CACHE;
    }

    static parseParameters(xmlDocument, query){
        return XMLUtils.XPathSelectNodes(xmlDocument, query).map(function(node){
            return Manager.parameterNodeToHash(node);
        }.bind(this));
    }

    static parameterNodeToHash(paramNode){
        const paramsAtts = paramNode.attributes;
        let paramsObject = {};
        if(paramNode.parentNode && paramNode.parentNode.parentNode && paramNode.parentNode.parentNode.getAttribute){
            paramsObject["pluginId"] = paramNode.parentNode.parentNode.getAttribute("id");
        }
        let collectCdata = false;
        const {MessageHash} = global.pydio;
        for(let i=0; i<paramsAtts.length; i++){
            const attName = paramsAtts.item(i).nodeName;
            let value = paramsAtts.item(i).value;
            if( (attName === "label" || attName === "description" || attName === "group" || attName.indexOf("group_switch_") === 0) && MessageHash[value] ){
                value = MessageHash[value];
            }
            if( attName === "cdatavalue" ){
                collectCdata = true;
                continue;
            }
            paramsObject[attName] = value;
        }
        if(collectCdata){
            paramsObject['value'] = paramNode.firstChild.value;
        }
        if(paramsObject['type'] === 'boolean'){
            if(paramsObject['value'] !== undefined) {
                paramsObject['value'] = (paramsObject['value'] === "true");
            }
            if(paramsObject['default'] !== undefined) {
                paramsObject['default'] = (paramsObject['default'] === "true");
            }
        }else if(paramsObject['type'] === 'integer' || paramsObject['type'] === 'integer-bytes'){
            if(paramsObject['value'] !== undefined) {
                paramsObject['value'] = parseInt(paramsObject['value']);
            }
            if(paramsObject['default'] !== undefined) {
                paramsObject['default'] = parseInt(paramsObject['default']);
            }
        }
        return paramsObject;
    }

    static createFormElement(props){
        let value;
        const {attributes, onAltTextSwitch, altTextSwitchIcon, altTextSwitchTip} = props;
        const switchProps = {onAltTextSwitch, altTip: altTextSwitchTip, altIconText: altTextSwitchIcon}
        switch(attributes['type']){
            case 'boolean':
                value = <InputBoolean {...props}/>
                if(onAltTextSwitch){
                    value = <AltText {...props} {...switchProps} altIcon={"mdi mdi-toggle-switch"}>{value}</AltText>;
                }
                break;
            case 'string':
            case 'textarea':
            case 'password':
                value = <InputText {...props}/>;
                break;
            case 'valid-password':
                value = <ValidPassword {...props}/>;
                break;
            case 'valid-login':
                value = <ValidLogin {...props}/>;
                break;
            case 'integer':
            case 'integer-bytes':
                value = attributes['type'] === 'integer-bytes' ? <InputIntegerBytes {...props}/> : <InputInteger {...props}/>;
                if(onAltTextSwitch){
                    value = <AltText {...props}  {...switchProps} altIcon={"mdi mdi-number"}>{value}</AltText>;
                }
                break;
            case 'image':
                value = <InputImage {...props}/>;
                break;
            case 'select':
                value = <SelectBox {...props}/>;
                if(onAltTextSwitch){
                    value = <AltText {...props}  {...switchProps} altIcon={"mdi mdi-view-list"}>{value}</AltText>;
                }
                break;
            case 'autocomplete':
                value = <AutocompleteBox {...props}/>;
                break;
            case 'autocomplete-tree':
                value = <AutocompleteTree {...props}/>;
                break;
            case 'legend':
                value = null;
                break;
            case 'hidden':
                value = null;
                break;
            default:
                if (props.value) {
                    value = props.value;
                } else {
                    value = <span className="paramValue-empty">Empty</span>;
                }
                break;
        }
        return value;
    }

    static SlashesToJson(values){
        if(values === undefined || typeof values !== 'object'){
            return values;
        }
        let newValues = {};
        let recurseOnKeys = {};
        Object.keys(values).forEach((k) => {
            const data = values[k];
            if (k.indexOf('/') > 0) {
                const parts = k.split('/');
                const firstPart = parts.shift();
                const lastPart = parts.join('/');
                if(!newValues[firstPart]){
                    newValues[firstPart] = {};
                } else if (typeof newValues[firstPart] === 'string') {
                    newValues[firstPart] = {'@value':newValues[firstPart]};
                }
                newValues[firstPart][lastPart] = data;
                recurseOnKeys[firstPart] = firstPart;
            }else {
                if (newValues[k] && typeof newValues[k] === 'object') {
                    newValues[k]['@value'] = data
                } else {
                    newValues[k] = data;
                }
            }
        });
        Object.keys(recurseOnKeys).map((key) => {
            newValues[key] = Manager.SlashesToJson(newValues[key]);
        });
        return newValues;
    }

    static JsonToSlashes(values, prefix = '') {
        let newValues = {};
        Object.keys(values).forEach((k) => {
            if (typeof values[k] === 'object') {
                const subValues = Manager.JsonToSlashes(values[k], prefix + k + '/');
                newValues = {...newValues, ...subValues};
                if (values[k]['@value']) {
                    newValues[prefix + k] = values[k]['@value'];
                }
            } else {
                newValues[prefix + k] = values[k]
            }
        });
        return newValues;
    }

    /**
     *
     * Extract POST-ready values from a combo parameters/values
     *
     * @param definitions Array Standard Form Definition array
     * @param values Object Key/Values of the current form
     * @param prefix String Optional prefix to add to all parameters (by default DRIVER_OPTION_).
     * @returns Object Object with all pydio-compatible POST parameters
     */
    static getValuesForPOST(definitions, values, prefix='DRIVER_OPTION_', additionalMetadata=null){
        var clientParams = {};
        for(var key in values){
            if(values.hasOwnProperty(key)) {
                clientParams[prefix+key] = values[key];
                var defType = null;
                for(var d = 0; d<definitions.length; d++){
                    if(definitions[d]['name'] == key){
                        defType = definitions[d]['type'];
                        break;
                    }
                }
                if(!defType){

                    var parts=key.split('/');
                    var last, prev;
                    if(parts.length > 1) {
                        last = parts.pop();
                        prev = parts.pop();
                    }
                    for(var k = 0; k<definitions.length; k++){
                        if(last !== undefined){
                            if(definitions[k]['name'] == last && definitions[k]['group_switch_name'] && definitions[k]['group_switch_name'] == prev){
                                defType = definitions[k]['type'];
                                break;
                            }
                        }else{
                            if(definitions[k]['name'] == key) {
                                defType = definitions[k]['type'];
                                break;
                            }
                        }
                    }

                }
                //definitions.map(function(d){if(d.name == theKey) defType = d.type});
                if(defType){
                    if(defType == "image") defType = "binary";
                    clientParams[prefix+ key + '_ajxptype'] = defType;
                }
                if(additionalMetadata && additionalMetadata[key]){
                    for(var meta in additionalMetadata[key]){
                        if(additionalMetadata[key].hasOwnProperty(meta)){
                            clientParams[prefix + key + '_' + meta] = additionalMetadata[key][meta];
                        }
                    }
                }
            }
        }

        // Reorder tree keys
        var allKeys = Object.keys(clientParams);
        allKeys.sort();
        allKeys.reverse();
        var treeKeys = {};
        allKeys.map(function(key){
            if(key.indexOf("/") === -1) return;
            if(key.endsWith("_ajxptype")) return;
            var typeKey = key + "_ajxptype";
            var parts = key.split("/");
            var parentName = parts.shift();
            var parentKey;
            while(parts.length > 0){
                if(!parentKey){
                    parentKey = treeKeys;
                }
                if(!parentKey[parentName]) {
                    parentKey[parentName] = {};
                }
                parentKey = parentKey[parentName];
                parentName = parts.shift();
            }
            var type = clientParams[typeKey];
            delete clientParams[typeKey];
            if(parentKey && !parentKey[parentName]) {
                if(type === "boolean"){
                    var v = clientParams[key];
                    parentKey[parentName] = (v === "true" || v === 1 || v === true );
                }else if(type === "integer" || type === "integer-bytes") {
                    parentKey[parentName] = parseInt(clientParams[key]);
                }else if(type && type.startsWith("group_switch:") && typeof clientParams[key] == "string"){
                    parentKey[parentName] = {group_switch_value:clientParams[key]};
                }else{
                    parentKey[parentName] = clientParams[key];
                }
            }else if(parentKey && type && type.startsWith('group_switch:')){
                parentKey[parentName]["group_switch_value"] = clientParams[key];
            }
            delete clientParams[key];
        });
        for(key in treeKeys){
            if(!treeKeys.hasOwnProperty(key)) continue;
            var treeValue = treeKeys[key];
            if(clientParams[key + '_ajxptype'] && clientParams[key + '_ajxptype'].indexOf('group_switch:') === 0
                && !treeValue['group_switch_value']){
                treeValue['group_switch_value'] = clientParams[key];
            }

            clientParams[key] = JSON.stringify(treeValue);
            clientParams[key+'_ajxptype'] = "text/json";

        }

        // Clean XXX_group_switch parameters
        for(var theKey in clientParams){
            if(!clientParams.hasOwnProperty(theKey)) continue;

            if(theKey.indexOf("/") == -1 && clientParams[theKey] && clientParams[theKey + "_ajxptype"] && clientParams[theKey + "_ajxptype"].startsWith("group_switch:")){
                if(typeof clientParams[theKey] == "string"){
                    clientParams[theKey] = JSON.stringify({group_switch_value:clientParams[theKey]});
                    clientParams[theKey + "_ajxptype"] = "text/json";
                }
            }
            if(clientParams.hasOwnProperty(theKey)){
                if(theKey.endsWith("_group_switch")){
                    delete clientParams[theKey];
                }
            }
        }

        return clientParams;
    }


}