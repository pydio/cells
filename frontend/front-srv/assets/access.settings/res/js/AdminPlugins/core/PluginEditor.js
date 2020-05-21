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
import {RaisedButton, FlatButton, IconButton, FontIcon} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import Loader from './Loader'
import XMLUtils from 'pydio/util/xml'
import LangUtils from 'pydio/util/lang'

/**
 * Editor for a given plugin. By default, displays documentation in a left column panel,
 * and plugin parameters as form cards on the right.
 * May take additionalPanes to be appended to the form cards.
 */
let PluginEditor = React.createClass({

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
        onDirtyChange:React.PropTypes.func,
        accessByName:React.PropTypes.func
    },


    loadPluginData(plugId){

        const loader = Loader.getInstance(this.props.pydio);
        Promise.all([loader.loadPlugins(), loader.loadPluginConfigs(plugId)]).then(result => {
            const xml = result[0];
            const values = result[1];

            const xmlData = XMLUtils.XPathSelectSingleNode(xml, '/plugins/*[@id="'+plugId+'"]');
            const params = PydioForm.Manager.parseParameters(xmlData, "server_settings/global_param");
            // Set Defaults
            params.forEach((param) => {
                if(values[param.name] === undefined && param['default']) {
                    values[param.name] = param['default'];
                }
            });

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
        if(nextProps.pluginId && nextProps.pluginId !== this.props.pluginId){
            this.loadPluginData(nextProps.pluginId);
            this.setState({values:{}});
        }
    },

    computeButtons(){
        const {dirty} = this.state;
        const actions = [];
        const adminStyles = AdminComponents.AdminStyles(this.props.muiTheme.palette);
        let props = adminStyles.props.header.flatButton;
        if(!dirty){
            props = adminStyles.props.header.flatButtonDisabled;
        }
        actions.push(<FlatButton primary={true} disabled={!dirty} label={this.context.getMessage('plugins.6')} onTouchTap={this.revert} {...props}/>);
        actions.push(<FlatButton primary={true} disabled={!dirty} label={this.context.getMessage('plugins.5')} onTouchTap={this.save} {...props}/>);
        return actions;
    },

    componentDidMount(){
        const {onHeaderChange} = this.props;
        if(onHeaderChange) {
            onHeaderChange({buttons: this.computeButtons()});
        }
    },

    getInitialState(){

        const {pluginId} = this.props;
        if(pluginId){
            this.loadPluginData(pluginId);
        }

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

    setDirty(value){
        const {onHeaderChange} = this.props;
        this.setState({dirty: value}, ()=>{
            if(onHeaderChange) {
                onHeaderChange({buttons: this.computeButtons()});
            }
        })
    },

    externalSetDirty(){
        this.setDirty(true);
    },

    onChange(formValues, dirty){
        this.setState({values:formValues});
        this.setDirty(dirty);
        if(this.props.onDirtyChange){
            this.props.onDirtyChange(dirty, formValues);
        }
    },

    save(){
        Loader.getInstance(this.props.pydio).savePluginConfigs(this.props.pluginId, this.state.values, (newValues) => {
            this.setDirty(false);
            if(this.props.onAfterSave){
                this.props.onAfterSave(newValues);
            }
        });
    },

    revert(){
        this.setState({values:this.state.originalValues});
        this.setDirty(false);
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

        const {closeEditor, additionalPanes, currentNode, accessByName, docAsAdditionalPane, onHeaderChange} = this.props;
        const {dirty, mainPaneScrolled, label, documentation} = this.state;

        let addPanes = {top:[], bottom:[]};
        if(additionalPanes){
            addPanes.top = additionalPanes.top.slice();
            addPanes.bottom = additionalPanes.bottom.slice();
        }

        let doc = documentation;
        if(doc && docAsAdditionalPane){
            doc = doc.firstChild.nodeValue.replace('<p><ul', '<ul').replace('</ul></p>', '</ul>').replace('<p></p>', '');
            doc = doc.replace('<img src="', '<img style="width:90%;" src="plug/' + this.props.pluginId + '/');
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
        if(mainPaneScrolled){
            scrollingClassName = ' main-pane-scrolled';
        }
        const adminStyles = AdminComponents.AdminStyles(this.props.muiTheme.palette);
        let bProps = adminStyles.props.header.flatButton;
        if(!dirty){
            bProps = adminStyles.props.header.flatButtonDisabled;
        }

        let actions = [];
        if(accessByName('Create')){
            if (closeEditor) {
                actions.push(<IconButton iconClassName={"mdi mdi-undo"}
                                         iconStyle={{color: dirty ? 'white' : 'rgba(255,255,255,.5)'}} disabled={!dirty}
                                         tooltip={this.context.getMessage('plugins.6')} onTouchTap={this.revert}/>);
                actions.push(<IconButton iconClassName={"mdi mdi-content-save"}
                                         iconStyle={{color: dirty ? 'white' : 'rgba(255,255,255,.5)'}} disabled={!dirty}
                                         tooltip={this.context.getMessage('plugins.5')} onTouchTap={this.save}/>);
                actions.push(<IconButton iconClassName={"mdi mdi-close"} iconStyle={{color: 'white'}}
                                         tooltip={this.context.getMessage('86', '')} onTouchTap={closeEditor}/>);
            } else {
                actions.push(<FlatButton secondary={true} disabled={!dirty} label={this.context.getMessage('plugins.6')}
                                         onTouchTap={this.revert} {...bProps}/>);
                actions.push(<FlatButton secondary={true} disabled={!dirty} label={this.context.getMessage('plugins.5')}
                                         onTouchTap={this.save} {...bProps}/>);
            }
        } else if(closeEditor){
            actions.push(<IconButton iconClassName={"mdi mdi-close"} iconStyle={{color: 'white'}}
                                     tooltip={this.context.getMessage('86', '')} onTouchTap={closeEditor}/>);
        }

        let titleLabel, titleIcon;
        if(currentNode){
            titleLabel = currentNode.getLabel();
            titleIcon = currentNode.getMetadata().get("icon_class");
        } else {
            titleLabel = label;
        }

        // Building  a form
        return (
            <div className={(this.props.className?this.props.className+" ":"") + "main-layout-nav-to-stack vertical-layout plugin-board" + scrollingClassName} style={this.props.style}>
                {!onHeaderChange && <AdminComponents.Header title={titleLabel} actions={actions} scrolling={this.state && this.state.mainPaneScrolled} icon={titleIcon} editorMode={!!closeEditor}/>}
                <PydioForm.FormPanel
                    ref="formPanel"
                    className="row-flex"
                    parameters={this.state.parameters}
                    values={this.state.values}
                    onChange={this.onChange}
                    disabled={!accessByName('Create')}
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
                {adminStyles.formCss()}
            </div>
        );


    }
});

PluginEditor = muiThemeable()(PluginEditor)

export {PluginEditor as default}