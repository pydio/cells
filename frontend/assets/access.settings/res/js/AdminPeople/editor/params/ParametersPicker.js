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

import React from "react";
import LangUtils from "pydio/util/lang";
import XMLUtils from 'pydio/util/xml';
import {TextField} from 'material-ui';

class ParametersPicker extends React.Component {

    constructor(props){
        super({actionsPrefix:'[a] ',parametersPrefix:'', ...props});
        this.state = {filter: null};
        if(this.props.initialSelection){
            this.state = {filter:this.props.initialSelection.paramName, ...this.props.initialSelection};
        }
    }

    filter(event){
        this.setState({filter:event.target.value.toLowerCase()});
    }

    select(plugin, type, param, attributes){
        this.props.onSelection(plugin, type, param, attributes);
        this.setState({pluginName:plugin, type:type, paramName:param});
    }

    componentDidMount(){
        setTimeout( () => {
            this.refs.input.focus();
        }, 150);
    }

    render(){

        const {pydio, allParameters, allActions} = this.props;
        const term = this.state.filter;
        const selection = this.state.paramName;
        const selectedPlugin = this.state.pluginName;
        const selectionType = this.state.type;

        const filter = name => {
            if(!term) {
                return true;
            }
            return (name.toLowerCase().indexOf(term) !== -1);
        };

        const highlight = name => {
            if(!term) {
                return name;
            }
            const pos = name.toLowerCase().indexOf(term);
            const start = name.substr(0, pos);
            const middle = name.substr(pos, term.length);
            const end = name.substr(pos + term.length);
            return <span>{start}<span className="highlight">{middle}</span>{end}</span>;
        };

        let entries = [];
        let merge = {};
        Object.keys(allParameters).forEach(pName => {
            if(!merge[pName]) {
                merge[pName] = {name:pName, label:pName, actions:[], params:[]};
            }
            merge[pName].params.push(...allParameters[pName]);
        });
        Object.keys(allActions).forEach(pName => {
            if(!merge[pName]) {
                merge[pName] = {name:pName, label:pName, actions:[], params:[]};
            }
            merge[pName].actions.push(...allActions[pName]);
        });


        const allData = LangUtils.objectValues(merge);

        allData.map((plugin) => {
            let params = [];
            let pluginMatch = false;
            let pluginLabel = plugin.label || plugin.name;
            if(filter(pluginLabel) || filter(plugin.name)){
                pluginMatch = true;
                if(filter(pluginLabel)) {
                    pluginLabel = highlight(pluginLabel);
                } else if(filter(plugin.name)) {
                    pluginLabel = <span>{pluginLabel} ({highlight(plugin.name)})</span>;
                }
            }


            plugin.params.concat(plugin.actions).map((param) =>  {
                const name = param.action || param.parameter;
                let label = param.label || name;
                let prefix = '';
                if(param.action){
                    label = XMLUtils.XPathGetSingleNodeText(param.xmlNode, "gui/@text") || label;
                    prefix = this.props.actionsPrefix;
                }else {
                    label = param.xmlNode.getAttribute("label") || label;
                    if(this.props.parametersPrefix){
                        prefix = this.props.parametersPrefix;
                    }
                }
                if(pydio.MessageHash[label]) {
                    label = pydio.MessageHash[label];
                }
                const filterLabel = filter(label);
                const filterName = filter(name);
                if(filterLabel || filterName || pluginMatch){
                    const click = () => this.select(plugin.name, param.action?'action':'parameter', name, param);
                    const selected = ((selectedPlugin === '*' || selectedPlugin === plugin.name) && param[selectionType] && selection === name);
                    let highlighted = label;
                    if(filterLabel){
                        highlighted = highlight(label);
                    }else if(filterName){
                        highlighted = <span>{label} ({highlight(name)}) </span>;
                    }
                    params.push(
                        <li
                            onClick={click}
                            className={(selected ? "selected ": "") + "parameters-param"}
                            key={plugin.name + '-'+ (param.action?'action':'parameter') + '-' + name}>{prefix} {highlighted}</li>);
                }
            });

            if(params.length){
                entries.push(<li className="parameters-plugin" key={plugin.name}>{pluginLabel}<ul>{params}</ul></li>);
            }
        });

        return (
            <div>
                <div style={{padding: '0 24px', borderBottom: '1px solid #e0e0e0'}}>
                    <TextField ref={"input"} floatingLabelText={this.props.getMessage('13')} onChange={this.filter.bind(this)} fullWidth={true} underlineShow={false}/>
                </div>
                <div className="parameters-tree-scroller">
                    <ul className="parameters-tree">
                        {entries}
                    </ul>
                </div>
            </div>
        );

    }

}

export {ParametersPicker as default}