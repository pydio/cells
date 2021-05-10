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
        return <span>Yes</span>
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
            borderRadius: '3px 10px 10px 3px',
            height: 16,
            lineHeight: '17px',
            padding: '0 10px 0 5px',
            color: '#9C27B0',
            fontWeight: 500,
            fontSize: 12,
            marginRight: 6
        };
        const value = node.getMetadata().get(column.name);
        if(!value || !value.split) {
            return null;
        }
        return <span>{value.split(',').map(tag => <span style={{...tagStyle, ...colorsFromString(tag)}}>{tag}</span>)}</span>
    }

    static renderDate(node, column) {
        if(!node.getMetadata().get(column.name)){
            return null;
        }
        return <DateTimeField node={node} column={column} type={"date"}/>;
    }

    static renderDateTime(node, column) {
        if(!node.getMetadata().get(column.name)){
            return null;
        }
        return <DateTimeField node={node} column={column} type={"date-time"}/>;
    }

    static renderTime(node, column) {
        if(!node.getMetadata().get(column.name)){
            return null;
        }
        return <DateTimeField node={node} column={column} type={"time"}/>;
    }

    static formPanelStars(props){
        return <StarsForm {...props}/>;
    }

    static formPanelCssLabels(props){

        const menuItems = Object.keys(getCssLabels()).map(function(id){
            let label = getCssLabels()[id];
            const lSpan = <span><span className="mdi mdi-label" style={{color: label.color, marginRight: 5}} />{label.label}</span>;
            return <MenuItem value={id} primaryText={lSpan}/>
        }.bind(this));

        return <SelectorForm {...props} menuItems={menuItems}/>;
    }

    static formPanelSelectorFilter(props){

        const itemsLoader = (callback) => {
            MetaClient.getInstance().loadConfigs().then(metaConfigs => {
                let configs = metaConfigs.get(props.fieldname);
                let menuItems = [];
                if(configs && configs.data){
                    configs.data.forEach(function(value, key){
                        menuItems.push(<MenuItem value={key} primaryText={value}/>);
                    });
                }
                callback(menuItems);
            })
        };

        return <SelectorForm {...props} menuItems={[]} itemsLoader={itemsLoader}/>;
    }

    static formPanelTags(props){
        return <TagsCloud {...props} editMode={true}/>;
    }

    static formPanelDate(props){
        return <DateTimeForm type={"date"} {...props} editMode={true}/>;
    }

    static formPanelBoolean(props){
        return <BooleanForm {...props}/>
    }

}