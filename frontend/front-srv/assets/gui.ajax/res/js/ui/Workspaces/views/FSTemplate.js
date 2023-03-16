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
import Breadcrumb from './Breadcrumb'
import Textfit from 'react-textfit'
import {debounce} from 'lodash'
const {withSearch} = Pydio.requireLib('hoc')
import MainFilesList from './MainFilesList'
import EditionPanel from './EditionPanel'
import InfoPanel from '../detailpanes/InfoPanel'
import WelcomeTour from './WelcomeTour'
import CellChat from './CellChat'
import {FlatButton, Paper} from 'material-ui'
import AddressBookPanel from './AddressBookPanel'
import MasterLayout from './MasterLayout'
import {muiThemeable} from 'material-ui/styles'
import DOMUtils from 'pydio/util/dom'
import Color from "color";
const {ButtonMenu, Toolbar, ListPaginator} = Pydio.requireLib('components');
const {ThemedContainers:{IconButton}} = Pydio.requireLib('hoc');

import UnifiedSearchForm from "../search/components/UnifiedSearchForm";

class FSTemplate extends React.Component {

    constructor(props){
        super(props);

        let rState = 'info-panel';
        if(localStorage.getItem('pydio.layout.rightColumnState') !== undefined && localStorage.getItem('pydio.layout.rightColumnState')){
            rState = localStorage.getItem('pydio.layout.rightColumnState');
        }
        const closedToggle = localStorage.getItem('pydio.layout.infoPanelToggle') === 'closed';
        const closedInfo = localStorage.getItem('pydio.layout.infoPanelOpen') === 'closed';

        this.state = {
            infoPanelOpen: !closedInfo,
            infoPanelToggle: !closedToggle,
            drawerOpen: false,
            rightColumnState: rState,
            searchFormState: {},
            searchView: false
        };
    }

    setSearchView() {
        const {pydio} = this.props
        const {searchView} = this.state;
        if(!searchView) {
            this.setState({searchViewTransition: true, workspaceRootView: false})
        }
        const dm = pydio.getContextHolder();
        dm.setSelectedNodes([]);
        if(dm.getContextNode() !== dm.getSearchNode()){
            this.setState({previousContext: dm.getContextNode()})
        }
    }

    unsetSearchView(){
        const {pydio} = this.props;
        const {searchView} = this.state;
        if(searchView) {
            this.setState({searchViewTransition: true})
        }
        const dm = pydio.getContextHolder();
        const {previousContext} = this.state;
        dm.setSelectedNodes([]);
        const ctxNode = previousContext || dm.getRootNode()
        dm.setContextNode(ctxNode, true);
        this.setState({previousContext: null, workspaceRootView: ctxNode.isRoot()});
    }

    componentDidMount(){
        const {pydio} = this.props;
        this._resizeTrigger = debounce(()=>{
            window.dispatchEvent(new Event('resize'));
            this.setState({searchViewTransition: false})
        }, 350)
        this._ctxObserver = ()=>{
            const searchView = pydio.getContextHolder().getContextNode() === pydio.getContextHolder().getSearchNode()
            if(searchView !== this.state.searchView) {
                this.setState({searchView, searchViewTransition: true}, this._resizeTrigger)
            }
            const workspaceRootView = pydio.getContextHolder().getContextNode().isRoot();
            if(workspaceRootView !== this.state.workspaceRootView) {
                this.setState({workspaceRootView})
            }
        }
        pydio.observe('context_changed', this._ctxObserver)
    }

    componentWillUnmount(){
        const {pydio} = this.props;
        pydio.stopObserving('user_logged', this._themeObserver);
        pydio.stopObserving('context_changed', this._ctxObserver)
        DOMUtils.stopObservingWindowResize(this._resizer);
    }

    openRightPanel(name){
        const {rightColumnState} = this.state;
        if(name === rightColumnState){
            this.closeRightPanel();
            return;
        }
        this.setState({rightColumnState: name}, () => {
            let {infoPanelOpen} = this.state;
            if(name !== 'info-panel'){
                infoPanelOpen = true;
            }
            if(name !== 'advanced-search'){
                localStorage.setItem('pydio.layout.rightColumnState', name);
                localStorage.setItem('pydio.layout.infoPanelToggle', 'open');
                localStorage.setItem('pydio.layout.infoPanelOpen', infoPanelOpen?'open':'closed');
            }
            this.setState({infoPanelToggle:true, infoPanelOpen}, () => this.resizeAfterTransition())
        });
    }

