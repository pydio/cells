/*
 * Copyright 2023 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import Pydio from 'pydio'
import React from 'react'
import {FlatButton, Paper} from "material-ui";
import Textfit from "react-textfit";
import Breadcrumb from "./Breadcrumb";
import UnifiedSearchForm from "../search/components/UnifiedSearchForm";
import {RefreshAction} from "./RefreshAction";
const {ButtonMenu, Toolbar, ListPaginator} = Pydio.requireLib('components');
const {ThemedContainers:{IconButton}} = Pydio.requireLib('hoc');


const AppBar = ({pydio, muiTheme, styles, searchView, searchTools, searchViewTransition, showInfoPanel, infoPanelOpen, showChatTab, chatOpen, onOpenDrawer, onUpdateSearchView, onToggleRightPanel, sortingInfo={}}) => {


    const mobile = pydio.UI.MOBILE_EXTENSIONS;
    const {breakpoint = 'md'} = muiTheme;
    const smallScreen = (breakpoint==='s'|| breakpoint==='xs'), xtraSmallScreen = (breakpoint === 'xs')

    const mainToolbars = [
        "change_main",
        "info_panel",
        "info_panel_share",
        "info_panel_edit_share",
    ];
    const mainToolbarsOthers = [
        "change",
        "other"
    ];

    const {values, humanizeValues, limit, setLimit, searchLoading, empty, resultsCount} = searchTools;

    const newButtonProps = {
        buttonStyle:{...styles.flatButtonStyle, ...styles.raisedButtonStyle},
        buttonLabelStyle:{...styles.flatButtonLabelStyle, ...styles.raisedButtonLabelStyle}
    };

    let searchToolbar
    if(searchView) {
        let stLabel, stDisable = true;
        let labelStyle = {...styles.flatButtonLabelStyle}
        if(searchLoading) {
            stLabel = pydio.MessageHash['searchengine.searching'];
        } else if(empty) {
            stLabel = pydio.MessageHash['searchengine.start'];
        } else if(resultsCount === 0) {
            stLabel = pydio.MessageHash['478'] // No results found
        } else if(resultsCount < limit) {
            stLabel = pydio.MessageHash['searchengine.results.foundN'].replace('%1', resultsCount)
        } else if(resultsCount === limit) {
            stDisable = false
            stLabel = pydio.MessageHash['searchengine.results.withMore'].replace('%1', limit)
        }
        if(stDisable){
            searchToolbar = (
                <div style={{
                    fontSize: 13,
                    fontWeight: 500,
                    height:24,
                    lineHeight:'25px',
                    display: 'flex',
                    alignItems: 'center',
                    color:muiTheme.userTheme === 'mui3' ? 'var(--md-sys-color-secondary)': 'white'
                }}>{stLabel}</div>
            )
        } else {
            searchToolbar = (
                <FlatButton
                    style={styles.flatButtonStyle}
                    labelStyle={labelStyle}
                    label={stLabel}
                    onClick={()=>{setLimit(limit+20)}}
                />
            )

        }
    }

    let sortingTag
    if(!searchView && sortingInfo && sortingInfo.label) {
        sortingTag = (
            <div style={{
                height: 24,
                borderRadius: 20,
                background: 'var(--md-sys-color-surface-3)',
                color: 'var(--md-sys-color-secondary)',
                fontWeight: 500,
                marginRight: 5,
                display:'flex',
                alignItems:'center',
                padding:'0 12px'
            }}>
                <span
                    className={'mdi mdi-sort-' + (sortingInfo.direction === 'asc'? 'ascending':'descending')}
                    style={{marginRight: 6, cursor:'pointer'}}
                    onClick={() => sortingInfo.toggle()}
                />
                {sortingInfo.label}
                <span
                    className={'mdi mdi-close'}
                    style={{marginLeft: 6, opacity:0.5, cursor:'pointer'}}
                    onClick={() => sortingInfo.toggle(true)}
                />
            </div>
        );
    }

    return (
        <Paper zDepth={styles.appBarZDepth} style={styles.appBarStyle} rounded={false}>
            {searchView &&
                <div>
                    <IconButton
                        style={{width:56,height:56,padding:14, margin:'6px -6px 6px 6px'}}
                        iconClassName={"mdi mdi-arrow-left"}
                        iconStyle={{...styles.buttonsIconStyle, fontSize: 30}}
                        onClick={()=>onUpdateSearchView(false)}
                    />
                </div>
            }
            <div id="workspace_toolbar" style={{flex:1, width:'calc(100% - 430px)', display:'flex'}}>
                {muiTheme.userTheme !== 'mui3' &&
                    <span className="drawer-button" style={{marginLeft: 12, marginRight: -6}}>
                        <IconButton iconStyle={{...styles.buttonsIconStyle, fontSize: 30}} iconClassName="mdi mdi-menu" onClick={onOpenDrawer}/>
                    </span>
                }
                <div style={{flex: 1, overflow:'hidden'}}>
                    {searchView &&
                        <Textfit
                            mode="single" min={12} max={22}
                            style={{...styles.breadcrumbStyle, padding: '0 20px', fontSize: 22, lineHeight:'44px', height:36}}>
                            {pydio.MessageHash['searchengine.topbar.title']}{humanizeValues(values)}
                            <RefreshAction pydio={pydio} muiTheme={muiTheme}/>
                        </Textfit>
                    }
                    {!searchView && <Breadcrumb pydio={pydio} startWithSeparator={false} rootStyle={styles.breadcrumbStyle}/>}
                    <div style={{height:32, paddingLeft: 20, alignItems:'center', display:'flex', overflow:'hidden'}}>
                        {searchToolbar}
                        {!searchView &&
                            <ButtonMenu
                                //{...props}
                                pydio={pydio}
                                {...newButtonProps}
                                {...styles.raisedButtonLevel}
                                id="create-button-menu"
                                toolbars={["upload", "create"]}
                                buttonTitle={pydio.MessageHash['198']}
                                raised={true}
                                controller={pydio.Controller}
                                openOnEvent={'tutorial-open-create-menu'}
                            />
                        }
                        {!mobile &&
                            <Toolbar
                                pydio={pydio}
                               // {...props}
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
                        <ListPaginator
                            id="paginator-toolbar"
                            style={{height: 24, borderRadius: 20, background: 'var(--md-sys-color-surface-3)', color: 'var(--md-sys-color-secondary)', marginRight: 5}}
                            toolbarColor={'var(--md-sys-color-secondary)'}
                            dataModel={pydio.getContextHolder()}
                            smallDisplay={true}
                            toolbarDisplay={true}
                        />
                        {sortingTag}
                    </div>
                </div>
            </div>
            <div style={{display:'flex', alignItems:'center'}}>
                {!smallScreen &&
                    <UnifiedSearchForm
                        style={{flex: 1}}
                        active={searchView}
                        preventOpen={searchViewTransition}
                        pydio={pydio}
                        formStyles={styles.searchForm}
                        searchTools={searchTools}
                        onRequestOpen={()=>onUpdateSearchView(true)}
                        onRequestClose={()=>onUpdateSearchView(false)}
                    />
                }
                <Toolbar
                    pydio={pydio}
                    id="display-toolbar"
                    toolbars={["display_toolbar"]}
                    renderingType="icon-font"
                    mergeItemsAsOneMenu={true}
                    mergedMenuIcom={"mdi mdi-settings"}
                    mergedMenuTitle={pydio.MessageHash['151']}
                    buttonStyle={styles.buttonsIconStyle}
                    flatButtonStyle={styles.buttonsStyle}
                />
                <div style={{display:'flex', paddingRight: 10}}>
                    {showInfoPanel &&
                        <IconButton
                            iconClassName={"mdi mdi-information"}
                            style={infoPanelOpen ? styles.activeButtonStyle : styles.buttonsStyle}
                            iconStyle={infoPanelOpen ? styles.activeButtonIconStyle : styles.buttonsIconStyle}
                            onClick={()=>{onToggleRightPanel('info-panel')}}
                            tooltip={pydio.MessageHash[infoPanelOpen ? '86':'341']}
                        />
                    }
                    {!searchView && showChatTab &&
                        <IconButton
                            iconClassName={chatOpen ? "mdi mdi-message-bulleted-off" : "mdi mdi-message-text"}
                            style={styles.buttonsStyle}
                            iconStyle={styles.buttonsIconStyle}
                            onClick={()=>{onToggleRightPanel('chat')}}
                            tooltip={pydio.MessageHash[chatOpen ? '86':'635']}
                            tooltipPosition={"bottom-left"}
                        />
                    }
                </div>
            </div>
        </Paper>
    )

}

export default AppBar