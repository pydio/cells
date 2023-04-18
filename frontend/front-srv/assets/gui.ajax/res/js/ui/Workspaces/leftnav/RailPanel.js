/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React, {useState, useEffect, Fragment} from 'react'

const PropTypes = require('prop-types');
const Pydio = require('pydio')
import DOMUtils from 'pydio/util/dom'
import UserWidget from './UserWidget'
import WorkspacesList from '../wslist/WorkspacesList'

const {TasksPanel} = Pydio.requireLib("boot");
import {muiThemeable} from 'material-ui/styles'
import {Resizable} from 're-resizable'
import PydioApi from 'pydio/http/api';
import ResourcesManager from 'pydio/http/resources-manager';
import {UserServiceApi} from 'cells-sdk';
import BookmarksList from "./BookmarksList";
import Tooltip from '@mui/material/Tooltip'

const RailIcon = muiThemeable()(({muiTheme,icon,iconOnly = false,text,active,alert,last = false,onClick = () => {},hover,setHover}) => {
    const [iHover, setIHover] = useState(false)

    let iconBg = 'transparent'
    let containerColor = 'on-surface-variant';
    if(active){
        iconBg = muiTheme.palette.mui3['secondary-container']
        containerColor = 'on-secondary-container'
    } else if(iHover || hover) {
        iconBg = muiTheme.palette.mui3['surface-5']
        containerColor = 'on-surface'
    }
    
    let styles = {
        container: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            cursor: 'pointer',
            margin: 4,
            marginBottom: last ? 4 : 16,
            color: muiTheme.palette.mui3[containerColor],
            position: 'relative'
        },
        alert: {
            borderRadius: '50%',
            position: 'absolute',
            backgroundColor: muiTheme.palette.accent1Color,
            width: 11,
            height: 11,
            top: 3,
            right: 12,
            border: '2px solid ' + muiTheme.palette.mui3['surface-variant']
        },
        icon: {
            fontSize: 22,
            padding: 4,
            background: iconBg,
            borderRadius: 20,
            width: '80%',
            textAlign: 'center',
        },
        text: {
            fontSize: 12,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        }
    }
    if (iconOnly) {
        styles.icon = {
            ...styles.icon,
            height: 40,
            width: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid ' + muiTheme.palette.mui3["outline-variant"]
        }
    }
    return (
        <div style={styles.container} onClick={() => onClick()} onMouseEnter={() => {
            setHover(true);
            setIHover(true)
        }} onMouseLeave={() => setIHover(false)}>
            {!iconOnly && <span className={"mdi mdi-" + icon} style={styles.icon}/>}
            {iconOnly && <Tooltip title={<div style={{padding:'2px 10px'}}>{text}</div>} placement={"right"}><span className={"mdi mdi-" + icon} style={styles.icon}/></Tooltip>}
            {!iconOnly && <div style={styles.text}>{text}</div>}
            {alert && <div style={styles.alert}/>}
        </div>
    )
})

const defaultWidth = 294

