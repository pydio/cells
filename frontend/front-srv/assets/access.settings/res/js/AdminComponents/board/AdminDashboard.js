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
import {AppBar, Paper, Toggle, FontIcon, IconButton, IconMenu, MenuItems} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import PydioDataModel from 'pydio/model/data-model'
const {UserWidget} = Pydio.requireLib('workspaces');
const {AsyncComponent, TasksPanel} = Pydio.requireLib('boot');
import ResourcesManager from 'pydio/http/resources-manager'
import DOMUtils from 'pydio/util/dom'

const styles = {
    appBar: {
        zIndex: 10,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        //backgroundColor:muiTheme.palette.primary1Color,
        color: 'white',
        display:'flex',
        alignItems:'center'
    },
    appBarTitle: {
        flex: 1,
        fontSize: 18,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    appBarButton: {
        padding: 14
    },
    appBarButtonIcon: {
        color: 'white',
        fontSize: 20
    },
    appBarLeftIcon: {
        color: 'white',
    },
    mainPanel : {
        position: 'absolute',
        top: 56,
        left: 256, // can be changed by leftDocked state
        right: 0,
        bottom: 0,
        backgroundColor:'#eceff1'
    },
    userWidget: {
        height: 56,
        lineHeight: '16px',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        display:'flex',
        alignItems:'center',
        width: 'auto',
        marginRight: 16
    }
};


let AdminDashboard = React.createClass({

    mixins:[MessagesProviderMixin, PydioProviderMixin],

    propTypes:{
        pydio: React.PropTypes.instanceOf(Pydio).isRequired
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
            leftDocked: true,
            showAdvanced: showAdvanced,
        };
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
        this._resizeObserver = this.computeLeftIsDocked.bind(this);
        DOMUtils.observeWindowResize(this._resizeObserver);
        this.computeLeftIsDocked();
        ResourcesManager.loadClass("SettingsBoards").then(c => {
            this.setState({searchComponent:{namespace:'SettingsBoards', componentName:'GlobalSearch'}});
        }).catch(e => {});
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
        DOMUtils.stopObservingWindowResize(this._resizeObserver);
    },

    computeLeftIsDocked(){
        const w = DOMUtils.getViewportWidth();
        this.setState({leftDocked: w > 780});
    },

    routeMasterPanel(node, selectedNode){
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
                accessByName={(permissionName) => {
                    return (!additionalProps.accesses || additionalProps.accesses[permissionName] === true);
                }}
            />);
    },

    backToHome(){
        //this.props.pydio.triggerRepositoryChange("homepage");
        window.open('https://pydio.com');
    },

    render(){
        const {showAdvanced, rightPanel, leftDocked, openLeftNav, searchComponent} = this.state;
        const {pydio, muiTheme} = this.props;
        const dm = pydio.getContextHolder();

        let rPanelContent;
        if(rightPanel){
            rPanelContent = React.createElement(rightPanel.COMPONENT, rightPanel.PROPS, rightPanel.CHILDREN);
        }
        let searchIconButton, leftIconButton, toggleAdvancedButton, aboutButton;

        // LEFT BUTTON
        let leftIcon, leftIconClick;
        if (leftDocked) {
            leftIcon = "mdi mdi-tune-vertical";
            leftIconClick = () => {
                dm.requireContextChange(dm.getRootNode());
            }
        } else {
            leftIcon = "mdi mdi-menu";
            leftIconClick = () => {
                this.setState({openLeftNav: !openLeftNav})
            };
        }
        leftIconButton = (
            <div style={{margin: '0 12px'}}>
                <IconButton iconClassName={leftIcon} onTouchTap={leftIconClick} iconStyle={styles.appBarLeftIcon}/>
            </div>
        );

        // SEARCH BUTTON
        if(searchComponent){
            searchIconButton = <AsyncComponent {...searchComponent} appBarStyles={styles} pydio={pydio}/>
        }

        toggleAdvancedButton = (
            <IconButton
                iconClassName={"mdi mdi-toggle-switch" + (showAdvanced ? "" : "-off")}
                style={styles.appBarButton}
                iconStyle={styles.appBarButtonIcon}
                tooltip={pydio.MessageHash['settings.topbar.button.advanced']}
                onTouchTap={() => {
                    this.setState({showAdvanced: !showAdvanced});
                    localStorage.setItem("cells.dashboard.advanced", !showAdvanced);
                }}
            />
        );

        aboutButton = (
            <IconButton
                iconClassName={"icomoon-cells"}
                onTouchTap={()=>{window.open('https://pydio.com')}}
                tooltip={pydio.MessageHash['settings.topbar.button.about']}
                style={styles.appBarButton}
                iconStyle={styles.appBarButtonIcon}
            />
        );

        const appBarStyle = {...styles.appBar, backgroundColor:muiTheme.palette.primary1Color};

        return (
            <div className="app-canvas">
                <AdminLeftNav
                    pydio={this.props.pydio}
                    dataModel={dm}
                    rootNode={dm.getRootNode()}
                    contextNode={dm.getContextNode()}
                    open={leftDocked || openLeftNav}
                    showAdvanced={showAdvanced}
                />
                <TasksPanel pydio={pydio} mode={"absolute"}/>
                <Paper zDepth={1} rounded={false} style={appBarStyle}>
                    {leftIconButton}
                    <span style={styles.appBarTitle}>{pydio.MessageHash['settings.topbar.title']}</span>
                    {searchIconButton}
                    {toggleAdvancedButton}
                    {aboutButton}
                    <UserWidget
                        pydio={pydio}
                        style={styles.userWidget}
                        hideActionBar={true}
                        displayLabel={false}
                        toolbars={["aUser", "user", "zlogin"]}
                        controller={pydio.getController()}
                    />
                </Paper>
                <Paper zDepth={0} className="main-panel" style={{...styles.mainPanel, left: leftDocked ? 256 : 0}}>
                    {this.routeMasterPanel(dm.getContextNode(), dm.getUniqueNode())}
                </Paper>
                <Paper zDepth={2} className={"paper-editor layout-fill vertical-layout" + (rightPanel?' visible':'')}>
                    {rPanelContent}
                </Paper>
            </div>
        )
    }
});

AdminDashboard = muiThemeable()(AdminDashboard);
export {AdminDashboard as default}