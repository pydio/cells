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
import React from 'react'
import {muiThemeable}from 'material-ui/styles'
import Color from 'color'
import {IconButton} from 'material-ui'

class OverlayIcon extends React.Component{

    findAction(){
        const {overlay, pydio, node} = this.props;
        let tooltip, action;
        const m = (id) => pydio.MessageHash[id] || id;
        const isLeaf = node.isLeaf();
        switch(overlay){
            case "mdi mdi-bookmark-outline":
                tooltip = isLeaf ? m('overlay.bookmark.file'):m('overlay.bookmark.folder');
                break;
            case "mdi mdi-share-variant":
                action = pydio.Controller.getActionByName("share-edit-shared");
                tooltip = isLeaf ? m('overlay.shared.file'):m('overlay.shared.folder');
                break;
            case "mdi mdi-lock-outline":
                tooltip = isLeaf ? m('overlay.lock.file'):m('overlay.lock.folder');
                break;
            case "mdi mdi-rss":
                tooltip = isLeaf ? m('overlay.watch.file'):m('overlay.watch.folder');
                break;
            default:
                break;
        }
        return {tooltip, action};
    }

    render(){
        const {muiTheme, overlay, selected} = this.props;
        const light = new Color(muiTheme.palette.primary1Color).saturationl(15).lightness(73).toString();
        let onClick;
        const {tooltip, action} = this.findAction();
        if(action){
            onClick = () => {action.apply();};
        }
        return (
            <IconButton
                tooltip={tooltip}
                tooltipPosition={"bottom-left"}
                iconClassName={overlay + ' overlay-icon-span'}
                style={{width: 30, height: 30, padding:6, margin: '6px 2px', cursor:onClick?'pointer':'default'}}
                iconStyle={{color: selected? 'white' : light, fontSize:15, transition:'none'}}
                onTouchTap={onClick}
            />);
    }

}

OverlayIcon = muiThemeable()(OverlayIcon);

export {OverlayIcon as default}