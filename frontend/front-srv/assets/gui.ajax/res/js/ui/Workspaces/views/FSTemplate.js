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
import {debounce} from 'lodash'
const {withSearch} = Pydio.requireLib('hoc')
import {muiThemeable} from 'material-ui/styles'
import {Resizable} from "re-resizable";
import MainFilesList from './MainFilesList'
import EditionPanel from './EditionPanel'
import InfoPanel from '../detailpanes/InfoPanel'
import WelcomeTour from './WelcomeTour'
import CellChat from './CellChat'
import AddressBookPanel from './AddressBookPanel'
import MasterLayout from './MasterLayout'
import AppBar from './AppBar'
import WorkspacesList from "../wslist/WorkspacesList";
import {MUITour} from "./WelcomeMuiTour";

class FSTemplate extends React.Component {

    constructor(props){
        super(props);

        let rState = 'info-panel';
        if(localStorage.getItem('pydio.layout.rightColumnState') !== undefined && localStorage.getItem('pydio.layout.rightColumnState')){
            rState = localStorage.getItem('pydio.layout.rightColumnState');
        }
        const closedToggle = localStorage.getItem('pydio.layout.infoPanelToggle') === 'closed';
        const closedInfo = localStorage.getItem('pydio.layout.infoPanelOpen') === 'closed';

        let defaultResizerWidth = 250;
        if(localStorage.getItem('pydio.layout.rightColumnWidth')){
            const p = parseInt(localStorage.getItem('pydio.layout.rightColumnWidth'))
            if(p > 0) {
                defaultResizerWidth = p
            }
        }


        this.state = {
            infoPanelOpen: !closedInfo,
            infoPanelToggle: !closedToggle,
            drawerOpen: false,
            rightColumnState: rState,
            rightColumnWidth: defaultResizerWidth,
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
        const resizeTrigger = debounce(()=>{
            window.dispatchEvent(new Event('resize'));
            this.setState({searchViewTransition: false})
        }, 350)
        this._ctxObserver = ()=>{
            const searchView = pydio.getContextHolder().getContextNode() === pydio.getContextHolder().getSearchNode()
            if(searchView !== this.state.searchView) {
                this.setState({searchView, searchViewTransition: true}, resizeTrigger)
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
        pydio.stopObserving('context_changed', this._ctxObserver)
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
            localStorage.setItem('pydio.layout.rightColumnState', name);
            localStorage.setItem('pydio.layout.infoPanelToggle', 'open');
            localStorage.setItem('pydio.layout.infoPanelOpen', infoPanelOpen?'open':'closed');
            this.setState({infoPanelToggle:true, infoPanelOpen}, () => this.resizeAfterTransition())
        });
    }

    closeRightPanel() {
        this.setState({infoPanelToggle: false}, () => {
            this.resizeAfterTransition();
        });
        localStorage.setItem('pydio.layout.rightColumnState', '');
        localStorage.setItem('pydio.layout.infoPanelToggle', 'closed');
    }


    resizeAfterTransition(){
        if(!this.state.infoPanelToggle){
            this.setState({rightColumnState: null});
        }
        setTimeout(() => { window.dispatchEvent(new Event('resize')) }, 250);
        setTimeout(() => { window.dispatchEvent(new Event('resize')) }, 500);
    }

    infoPanelContentChange(numberOfCards){
        this.setState({infoPanelOpen: (numberOfCards > 0)}, () => this.resizeAfterTransition())
    }

    openDrawer(event){
        event.stopPropagation();
        this.setState({drawerOpen: true});
    }

    render () {

        const {muiTheme, pydio} = this.props;

        const {breakpoint = 'md', userTheme} = muiTheme;
        const smallScreen = (breakpoint==='s'|| breakpoint==='xs'), xtraSmallScreen = (breakpoint === 'xs')

        const guiPrefs = pydio.user ? pydio.user.getPreference('gui_preferences', true) : {};
        const wTourEnabled = pydio.getPluginConfigs('gui.ajax').get('ENABLE_WELCOME_TOUR');
        const dm = pydio.getContextHolder();
        const searchView = dm.getContextNode() === dm.getSearchNode();
        const {searchViewTransition, workspaceRootView = dm.getContextNode().isRoot()} = this.state;

        // Header Size FX
        const {headerLarge = true} = this.state;
        const headerBase = 72;
        let headerHeight = headerBase;
        if(workspaceRootView && !searchView && headerLarge) {
            //Toggle Header Height
            //headerHeight = 152
        }

        let showChatTab = (!pydio.getPluginConfigs("action.advanced_settings").get("GLOBAL_DISABLE_CHATS")) && !xtraSmallScreen;
        let showAddressBook = (!pydio.getPluginConfigs("action.user").get("DASH_DISABLE_ADDRESS_BOOK")) && !smallScreen;
        let showInfoPanel = !xtraSmallScreen;

        if(showChatTab){
            const repo = pydio.user.getRepositoriesList().get(pydio.user.activeRepository);
            if(repo && !repo.getOwner()){
                showChatTab = false;
            }
        }
        let {drawerOpen, rightColumnState, rightColumnWidth, displayMode, sortingInfo} = this.state;
        let rightColumnClosed = false;

        if(!showChatTab && rightColumnState === 'chat') {
            rightColumnState = 'info-panel';
        }
        if(!showInfoPanel && rightColumnState === 'info-panel'){
            rightColumnState = '';
        }

        let classes = ['vertical_fit', 'react-fs-template'];
        if(!rightColumnState || xtraSmallScreen) {
            rightColumnClosed = true

        }
        const styles = muiTheme.buildFSTemplate({headerHeight, searchView, rightColumnClosed, displayMode})

        // Making sure we only pass the style to the parent element
        const {style, ...props} = this.props;

        let tutorialComponent;
        if (wTourEnabled && !guiPrefs['WelcomeComponent.Pydio8.TourGuide.FSTemplate']){
            tutorialComponent = <WelcomeTour pydio={pydio}/>;
        } else if (userTheme === 'mui3' && guiPrefs['WelcomeComponent.Pydio8.TourGuide.FSTemplate'] && !guiPrefs['WelcomeComponent.MUITour']) {
            tutorialComponent = <MUITour pydio={pydio}/>
        }

        let leftPanelProps = {
            headerHeight:headerBase,
            style:styles.leftPanel.masterStyle,
            railPanelStyle:styles.leftPanel.railPanelStyle,
            closed: searchView || smallScreen,
            drawerOpen,
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

        const {searchTools, searchTools:{values, empty, searchLoading}} = this.props;

        if(searchView) {
            leftPanelProps.workspacesListProps = {
                ...leftPanelProps.workspacesListProps,
                searchTools,
                searchView: true
            };
        }

        if(muiTheme.userTheme!=='mui3'){
            styles.searchForm.textField = {color:'white'}
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
                <AppBar
                    pydio={pydio}
                    muiTheme={muiTheme}
                    styles={styles}

                    headerHeight={headerHeight}
                    sortingInfo={displayMode!=='detail'&&displayMode!=='masonry'?sortingInfo:null}
                    searchView={searchView}
                    searchViewTransition={searchViewTransition}
                    searchTools={searchTools}
                    onUpdateSearchView={(u) => u?this.setSearchView():this.unsetSearchView()}

                    showChatTab={showChatTab}
                    showInfoPanel={showInfoPanel}
                    showAddressBook={showAddressBook}
                    rightColumnState={rightColumnState}
                    onOpenRightPanel={(p) => this.openRightPanel(p)}

                    onOpenDrawer={(e)=>this.openDrawer(e)}

                />

                <div style={{display:'flex', flex: 1, overflow:'hidden'}}>
                    {searchView &&
                        <WorkspacesList
                            className={"left-panel"}
                            pydio={pydio}
                            showTreeForWorkspace={pydio.user?pydio.user.activeRepository:false}
                            {...leftPanelProps.workspacesListProps}
                        />
                    }
                    <MainFilesList
                        ref="list"
                        key={searchView?"search-results":"files-list"}
                        pydio={pydio}
                        dataModel={pydio.getContextHolder()}
                        searchResults={searchView}
                        searchScope={values ? values.scope : null}
                        searchLoading={searchLoading}
                        searchEmpty={empty}
                        onDisplayModeChange={(dMode) => {
                            this.setState({displayMode: dMode});
                        }}
                        onSortingInfoChange={(si) => {
                            const {sortingInfo={}} = this.state;
                            if(sortingInfo.attribute !== si.attribute || sortingInfo.direction !== si.direction) {
                                this.setState({sortingInfo: si})
                            }
                        }}
                        onScroll={({scrollTop}) => this.setState({headerLarge: scrollTop < 10})}
                        style={styles.listStyle}
                    />
                    <Resizable
                        enable={{ top:false, right:false, bottom:false, left:!rightColumnClosed, topRight:false, bottomRight:false, bottomLeft:false, topLeft:false }}
                        style={{transition: 'width 550ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'}}
                        handleStyles={{left:{width: 6, left: 0}}}
                        size={{width:rightColumnClosed?0:rightColumnWidth, height: '100%'}}
                        onResizeStop={(e, direction, ref, d)=>{
                            const newWidth = rightColumnWidth+d.width
                            this.setState({rightColumnWidth:newWidth})
                            localStorage.setItem('pydio.layout.rightColumnWidth', newWidth+'')
                            this.resizeAfterTransition()
                        }}
                    >
                        {rightColumnState === 'info-panel' &&
                            <InfoPanel
                                {...props}
                                dataModel={pydio.getContextHolder()}
                                onRequestClose={()=>{this.closeRightPanel()}}
                                onContentChange={this.infoPanelContentChange.bind(this)}
                                style={styles.infoPanel.masterStyle}
                                mainEmptyStateProps={{
                                    iconClassName:'',
                                    primaryTextId:'ajax_gui.infopanel.empty.select.file',
                                    style:{minHeight: 180, backgroundColor: 'transparent', padding:'0 20px'}
                                }}
                            />
                        }
                        {rightColumnState === 'chat' &&
                            <CellChat pydio={pydio} style={styles.otherPanelsStyle} zDepth={0} onRequestClose={()=>{this.closeRightPanel()}}/>
                        }
                        {rightColumnState === 'address-book' &&
                            <AddressBookPanel pydio={pydio} style={styles.otherPanelsStyle} zDepth={0} onRequestClose={()=>{this.closeRightPanel()}}/>
                        }
                    </Resizable>
                </div>

                <EditionPanel {...props}/>

            </MasterLayout>
        );

    }
}

FSTemplate = withSearch(FSTemplate, 'main', 'ws');
FSTemplate = muiThemeable()(FSTemplate);
FSTemplate.INFO_PANEL_WIDTH = 270

export {FSTemplate as default}
