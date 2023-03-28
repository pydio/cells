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
const {ButtonMenu, Toolbar, ListPaginator} = Pydio.requireLib('components');
const {ThemedContainers:{IconButton}} = Pydio.requireLib('hoc');


const AppBar = ({pydio, muiTheme, styles, headerHeight, searchView, searchTools, searchViewTransition, showInfoPanel, showAddressBook, rightColumnState, showChatTab, onOpenDrawer, onUpdateSearchView, onOpenRightPanel}) => {


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

    const {values, humanizeValues, limit, setLimit, searchLoading} = searchTools;

    const newButtonProps = {
        buttonStyle:{...styles.flatButtonStyle, ...styles.raisedButtonStyle},
        buttonLabelStyle:{...styles.flatButtonLabelStyle, ...styles.raisedButtonLabelStyle}
    };

    let searchToolbar
    if(searchView) {
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
                        <ListPaginator
                            id="paginator-toolbar"
                            style={{height: 23, borderRadius: 2, /*background: newButtonProps.buttonBackgroundColor,*/ marginRight: 5}}
                            dataModel={pydio.getContextHolder()}
                            smallDisplay={true}
                            toolbarDisplay={true}
                        />
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
                    </div>
                </div>
            </div>
            <div style={{display:'flex', alignItems:'center'}}>
                <Toolbar
                    pydio={pydio}
                    // {...props}
                    id="display-toolbar"
                    toolbars={["display_toolbar"]}
                    renderingType="icon-font"
                    mergeItemsAsOneMenu={true}
                    mergedMenuIcom={"mdi mdi-settings"}
                    mergedMenuTitle={pydio.MessageHash['151']}
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
                        onRequestOpen={()=>onUpdateSearchView(true)}
                        onRequestClose={()=>onUpdateSearchView(false)}
                    />
                }
                <div style={{margin:'0 10px', height: headerHeight, display:'none'}}/>
                <div style={{display:'flex', paddingRight: 10}}>
                    {showInfoPanel &&
                        <IconButton
                            iconClassName={"mdi mdi-information"}
                            style={rightColumnState === 'info-panel' ? styles.activeButtonStyle : styles.buttonsStyle}
                            iconStyle={rightColumnState === 'info-panel' ? styles.activeButtonIconStyle : styles.buttonsIconStyle}
                            onClick={()=>{onOpenRightPanel('info-panel')}}
                            tooltip={pydio.MessageHash[rightColumnState === 'info-panel' ? '86':'341']}
                        />
                    }
                    {!searchView && showChatTab &&
                        <IconButton
                            iconClassName={"mdi mdi-message-text"}
                            style={rightColumnState === 'chat' ? styles.activeButtonStyle : styles.buttonsStyle}
                            iconStyle={rightColumnState === 'chat' ? styles.activeButtonIconStyle : styles.buttonsIconStyle}
                            onClick={()=>{onOpenRightPanel('chat')}}
                            tooltip={pydio.MessageHash[rightColumnState === 'chat' ? '86':'635']}
                            tooltipPosition={"bottom-left"}
                        />
                    }
                    {!searchView && showAddressBook &&
                        <IconButton
                            iconClassName={"mdi mdi-account-card-details"}
                            style={rightColumnState === 'address-book' ? styles.activeButtonStyle : styles.buttonsStyle}
                            iconStyle={rightColumnState === 'address-book' ? styles.activeButtonIconStyle : styles.buttonsIconStyle}
                            onClick={()=>{onOpenRightPanel('address-book')}}
                            tooltip={pydio.MessageHash[rightColumnState === 'address-book' ? '86':'592']}
                            tooltipPosition={showChatTab?"bottom-center":"bottom-left"}
                        />
                    }
                </div>
            </div>
        </Paper>
    )

}

export default AppBar