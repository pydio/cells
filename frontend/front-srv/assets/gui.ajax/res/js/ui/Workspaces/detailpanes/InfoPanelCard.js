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

import React, {useState, useContext, useLayoutEffect} from 'react';
import Pydio from 'pydio'
import {IconButton, Paper} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import Tooltip from '@mui/material/Tooltip'
import {MultiColumnContext} from "./MultiColumnPanel";
import {ResizableContext} from "./ResizableColumn";
const {Toolbar} = Pydio.requireLib('components')
import ReactDOM from 'react-dom';
import reactdnd from 'react-dnd'
import {DragTypes, itemSource, itemTarget, collect, collectDrop} from "./dnd";
import useWorkspacePref from "../views/useWorkspacePref";

/**
 * Default InfoPanel Card
 */
let ContextInfoPanelCard = ({primaryToolbars, icon, title, closedTitle, shrinkTitle, actions, defaultOpen = false, onRequestDetachPanel, muiTheme, pydio, standardData, popoverPanel, namespace, componentName, style, contentStyle, isDragging, connectDragSource, connectDragPreview, connectDropTarget, displayForColumn, stickToColumn, currentColumn, currentPin, setColumnPin, scrollAreaProps, children}) => {

    const identifier = namespace + '.' + componentName;

    const {width=0, setWidth=()=>{}} = useContext(ResizableContext) || {};
    let [open, setOpen] = useWorkspacePref('FSTemplate.MultiColumn.InfoPanel.cardStatus.'+identifier+'.open', defaultOpen)
    const [hoverRow, setHoverRow] = useState(null)
    const [hoverTitle, setHoverTitle] = useState(false)
    const [mouseDownTitle, setMouseDownTitle] = useState(false)

    let mdtInt;
    const wrapMouseDownTitle = (value) => {
        clearTimeout(mdtInt)
        if(!value) {
            setMouseDownTitle(false)
            return
        }
        mdtInt = setTimeout(()=>{setMouseDownTitle(true)}, 250)
    }

    if(displayForColumn && !displayForColumn(identifier)){
        return null;
    }

    useLayoutEffect(() => {
        if(scrollAreaProps){
            try{
                setTimeout(scrollAreaProps.refresh, 250)
            }catch(e){}
        }
    }, [open])

    const styles = muiTheme.buildFSTemplate({}).infoPanel;
    const shrinkMode = !!(width && width < 80);
    const m  = (id) => Pydio.getMessages()['ajax_gui.' + id] || id

    let refinedStyles = {};
    if (shrinkMode) {
        refinedStyles.main = styles.card.shrinked.panel
        refinedStyles.header = styles.card.shrinked.header
        refinedStyles.title = styles.card.shrinked.headerTitle
    } else if(currentPin) {
        if(currentPin === identifier){
            refinedStyles = {
                main: {...refinedStyles.main, flex: 1, display:'flex', flexDirection:'column', marginTop: 0, marginBottom: 0},
                content: {flex: 1, overflowY: 'auto'}
            }
        } else {
            refinedStyles = {
                main: {...refinedStyles.main, marginTop: 0, marginBottom: 0, flexShrink: 0}
            }
        }
    }

    // Recompute open status
    if(shrinkMode) {
        open = false
    } else if(!identifier || popoverPanel || currentPin === identifier){
        open = true
    } else if(currentPin && currentPin !== identifier) {
        open = false
    }

    let theTitle;
    if(popoverPanel) {
        // No toggle icon
        theTitle = title ? <div style={styles.card.header}><div style={{...styles.card.headerTitle, cursor: 'default'}}>{title}</div></div> : null;
    } else {
        let headerStyle = styles.card.header
        if(!open && closedTitle) {
            title = closedTitle;
        }
        if(!open && !title && identifier) {
            title = identifier;
        }
        if(!title) {
            headerStyle = {...headerStyle, position: 'absolute', zIndex: 10, left: 0, right: 0}
        }
        const actions = [];
        let titleOpenToggle;
        if(!connectDragSource){ // DND not here, use arrows to move to next column?
            if(currentColumn > 0) {-
                actions.push({icon: 'arrow-left', click:()=> stickToColumn(identifier, currentColumn-1)})
            }
            actions.push({icon: 'arrow-right', click:()=> stickToColumn(identifier, currentColumn+1)})
        }
        if(onRequestDetachPanel && open && hoverTitle) {
            actions.push({icon:'picture-in-picture-bottom-right', label:m('infopanel.card.detach'), click:onRequestDetachPanel})
        }
        if(currentPin) { // there is a pinned panel
            if(currentPin === identifier) {
                if(hoverTitle){
                    actions.push({icon:'pin-off-outline', label: m('infopanel.card.unpin'), click:() => setColumnPin(null)})
                }
            } else {
                actions.push({icon:'chevron-right',  click:() => setColumnPin(identifier)})
            }
        } else {
            if(open && hoverTitle) {
                actions.push({icon:'pin-outline', label: m('infopanel.card.pin'), click:() => setColumnPin(identifier)})
            }
            titleOpenToggle = ()=>setOpen(!open)
            actions.push({icon:open?'chevron-up':'chevron-down', click:titleOpenToggle})
        }
        let shrinkIconStyle = styles.card.shrinked.icon
        if(hoverTitle){
            shrinkIconStyle = {...shrinkIconStyle, ...styles.card.shrinked.iconHover}
        }
        theTitle = (
            <div
                style={{...headerStyle, ...refinedStyles.header}}
                ref={(instance)=>connectDragSource(ReactDOM.findDOMNode(instance))}
            >
                {shrinkMode && <div style={shrinkIconStyle}><span className={icon ? icon : "mdi mdi-information-box-outline"}/></div>}
                <div
                    style={{...styles.card.headerTitle, ...refinedStyles.title, cursor:mouseDownTitle||!titleOpenToggle?'move':'default'}}
                    onClick={titleOpenToggle}
                    onMouseDown={()=>wrapMouseDownTitle(true)}
                    onMouseUp={()=>wrapMouseDownTitle(false)}
                    onMouseOut={()=>wrapMouseDownTitle(false)}
                >{shrinkMode && shrinkTitle || title}</div>
                {!shrinkMode &&
                    <div style={{...styles.card.headerIcon}}>
                        {actions.map(a => {
                            const iconButton = (<IconButton
                                iconClassName={"mdi mdi-"+a.icon}
                                onClick={a.click}
                                style={{width:36, height:36, padding: 8, marginLeft: -3}}
                                iconStyle={{fontSize:18, color:styles.card.headerIcon.color}}
                            />)
                            if(a.label) {
                                return ( <Tooltip placement={"bottom-end"} title={<span style={{padding:'0 10px'}}>{a.label}</span>}><span>{iconButton}</span></Tooltip> )
                            } else {
                                return iconButton;
                            }
                        })}
                    </div>
                }
            </div>
        )
    }
    let theActions = actions ? <div style={styles.card.actions}>{actions}</div> : null;
    let rows, toolBar;
    if(standardData){
        rows = standardData.map((object)=>{
            const {key, label, value, hoverValue} = object;
            return (
                <div className="infoPanelRow" key={key}>
                    <div className="infoPanelLabel">{label}</div>
                    <div
                        className="infoPanelValue"
                        style={{userSelect:'text'}}
                        onMouseOver={()=>setHoverRow(key)}
                        onMouseOut={()=>setHoverRow(null)}
                    >
                        {hoverValue && hoverRow === key?hoverValue:value}
                    </div>
                </div>
            );
        });
    }
    if(primaryToolbars){
        toolBar = (
            <Toolbar
                toolbarStyle={styles.toolbar.container}
                flatButtonStyle={styles.toolbar.flatButton}
                fabButtonStyle={styles.toolbar.fabButton}
                buttonStyle={styles.toolbar.button}
                className="primaryToolbar"
                renderingType="button"
                toolbars={primaryToolbars}
                controller={pydio.getController()}
                fabAction={"share"}
                buttonMenuNoLabel={true}
                buttonMenuPopoverDirection={"right"}
            />
        );
    }

    let panelOpen = open?styles.card.panelOpen:{}
    if(popoverPanel) {
        panelOpen = {...panelOpen, margin: 0}
    }

    return (
        <Paper
            zDepth={styles.card.zDepth}
            className="panelCard"
            style={{...styles.card.panel, ...panelOpen, ...style, ...refinedStyles.main, opacity:isDragging?0:null}}
            ref={instance => {
                connectDropTarget(ReactDOM.findDOMNode(instance));
                connectDragPreview(ReactDOM.findDOMNode(instance));
            }}
            onMouseEnter={()=>{setHoverTitle(true);}}
            onMouseLeave={()=>{setHoverTitle(false);}}
            onClick={shrinkMode?()=>{
                if(currentPin) {
                    setColumnPin(identifier)
                } else {
                    setOpen(true)
                }
                setWidth(420)
            }: null}
        >
            {theTitle}
            {open &&
                <div className="panelContent" style={{...styles.card.content, ...contentStyle, ...refinedStyles.content}}>
                    {children}
                    {rows}
                    {toolBar}
                </div>
            }
            {open && theActions}
        </Paper>
    );
};

ContextInfoPanelCard = muiThemeable()(ContextInfoPanelCard);
ContextInfoPanelCard = reactdnd.flow(
    reactdnd.DragSource(DragTypes.CARD, itemSource, collect),
    reactdnd.DropTarget(DragTypes.CARD, itemTarget, collectDrop)
)(ContextInfoPanelCard);

// Map context to props
const InfoPanelCard = (props) => {
    const contextProps = useContext(MultiColumnContext) || {}
    return <ContextInfoPanelCard {...props} {...contextProps}/>
}

export {InfoPanelCard as default}
