/*
 * Copyright 2024 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React, {useEffect, useState} from 'react'
import XMLUtils from 'pydio/util/xml'

function fromRegistry(pydio){

    let panelsNodes = XMLUtils.XPathSelectNodes(pydio.getXmlRegistry(), 'client_configs/component_config[@component="InfoPanel"]/infoPanel');
    let panels = new Map();
    panelsNodes.forEach(function(node){
        if(!node.getAttribute('reactComponent')) {
            return;
        }
        let mimes = node.getAttribute('mime').split(',');
        let component = node.getAttribute('reactComponent');
        mimes.map(function(mime){
            if(!panels.has(mime)) {
                panels.set(mime, []);
            }
            panels.get(mime).push({
                COMPONENT:component,
                THEME:node.getAttribute('theme'),
                ATTRIBUTES:node.getAttribute('attributes'),
                WEIGHT:node.getAttribute('weight') ? parseInt(node.getAttribute('weight')) : 0
            });
        });
    });
    return panels;

}

function selectionToTemplates(dataModel, refTemplates){

    //const {dataModel} = this.props;
    let selection = dataModel.getSelectedNodes();
    if((!selection || !selection.length) && dataModel.getContextNode() === dataModel.getRootNode()){
        selection = [dataModel.getContextNode()];
    }
    let primaryMime, templates = [], uniqueNode;
    let data = {};
    if(!selection || selection.length < 1){
        primaryMime = 'no_selection';
    }else if(selection.length > 1){
        primaryMime = 'generic_multiple';
        data.nodes = selection;
    }else {
        uniqueNode = selection[0];
        if(uniqueNode.isLeaf()){
            primaryMime = 'generic_file';
        }else{
            primaryMime = 'generic_dir';
            if(dataModel.getRootNode() === uniqueNode){
                primaryMime = 'ajxp_root_node';
            }
        }
        data.node = uniqueNode;
    }
    if(refTemplates.has(primaryMime)){
        templates = templates.concat(refTemplates.get(primaryMime));
    }
    if(uniqueNode){
        refTemplates.forEach(function(list, mimeName){
            if(mimeName === primaryMime) {
                return;
            }
            if(mimeName.indexOf('meta:') === 0 && uniqueNode.getMetadata().has(mimeName.substr(5))){
                templates = templates.concat(list);
            }else if(uniqueNode.getAjxpMime() === mimeName){
                templates = templates.concat(list);
            }
        });
    }
    /*
    if(this.props.onContentChange && !initTemplates){
        this.props.onContentChange(templates.length);
    }
    if(this.props.onTemplatesChange) {
        this.props.onTemplatesChange(templates)
    }
    */
    templates.sort(function(a, b){
        return (a.WEIGHT === b.WEIGHT ? 0 : ( a.WEIGHT > b.WEIGHT ? 1 : -1));
    });
    return {TEMPLATES:templates, DATA:data};
}


const useTemplates = ({pydio, dataModel, onContentChange}) => {
    const [templates, setTemplates] = useState(fromRegistry(pydio))
    const [activeTemplates, setActiveTemplates] = useState(selectionToTemplates(dataModel, templates))

    useEffect(() => {
        if(onContentChange) {
            onContentChange(activeTemplates.TEMPLATES.length)
        }
    }, [activeTemplates])

    useEffect(()=>{
        const selObserver = () => {
            setActiveTemplates(selectionToTemplates(dataModel, templates))
        }
        const configObserver = () => {
            const newTemplates = fromRegistry(pydio)
            setTemplates(newTemplates)
            setActiveTemplates(selectionToTemplates(dataModel, newTemplates))
        }
        pydio.observe("actions_refreshed", selObserver );
        pydio.observe("selection_reloaded", selObserver );
        pydio.observe("registry_loaded", configObserver );

        return () => {
            pydio.stopObserving("actions_refreshed", selObserver);
            pydio.observe("selection_reloaded", selObserver);
            pydio.stopObserving("registry_loaded", configObserver);

        }
    }, [])

    return {templates, activeTemplates}
}

export {useTemplates}