let RailPanel = ({
                     style = {},
                     railPanelStyle={},
                     userWidgetProps,
                     workspacesListProps = {},
                     pydio,
                     onClick,
                     onMouseOver,
                     muiTheme,
                     closed = false
                 }) => {

    let uWidgetProps = {...userWidgetProps};
    uWidgetProps.style = {
        width: '100%',
        ...uWidgetProps.style
    };
    const {MessageHash, Controller, user} = pydio
    const [hover, setHover] = useState(false)
    const [hoverBarDef, setHoverBarDef] = useState(null)
    const [ASData, setASData] = useState([])
    const [ASLib, setASLib] = useState()
    const [unreadCount, setUnreadCount] = useState(0)

    const [activeClosed, setActiveClosed] = useState(user.getGUIPreference('Layout.RailPanel.ActiveClosed')||false)
    const updateActiveClosed = (c) => {
        setActiveClosed(c);
        user.setGUIPreference('Layout.RailPanel.ActiveClosed', c, true)
    }
    const [showCloseToggle, setShowCloseToggle] = useState(false)

    let defaultResizerWidth = defaultWidth;
    const upw = user.getGUIPreference('Layout.RailPanel.ActiveWidth')
    if(upw && upw < 1) {
        defaultResizerWidth = upw * DOMUtils.getViewportWidth();
    }
    const [resizerWidth, setResizerWidth] = useState(defaultResizerWidth)
    const updateResizerWidth = (w) => {
        setResizerWidth(w);
        window.dispatchEvent(new Event('resize'))
        // Store a percentage
        user.setGUIPreference('Layout.RailPanel.ActiveWidth', w/DOMUtils.getViewportWidth(), true)
    }

    useEffect(()=>{
        ResourcesManager.loadClass('PydioActivityStreams').then(ns => {
            setASLib(ns)
        })
    }, [])

    useEffect(() => {
        if(ASLib) {
            const {ASClient} = ASLib
            setASLib(ASLib)
            if (hoverBarDef && hoverBarDef.id === 'notifications') {
                ASClient.loadActivityStreams('USER_ID', pydio.user.id, 'inbox').then((json) => {
                    setASData(json.items)
                }).catch(msg => {
                    console.error(msg)
                });
            }
            ASClient.UnreadInbox(pydio.user.id).then((count) => {
                setUnreadCount(count);
            }).catch(msg => {
            });
        }
    },[hoverBarDef, ASLib])

    useEffect(() => {
        const observer = (event) => {
            if (!ASLib) {
                return
            }
            const {ASClient} = ASLib
            if (hover && hoverBarDef && hoverBarDef.id === 'notifications') {
                ASClient.loadActivityStreams('USER_ID', pydio.user.id, 'inbox').then((json) => {
                    setASData(json.items)
                }).catch(e => {
                });
            } else {
                ASClient.UnreadInbox(pydio.user.id).then((count) => {
                    setUnreadCount(count);
                }).catch(msg => {
                });
            }
        }
        pydio.observe('websocket_event:activity', observer)
        return () => pydio.stopObserving('websocket_event:activity', observer)
    }, [hover, hoverBarDef, ASLib])

    const wsBar = (className = '') => (
        <Fragment>
            <WorkspacesList
                className={"vertical_fit"+className}
                pydio={pydio}
                showTreeForWorkspace={pydio.user ? pydio.user.activeRepository : false}
                {...workspacesListProps}
            />
            <TasksPanel pydio={pydio} mode={"flex"}/>
        </Fragment>
    )

    const toolbars =
        {
            "top": [
                {
                    id:'home',
                    icon: 'home-outline',
                    text: MessageHash['ajax_gui.leftrail.buttons.home'],
                    ignore: !user.getRepositoriesList().has('homepage'),
                    active: user.activeRepository === 'homepage',
                    onClick: () => {
                        Controller.getActionByName('switch_to_homepage').apply()
                    },
                },
                {
                    id:'files',
                    icon: 'folder-multiple-outline',
                    text: MessageHash['ajax_gui.leftrail.buttons.all-files'],
                    active: user.getActiveRepositoryObject().accessType === 'gateway',
                    onClick: () => {
                        if(user.getActiveRepositoryObject().accessType !== 'gateway') {
                            // Switch to the first repository of the list
                            let rr = []
                            user.getRepositoriesList().forEach(r => rr.push(r))
                            rr = rr.filter(r => r.accessType==='gateway')
                            if(!rr.length) {
                                return
                            }
                            rr.sort((a,b)=>a.getLabel().localeCompare(b.getLabel()))
                            const perso = rr.filter(r => r.getRepositoryType() === 'workspace-personal')
                            if(perso.length) {
                                pydio.triggerRepositoryChange(perso[0].getId())
                                return
                            }
                            const wss = rr.filter(r => !r.getOwner())
                            if(wss.length) {
                                pydio.triggerRepositoryChange(wss[0].getId())
                                return
                            }
                            pydio.triggerRepositoryChange(rr[0].getId())
                        }
                    },
                    hoverBar: () => wsBar(' rail-hover-bar'),
                    activeBar: wsBar
                },
                {
                    id:'bookmarks',
                    text: MessageHash['147'],
                    icon: 'star-outline',
                    onClick: () => {},
                    hoverBar: () => {
                        return (
                            <div style={{height:'100%', display:'flex', flexDirection:'column', width:'100%', overflow:'hidden'}} className={"rail-hover-bar"}>
                                <div style={{fontSize: 20, padding:16}}>Bookmarks</div>
                                <BookmarksList pydio={pydio} asPopover={false} useCache={true} onRequestClose={()=>{setHover(false)}}/>
                            </div>
                        )
                    },
                    hoverWidth: 320
                },
                {
                    id:'directory',
                    text: MessageHash['ajax_gui.leftrail.buttons.directory'],
                    ignore: !user.getRepositoriesList().has('directory'),
                    active: user.activeRepository === 'directory',
                    icon: 'account-box-outline',
                    onClick: () => {
                        pydio.triggerRepositoryChange('directory')
                    },
                }
            ],
            "bottom": [
                {
                    id: 'notifications',
                    text: MessageHash['notification_center.1'],
                    icon: 'bell-outline',
                    hoverWidth: 320,
                    alert: unreadCount > 0,
                    hoverBar: (lib, data) => {
                        if (!lib) {
                            return null;
                        }
                        const {ActivityList} = lib;
                        return (
                            <div style={{height:'100%', display:'flex', flexDirection:'column', width:'100%', overflow:'hidden'}} className={"rail-hover-bar"}>
                                <div style={{fontSize: 20, padding:16}}>Notifications</div>
                                <ActivityList
                                    items={data || []}
                                    style={{overflowY: 'scroll', flex: 1}}
                                    groupByDate={true}
                                    displayContext={"popover"}
                                    onRequestClose={()=>{setHover(false)}}
                                />
                            </div>
                        )
                    }
                },
                {
                    id:'theme',
                    text: muiTheme.darkMode? 'Light Mode' : 'Dark Mode',
                    icon: 'theme-light-dark',
                    onClick: () => {
                        const newTheme = muiTheme.darkMode ? 'mui3-light' : 'mui3-dark';
                        user.getIdmUser().then(idmUser => {
                            if (!idmUser.Attributes) {
                                idmUser.Attributes = {};
                            }
                            idmUser.Attributes['theme'] = newTheme;
                            const api = new UserServiceApi(PydioApi.getRestClient());
                            return api.putUser(idmUser.Login, idmUser).then(response => {
                                pydio.refreshUserData();
                            });
                        });
                    },
                }
            ]
        }
    const load = (def) => {
        def.setHover = (h) => {
            if(!h) {
                return
            }
            if (def.active && !activeClosed) {
                return
            }
            if (def.hoverBar) {
                setHoverBarDef(def)
            }
            setHover(!!def.hoverBar)
        }
        def.hover = hover && hoverBarDef && hoverBarDef.id === def.id
        if (!def.action) {
            return def
        }
        const a = Controller.getActionByName(def.action)
        if (a.deny) {
            return {...def, ignore: true}
        }
        let {icon = a.options.icon_class, text = MessageHash[a.options.text_id]} = def;
        return {...def, icon, text, onClick: () => a.options.callback()}
    }

    const showStickToggle = hoverBarDef && hoverBarDef.active && hoverBarDef.activeBar && activeClosed

    uWidgetProps.style.width = 'auto'
    uWidgetProps.style.margin = '0 auto'

    const railWidth = railPanelStyle.width || 74

    const railStyle = {
        ...railPanelStyle,
        flexShrink: 0,
        overflow: 'hidden',
        paddingBottom: 8
    }

    let activeBar
    if (!closed && !activeClosed) {
        const aa = toolbars.top.filter(a => a.active && a.activeBar)
        if (aa.length) {
            activeBar = aa[0].activeBar()
        }
    }
    let hoverStyle = {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        left: railWidth,
        top: 0,
        bottom: 0,
        width: 0,
        transition: 'width 350ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
        background: style.background,
        zIndex: 902,
        overflow: 'hidden',
        boxShadow: "rgba(0, 0, 0, 0.16) 2px 0px 2px"
    }
    const innerWidth = (hoverBarDef && hoverBarDef.hoverWidth) || (defaultWidth - railWidth)
    if (hover) {
        hoverStyle.width = innerWidth
    }

    const closerStyle = {
        position:'absolute',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        top:10,
        zIndex:950,
        right: 10,
        cursor:'pointer',
        borderRadius:'50%',
        height: 24,
        width: 24,
        fontSize: 16,
        backgroundColor:'var(--md-sys-color-surface-variant)'
    }

    const tops = toolbars.top.map(load).filter(a => !a.ignore)
    const bottoms = toolbars.bottom.map(load).filter(a => !a.ignore)

    return (
        <Resizable
            enable={{
                top: false,
                right: true,
                bottom: false,
                left: false,
                topRight: false,
                bottomRight: false,
                bottomLeft: false,
                topLeft: false
            }}
            size={{width: activeBar ? resizerWidth : railWidth, height: '100%'}}
            onResizeStop={(e, direction, ref, d)=> updateResizerWidth(resizerWidth+d.width) }
            minWidth={activeBar?railWidth + 50:railWidth}
            handleStyles={{right: {zIndex: 900}}}
            style={{transition: 'width 550ms cubic-bezier(0.23, 1, 0.32, 1) 0ms', zIndex: 905}}
        >
            <div className="left-panel vertical_fit" style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                overflow: hoverBarDef ? 'visible' : null
            }} onClick={onClick} onMouseOver={onMouseOver}>
                <div className={"left-rail vertical_layout"} style={railStyle}>
                    <UserWidget
                        pydio={pydio}
                        controller={pydio.getController()}
                        toolbars={["rail_user","zlogin"]}
                        {...uWidgetProps}
                        actionBarStyle={{display:'none'}}
                        avatarStyle={{padding: 0}}
                        displayLabel={false}
                        hideNotifications={true}
                        hideBookmarks={true}
                        popoverTargetPosition={"top"}
                        popoverStyle={{minWidth: 200, marginTop:2, background:'var(--md-sys-color-surface)'}}
                        menuStyle={{width:200, listStyle:{background:'transparent'}}}
                        popoverHeaderAvatar={true}
                    />
                    <div>{tops.map((b, i, a) => <RailIcon {...b} last={i === a.length - 1}/>)}</div>
                    <div className={"vertical_fit"}/>
                    <div>{bottoms.map((b, i, a) => <RailIcon iconOnly {...b} last={i === a.length - 1}/>)}</div>
                </div>
                {activeBar &&
                    <div
                        id={"left-rail-active-column"}
                        className={"vertical_layout" + (showCloseToggle?' with-rail-close-toggle':'')}
                        style={{flex: 1, height: '100%', overflow:'hidden', ...style}}
                        onMouseEnter={()=> setShowCloseToggle(true)}
                        onMouseLeave={()=> setShowCloseToggle(false)}
                    >
                        {activeBar}
                        {showCloseToggle && <div style={{...closerStyle}} onClick={() => updateActiveClosed(true)}><span className={"mdi mdi-chevron-double-left"}/></div>}
                    </div>
                }
                <div style={hoverStyle}>
                    <div className={"vertical_layout" + (showStickToggle?' with-rail-stick-toggle':'')}
                         style={{flex: 1, height: '100%', position: 'absolute', width: innerWidth, right: 0, ...style}}
                         onMouseEnter={() => setHover(true)}
                         onMouseLeave={() => setHover(false)}>{hoverBarDef && hoverBarDef.hoverBar(ASLib, ASData)}</div>
                    {showStickToggle &&
                        <div
                            style={{...closerStyle}}
                            onMouseEnter={() => setHover(true)}
                            onClick={() => { updateActiveClosed(false); setHover(false);}}>
                            <span className={"mdi mdi-chevron-double-right"}/>
                        </div>
                    }
                </div>
            </div>
        </Resizable>
    )

};

RailPanel.propTypes = {
    pydio: PropTypes.instanceOf(Pydio).isRequired,
    userWidgetProps: PropTypes.object,
    workspacesListProps: PropTypes.object,
    style: PropTypes.object
};
RailPanel = muiThemeable()(RailPanel)
export {RailPanel as default}
