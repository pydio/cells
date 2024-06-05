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

import React from 'react';
import Pydio from 'pydio'
import createReactClass from 'create-react-class';
import {FlatButton, IconButton} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import Loader from './Loader'
import XMLUtils from 'pydio/util/xml'
import PropTypes from 'prop-types';
import LangUtils from 'pydio/util/lang'
import SitesParameters from "./SitesParameters";
const {Header, PaperEditorLayout, MessagesConsumerMixin, AdminStyles} = AdminComponents;
const {Manager, FormPanel, PydioHelper} = Pydio.requireLib('form')

/**
 * Editor for a given plugin. By default, displays documentation in a left column panel,
 * and plugin parameters as form cards on the right.
 * May take additionalPanes to be appended to the form cards.
 */
let PluginEditor = createReactClass({
    displayName: 'PluginEditor',
    mixins:[MessagesConsumerMixin],

    propTypes:{
        pluginId:PropTypes.string.isRequired,
        close:PropTypes.func,
        style:PropTypes.string,
        className:PropTypes.string,
        additionalPanes:PropTypes.shape({
            top:PropTypes.array,
            bottom:PropTypes.array
        }),
        docAsAdditionalPane:PropTypes.bool,
        additionalDescription:PropTypes.string,
        registerCloseCallback:PropTypes.func,
        onBeforeSave:PropTypes.func,
        onAfterSave:PropTypes.func,
        onRevert:PropTypes.func,
        onDirtyChange:PropTypes.func,
        accessByName:PropTypes.func
    },

    loadPluginData(plugId){

        const loader = Loader.getInstance(this.props.pydio);
        Promise.all([loader.loadPlugins(), loader.loadPluginConfigs(plugId)]).then(result => {
            const xml = result[0];
            const values = result[1];

            const xmlData = XMLUtils.XPathSelectSingleNode(xml, '/plugins/*[@id="'+plugId+'"]');
            const params = Manager.parseParameters(xmlData, "server_settings/global_param");
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
        const adminStyles = AdminStyles(this.props.muiTheme.palette);
        let props = adminStyles.props.header.flatButton;
        if(!dirty){
            props = adminStyles.props.header.flatButtonDisabled;
        }
        actions.push(<FlatButton primary={true} disabled={!dirty} label={this.context.getMessage('plugins.6')} onClick={this.revert} {...props}/>);
        actions.push(<FlatButton primary={true} disabled={!dirty} label={this.context.getMessage('plugins.5')} onClick={this.save} {...props}/>);
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

    customChecks(formValues) {
        const {pluginId, pydio} = this.props;
        if(pluginId === "core.uploader") {
            const partSize = parseInt(formValues['MULTIPART_UPLOAD_PART_SIZE']) || 0
            const multiple = 10 * 1024 * 1024 // 10MB
            if(partSize < multiple) {
                formValues['MULTIPART_UPLOAD_PART_SIZE'] = multiple
                pydio.UI.displayMessage('ERROR', pydio.MessageHash['settings.uploaders-chunk-size-warn-too-small'])
            } else if (partSize % multiple !== 0) {
                formValues['MULTIPART_UPLOAD_PART_SIZE'] = partSize + multiple - (partSize % multiple)
                pydio.UI.displayMessage('ERROR', pydio.MessageHash['settings.uploaders-chunk-size-warn-multiple'])
            }
            const queueSize = parseInt(formValues['MULTIPART_UPLOAD_QUEUE_SIZE']) || 0
            if(queueSize > 6) {
                formValues['MULTIPART_UPLOAD_QUEUE_SIZE'] = 6
            }
        }
        return formValues;
    },

    onChange(formValues, dirty){
        formValues = this.customChecks(formValues)
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
        var h = Manager.hasHelper(this.props.pluginId, paramName);
        if(!h && testPluginId){
            h = Manager.hasHelper(testPluginId, paramName);
        }
        return h;
    },

    showHelper(helperData, testPluginId){
        if(helperData){
            let plugId = this.props.pluginId;
            if(testPluginId && !Manager.hasHelper(plugId, helperData['name'])){
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

        const {closeEditor, additionalPanes, currentNode, accessByName, docAsAdditionalPane, onHeaderChange, pluginId, pydio} = this.props;
        const {dirty, mainPaneScrolled, label, documentation} = this.state;

        let addPanes = {top:[], bottom:[]};
        if(additionalPanes){
            addPanes.top = additionalPanes.top.slice();
            addPanes.bottom = additionalPanes.bottom.slice();
        }
        if(pluginId === 'core.pydio'){
            addPanes.bottom.push(
                <SitesParameters type={"sites"} pydio={pydio} m={this.context.getMessage}/>,
                <SitesParameters type={"externals"} pydio={pydio} m={this.context.getMessage}/>
            );
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
                    <h3>{this.context.getMessage('plugins.documentation')}</h3>
                    <div className="plugin-doc-pane" dangerouslySetInnerHTML={readDoc()}></div>
                </div>
            );
            addPanes.top.push(docPane);
        }

        let scrollingClassName = '';
        if(mainPaneScrolled){
            scrollingClassName = ' main-pane-scrolled';
        }
        const adminStyles = AdminStyles(this.props.muiTheme.palette);
        let bProps = adminStyles.props.header.flatButton;
        if(!dirty){
            bProps = adminStyles.props.header.flatButtonDisabled;
        }

        let actions = [];
        if(accessByName('Create')){
            if (closeEditor) {
                actions.push(PaperEditorLayout.actionButton(this.context.getMessage('plugins.6'), "mdi mdi-undo", () => this.revert(), !dirty))
                actions.push(PaperEditorLayout.actionButton(this.context.getMessage('plugins.5'), "mdi mdi-content-save", () => this.save(), !dirty))
            } else {
                actions.push(<FlatButton secondary={true} disabled={!dirty} label={this.context.getMessage('plugins.6')}
                                         onClick={this.revert.bind(this)} {...bProps}/>);
                actions.push(<FlatButton secondary={true} disabled={!dirty} label={this.context.getMessage('plugins.5')}
                                         onClick={this.save.bind(this)} {...bProps}/>);
            }
        }

        let titleLabel, titleIcon;
        if(currentNode){
            titleLabel = currentNode.getLabel();
            titleIcon = currentNode.getMetadata().get("icon_class");
        } else {
            titleLabel = label;
        }

        // Building  a form
        const contents = (
            <React.Fragment>
                <FormPanel
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
                    variant={"v2"}
                    variantShowLegend={true}
                />
                <PydioHelper
                    helperData={this.state?this.state.helperData:null}
                    close={this.closeHelper}
                />
                {adminStyles.formCss()}
            </React.Fragment>
        )

        if (closeEditor) {
            return (
                <PaperEditorLayout
                    title={titleLabel}
                    titleLeftIcon={"mdi mdi-google-circles-group"}
                    titleActionBar={<div>{actions}</div>}
                    closeAction={closeEditor}
                >
                    {contents}
                </PaperEditorLayout>
            )
        } else {
            return (
                <div
                    className={(this.props.className ? this.props.className + " " : "") + "main-layout-nav-to-stack vertical-layout plugin-board" + scrollingClassName}
                    style={this.props.style}>
                    {!onHeaderChange &&
                        <Header
                            title={titleLabel}
                            actions={actions}
                            scrolling={this.state && this.state.mainPaneScrolled}
                            icon={titleIcon}
                        />
                    }
                    {contents}
                </div>
            );
        }

    },
});

PluginEditor = muiThemeable()(PluginEditor)

export {PluginEditor as default}