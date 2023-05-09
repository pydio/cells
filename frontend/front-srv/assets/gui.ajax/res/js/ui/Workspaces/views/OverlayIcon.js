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
import React, {Fragment, Component} from 'react'
import Pydio from 'pydio'
import {muiThemeable}from 'material-ui/styles'
import Color from 'color'
import {IconButton, Popover} from 'material-ui'
const {AsyncComponent} = Pydio.requireLib('boot');
const {Callbacks} = Pydio.requireLib('actions/core')

class OverlayIcon extends Component{

    findAction(){
        const {overlay, pydio, node, clickActions} = this.props;
        let tooltip, count, popoverNS, popoverComponent, clickAction;
        const m = (id) => pydio.MessageHash[id] || id;
        const isLeaf = node.isLeaf();
        switch(overlay){
            case "mdi mdi-star":
            case "mdi mdi-star-outline":
                tooltip = isLeaf ? m('overlay.bookmark.file'):m('overlay.bookmark.folder');
                if(clickActions) {
                    clickAction = () => Callbacks.toggleBookmarkNode(node)
                }
                break;
            case "mdi mdi-share-variant":
                popoverNS = 'ShareDialog'
                popoverComponent = 'InfoPanel'
                tooltip = isLeaf ? m('overlay.shared.file'):m('overlay.shared.folder');
                break;
            case "mdi mdi-lock-outline":
                tooltip = isLeaf ? m('overlay.lock.file'):m('overlay.lock.folder');
                break;
            case "mdi mdi-bell":
                popoverNS = 'PydioActivityStreams';
                popoverComponent = 'OverlayPanel';
                tooltip = isLeaf ? m('overlay.watch.file'):m('overlay.watch.folder');
                break;
            case "mdi mdi-tag":
            case "mdi mdi-tag-outline":
                tooltip = ''
                popoverNS = 'ReactMeta'
                popoverComponent = 'InfoPanel'
                break;
            case "mdi mdi-message-outline":
            case "mdi mdi-message":
                count = node.getMetadata().get('has_comments');
                tooltip = count + ' comment' + (count > 1 ? 's' : '');
                popoverNS = 'MetaComments'
                popoverComponent = 'InfoPanel'
                break;
            default:
                break;
        }
        return {tooltip, count, popoverNS, popoverComponent, clickAction};
    }

    selectAndApply(action) {
        const {pydio, node} = this.props;
        const dm = pydio.getContextHolder();
        if(dm.getUniqueNode() === node) {
            action.apply();
        } else {
            pydio.observeOnce('actions_refreshed', () => {
                action.apply();
            })
            dm.setSelectedNodes([node]);
        }
    }

    render(){
        const {pydio, node, muiTheme, overlay, selected, tooltipPosition='bottom-left', popoverDirection, style, className} = this.props;
        const light = new Color(muiTheme.palette.primary1Color).saturationl(15).lightness(73).toString();
        const {tooltip, count, popoverNS, popoverComponent, clickAction} = this.findAction();
        let onClick;
        if(popoverComponent) {
            onClick = (e) => {
                e.stopPropagation();
                pydio.getContextHolder().setSelectedNodes([node]);
                this.setState({popoverAnchor: e.currentTarget, popoverOpen: true})
            }
        } else  if(clickAction) {
            onClick = (e) => {
                e.stopPropagation();
                clickAction();
            }
        }
        const ic = (
            <IconButton
                tooltip={tooltip}
                tooltipPosition={tooltipPosition}
                iconClassName={overlay + ' overlay-icon-span' + (className?' '+className:'')}
                style={{width: 30, height: 30, padding:6, margin: '6px 2px', zIndex:0, cursor:onClick?'pointer':'default', ...style}}
                iconStyle={{color: selected? 'white' : light, fontSize:15, transition:'none'}}
                onClick={onClick}
                data-icon-count={count}
            />);
        if(popoverComponent) {
            const {popoverAnchor, popoverOpen} = this.state || {}
            return (
                <Fragment>
                    <Popover
                        open={popoverOpen}
                        anchorEl={popoverAnchor}
                        anchorOrigin={{horizontal: popoverDirection, vertical: 'top'}}
                        targetOrigin={{horizontal: popoverDirection, vertical: 'top'}}
                        canAutoPosition={true}
                        onRequestClose={() => {this.setState({popoverOpen: false})}}
                        style={{backgroundColor:'transparent', width: 310}}
                        zDepth={2}
                    >
                        <AsyncComponent
                            namespace={popoverNS}
                            componentName={popoverComponent}
                            pydio={pydio}
                            node={node}
                            popoverPanel={true}
                            popoverRequestClose={() => {this.setState({popoverOpen: false})}}
                            onLoad={()=>{window.dispatchEvent(new Event('resize'))}}
                        />
                    </Popover>
                    {ic}
                </Fragment>
            );
        } else {
            return ic
        }

    }

}

OverlayIcon = muiThemeable()(OverlayIcon);

export {OverlayIcon as default}