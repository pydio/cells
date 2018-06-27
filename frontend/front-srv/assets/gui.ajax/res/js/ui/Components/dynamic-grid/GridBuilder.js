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
const Pydio = require('pydio')
const {PydioContextConsumer, AsyncComponent} = Pydio.requireLib('boot')


let GridBuilder = React.createClass({

    propTypes:{
        namespaces          : React.PropTypes.array,
        onCreateCard        : React.PropTypes.func,
        onEditStatusChange  : React.PropTypes.func
    },

    getInitialState:function(){
        return {
            selectedIndex:0,
            availableWidgets:this.listAvailableWidgets()
        }
    },

    listAvailableWidgets:function(secondPass = false){
        var widgets = [];
        let additionalNamespaces = [];
        this.props.namespaces.map(function(ns){
            if(!global[ns]) {
                additionalNamespaces.push(ns);
                return;
            }
            for(var k in global[ns]){
                if(global[ns].hasOwnProperty(k)){
                    var widgetClass = global[ns][k];
                    if(widgetClass.hasBuilderFields && widgetClass.hasBuilderFields()){
                        widgets.push({reactClass:widgetClass, fullName:ns+'.'+widgetClass.displayName});
                    }
                }
            }
        });
        if(additionalNamespaces.length && !secondPass){
            ResourcesManager.loadClassesAndApply(additionalNamespaces, function(){
                this.setState({
                    availableWidgets:this.listAvailableWidgets(true)
                });
            }.bind(this));
        }
        return widgets;
    },

    onDropDownChange:function(event, index, item){
        var defaultValues={};
        if(index != 0){
            item.payload['reactClass'].getBuilderFields().map(function(f){
                if(f['default']) defaultValues[f.name] = f['default'];
            });
        }
        if(this.props.onEditStatusChange){
            this.props.onEditStatusChange((index != 0));
        }
        this.setState({
            selectedIndex:index,
            selectedWidget:item.payload,
            currentFormValues:defaultValues
        });
    },

    cancel:function(){
        if(this.props.onEditStatusChange){
            this.props.onEditStatusChange(false);
        }
        this.setState({selectedIndex:0});
    },

    onFormValueChange:function(newValues){
        this.setState({currentFormValues:newValues});
    },

    onFormSubmit:function(){
        var values = this.state.currentFormValues;
        var selectedWidget = this.state.selectedWidget;
        var title = (values.title?values.title:values.legend);
        if(!title) title = this.state.selectedWidget['reactClass'].builderDisplayName;
        this.props.onCreateCard({
            componentClass:selectedWidget.fullName,
            title:title,
            props:values
        });
        this.cancel();
    },

    resetLayout: function(){
        if(window.confirm(this.props.getMessage('home.51'))){
            this.props.onResetLayout();
        }
    },

    render:function(){

        const {getMessage} = this.props;

        var selectorItems = [{payload:0,text:getMessage('home.50')}].concat(
            this.state.availableWidgets.map(function(w, index){
                return {payload:w, text:w['reactClass'].builderDisplayName};
            })
        );

        var selector = (
            <ReactMUI.DropDownMenu
                menuItems={selectorItems}
                onChange={this.onDropDownChange}
                selectedIndex={this.state.selectedIndex}
                autoWidth={false}
                className="widget-type-selector"
            />
        );

        var form, add;
        if(this.state.selectedIndex != 0){
            var fields = this.state.selectedWidget['reactClass'].getBuilderFields();
            var defaultValues={};
            fields.map(function(f){
                if(f['default']) defaultValues[f.name] = f['default'];
            });
            if(this.state.currentFormValues){
                defaultValues = LangUtils.mergeObjectsRecursive(defaultValues, this.state.currentFormValues);
            }
            form =(
                <AsyncComponent
                    namespace="PydioForm"
                    componentName="FormPanel"
                    parameters={fields}
                    depth={-1}
                    values={defaultValues}
                    onChange={this.onFormValueChange}
                />
            );
            add = (
                <div style={{textAlign:'center', paddingBottom:100}}>
                    <ReactMUI.RaisedButton label={getMessage('home.52')} onClick={this.onFormSubmit}/>
                    &nbsp;<ReactMUI.RaisedButton label={getMessage('54', '')} onClick={this.cancel}/>
                </div>
            );
        }

        return (
            <ReactMUI.Paper
                {...this.props}
                zDepth={3}>
                <h3>{getMessage('home.53')}</h3>
                <div className="legend">
                    {getMessage('home.54')}
                    <br/>
                    {getMessage('home.55')}</div>
                {selector}
                {form}
                {add}
                <div style={{position:'absolute',bottom: 30,left: 10}}>
                    <ReactMUI.FlatButton disabled={(this.state.selectedIndex != 0)} label={getMessage('home.56')} secondary={true} onClick={this.resetLayout}/>
                </div>
            </ReactMUI.Paper>
        );
    }

});

GridBuilder = PydioContextConsumer(GridBuilder);
export {GridBuilder as default}