    closeRightPanel() {
        const {rightColumnState} = this.state;
        if(rightColumnState === 'advanced-search'){
            // Reopen last saved state
            const rState = localStorage.getItem('pydio.layout.rightColumnState');
            if(rState !== undefined && rState && rState !== 'advanced-search'){
                this.openRightPanel(rState);
            } else {
                this.setState({infoPanelToggle: false}, () => {
                    this.resizeAfterTransition();
                });
            }
        } else {
            this.setState({infoPanelToggle: false}, () => {
                this.resizeAfterTransition();
            });
            localStorage.setItem('pydio.layout.rightColumnState', '');
            localStorage.setItem('pydio.layout.infoPanelToggle', 'closed');
        }
    }


    resizeAfterTransition(){
        setTimeout(() => {
            if(this.refs.list) {
                this.refs.list.resize();
            }
            if(!this.state.infoPanelToggle){
                this.setState({rightColumnState: null});
            }
        }, 300);
    }

    infoPanelContentChange(numberOfCards){
        this.setState({infoPanelOpen: (numberOfCards > 0)}, () => this.resizeAfterTransition())
    }

    openDrawer(event){
        event.stopPropagation();
        this.setState({drawerOpen: true});
    }

    render () {

        const {muiTheme} = this.props;
        const mobile = this.props.pydio.UI.MOBILE_EXTENSIONS;
        const {breakpoint = 'md'} = muiTheme;
        const smallScreen = (breakpoint==='s'|| breakpoint==='xs'), xtraSmallScreen = (breakpoint === 'xs')

        const {pydio} = this.props;
        const guiPrefs = pydio.user ? pydio.user.getPreference('gui_preferences', true) : [];
        const wTourEnabled = pydio.getPluginConfigs('gui.ajax').get('ENABLE_WELCOME_TOUR');
        const dm = pydio.getContextHolder();
        const searchView = dm.getContextNode() === dm.getSearchNode();
        const {searchViewTransition, workspaceRootView = dm.getContextNode().isRoot()} = this.state;

        // Load from user prefs
        const {headerLarge = true} = this.state;

        const headerBase = 72;
        let headerHeight = headerBase;
        if(workspaceRootView && !searchView && headerLarge) {
            //Toggle Header Height
            //headerHeight = 152
        }

        const styles = muiTheme.buildFSTemplate({headerHeight, searchView})

        const {infoPanelOpen, drawerOpen, infoPanelToggle, filesListDisplayMode} = this.state;
        let {rightColumnState} = this.state;

        let mainToolbars = [
            "change_main",
            "info_panel",
            "info_panel_share",
            "info_panel_edit_share",
        ];
        let mainToolbarsOthers = [
            "change",
            "other"
        ];

        let showChatTab = (!pydio.getPluginConfigs("action.advanced_settings").get("GLOBAL_DISABLE_CHATS"));
        let showAddressBook = (!pydio.getPluginConfigs("action.user").get("DASH_DISABLE_ADDRESS_BOOK")) && !smallScreen;
        let showInfoPanel = !xtraSmallScreen;
        if(showChatTab){
            const repo = pydio.user.getRepositoriesList().get(pydio.user.activeRepository);
            if(repo && !repo.getOwner()){
                showChatTab = false;
            }
        }
        if(!showChatTab && rightColumnState === 'chat') {
            rightColumnState = 'info-panel';
        }
        if(!showInfoPanel && rightColumnState === 'info-panel'){
            rightColumnState = '';
        }

        let classes = ['vertical_layout', 'vertical_fit', 'react-fs-template'];
        const thumbDisplay = (filesListDisplayMode && filesListDisplayMode.indexOf("grid-") === 0) || filesListDisplayMode === 'masonry' ;
        if((infoPanelOpen || thumbDisplay) && infoPanelToggle) {
            classes.push('info-panel-open');
            if(rightColumnState !== 'info-panel'){
                //classes.push('info-panel-open-lg');
            }
        }

        // Making sure we only pass the style to the parent element
        const {style, ...props} = this.props;

        let tutorialComponent;
        if (wTourEnabled && !guiPrefs['WelcomeComponent.Pydio8.TourGuide.FSTemplate']){
            tutorialComponent = <WelcomeTour ref="welcome" pydio={this.props.pydio}/>;
        }

        let newButtonProps = {
            buttonStyle:{...styles.flatButtonStyle, marginRight: 4, boxShadow: 0, background:'none'},
            buttonLabelStyle:{...styles.flatButtonLabelStyle, paddingRight: 8}
        };

        let leftPanelProps = {
            headerHeight:headerBase,
            style:styles.leftPanel.masterStyle,
            userWidgetProps: {
                color: styles.userWidgetStyle.color,
                mergeButtonInAvatar:true,
                popoverDirection:'left',
                actionBarStyle:{
                    marginTop:0
                },
                style:styles.userWidgetStyle
            },
            workspacesListProps:{
                ...styles.leftPanel.workspacesList
            }
        };

        const {searchTools, searchTools:{values, setValues, facets, activeFacets, toggleFacet,
            humanizeValues, limit, setLimit, searchLoading}} = this.props;
        let searchToolbar;

        if(searchView) {
            leftPanelProps.workspacesListProps = {
                ...leftPanelProps.workspacesListProps,
                searchView: true,
                values, setValues, searchLoading, facets, activeFacets, toggleFacet,
            };
            /*
            styles.appBarStyle = {
                ...styles.appBarStyle,
                marginLeft: 0
            }
            styles.listStyle = {
                ...styles.listStyle,
                marginLeft: 250
            }
             */
            const count = pydio.getContextHolder().getSearchNode().getChildren().size;
            let stLabel, stDisable = true;
            let labelStyle = {...styles.flatButtonLabelStyle}
            if(searchLoading) {
                stLabel = pydio.MessageHash['searchengine.searching'];
            } else if(count === 0) {
                stLabel = pydio.MessageHash['478'] // No results found
            } else if(count < limit) {
                stLabel = pydio.MessageHash['searchengine.results.foundN'].replace('%1', count)
            } else if(count === limit) {
                stDisable = false
                stLabel = pydio.MessageHash['searchengine.results.withMore'].replace('%1', limit)
            }
            if(stDisable){
                labelStyle = {...labelStyle, /*color: themeLight?'#616161':'white'*/}
            }
            searchToolbar = (
                <FlatButton
                    style={styles.flatButtonStyle}
                    labelStyle={labelStyle}
                    label={stLabel}
                    disabled={stDisable}
                    onClick={()=>{setLimit(limit+20)}}
                />
            )
        }

        return (
            <MasterLayout
                pydio={pydio}
                style={{...style, ...styles.masterStyle}}
                desktopStyle={searchView?{marginLeft: 0}:{}}
                classes={classes}
                tutorialComponent={tutorialComponent}
                drawerOpen={drawerOpen}
                leftPanelProps={leftPanelProps}
                onCloseDrawerRequested={()=>{this.setState({drawerOpen:false})}}
            >
                    <Paper zDepth={styles.appBarZDepth} style={styles.appBarStyle} rounded={false}>
                        {searchView &&
                        <div>
                            <IconButton
                                style={{width:56,height:56,padding:14, margin:'6px -6px 6px 6px'}}
                                iconClassName={"mdi mdi-arrow-left"}
                                iconStyle={{...muiTheme.iconButton.iconStyle, fontSize: 30}}
                                onClick={()=>this.unsetSearchView()}
                            />
                        </div>
                        }
                        <div id="workspace_toolbar" style={{flex:1, width:'calc(100% - 430px)', display:'flex'}}>
                            <span className="drawer-button" style={{marginLeft: 12, marginRight: -6}}>
                                <IconButton iconStyle={muiTheme.iconButton} iconClassName="mdi mdi-menu" onClick={this.openDrawer.bind(this)}/>
                            </span>
                            <div style={{flex: 1, overflow:'hidden'}}>
                                {searchView &&
                                    <Textfit
                                        mode="single" min={12} max={22}
                                        style={{...styles.breadcrumbStyle, padding: '0 20px', fontSize: 22, lineHeight:'44px', height:36}}>
                                        {pydio.MessageHash['searchengine.topbar.title']}{humanizeValues(values)}
                                    </Textfit>
                                }
                                {!searchView && <Breadcrumb {...props} startWithSeparator={false} rootStyle={styles.breadcrumbStyle}/>}
                                <div style={{height:32, paddingLeft: 20, alignItems:'center', display:'flex', overflow:'hidden'}}>
                                    {searchToolbar}
                                    {!searchView &&
                                        <ButtonMenu
                                            {...props}
                                            {...newButtonProps}
                                            id="create-button-menu"
                                            toolbars={["upload", "create"]}
                                            buttonTitle={this.props.pydio.MessageHash['198']}
                                            raised={true}
                                            secondary={true}
                                            controller={props.pydio.Controller}
                                            openOnEvent={'tutorial-open-create-menu'}
                                        />
                                    }
                                    <ListPaginator
                                        id="paginator-toolbar"
                                        style={{height: 23, borderRadius: 2, /*background: newButtonProps.buttonBackgroundColor,*/ marginRight: 5}}
                                        dataModel={props.pydio.getContextHolder()}
                                        smallDisplay={true}
                                        toolbarDisplay={true}
                                    />
                                    {!mobile &&
                                        <Toolbar
                                            {...props}
                                            id="main-toolbar"
                                            toolbars={mainToolbars}
                                            groupOtherList={mainToolbarsOthers}
                                            renderingType="button"
                                            toolbarStyle={{overflow:'hidden'}}
                                            flatButtonStyle={styles.flatButtonStyle}
                                            buttonStyle={styles.flatButtonLabelStyle}
                                        />
                                    }
                                    {mobile && <span style={{flex:1}}/>}
                                </div>
                            </div>
                        </div>
                        <div style={{display:'flex', alignItems:'center'}}>
                            <Toolbar
                                {...props}
                                id="display-toolbar"
                                toolbars={["display_toolbar"]}
                                renderingType="icon-font"
                                mergeItemsAsOneMenu={true}
                                mergedMenuIcom={"mdi mdi-settings"}
                                mergedMenuTitle={this.props.pydio.MessageHash['151']}
                                buttonStyle={styles.buttonsIconStyle}
                                flatButtonStyle={styles.buttonsStyle}
                            />
                            {!smallScreen &&
                            <UnifiedSearchForm
                                style={{flex: 1}}
                                active={searchView}
                                preventOpen={searchViewTransition}
                                pydio={pydio}
                                formStyles={styles.searchForm}
                                searchTools={searchTools}
                                onRequestOpen={()=>this.setSearchView()}
                                onRequestClose={()=>this.unsetSearchView()}
                            />
                            }
                            <div style={{margin:'0 10px', height: headerHeight, display:'none'}}/>
                            <div style={{display:'flex', paddingRight: 10}}>
                                {showInfoPanel &&
                                <IconButton
                                    iconClassName={"mdi mdi-information"}
                                    style={rightColumnState === 'info-panel' ? styles.activeButtonStyle : styles.buttonsStyle}
                                    iconStyle={rightColumnState === 'info-panel' ? styles.activeButtonIconStyle : styles.buttonsIconStyle}
                                    onClick={()=>{this.openRightPanel('info-panel')}}
                                    tooltip={pydio.MessageHash[rightColumnState === 'info-panel' ? '86':'341']}
                                />
                                }
                                {!searchView && showChatTab &&
                                <IconButton
                                    iconClassName={"mdi mdi-message-text"}
                                    style={rightColumnState === 'chat' ? styles.activeButtonStyle : styles.buttonsStyle}
                                    iconStyle={rightColumnState === 'chat' ? styles.activeButtonIconStyle : styles.buttonsIconStyle}
                                    onClick={()=>{this.openRightPanel('chat')}}
                                    tooltip={pydio.MessageHash[rightColumnState === 'chat' ? '86':'635']}
                                    tooltipPosition={"bottom-left"}
                                />
                                }
                                {!searchView && showAddressBook &&
                                    <IconButton
                                        iconClassName={"mdi mdi-account-card-details"}
                                        style={rightColumnState === 'address-book' ? styles.activeButtonStyle : styles.buttonsStyle}
                                        iconStyle={rightColumnState === 'address-book' ? styles.activeButtonIconStyle : styles.buttonsIconStyle}
                                        onClick={()=>{this.openRightPanel('address-book')}}
                                        tooltip={pydio.MessageHash[rightColumnState === 'address-book' ? '86':'592']}
                                        tooltipPosition={showChatTab?"bottom-center":"bottom-left"}
                                    />
                                }
                            </div>
                        </div>
                    </Paper>
                    <MainFilesList
                        ref="list"
                        key={searchView?"search-results":"files-list"}
                        pydio={pydio}
                        dataModel={pydio.getContextHolder()}
                        searchResults={searchView}
                        searchScope={values ? values.scope : null}
                        searchLoading={searchLoading}
                        onDisplayModeChange={(dMode) => {
                            this.setState({filesListDisplayMode: dMode});
                        }}
                        onScroll={({scrollTop}) => this.setState({headerLarge: scrollTop < 10})}
                        style={styles.listStyle}
                    />
                {rightColumnState === 'info-panel' &&
                    <InfoPanel
                        {...props}
                        dataModel={pydio.getContextHolder()}
                        onRequestClose={()=>{this.closeRightPanel()}}
                        onContentChange={this.infoPanelContentChange.bind(this)}
                        style={styles.infoPanel.masterStyle}
                        mainEmptyStateProps={thumbDisplay? {
                            iconClassName:'',
                            primaryTextId:'ajax_gui.infopanel.empty.select.file',
                            style:{minHeight: 180, backgroundColor: 'transparent', padding:'0 20px'}
                        }:null}
                    />
                }
                {rightColumnState === 'chat' &&
                    <CellChat pydio={pydio} style={styles.otherPanelsStyle} zDepth={0} onRequestClose={()=>{this.closeRightPanel()}}/>
                }

                {rightColumnState === 'address-book' &&
                    <AddressBookPanel pydio={pydio} style={styles.otherPanelsStyle} zDepth={0} onRequestClose={()=>{this.closeRightPanel()}}/>
                }

                <EditionPanel {...props}/>

            </MasterLayout>
        );


    }
}

FSTemplate = withSearch(FSTemplate, 'main', 'ws');
FSTemplate = muiThemeable()(FSTemplate);
FSTemplate.INFO_PANEL_WIDTH = 270

export {FSTemplate as default}
