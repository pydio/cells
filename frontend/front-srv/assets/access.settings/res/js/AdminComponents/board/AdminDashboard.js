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
import Pydio from 'pydio';
import {MessagesProviderMixin, PydioProviderMixin} from '../util/Mixins'
import AdminLeftNav from './AdminLeftNav'
import {AppBar, Paper} from 'material-ui'
import PydioDataModel from 'pydio/model/data-model'
const {UserWidget} = Pydio.requireLib('workspaces');
const {AsyncComponent} = Pydio.requireLib('boot');
import ResourcesManager from 'pydio/http/resources-manager'
import DOMUtils from 'pydio/util/dom'

const AdminDashboard = React.createClass({

    mixins:[MessagesProviderMixin, PydioProviderMixin],

    propTypes:{
        pydio: React.PropTypes.instanceOf(Pydio).isRequired
    },

    getInitialState: function(){
        const dm = this.props.pydio.getContextHolder();
        return {
            contextNode:dm.getContextNode(),
            selectedNodes:dm.getSelectedNodes(),
            contextStatus:dm.getContextNode().isLoaded(),
            openLeftNav: false,
            leftDocked: true,
        };
    },

    dmChangesToState: function(){
        const dm = this.props.pydio.getContextHolder();
        this.setState({
            contextNode:dm.getContextNode(),
            selectedNodes:dm.getSelectedNodes(),
            contextStatus:dm.getContextNode().isLoaded()
        });
        dm.getContextNode().observe("loaded", this.dmChangesToState);
        if(dm.getUniqueNode()){
            dm.getUniqueNode().observe("loaded", this.dmChangesToState);
        }
    },

    openEditor: function(node){
        this.openRightPane({
            COMPONENT:PydioComponents.ReactEditorOpener,
            PROPS:{
                node:node,
                registry:this.props.pydio.Registry,
                onRequestTabClose: this.closeRightPane,
                registerCloseCallback:this.registerRightPaneCloseCallback
            },
            CHILDREN:null
        });
    },

    openRightPane: function(serializedComponent){
        serializedComponent['PROPS']['registerCloseCallback'] = this.registerRightPaneCloseCallback;
        serializedComponent['PROPS']['closeEditorContainer'] = this.closeRightPane;
        // Do not open on another already opened
        if(this.state && this.state.rightPanel && this.state.rightPanelCloseCallback){
            if(this.state.rightPanelCloseCallback() === false){
                return;
            }
        }
        if(typeof serializedComponent.COMPONENT === 'string' || serializedComponent.COMPONENT instanceof String ){

            const [namespace, componentName] = serializedComponent.COMPONENT.split('.');
            ResourcesManager.loadClassesAndApply([namespace], function(){
                if(window[namespace] && window[namespace][componentName]){
                    const comp = window[namespace][componentName];
                    serializedComponent.COMPONENT = comp;
                    this.openRightPane(serializedComponent);
                }
            }.bind(this));

        }else{
            this.setState({ rightPanel:serializedComponent });
        }
    },

    registerRightPaneCloseCallback: function(callback){
        this.setState({rightPanelCloseCallback:callback});
    },

    closeRightPane:function(){
        if(this.state.rightPanelCloseCallback && this.state.rightPanelCloseCallback() === false){
            return false;
        }
        this.setState({rightPanel:null, rightPanelCloseCallback:null});
        return true;
    },

    componentDidMount: function(){
        const dm = this.props.pydio.getContextHolder();
        dm.observe("context_changed", this.dmChangesToState);
        dm.observe("selection_changed", this.dmChangesToState);
        // Monkey Patch Open Current Selection In Editor
        let monkeyObject = this.props.pydio.UI;
        if(this.props.pydio.UI.__proto__){
            monkeyObject = this.props.pydio.UI.__proto__;
        }
        monkeyObject.__originalOpenCurrentSelectionInEditor = monkeyObject.openCurrentSelectionInEditor;
        monkeyObject.openCurrentSelectionInEditor = function(dataModelOrNode){
            if(dataModelOrNode instanceof PydioDataModel){
                this.openEditor(dataModelOrNode.getUniqueNode());
            }else{
                this.openEditor(dataModelOrNode);
            }
        }.bind(this);
        this._bmObserver = function(){
            this.props.pydio.Controller.actions.delete("bookmark");
        }.bind(this);
        this.props.pydio.observe("actions_loaded", this._bmObserver);
        this._resizeObserver = this.computeLeftIsDocked.bind(this);
        DOMUtils.observeWindowResize(this._resizeObserver)
        this.computeLeftIsDocked();
    },

    componentWillUnmount: function(){
        const dm = this.props.pydio.getContextHolder();
        dm.stopObserving("context_changed", this.dmChangesToState);
        dm.stopObserving("selection_changed", this.dmChangesToState);
        // Restore Monkey Patch
        let monkeyObject = this.props.pydio.UI;
        if(this.props.pydio.UI.__proto__){
            monkeyObject = this.props.pydio.UI.__proto__;
        }
        monkeyObject.openCurrentSelectionInEditor = monkeyObject.__originalOpenCurrentSelectionInEditor;
        if(this._bmObserver){
            this.props.pydio.stopObserving("actions_loaded", this._bmObserver);
        }
        DOMUtils.stopObservingWindowResize(this._resizeObserver);
    },

    computeLeftIsDocked(){
        const w = DOMUtils.getViewportWidth();
        this.setState({leftDocked: w > 780});
    },

    routeMasterPanel: function(node, selectedNode){
        const path = node.getPath();
        if(!selectedNode) selectedNode = node;

        let dynamicComponent;
        if(node.getMetadata().get('component')){
            dynamicComponent = node.getMetadata().get('component');
        }else{
            return <div>No Component Found</div>;
        }
        const parts = dynamicComponent.split('.');
        const additionalProps = node.getMetadata().has('props') ? JSON.parse(node.getMetadata().get('props')) : {};
        return (
            <AsyncComponent
                pydio={this.props.pydio}
                namespace={parts[0]}
                componentName={parts[1]}
                dataModel={this.props.pydio.getContextHolder()}
                rootNode={node}
                currentNode={selectedNode}
                openEditor={this.openEditor}
                openRightPane={this.openRightPane}
                closeRightPane={this.closeRightPane}
                {...additionalProps}
            />);
    },

    backToHome: function(){
        //this.props.pydio.triggerRepositoryChange("homepage");
        window.open('https://pydio.com');
    },

    render: function(){
        const dm = this.props.pydio.getContextHolder();
        let params = this.props.pydio.Parameters;
        let img = ResourcesManager.resolveImageSource('white_logo.png');
        const logo = (
            <img
                className="custom_logo_image linked"
                src={img}
                title="Back to Home"
                width=""
                height=""
                style={{height: 40, width: 'auto', marginRight: 10}}
                onClick={this.backToHome}
            />
        );
        let rPanelContent;
        if(this.state.rightPanel){
            rPanelContent = React.createElement(this.state.rightPanel.COMPONENT, this.state.rightPanel.PROPS, this.state.rightPanel.CHILDREN);
        }
        const rightPanel = (
            <Paper zDepth={2} className={"paper-editor layout-fill vertical-layout" + (this.state.rightPanel?' visible':'')}>
                {rPanelContent}
            </Paper>
        );

        let appBarRight;
        if(this.props.iconElementRight){
            appBarRight = this.props.iconElementRight;
        }else{
            const style = {
                color: 'white',
                fontSize: 20,
                display:'flex',
                alignItems:'center',
                height: 50
            };
            appBarRight = (
                <div style={style}>{logo}</div>
            );

        }
        const userWidgetStyle = {
            height: 64,
            lineHeight: '16px',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            display:'flex',
            alignItems:'center'
        };
        const title = <UserWidget pydio={this.props.pydio} style={userWidgetStyle} hideActionBar={true} userTouchBackHome={true}/>

        let mainPanelStyle = {
            position: 'absolute',
            top: 64,
            left: this.state.leftDocked ? 256 : 0,
            right: 0,
            bottom: 0,
            backgroundColor:'#eceff1'
        };

        return (
            <div className="app-canvas">
                <AdminLeftNav
                    pydio={this.props.pydio}
                    dataModel={dm}
                    rootNode={dm.getRootNode()}
                    contextNode={dm.getContextNode()}
                    open={this.state.leftDocked || this.state.openLeftNav}
                />
                <AppBar
                    title={title}
                    zDepth={1}
                    showMenuIconButton={!this.state.leftDocked}
                    onLeftIconButtonTouchTap={() => {this.setState({openLeftNav: !this.state.openLeftNav})}}
                    iconElementRight={appBarRight}
                    style={this.state.leftDocked ? {paddingLeft: 0} : null}
                />
                <Paper zDepth={0} className="main-panel" style={mainPanelStyle}>
                    {this.routeMasterPanel(dm.getContextNode(), dm.getUniqueNode())}
                </Paper>
                {rightPanel}
            </div>
        )
    }
});

export {AdminDashboard as default}