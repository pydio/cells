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
import UnifiedSearchForm from "../search/components/UnifiedSearchForm";
const {Toolbar} = Pydio.requireLib('components');
const {ThemedContainers:{IconButton}} = Pydio.requireLib('hoc');


const AppBarRight = ({pydio, muiTheme, styles, containerStyle, searchIconButton, searchView, searchTools, searchViewTransition, showInfoPanel, infoPanelOpen, showChatTab, chatOpen, onUpdateSearchView, onToggleRightPanel, displayMode}) => {

    const {breakpoint = 'md'} = muiTheme;
    const smallScreen = (breakpoint==='s'|| breakpoint==='xs')
    const {values, setValues} = searchTools

    return (
        <div style={containerStyle}>
            {!smallScreen && !searchIconButton &&
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
            {!smallScreen && searchIconButton &&
                <IconButton
                    iconClassName={"mdi mdi-magnify"}
                    style={styles.buttonsStyle}
                    iconStyle={styles.buttonsIconStyle}
                    onClick={()=>{setValues(values)}}
                    tooltip={pydio.MessageHash['87']}
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
    )

}

export default AppBarRight