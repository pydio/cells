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
import UserWidget from './UserWidget'
import WorkspacesList from '../wslist/WorkspacesList'

const {TasksPanel} = Pydio.requireLib("boot");
import {muiThemeable} from 'material-ui/styles'
import {Resizable} from 're-resizable'
import PydioApi from 'pydio/http/api';
import ResourcesManager from 'pydio/http/resources-manager';
import {UserServiceApi} from 'cells-sdk';
import BookmarksList from "./BookmarksList";

const RailIcon = muiThemeable()(({
                                     muiTheme,
                                     icon,
                                     iconOnly = false,
                                     text,
                                     active,
                                     alert,
                                     last = false,
                                     onClick = () => {
                                     },
                                     hover,
                                     setHover
                                 }) => {
    const [iHover, setIHover] = useState(false)

    let styles = {
        container: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            cursor: 'pointer',
            margin: 4,
            marginBottom: last ? 4 : 16,
            color: muiTheme.palette.mui3[iHover || active ? "on-surface" : "on-surface-variant"],
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
            backgroundColor: muiTheme.palette.mui3[iHover || active ? "surface-variant" : "transparent"],
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
            <span className={"mdi mdi-" + icon} style={styles.icon}/>
            {!iconOnly && <div style={styles.text}>{text}</div>}
            {alert && <div style={styles.alert}/>}
        </div>
    )
})

let RailPanel = ({
                     style = {},
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
    const [resizerWidth, setResizerWidth] = useState(250)

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

    const wsBar = () => (
        <Fragment>
            <WorkspacesList
                className={"vertical_fit"}
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
                    icon: 'home-outline',
                    text: 'Home',
                    ignore: !user.getRepositoriesList().has('homepage'),
                    active: user.activeRepository === 'homepage',
                    onClick: () => {
                        Controller.getActionByName('switch_to_homepage').apply()
                    },
                },
                {
                    icon: 'folder-multiple-outline',
                    text: 'All Files',
                    active: user.getActiveRepositoryObject().accessType === 'gateway',
                    onClick: () => {
                    },
                    hoverBar: wsBar,
                    activeBar: wsBar
                },
                {
                    text: 'Bookmarks',
                    icon: 'star-outline',
                    onClick: () => {
                    },
                    hoverBar: () => <BookmarksList pydio={pydio} asPopover={false} useCache={true}/>,
                    hoverWidth: 320
                },
                {
                    text: 'Directory',
                    icon: 'account-box-outline',
                    action: 'open_address_book',
                }
            ],
            "bottom": [
                {
                    id: 'notifications',
                    text: 'Alerts',
                    icon: 'bell-outline',
                    hoverWidth: 320,
                    alert: unreadCount > 0,
                    hoverBar: (lib, data) => {
                        if (!lib) {
                            return null;
                        }
                        const {ActivityList} = lib;
                        return (
                            <ActivityList
                                items={data || []}
                                style={{overflowY: 'scroll', height: '100%', paddingTop: 20}}
                                groupByDate={true}
                                displayContext={"popover"}
                            />
                        )
                    }
                },
                {
                    text: 'Mode',
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
            if (def.active || !h) {
                return
            }
            if (def.hoverBar) {
                setHoverBarDef(def)
            }
            setHover(!!def.hoverBar)
        }
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


    uWidgetProps.style.width = 'auto'
    uWidgetProps.style.margin = '0 auto'

    const railStyle = {
        width: 74,
        flexShrink: 0,
        borderRight: '1px solid var(--md-sys-color-outline-variant)',
        overflow: 'hidden',
        paddingBottom: 8
    }

    let activeBar
    if (!closed) {
        const aa = toolbars.top.filter(a => a.active && a.activeBar)
        if (aa.length) {
            activeBar = aa[0].activeBar()
        }
    }
    let hoverStyle = {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        left: 74,
        top: 0,
        bottom: 0,
        width: 0,
        transition: 'width 350ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
        background: style.background,
        zIndex: 902,
        overflow: 'hidden',
        boxShadow: "rgba(0, 0, 0, 0.16) 2px 0px 2px"
    }
    const innerWidth = (hoverBarDef && hoverBarDef.hoverWidth) || (250 - 74)
    if (hover) {
        hoverStyle.width = innerWidth
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
            size={{width: activeBar ? resizerWidth : 74, height: '100%'}}
            onResizeStop={(e, direction, ref, d)=>{
                setResizerWidth(resizerWidth+d.width);
                window.dispatchEvent(new Event('resize'))
            }}
            //minWidth={activeBar ? 250 : 74}
            handleStyles={{right: {zIndex: 900}}}
            style={{transition: 'width 550ms cubic-bezier(0.23, 1, 0.32, 1) 0ms', zIndex: 905}}
        >
            <div className="left-panel vertical_fit" style={{
                ...style,
                width: '100%',
                height: '100%',
                display: 'flex',
                overflow: hoverBarDef ? 'visible' : null
            }} onClick={onClick} onMouseOver={onMouseOver}>
                <div className={"left-rail vertical_layout"} style={railStyle}>
                    <UserWidget
                        pydio={pydio}
                        controller={pydio.getController()}
                        toolbars={["aUser", "user", "zlogin"]}
                        {...uWidgetProps}
                        displayLabel={false}
                        hideNotifications={true}
                        hideBookmarks={true}
                    />
                    <div>{tops.map((b, i, a) => <RailIcon {...b} last={i === a.length - 1}/>)}</div>
                    <div className={"vertical_fit"}/>
                    <div>{bottoms.map((b, i, a) => <RailIcon iconOnly {...b} last={i === a.length - 1}/>)}</div>
                </div>
                {activeBar &&
                    <div className={"vertical_layout"} style={{flex: 1, height: '100%', overflow:'hidden'}}>{activeBar}</div>
                }
                <div style={hoverStyle}>
                    <div className={"vertical_layout"}
                         style={{flex: 1, height: '100%', position: 'absolute', width: innerWidth, right: 0}}
                         onMouseEnter={() => setHover(true)}
                         onMouseLeave={() => setHover(false)}>{hoverBarDef && hoverBarDef.hoverBar(ASLib, ASData)}</div>
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
