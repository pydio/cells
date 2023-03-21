import React from 'react';

import createReactClass from 'create-react-class';

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
import PropTypes from 'prop-types';

import Pydio from 'pydio';
import {MessagesProviderMixin, PydioProviderMixin} from '../util/Mixins'
import AdminLeftNav from './AdminLeftNav'
import {Paper} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import PydioDataModel from 'pydio/model/data-model'
import Observable from 'pydio/lang/observable'

const {AsyncComponent, TasksPanel} = Pydio.requireLib('boot');
const {ReactEditorOpener} = Pydio.requireLib('components');
import ResourcesManager from 'pydio/http/resources-manager'
import DOMUtils from 'pydio/util/dom'
import AdminStyles from "../styles/AdminStyles";
import { colors, getMuiTheme } from 'material-ui/styles';
import { MuiThemeProvider } from 'material-ui';

class LeftToggleListener extends Observable {
    constructor() {
        super();
        this.active = false;
        this.open = false;
    }

    update(){
        this.notify('update');
    }

    isOpen(){
        return !this.active || this.open;
    }

    isActive(){
        return this.active;
    }

    toggle(){
        this.open = !this.open;
        this.update();
    }

    setActive(b){
        this.active = b;
        this.update();
    }

    static getInstance(){
        if(!LeftToggleListener.__INSTANCE){
            LeftToggleListener.__INSTANCE = new LeftToggleListener();
        }
        return LeftToggleListener.__INSTANCE;
    }
}

