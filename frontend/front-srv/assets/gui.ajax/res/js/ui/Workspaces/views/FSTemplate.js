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
import MainFilesList from './MainFilesList'
import EditionPanel from './EditionPanel'
import WelcomeTour from './WelcomeTour'
import {CellChatDetached} from './CellChat'
import MasterLayout from './MasterLayout'
import AppBar from './AppBar'
import WorkspacesList from "../wslist/WorkspacesList";
import {MUITour} from "./WelcomeMuiTour";
import {MultiColumnPanel} from "../detailpanes/MultiColumnPanel";

class FSTemplate extends React.Component {

    constructor(props){
        super(props);
        const {pydio} = props
        const uPref = (k, v) => {
            return pydio.user ? pydio.user.getLayoutPreference(k, v) : v
        }

        this.state = {
            infoPanelOpen: uPref('FSTemplate.infoPanelOpen', true), // open by default
            chatOpen: uPref('FSTemplate.chatOpen', false), // closed by default
            chatDetached: uPref('FSTemplate.chatDetached', true), // detached by default
            drawerOpen: false,
            searchFormState: {},
            searchView: false
        };
    }

    setSearchView() {
        const {pydio} = this.props
        const {searchView} = this.state;
        if(!searchView) {
            this.setState({searchViewTransition: true})
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
        this.setState({previousContext: null});
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
        }
        pydio.observe('context_changed', this._ctxObserver)
    }

    componentWillUnmount(){
        const {pydio} = this.props;
        pydio.stopObserving('context_changed', this._ctxObserver)
    }

    toggleAndStore(keyName) {
        const value = this.state[keyName]
        const newValue = !value;
        const {pydio} = this.props;
        this.setState({[keyName]: newValue}, ()=> {
            this.resizeAfterTransition()
            pydio.user.setLayoutPreference('FSTemplate.' + keyName, !!newValue)
        })
    }

    toggleRightPanel(name){
        this.toggleAndStore(name === 'chat' ? 'chatOpen' : 'infoPanelOpen')
    }


    resizeAfterTransition(){
        setTimeout(() => { window.dispatchEvent(new Event('resize')) }, 250);
        setTimeout(() => { window.dispatchEvent(new Event('resize')) }, 500);
    }

    infoPanelContentChange(numberOfCards){
        //this.setState({infoPanelOpen: (numberOfCards > 0)}, () => this.resizeAfterTransition())
    }

    openDrawer(event){
        event.stopPropagation();
        this.setState({drawerOpen: true});
    }

    render () {

        const {muiTheme, pydio} = this.props;

        const {breakpoint = 'md', userTheme} = muiTheme;
        const smallScreen = (breakpoint==='s'|| breakpoint==='xs'), xtraSmallScreen = (breakpoint === 'xs')

        const wTourEnabled = pydio.getPluginConfigs('gui.ajax').get('ENABLE_WELCOME_TOUR');
        const dm = pydio.getContextHolder();
        const searchView = dm.getContextNode() === dm.getSearchNode();
        const {searchViewTransition} = this.state;

        let headerHeight = 72;

        let showChatTab = (!pydio.getPluginConfigs("action.advanced_settings").get("GLOBAL_DISABLE_CHATS")) && !xtraSmallScreen;
        let showInfoPanel = !xtraSmallScreen;

        if(showChatTab){
            const repo = pydio.user.getRepositoriesList().get(pydio.user.activeRepository);
            if(repo && !repo.getOwner()){
                showChatTab = false;
            }
        }
        let {drawerOpen, infoPanelOpen, chatOpen, chatDetached=true, displayMode, sortingInfo} = this.state;

        let classes = ['vertical_fit', 'react-fs-template'];
        const styles = muiTheme.buildFSTemplate({headerHeight, searchView, rightColumnClosed: !infoPanelOpen, displayMode})

        // Making sure we only pass the style to the parent element
        const {style, ...props} = this.props;

        let tutorialComponent;
        const wTour = pydio.user.getLayoutPreference('WelcomeComponent.Pydio8.TourGuide.FSTemplate', false)
        const wtMUI = pydio.user.getLayoutPreference('WelcomeComponent.MUITour', false)
        if (wTourEnabled && !wTour){
            tutorialComponent = <WelcomeTour pydio={pydio}/>;
        } else if (userTheme === 'mui3' && wTour && !wtMUI) {
            tutorialComponent = <MUITour pydio={pydio}/>
        }

        let leftPanelProps = {
            headerHeight,
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
        let rightAdditionalTemplates;
        if(showChatTab && chatOpen && !chatDetached) {
            rightAdditionalTemplates = [{
                COMPONENT: "PydioWorkspaces.CellChatInfoCard",
                WEIGHT: -600,
                PROPS: {onRequestDetachPanel: () => this.toggleAndStore('chatDetached')}
            }];
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
                    chatOpen={chatOpen}
                    showInfoPanel={showInfoPanel}
                    infoPanelOpen={infoPanelOpen}
                    onToggleRightPanel={(p) => this.toggleRightPanel(p)}
                    onOpenDrawer={(e)=>this.openDrawer(e)}
                />
                <div style={styles.masterListContainer}>
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
                        style={styles.listStyle}
                    />
                    <MultiColumnPanel
                        {...props}
                        closed={!infoPanelOpen}
                        afterResize={()=>this.resizeAfterTransition()}
                        storageKey={searchView?'MultiColumn.SearchView':'MultiColumn.InfoPanel'}
                        dataModel={pydio.getContextHolder()}
                        onRequestClose={()=>{this.toggleRightPanel('info-panel')}}
                        onContentChange={this.infoPanelContentChange.bind(this)}
                        style={styles.infoPanel.masterStyle}
                        mainEmptyStateProps={{
                            iconClassName:'',
                            primaryTextId:'ajax_gui.infopanel.empty.select.file',
                            style:{minHeight: 180, backgroundColor: 'transparent', padding:'0 20px'}
                        }}
                        additionalTemplates={rightAdditionalTemplates}
                    />
                </div>
                {showChatTab && chatOpen && chatDetached &&
                    <CellChatDetached
                        pydio={pydio}
                        onRequestClose={()=> this.toggleRightPanel('chat')}
                        onRequestToInfoPanel={() => this.toggleAndStore('chatDetached')}
                    />
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
