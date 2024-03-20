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
const {PromptValidators} = Pydio.requireLib('boot')
import Action from 'pydio/model/action'
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
import genUuid from 'uuid4'

const CurrentTemplateKey = 'FSTemplate'
const TemplatesKey = 'FSTemplatePresets'

class FSTemplate extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            ...this.stateFromPrefs(),
            drawerOpen: false,
            searchFormState: {},
            searchView: false
        };
    }

    stateFromPrefs() {
        const {pydio} = this.props
        const uPref = (k, v) => {
            return pydio.user ? pydio.user.getLayoutPreference(k, v) : v
        }
        return {
            infoPanelOpen: uPref('FSTemplate.infoPanelOpen', true), // open by default
            chatOpen: uPref('FSTemplate.chatOpen', false), // closed by default
            chatDetached: uPref('FSTemplate.chatDetached', true), // detached by default
        }
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
        this._prefObserver = ({path, value}) => {
            if(!path || path.indexOf(CurrentTemplateKey +'.') !== 0) {
                return
            }
            // If a template is currently in use, update it
            const presets = pydio.user.getLayoutPreference(TemplatesKey, [])
            const currents = presets.filter(p => p.current)
            if(!currents.length) {
                return
            }
            const current = currents[0]
            const newPayload = pydio.user.getLayoutPreference(CurrentTemplateKey)
            presets.forEach(p => {
                if(p.id === current.id) {
                    p.payload = newPayload
                }
            })
            pydio.user.setLayoutPreference(TemplatesKey, presets)
        };
        this._reloadPrefObserver = () => {
            this.setState(this.stateFromPrefs())
        }
        pydio.getController().updateGuiActions(this.getPydioActions());
        pydio.observe('context_changed', this._ctxObserver)
        pydio.observe('set_layout_preference', this._prefObserver)
        pydio.observe('reload_layout_preferences', this._reloadPrefObserver)
    }

    componentWillUnmount(){
        const {pydio} = this.props;
        pydio.stopObserving('context_changed', this._ctxObserver)
        pydio.stopObserving('set_layout_preference', this._prefObserver)
        pydio.stopObserving('reload_layout_preferences', this._reloadPrefObserver)
        this.getPydioActions(true).map(function(key){
            pydio.getController().deleteFromGuiActions(key);
        }.bind(this));
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



    buildLayoutActions() {
        //{name, icon_class, callback (), highlight ()}
        const {pydio} = this.props;
        if(!pydio.user) {
            return []
        }

        const save = (k, v) => pydio.user.setLayoutPreference(k, v)
        const labelPrompt = (defaultValue, submitValue) => {
            pydio.UI.openComponentInModal('PydioReactUI', 'PromptDialog', {
                dialogTitleId:'ajax_gui.layouts.prompt.save',
                fieldLabelId:'ajax_gui.layouts.prompt.save.field',
                validate:PromptValidators.Empty,
                defaultValue,
                submitValue
            });
        }

        const presets = [...pydio.user.getLayoutPreference(TemplatesKey, [])]
        const actions = presets.map(({id, label, current, payload}) => {
            const use =()=>{
                const newPresets = [...presets]
                newPresets.forEach(p => p.current = p.id === id)
                save(CurrentTemplateKey, payload)
                save(TemplatesKey, newPresets)
                pydio.notify('reload_layout_preferences')
            }

            if(current) {
                return {
                    name: label,
                    icon_class:'mdi mdi-check',
                    subMenu:[
                        {
                            text:pydio.MessageHash['ajax_gui.layouts.action.rename'],
                            iconClassName:'mdi mdi-view-dashboard-edit-outline',
                            payload:()=>{
                                labelPrompt((label, value) => {
                                    // update label in-place
                                    presets.forEach(p => {
                                        if(p.id === id) {
                                            p.label = value
                                        }
                                    })
                                    save(TemplatesKey, presets)
                                })
                            }
                        },
                        {
                            text:pydio.MessageHash['ajax_gui.layouts.action.remove'],
                            iconClassName:'mdi mdi-delete-outline',
                            payload:()=>{
                                save(TemplatesKey, [...presets.filter(p => p.id !== id)])
                            }
                        },
                    ]
                }
            } else {
                return {
                    name: label,
                    icon_class: 'mdi mdi-view-dashboard-outline',
                    callback: use
                }
            }
        })
        actions.push({
            name:pydio.MessageHash['ajax_gui.layouts.action.create'],
            icon_class:'mdi mdi-content-save',
            callback:() => {
                labelPrompt(pydio.MessageHash['ajax_gui.layouts.action.create.default'], (value) => {
                    const current = pydio.user.getLayoutPreference(CurrentTemplateKey)
                    const preset = {id:genUuid(), label:value, current: true, payload: current}
                    save(TemplatesKey, [...presets.map(p => {return {...p, current: false}}), preset])
                });
            }
        })
        return actions
    }

    getPydioActions(keysOnly = false) {
        if(keysOnly) {
            return ['manage_layouts_preferences']
        }
        const actions = new Map()
        const manageAction = new Action({
            name:'manage_layouts_preferences',
            icon_class:'mdi mdi-view-list',
            text_id:'ajax_gui.layouts.preferences',
            title_id:'ajax_gui.layouts.preferences.legend',
            text:Pydio.getMessages()['ajax_gui.layouts.preferences'],
            title:Pydio.getMessages()['ajax_gui.layouts.preferences.legend'],
            hasAccessKey:false,
            subMenu:true,
            subMenuUpdateImage:true,
            weight:500
        }, {
            selection:false,
            dir:true,
            actionBar:true,
            actionBarGroup:'display_toolbar',
            contextMenu:false,
            infoPanel:false
        }, {}, {}, {
            dynamicBuilder: this.buildLayoutActions.bind(this),
        })
        actions.set('manage_layouts_preferences', manageAction)
        return actions
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
                        storageKey={searchView?'FSTemplate.MultiColumn.SearchView':'FSTemplate.MultiColumn.InfoPanel'}
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
