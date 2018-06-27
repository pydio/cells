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

const React = require('react')
const LangUtils = require('pydio/util/lang')

const ParametersPicker = React.createClass({

    propTypes:{
        allParameters:React.PropTypes.object.isRequired,
        allActions:React.PropTypes.object.isRequired,
        onSelection:React.PropTypes.func.isRequired,
        getMessage:React.PropTypes.func,
        actionsPrefix:React.PropTypes.string,
        parametersPrefix:React.PropTypes.string,
        initialSelection:React.PropTypes.object
    },

    getDefaultProps: function(){
        return {actionsPrefix:'[a] ',parametersPrefix:''};
    },

    getInitialState: function(){
        let s = {filter: null};
        if(this.props.initialSelection){
            s = LangUtils.mergeObjectsRecursive({filter:this.props.initialSelection.paramName}, this.props.initialSelection);
        }
        return s;
    },

    filter: function(event){
        this.setState({filter:event.target.value.toLowerCase()});
    },

    select:function(plugin, type, param, attributes){
        this.props.onSelection(plugin, type, param, attributes);
        this.setState({pluginName:plugin, type:type, paramName:param});
    },

    render: function(){

        var term = this.state.filter;

        var selection = this.state.paramName;
        var selectedPlugin = this.state.pluginName;
        var selectionType = this.state.type;

        var filter = function(name){
            if(!term) return true;
            return (name.toLowerCase().indexOf(term) !== -1);
        };

        var highlight = function(name){
            if(!term) return name;
            var pos = name.toLowerCase().indexOf(term);
            var start = name.substr(0, pos);
            var middle = name.substr(pos, term.length);
            var end = name.substr(pos + term.length);
            return <span>{start}<span className="highlight">{middle}</span>{end}</span>;
        };

        var entries = [];
        var allData = LangUtils.objectValues(LangUtils.mergeObjectsRecursive(this.props.allParameters, this.props.allActions));
        allData.map(function(plugin){
            var params = [];
            var pluginMatch = false;
            var pluginLabel = plugin.label || plugin.name;
            if(filter(pluginLabel) || filter(plugin.name)){
                pluginMatch = true;
                if(filter(pluginLabel)) {
                    pluginLabel = highlight(pluginLabel);
                } else if(filter(plugin.name)) {
                    pluginLabel = <span>{pluginLabel} ({highlight(plugin.name)})</span>;
                }
            }


            LangUtils.objectValues(plugin.params).concat(LangUtils.objectValues(plugin.actions)).map(function(param){
                var label = param.label || param.name;
                var prefix = '';
                if(param._type == 'action'){
                    if(global.pydio.MessageHash[label]) label = global.pydio.MessageHash[label];
                    prefix = this.props.actionsPrefix;
                }else if(this.props.parametersPrefix){
                    prefix = this.props.parametersPrefix;
                }
                var filterLabel = filter(label);
                var filterName = filter(param.name);
                if(filterLabel || filterName || pluginMatch){
                    var click = function(){this.select(plugin.name, param._type, param.name, param);}.bind(this);
                    var selected = ((selectedPlugin === '*' || selectedPlugin === plugin.name) && param._type == selectionType && selection == param.name);
                    var highlighted = label;
                    if(filterLabel){
                        highlighted = highlight(label);
                    }else if(filterName){
                        highlighted = <span>{label} ({highlight(param.name)}) </span>;
                    }
                    params.push(
                        <li
                            onClick={click}
                            className={(selected ? "selected ": "") + "parameters-param"}
                            key={plugin.name + '-'+ param._type + '-' + param.name}>{prefix} {highlighted}</li>);
                }
            }.bind(this));

            if(params.length){
                entries.push(<li className="parameters-plugin" key={plugin.name}>{pluginLabel}<ul>{params}</ul></li>);
            }
        }.bind(this));

        return (
            <div>
                <div className="picker-search-container">
                    <ReactMUI.TextField floatingLabelText={this.props.getMessage('13')} onChange={this.filter}/>
                </div>
                <div className="parameters-tree-scroller">
                    <ul className="parameters-tree">
                        {entries}
                    </ul>
                </div>
            </div>
        );

    }


});

export {ParametersPicker as default}