let AdminDashboard = createReactClass({
    displayName: 'AdminDashboard',
    mixins:[MessagesProviderMixin, PydioProviderMixin],

    propTypes:{
        pydio: PropTypes.instanceOf(Pydio).isRequired
    },

    getInitialState(){
        const dm = this.props.pydio.getContextHolder();
        let showAdvanced;
        if(localStorage.getItem("cells.dashboard.advanced") !== null){
            showAdvanced = localStorage.getItem("cells.dashboard.advanced");
        }
        if(!showAdvanced && dm.getContextNode().getMetadata().get("advanced")){
            showAdvanced = true;
        }
        return {
            contextNode:dm.getContextNode(),
            selectedNodes:dm.getSelectedNodes(),
            contextStatus:dm.getContextNode().isLoaded(),
            openLeftNav: false,
            showAdvanced: showAdvanced,
        };
    },

    toggleAdvanced(){
        const {showAdvanced} = this.state;
        this.setState({showAdvanced: !showAdvanced});
        localStorage.setItem("cells.dashboard.advanced", !showAdvanced);
    },

    dmChangesToState(){
        const dm = this.props.pydio.getContextHolder();
        this.setState({
            contextNode:dm.getContextNode(),
            selectedNodes:dm.getSelectedNodes(),
            contextStatus:dm.getContextNode().isLoaded()
        });
        const {showAdvanced} = this.state;
        if(!showAdvanced && dm.getContextNode().getMetadata().get("advanced")){
            this.setState({showAdvanced: true});
        }
        dm.getContextNode().observe("loaded", this.dmChangesToState);
        if(dm.getUniqueNode()){
            dm.getUniqueNode().observe("loaded", this.dmChangesToState);
        }
    },

    openEditor(node){
        this.openRightPane({
            COMPONENT:ReactEditorOpener,
            PROPS:{
                node:node,
                registry:this.props.pydio.Registry,
                onRequestTabClose: this.closeRightPane,
                registerCloseCallback:this.registerRightPaneCloseCallback
            },
            CHILDREN:null
        });
    },

    openRightPane(serializedComponent){
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

    registerRightPaneCloseCallback(callback){
        this.setState({rightPanelCloseCallback:callback});
    },

    closeRightPane:function(){
        if(this.state.rightPanelCloseCallback && this.state.rightPanelCloseCallback() === false){
            return false;
        }
        this.setState({rightPanel:null, rightPanelCloseCallback:null});
        return true;
    },

    componentDidMount(){
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
        LeftToggleListener.getInstance().observe('update', ()=>{
            // Simple state change
            this.setState({
                toggleOpen: LeftToggleListener.getInstance().isOpen(),
                toggleActive: LeftToggleListener.getInstance().isActive(),
            });
        });
        this._resizeObserver = this.computeLeftIsDocked.bind(this);
        DOMUtils.observeWindowResize(this._resizeObserver);
        this.computeLeftIsDocked();
    },

    componentWillUnmount(){
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
        LeftToggleListener.getInstance().stopObserving('update');
        DOMUtils.stopObservingWindowResize(this._resizeObserver);
    },

    computeLeftIsDocked(){
        LeftToggleListener.getInstance().setActive(DOMUtils.getViewportWidth() <= 780);
    },

    routeMasterPanel(node, selectedNode){
        const {pydio} = this.props;
        if(!selectedNode) {
            selectedNode = node;
        }
        let dynamicComponent;
        if(node.getMetadata().get('component')){
            dynamicComponent = node.getMetadata().get('component');
        }else{
            return (
                <div style={{width: '100%',height: '100%', minHeight:500,display: 'flex',alignItems: 'center',justifyContent: 'center'}}>
                    <div style={{fontSize: 18, color: 'rgba(0,0,0,0.33)'}}>{pydio.MessageHash["466"]}</div>
                </div>
            );
        }
        const parts = dynamicComponent.split('.');
        const additionalProps = node.getMetadata().has('props') ? JSON.parse(node.getMetadata().get('props')) : {};
        return (
            <AsyncComponent
                pydio={pydio}
                namespace={parts[0]}
                componentName={parts[1]}
                dataModel={pydio.getContextHolder()}
                rootNode={node}
                currentNode={selectedNode}
                openEditor={this.openEditor}
                openRightPane={this.openRightPane}
                closeRightPane={this.closeRightPane}
                {...additionalProps}
                accessByName={(permissionName) => {
                    return (!additionalProps.accesses || additionalProps.accesses[permissionName] === true);
                }}
            />);
    },

    render(){
        const {showAdvanced, rightPanel} = this.state;
        const {pydio} = this.props;
        const dm = pydio.getContextHolder();

        let rPanelContent;
        if(rightPanel){
            rPanelContent = React.createElement(rightPanel.COMPONENT, rightPanel.PROPS, rightPanel.CHILDREN);
        }

        const theme = getMuiTheme({
            userTheme:'material',
            palette:{
                primary1Color:'#03a9f4',
                primary2Color:'#f57c00',
                accent1Color: '#f57c00',
                accent2Color: '#324a57',
                avatarsColor        : '#438db3',
                sharingColor        : '#4aceb0',
            }
        });
        const adminStyles = AdminStyles(theme.palette);

        let overlay = {visibility:'hidden', opacity:'0'};
        if(rightPanel){
            overlay = {visibility: 'visible', opacity: '1'};
        }
        overlay = {
            position:'absolute',
            transition:'visibility 0s, opacity 150ms linear',
            top: 0, right: 0, left: 0, bottom: 0,
            backgroundColor:'rgba(0,0,0,.54)',
            zIndex: 10,
            ...overlay
        };

        return (
            <MuiThemeProvider muiTheme={theme}>
                <div className="app-canvas">
                    <AdminLeftNav
                        pydio={this.props.pydio}
                        dataModel={dm}
                        rootNode={dm.getRootNode()}
                        contextNode={dm.getContextNode()}
                        open={LeftToggleListener.getInstance().isOpen()}
                        showAdvanced={showAdvanced}
                        toggleAdvanced={this.toggleAdvanced.bind(this)}
                    />
                    <TasksPanel pydio={pydio} mode={"absolute"}/>
                    <Paper zDepth={0} className="main-panel" style={{...adminStyles.body.mainPanel, left: LeftToggleListener.getInstance().isActive() ? 0 : 256}}>
                        {this.routeMasterPanel(dm.getContextNode(), dm.getUniqueNode())}
                    </Paper>
                    <div style={overlay}/>
                    <Paper zDepth={5} className={"paper-editor layout-fill vertical-layout" + (rightPanel?' visible':'')} style={{zIndex: 11, borderRadius: '4px 4px 0 0'}}>
                        {rPanelContent}
                    </Paper>
                </div>
            </MuiThemeProvider>
        )
    },
});

AdminDashboard = muiThemeable()(AdminDashboard);
export {AdminDashboard as default}
export {LeftToggleListener}