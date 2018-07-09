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
import {RaisedButton, FlatButton} from 'material-ui'
import Loader from './Loader'
import XMLUtils from 'pydio/util/xml'
import LangUtils from 'pydio/util/lang'

/**
 * Editor for a given plugin. By default, displays documentation in a left column panel,
 * and plugin parameters as form cards on the right.
 * May take additionalPanes to be appended to the form cards.
 */
const PluginEditor = React.createClass({

    mixins:[AdminComponents.MessagesConsumerMixin],

    propTypes:{
        pluginId:React.PropTypes.string.isRequired,
        close:React.PropTypes.func,
        style:React.PropTypes.string,
        className:React.PropTypes.string,
        additionalPanes:React.PropTypes.shape({
            top:React.PropTypes.array,
            bottom:React.PropTypes.array
        }),
        docAsAdditionalPane:React.PropTypes.bool,
        additionalDescription:React.PropTypes.string,
        registerCloseCallback:React.PropTypes.func,
        onBeforeSave:React.PropTypes.func,
        onAfterSave:React.PropTypes.func,
        onRevert:React.PropTypes.func,
        onDirtyChange:React.PropTypes.func
    },


    loadPluginData(plugId){

        const loader = Loader.getInstance(this.props.pydio);
        Promise.all([loader.loadPlugins(), loader.loadPluginConfigs(plugId)]).then(result => {
            const xml = result[0];
            const values = result[1];

            const xmlData = XMLUtils.XPathSelectSingleNode(xml, '/plugins/*[@id="'+plugId+'"]');
            console.log(xmlData);
            const params = PydioForm.Manager.parseParameters(xmlData, "server_settings/global_param");

            let documentation = XMLUtils.XPathSelectSingleNode(xmlData, "//plugin_doc");
            let enabledAlways = false;
            const label = xmlData.getAttribute("label");
            const description = xmlData.getAttribute("description");
            try{enabledAlways = xmlData.getAttribute("enabled") === 'always';}catch (e){}
            this.setState({
                loaded: true,
                parameters:params,
                values:values,
                originalValues:LangUtils.deepCopy(values),
                documentation:documentation,
                enabledAlways:enabledAlways,
                dirty:false,
                label:label,
                description:description
            });

            if(this.props.registerCloseCallback){
                this.props.registerCloseCallback(() => {
                    if(this.state && this.state.dirty && !confirm(this.context.getMessage('19','role_editor'))){
                        return false;
                    }
                });
            }

        });

    },

    componentWillReceiveProps(nextProps){
        if(nextProps.pluginId !== this.props.pluginId){
            this.loadPluginData(nextProps.pluginId);
            this.setState({values:{}});
        }
    },

    getInitialState(){

        this.loadPluginData(this.props.pluginId);

        return {
            loaded:false,
            parameters:[],
            values:{},
            documentation:'',
            dirty:false,
            label:'',
            docOpen:false
        };
    },

    externalSetDirty(){
        this.setState({dirty:true});
    },

    onChange(formValues, dirty){
        this.setState({dirty:dirty, values:formValues});
        if(this.props.onDirtyChange){
            this.props.onDirtyChange(dirty, formValues);
        }
    },

    save(){
        Loader.getInstance(this.props.pydio).savePluginConfigs(this.props.pluginId, this.state.values, (newValues) => {
            this.setState({dirty:false});
            if(this.props.onAfterSave){
                this.props.onAfterSave(newValues);
            }
        });
    },

    revert(){
        this.setState({dirty:false, values:this.state.originalValues});
        if(this.props.onRevert){
            this.props.onRevert(this.state.originalValues);
        }
    },

    parameterHasHelper(paramName, testPluginId){
        paramName = paramName.split('/').pop();
        var h = PydioForm.Manager.hasHelper(this.props.pluginId, paramName);
        if(!h && testPluginId){
            h = PydioForm.Manager.hasHelper(testPluginId, paramName);
        }
        return h;
    },

    showHelper(helperData, testPluginId){
        if(helperData){
            let plugId = this.props.pluginId;
            if(testPluginId && !PydioForm.Manager.hasHelper(plugId, helperData['name'])){
                helperData['pluginId'] = testPluginId;
            }else{
                helperData['pluginId'] = plugId;
            }
            helperData['updateCallback'] = this.helperUpdateValues.bind(this);
        }
        this.setState({helperData:helperData});
    },

    closeHelper(){
        this.setState({helperData:null});
    },

    /**
     * External helper can pass a full set of values and update them
     * @param newValues
     */
    helperUpdateValues(newValues){
        this.onChange(newValues, true);
    },

    toggleDocPane(){
        this.setState({docOpen:!this.state.docOpen});
    },

    monitorMainPaneScrolling(event){
        if(event.target.className.indexOf('pydio-form-panel') === -1){
            return;
        }
        const scroll = event.target.scrollTop;
        const newState = (scroll > 5);
        const currentScrolledState = (this.state && this.state.mainPaneScrolled);
        if(newState !== currentScrolledState){
            this.setState({mainPaneScrolled:newState});
        }
    },

    render(){

        let addPanes = {top:[], bottom:[]};
        if(this.props.additionalPanes){
            addPanes.top = this.props.additionalPanes.top.slice();
            addPanes.bottom = this.props.additionalPanes.bottom.slice();
        }
        let closeButton;
        if(this.props.closeEditor){
            closeButton = <RaisedButton label={this.context.getMessage('86','')} onTouchTap={this.props.closeEditor}/>
        }

        let doc = this.state.documentation;
        if(doc && this.props.docAsAdditionalPane){
            doc = doc.firstChild.nodeValue.replace('<p><ul', '<ul').replace('</ul></p>', '</ul>').replace('<p></p>', '');
            doc = doc.replace('<img src="', '<img style="width:90%;" src="plugins/' + this.props.pluginId + '/');
            const readDoc = () => {
                return {__html:doc};
            };
            const docPane = (
                <div className={"plugin-doc" + (this.state.docOpen?' plugin-doc-open':'')}>
                    <h3>Documentation</h3>
                    <div className="plugin-doc-pane" dangerouslySetInnerHTML={readDoc()}></div>
                </div>
            );
            addPanes.top.push(docPane);
        }

        let scrollingClassName = '';
        if(this.state && this.state.mainPaneScrolled){
            scrollingClassName = ' main-pane-scrolled';
        }
        let actions = [];
        actions.push(<FlatButton secondary={true} disabled={!this.state.dirty} label={this.context.getMessage('plugins.6')} onTouchTap={this.revert}/>);
        actions.push(<FlatButton secondary={true} disabled={!this.state.dirty} label={this.context.getMessage('plugins.5')} onTouchTap={this.save}/>);
        actions.push(closeButton);

        let icon;
        // Building  a form
        return (
            <div className={(this.props.className?this.props.className+" ":"") + "main-layout-nav-to-stack vertical-layout plugin-board" + scrollingClassName} style={this.props.style}>
                <AdminComponents.Header title={this.state.label} actions={actions} scrolling={this.state && this.state.mainPaneScrolled} icon={icon}/>
                <PydioForm.FormPanel
                    ref="formPanel"
                    className="row-flex"
                    parameters={this.state.parameters}
                    values={this.state.values}
                    onChange={this.onChange}
                    disabled={false}
                    additionalPanes={addPanes}
                    tabs={this.props.tabs}
                    setHelperData={this.showHelper}
                    checkHasHelper={this.parameterHasHelper}
                    onScrollCallback={this.monitorMainPaneScrolling}
                />
                <PydioForm.PydioHelper
                    helperData={this.state?this.state.helperData:null}
                    close={this.closeHelper}
                />
            </div>
        );


    }
});

export {PluginEditor as default}