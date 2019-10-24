/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import ReactDOM from 'react-dom'
import LeftPanel from '../leftnav/LeftPanel'
import FastSearch from "../search/FastSearch";
import {muiThemeable} from 'material-ui/styles'
import {ThemeProvider} from "@mui/material/styles";

const {withContextMenu, dropProvider} = Pydio.requireLib('hoc');
const {ContextMenu} = Pydio.requireLib('components');

const localStyle = `
  div[role="menu"]{
    background: var(--md-sys-color-surface-2);
    span[role="menuitem"]{
      font-size: 14px !important;
    }
  }
`

class MasterLayout extends React.Component{

    closeDrawer(e){
        if(!this.props.drawerOpen){
            return;
        }
        const widgets = document.getElementsByClassName('left-panel');
        if(widgets && widgets.length > 0 && widgets[0].contains(ReactDOM.findDOMNode(e.target))){
            return;
        }
        this.props.onCloseDrawerRequested();
    }

    render(){

        const {pydio, tutorialComponent, onContextMenu, classes, style, leftPanelProps, children, drawerOpen, desktopStyle = {}, muiTheme} = this.props;
        let connectDropTarget = this.props.connectDropTarget || function(c){return c;};

        let allClasses = [...classes];
        if(drawerOpen){
            allClasses.push('drawer-open');
        }

        let elements = [
            tutorialComponent,
            <LeftPanel className="left-panel" pydio={pydio} {...leftPanelProps}/>,
            <div className="desktop-container vertical_layout vertical_fit" style={desktopStyle}>{children}</div>,
            <span className="context-menu"><ContextMenu pydio={this.props.pydio}/></span>,
            <FastSearch/>,
            <style type={"text/css"} dangerouslySetInnerHTML={{__html:localStyle}} />
        ]

        // Re-wrap into @mui ThemeProvider
        if(muiTheme['@mui']) {
            elements = <ThemeProvider theme={muiTheme['@mui']}>{elements}</ThemeProvider>
        }

        return(connectDropTarget(
            <div
                style={{...style, overflow:'hidden'}}
                className={allClasses.join(' ')}
                onClick={this.closeDrawer.bind(this)}
                onContextMenu={onContextMenu}>
                {elements}
            </div>
        ));

    }

}

MasterLayout = muiThemeable()(MasterLayout);
MasterLayout = dropProvider(MasterLayout);
MasterLayout = withContextMenu(MasterLayout);

export {MasterLayout as default}