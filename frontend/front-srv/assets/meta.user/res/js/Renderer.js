/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import {MenuItem} from 'material-ui'
import StarsField from "./fields/StarsField";
import SelectorField from "./fields/SelectorField";
import CssLabelsField, {getCssLabels} from "./fields/CssLabelsField";
import colorsFromString from "./hoc/colorsFromString";
import StarsForm from "./fields/StarsForm";
import SelectorForm from "./fields/SelectorForm";
import MetaClient from "./MetaClient";
import TagsCloud from "./fields/TagsCloud";
import {DateTimeField, DateTimeForm} from "./fields/DateTime";
import BooleanForm from "./fields/BooleanForm";
import {IntegerField, IntegerForm} from "./fields/Integer";

export default class Renderer{

    static renderStars(node, column){
        if(!node.getMetadata().get(column.name)){
            return null;
        }
        return <StarsField node={node} column={column} size="small"/>;
    }

    static renderBoolean(node, column){
        if(!node.getMetadata().get(column.name)){
            return null;
        }
        return <span><span className={"mdi mdi-check"} style={{color:'#4caf50'}}/> {column.label}</span>
    }

    static renderSelector(node, column){
        if(!node.getMetadata().get(column.name)){
            return null;
        }
        return <SelectorField node={node} column={column}/>;
    }

    static renderCSSLabel(node, column){
        if(!node.getMetadata().get(column.name)){
            return null;
        }
        return <CssLabelsField node={node} column={column}/>;
    }

    static renderTagsCloud(node, column){
        if(!node.getMetadata().get(column.name)){
            return null;
        }
        const tagStyle = {
            display:'inline-block',
            backgroundColor: '#E1BEE7',
            borderRadius: 6,
            height: 22,
            lineHeight: '22px',
            padding: '0 6px',
            color: '#9C27B0',
            fontWeight: 500,
            fontSize: 12,
            marginLeft: 2,
            marginRight: 6
        };
        const value = node.getMetadata().get(column.name);
        if(!value || !value.split) {
            return null;
        }
        return (<span>{value.split(',').map((tag, index) => {
            let sStyle = {...tagStyle, ...colorsFromString(tag)};
            if(index === value.split(',').length -1){
                sStyle = {...sStyle, marginRight: -4}
            }
            return <span style={sStyle}>{tag}</span>
        })}</span>)
    }

    static renderDate(node, column) {
        if(!node.getMetadata().get(column.name)){
            return null;
        }
        return <DateTimeField node={node} column={column} type={"date"}/>;
    }

    static renderInteger(node, column) {
        if(!node.getMetadata().get(column.name)){
            return null;
        }
        return <IntegerField node={node} column={column} inline={true}/>;
    }

    static formPanelStars(props){
        return <StarsForm {...props} search={true}/>;
    }

    static formPanelCssLabels(props, configs){

        const menuItems = Object.keys(getCssLabels()).map(function(id){
            let label = getCssLabels()[id];
            const lSpan = <span><span className="mdi mdi-label" style={{color: label.color, marginRight: 5}} />{label.label}</span>;
            return <MenuItem value={id} primaryText={lSpan}/>
        }.bind(this));

        return <SelectorForm {...props} menuItems={menuItems} search={!configs}/>;
    }

    static formPanelSelectorFilter(props, configs){

        const configsToItems = (metaConfigs, callback) => {
            let configs = metaConfigs.get(props.fieldname);
            let menuItems = [], keys = [], stepper, labels = {};
            if(configs && configs.data && configs.data.items){
                menuItems = configs.data.items.map((i) => {
                    keys.push(i.key);
                    labels[i.key] = i.value;
                    let pSpan = i.value;
                    if(i.color) {
                        pSpan = <span><span className={"mdi mdi-label"} style={{color: i.color, marginRight:5}}/>{i.value}</span>
                    }
                    return <MenuItem value={i.key} primaryText={pSpan}/>;
                });
            }
            if(configs && configs.data && configs.data.steps){
                stepper = true
            }
            callback(menuItems, keys, stepper, labels);
        }

        const itemsLoader = (callback) => {
            if(configs) {
                configsToItems(configs, callback);
            } else {
                MetaClient.getInstance().loadConfigs().then(metaConfigs => configsToItems(metaConfigs, callback))
            }
        };
        return <SelectorForm {...props} menuItems={[]} itemsLoader={itemsLoader} search={!configs}/>;
    }

    static formPanelTags(props, configs){
        return <TagsCloud {...props} editMode={true} search={!configs}/>;
    }

    static formPanelDate(props){
        return <DateTimeForm type={"date"} {...props} editMode={true} search={true}/>;
    }

    static formPanelBoolean(props){
        return <BooleanForm {...props} search={true}/>
    }

    static formPanelInteger(props) {
        return <IntegerForm {...props} search={true}/>
    }

    /**
     * Return renderer for a given metadata type
     * @param type
     * @return {(function(*): *)|*|(function(*, *): *)}
     */
    static typeFormRenderer(type) {
        switch (type) {
            case 'stars_rate':
                return Renderer.formPanelStars
            case 'css_label':
                return Renderer.formPanelCssLabels
            case 'choice':
                return Renderer.formPanelSelectorFilter
            case 'tags':
                return Renderer.formPanelTags
            case 'integer':
                return Renderer.formPanelInteger
            case 'boolean':
                return Renderer.formPanelBoolean
            case 'date':
                return Renderer.formPanelDate
            default:
                return null
        }
    }

    /**
     * Return renderer for inline display
     * @param type
     * @return {{renderer: ((function(*, *): (null|*))|*)}|{renderer: ((function(*, *): (null|*))|*), sortType: string}|null}
     */
    static typeColumnRenderer(type) {
        let out;
        switch (type) {
            case 'stars_rate':
                out = {renderComponent: Renderer.renderStars, sortType: 'number'}
                break
            case 'css_label':
                out = {renderComponent: Renderer.renderCSSLabel, sortType: 'string'}
                break
            case 'choice':
                out = {renderComponent: Renderer.renderSelector, sortType: 'string'}
                break
            case 'tags':
                out = {renderComponent: Renderer.renderTagsCloud, renderBlock: true, sortType: 'string'}
                break
            case 'integer':
                out = {renderComponent: Renderer.renderInteger, sortType: 'number'}
                break
            case 'boolean':
                out = {renderComponent: Renderer.renderBoolean, sortType: 'number'}
                break
            case 'date':
                out = {renderComponent: Renderer.renderDate, sortType: 'number'}
                break
            default:
                return {}
        }
        // Duplicate key
        if (out.renderComponent) {
            out.renderCell = out.renderComponent
        }
        return out;
    }

}