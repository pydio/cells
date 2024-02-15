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
import PropTypes from 'prop-types';
import Pydio from 'pydio'
const {withVerticalScroll, ModernTextField} = Pydio.requireLib('hoc');
import WorkspaceEntry from './WorkspaceEntry'
import Repository from 'pydio/model/repository'
import ResourcesManager from 'pydio/http/resources-manager'
import {FontIcon, IconButton, IconMenu, MenuItem, FlatButton, Subheader} from 'material-ui'
const {muiThemeable} = require('material-ui/styles');
import Color from 'color'
import Facets from "../search/components/Facets";
import SearchSorter from "../search/components/SearchSorter";
const {ThemedContainers:{Popover}} = Pydio.requireLib('hoc');

class Entries extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            toggleFilter: false,
            filterValue: ''
        };
    }

    computePagination(entries){
        if (!entries || !entries.length) {
            return {use: false}
        }
        const pageSize = 15;
        if (entries.length <= pageSize) {
            return {use: false}
        }
        let {page} = this.state;
        const {activeWorkspace} = this.props;
        if(!page) {
            page = 1;
            if(activeWorkspace){
                const wsIndex = entries.map(ws => ws.getId()).indexOf(activeWorkspace);
                if(wsIndex > -1) {
                    // Select page that shows active workspace
                    page = Math.floor(wsIndex / pageSize) + 1;
                }
            }
        }
        const max = Math.ceil(entries.length / pageSize);
        const sliceStart = (page - 1) * pageSize;
        const sliceEnd = Math.min((page) * pageSize, entries.length);
        let pages = [];
        for (let i = 1; i <= max; i ++) {
            pages.push(i);
        }
        return {
            use: true,
            sliceStart,
            sliceEnd,
            total: entries.length,
            pages,
            page,
            pageSize,
        }
    }

    renderPagination(pagination){
        const {titleStyle} = this.props;
        const {page, pages, sliceStart, sliceEnd, total} = pagination;
        const chevStyles = {style:{width: 36, height: 36, padding:6}, iconStyle:{color:titleStyle.color}};
        return (
            <div style={{display:'flex', backgroundColor:'rgba(0, 0, 0, 0.03)', color:titleStyle.color, alignItems:'center', justifyContent:'center', fontWeight:400}}>
                <IconButton iconClassName={"mdi mdi-chevron-left"} disabled={page === 1} onClick={() => this.setState({page:page-1})} {...chevStyles}/>
                <div>{sliceStart+1}-{sliceEnd} of {total}</div>
                <IconButton iconClassName={"mdi mdi-chevron-right"} disabled={page === pages.length} onClick={() => this.setState({page:page+1})} {...chevStyles}/>
            </div>
        );
    }


    render(){
        const {title, entries=[], filterHint, workspaceEntryStyler, titleStyle, pydio, createAction, createActionEntry,
            activeWorkspace, palette, buttonStyles, emptyState, className, showOwner,
            searchView, values, setValues, searchLoading, listSettings} = this.props;
        const {toggleFilter, filterValue} = this.state;

        const filterFunc = (t, f, ws)=> (!t || !f || ws.getLabel().toLowerCase().indexOf(f.toLowerCase()) >= 0);

        let wss = entries.filter((ws) => filterFunc(toggleFilter, filterValue, ws));
        const pagination = this.computePagination(wss);
        if(pagination.use){
            wss = wss.slice(pagination.sliceStart, pagination.sliceEnd);
        }
        let uniqueResult;
        if(toggleFilter && filterValue && wss.length === 1 && wss[0].getId() !== activeWorkspace){
            uniqueResult = wss[0];
        }

        return (
            <div className={className}>
                {!toggleFilter &&
                    <div key="shared-title" className="section-title" style={titleStyle}>
                        <span style={{cursor:'pointer'}} title={filterHint} onClick={()=>{this.setState({toggleFilter: true})}}>
                            {title}
                            {entries.length > 0 && <span style={{fontSize: 12, opacity: '0.4',marginLeft: 3}} className={"mdi mdi-filter"}/>}
                        </span>
                        {listSettings}
                        {createAction}
                    </div>
                }
                {toggleFilter &&
                    <div key="shared-title" className="section-title filter-active" style={{...titleStyle, paddingLeft: 12, paddingRight: 8, textTransform: 'none', transition:'none'}}>
                        <ModernTextField
                            focusOnMount={true}
                            fullWidth={true}
                            style={{marginTop: -16, marginBottom: -16, top: -1}}
                            hintText={filterHint}
                            hintStyle={{fontWeight: 400}}
                            inputStyle={{fontWeight: 400, color:palette.primary1Color, backgroundColor:'rgba(0,0,0,.03)'}}
                            value={filterValue}
                            onChange={(e,v) => {this.setState({filterValue:v})}}
                            onBlur={()=>{setTimeout(()=>{if(!filterValue) this.setState({toggleFilter:false})}, 150)}}
                            onKeyPress={(ev) =>  {
                                if(ev.key === 'Enter' && uniqueResult){
                                    if(searchView) {
                                        let scope = uniqueResult.getSlug()
                                        if(scope !== 'all' && scope !== 'previous_context'){
                                            scope += '/'
                                        }
                                        setValues({...values, scope});
                                    } else {
                                        pydio.triggerRepositoryChange(uniqueResult.getId());
                                    }
                                    this.setState({filterValue:'', toggleFilter: false});
                                }
                            }}
                        />
                        {uniqueResult &&
                            <div style={{...buttonStyles.button, right: 28, lineHeight:'24px', fontSize:20, opacity: 0.5}}>
                                <span className={"mdi mdi-keyboard-return"}/>
                            </div>
                        }
                        <IconButton
                            key={"close-filter"}
                            iconClassName={"mdi mdi-close"}
                            style={buttonStyles.button}
                            iconStyle={buttonStyles.icon}
                            onClick={()=>{this.setState({toggleFilter: false, filterValue:''})}}
                        />
                    </div>
                }
                <div className={"workspaces"}>
                    {wss.map((ws) => (
                        <WorkspaceEntry
                            pydio={pydio}
                            key={ws.getId()}
                            workspace={ws}
                            showOwner={showOwner}
                            showFoldersTree={activeWorkspace && activeWorkspace===ws.getId()}
                            searchView={searchView}
                            values={values}
                            setValues={setValues}
                            searchLoading={searchLoading}
                            styler={workspaceEntryStyler}
                        />
                    ))}
                    {!entries.length && emptyState}
                    {createActionEntry}
                    {pagination.use && this.renderPagination(pagination)}
                </div>
            </div>
        );

    }

}

class WorkspacesList extends React.Component{

    constructor(props, context){
        super(props, context);
        this.state = this.stateFromPydio(props.pydio);
        this._reloadObserver = () => {
            this.setState(this.stateFromPydio(this.props.pydio));
        };
    }

    shouldComponentUpdate(nextProps, nextState){
        return nextState.random !== this.state.random
            || nextState.popoverOpen !== this.state.popoverOpen
            || nextProps.searchTools !== this.props.searchTools
//            || nextProps.values !== this.props.values
 //           || nextProps.facets !== this.props.facets
 //           || nextProps.activeFacets !== this.props.activeFacets;
    }

    stateFromPydio(pydio){
        const workspaces = pydio.user ? pydio.user.getRepositoriesList() : new Map();
        let hiddenWorkspaces, hiddenWsStatus, cellsSortingMixed = false, prefs = {}, merge = false;
        if(pydio.user) {
            prefs = pydio.user.getGUIPreferences();
            if(prefs['MaskedWorkspaces'] && prefs['MaskedWorkspaces'].length) {
                hiddenWorkspaces = prefs['MaskedWorkspaces']
                hiddenWsStatus = prefs['LeftPanel.MaskedWorkspaces.Show'] || false
            }
            cellsSortingMixed = prefs['LeftPanel.OwnedCellsFirst'];
            merge = prefs['LeftPanel.MergeWorkspaces'] || pydio.getPluginConfigs('core.pydio').get('MERGE_WORKSPACES_AND_CELLS')
        }
        return {
            random: Math.random(),
            merge,
            workspaces,
            hiddenWorkspaces,
            hiddenWsStatus,
            cellsSortingMixed,
            userPrefs: prefs,
            activeWorkspace: pydio.user ? pydio.user.activeRepository : false,
            activeRepoIsHome: pydio.user && pydio.user.activeRepository === 'homepage'
        };
    }

    togglePref(name) {
        const {pydio} = this.props;
        const {userPrefs} = this.state;
        switch (name){
            case "mask":
                const {hiddenWsStatus} = this.state;
                userPrefs['LeftPanel.MaskedWorkspaces.Show'] = !hiddenWsStatus;
            break;
            case "owned":
                const {cellsSortingMixed} = this.state;
                userPrefs['LeftPanel.OwnedCellsFirst'] = !cellsSortingMixed;
            break;
            case "merge":
                const {merge} = this.state;
                userPrefs['LeftPanel.MergeWorkspaces'] = !merge;

        }
        pydio.user.setGUIPreferences(userPrefs, true)
    }

    componentDidMount(){
        this.props.pydio.observe('repository_list_refreshed', this._reloadObserver);
    }

    componentWillUnmount(){
        this.props.pydio.stopObserving('repository_list_refreshed', this._reloadObserver);
    }

    createRepositoryEnabled(){
        return this.props.pydio.getPluginConfigs("auth").get("USER_CREATE_CELLS");
    }

    render(){
        let createActionIcon, createActionEntry;
        const {workspaces, hiddenWorkspaces, hiddenWsStatus ,activeWorkspace,
            popoverOpen, popoverAnchor, popoverContent, merge, cellsSortingMixed} = this.state;
        const {pydio, className, muiTheme, sectionTitleStyle, workspaceEntryStyler,
            searchView, searchTools} = this.props;

        // Split Workspaces from Cells
        let wsList = [];
        workspaces.forEach(o => wsList.push(o));
        if(hiddenWorkspaces && !hiddenWsStatus) {
            wsList = wsList.filter(ws =>
                hiddenWorkspaces.indexOf(ws.getId())=== -1
                || activeWorkspace === ws.getId()
                || (searchTools && searchTools.values.scope && searchTools.values.scope.indexOf(ws.getSlug() + '/') === 0)
            )
        }
        wsList = wsList.filter(ws => !Repository.isInternal(ws.getId()));
        wsList.sort((oA, oB) => {
            if(oA.getRepositoryType() === "workspace-personal") {
                return -1
            }
            if(oB.getRepositoryType() === "workspace-personal") {
                return 1
            }
            if(!cellsSortingMixed) {
                if(oA.userIsOwner() && !oB.userIsOwner()) {
                    return -1
                }
                if(oB.userIsOwner() && !oA.userIsOwner()) {
                    return 1
                }
            }
            const res = oA.getLabel().localeCompare(oB.getLabel(), undefined, {numeric: true});
            if (res === 0) {
                return oA.getSlug().localeCompare(oB.getSlug());
            } else {
                return res;
            }
        });
        let entries = wsList.filter(ws => !ws.getOwner());
        let sharedEntries = wsList.filter(ws => ws.getOwner());


        const messages = pydio.MessageHash;

        const createClick = function(event){
            const target = event.target;
            ResourcesManager.loadClassesAndApply(['ShareDialog'], () => {
                this.setState({
                    popoverOpen: true,
                    popoverAnchor: target,
                    popoverContent: <ShareDialog.CreateCellDialog pydio={pydio} onDismiss={()=> {this.setState({popoverOpen: false})}}/>
                })
            })
        }.bind(this);

        const buttonStyles = {
            button: {
                width: 36,
                height: 36,
                padding: 6,
                position:'absolute',
                right: 8,
                top: 8
            },
            icon : {
                fontSize: 22,
                color: muiTheme.palette.primary1Color //'rgba(0,0,0,.54)'
            }
        };

        if(this.createRepositoryEnabled()) {

            let caeClass = 'create-cell-small' // will be shown only if column is small
            if((sharedEntries.length||(merge && (sharedEntries.length || entries.length)))){
                if(merge) {
                    caeClass = ''; // always show
                } else {
                    createActionIcon = <IconButton
                        key={"create-cell"}
                        style={buttonStyles.button}
                        iconStyle={buttonStyles.icon}
                        iconClassName={"mdi mdi-plus"}
                        tooltip={messages[417]}
                        tooltipPosition={merge?"bottom-left":"top-left"}
                        onClick={createClick}
                    />
                }
            }
            createActionEntry = (
                <div
                    onClick={createClick}
                    className={"workspace-entry " + caeClass}
                    style={{...workspaceEntryStyler.rootItemStyle.default, color:'var(--md-sys-color-primary)'}}
                >
                    <span className={"icomoon-cells-full-plus"} style={{fontSize: 24, marginRight: 13, marginLeft:-4, opacity: 0.53}}/>
                    <div className={"workspace-label"}>{messages[417]}</div>
                </div>
            )

        }

        let classNames = ['user-workspaces-list'];
        if(className) {
            classNames.push(className);
        }

        const entriesProps = {
            pydio,
            palette: muiTheme.palette,
            buttonStyles,
            activeWorkspace,
            workspaceEntryStyler
        }

        if(searchView) {
            const {values, setValues, searchLoading, facets, activeFacets, toggleFacet} = searchTools
            const additionalEntries = []

            const fakeScopeEntry = new Repository('previous_context')
            fakeScopeEntry.setSlug('previous_context')
            fakeScopeEntry.setLabel(messages[170])
            additionalEntries.push(fakeScopeEntry)

            const fakeAllEntry = new Repository('all');
            fakeAllEntry.setSlug('all')
            fakeAllEntry.setLabel(messages[610]) // All workspaces
            additionalEntries.push(fakeAllEntry)
            return (
                <div className={classNames.join(' ')}>
                    <SearchSorter searchTools={searchTools} style={{padding:10, marginBottom: -20}} selectStyle={{borderRadius:6, marginTop: 0}}/>
                    <Entries
                        {...entriesProps}
                        title={messages['searchengine.scope.title']}
                        entries={[...additionalEntries, ...entries, ...sharedEntries]}
                        filterHint={messages['ws.quick-filter']}
                        titleStyle={{...sectionTitleStyle, marginTop:5, position:'relative', overflow:'visible', transition:'none'}}
                        searchView={searchView}
                        values={values}
                        setValues={setValues}
                        searchLoading={searchLoading}
                    />
                    <Facets
                        pydio={pydio}
                        facets={facets}
                        activeFacets={activeFacets}
                        onToggleFacet={toggleFacet}
                        values={values}
                        dataModel={pydio.getContextHolder()}
                        zDepth={0}
                        styles={{
                            container:{
                                color:'inherit',
                                backgroundColor:'transparent',
                                padding: '0 16px 16px'
                            },
                            header:{
                                display:'none'
                            },
                            subHeader:{
                                color: Color(muiTheme.palette.primary1Color).darken(0.1).alpha(0.50).toString(),
                                fontWeight: 500,
                                textTransform:'uppercase',
                                padding: '12px 0'
                            }
                        }}
                    />
                </div>
            );
        }

        const emptyStateStyle ={
            textAlign:'center',
            background: muiTheme.palette.mui3['surface-5'],
            color: muiTheme.palette.mui3['outline'],
            margin: '0px 16px',
            borderRadius: muiTheme.borderRadius,
            padding: '16px 0px 10px',
        }
        const showWorkspacesSection = !merge && entries.length > 0

        const listItemFontIcon = {fontSize: 20, top: 1}
        const listItemFontIconRight = {fontSize: 16, top: 1}
        const listSettings = (
            <IconMenu
                iconButtonElement={<IconButton iconClassName={"mdi mdi-settings"} iconStyle={{fontSize:12, opacity:0.4, color:'inherit'}} style={{padding:0, height: 18, width: 18}}/>}
                desktop={true}
            >
                <Subheader style={{marginTop:-10}}>{messages['ajax_gui.wslist-options.title']}</Subheader>
                <MenuItem
                    leftIcon={<FontIcon className={"mdi mdi-playlist-plus"} style={listItemFontIcon}/>}
                    primaryText={messages['ajax_gui.wslist-options.show-masked']}
                    onClick={() => this.togglePref("mask")}
                    rightIcon={<FontIcon className={'mdi mdi-toggle-switch'+(hiddenWsStatus?'':'-off')} style={listItemFontIconRight}/>}
                />
                <MenuItem
                    leftIcon={<FontIcon className={"mdi mdi-call-merge"} style={{...listItemFontIcon, transform:'rotate(90deg)', top: 5}}/>}
                    primaryText={messages['ajax_gui.wslist-options.merge-workspaces']}
                    onClick={() => this.togglePref("merge")}
                    rightIcon={<FontIcon className={'mdi mdi-toggle-switch'+(merge?'':'-off')} style={listItemFontIconRight}/>}
                />
                <MenuItem
                    leftIcon={<FontIcon className={"mdi mdi-account-star"} style={listItemFontIcon}/>}
                    primaryText={messages['ajax_gui.wslist-options.own-cells-first']}
                    onClick={() => this.togglePref("owned")}
                    rightIcon={<FontIcon className={'mdi mdi-toggle-switch'+(cellsSortingMixed?'-off':'')} style={listItemFontIconRight}/>}
                />
            </IconMenu>
        )

        return (
            <div className={classNames.join(' ')}>
                <Popover
                    open={popoverOpen}
                    anchorEl={popoverAnchor}
                    useLayerForClickAway={true}
                    onRequestClose={() => {this.setState({popoverOpen: false})}}
                    anchorOrigin={{horizontal:"right",vertical:"center"}}
                    targetOrigin={{horizontal:"left",vertical:"center"}}
                    zDepth={3}
                    style={{overflow: 'hidden'}}
                >{popoverContent}</Popover>
                {showWorkspacesSection &&
                    <Entries
                        {...entriesProps}
                        title={messages[468]}
                        entries={entries}
                        listSettings={listSettings}
                        showOwner={!cellsSortingMixed}
                        filterHint={messages['ws.quick-filter']}
                        titleStyle={{...sectionTitleStyle, marginTop:5, position:'relative', overflow:'visible', transition:'none'}}
                        className={"first-section"}
                    />
                }
                <Entries
                    {...entriesProps}
                    title={messages[merge?468:469]}
                    entries={merge?[...entries, ...sharedEntries]:sharedEntries}
                    listSettings={showWorkspacesSection?null:listSettings}
                    showOwner={!cellsSortingMixed}
                    filterHint={messages['cells.quick-filter']}
                    titleStyle={{...sectionTitleStyle, position:'relative', overflow:'visible', transition:'none'}}
                    createAction={createActionIcon}
                    createActionEntry={createActionEntry}
                    className={showWorkspacesSection ? "" : "first-section"}
                    emptyState={
                        <div style={emptyStateStyle} className={"create-cell-empty-state"}>
                            <div className="icomoon-cells" style={{fontSize:60}}></div>
                            {this.createRepositoryEnabled() && <FlatButton style={{color: muiTheme.palette.mui3.primary, marginTop:5}} primary={true} label={messages[418]} onClick={createClick}/>}
                            <div style={{fontSize: 13, padding: '5px 20px'}}>{messages[633]}</div>
                        </div>
                    }
                />
            </div>
        );
    }
}

WorkspacesList.PropTypes =   {
    pydio                   : PropTypes.instanceOf(Pydio),
    workspaces              : PropTypes.instanceOf(Map),
    onHoverLink             : PropTypes.func,
    onOutLink               : PropTypes.func,
    className               : PropTypes.string,
    style                   : PropTypes.object,
    sectionTitleStyle       : PropTypes.object,
    filterByType            : PropTypes.oneOf(['shared', 'entries', 'create'])
};


WorkspacesList = withVerticalScroll(WorkspacesList);
WorkspacesList = muiThemeable()(WorkspacesList);

export {WorkspacesList as default}