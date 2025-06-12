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


const {Component, createRef} = require('react');

import ContextMenuModel from 'pydio/model/context-menu'
import Utils from './Utils'
import PopupMenu from './PopupMenu'

const dims = {
    MENU_ITEM_HEIGHT: 32, //48 if not display:compact
    MENU_SEP_HEIGHT: 16,
    MENU_VERTICAL_PADDING: 8,
    MENU_WIDTH: 250,
    OFFSET_VERTICAL: 8,
    OFFSET_HORIZONTAL: 8
};

class ContextMenu extends Component{

    constructor(props) {
        super(props);
        this.menu = createRef();
    }

    modelOpen(node){
        let position = ContextMenuModel.getInstance().getPosition();
        const {pydio} = this.props;
        if(!node){
            this.openMenu('genericContext', position);
            return;
        }
        const dm = pydio.getContextHolder();
        if (dm.getSelectedNodes().indexOf(node) === -1) {
            pydio.observeOnce("actions_refreshed", function (dataModel) {
                this.openMenu('selectionContext', position);
            }.bind(this));
            dm.setSelectedNodes([node]);
        } else {
            this.openMenu('selectionContext', position);
        }
    }

    openMenu(context, position){
        let items = this.computeMenuItems(context);
        this._items = items;
        const mobile = this.props.pydio.UI.MOBILE_EXTENSIONS;
        if (mobile) {
            this.menu.current.showMenu({
                bottom: 0,
                left: 0,
                right: 0,
                height: 200,
                zIndex: 10000,
                overflowY: 'auto'
            }, items);
        } else {
            position = this.computeVisiblePosition(position, items);
            this.menu.current.showMenu({
                top: position.y,
                left: position.x
            }, items);
        }
    }

    computeMenuItems(context){
        let actions = this.props.pydio.Controller.getContextActions(context, ['inline', 'info_panel', 'info_panel_share']);
        return Utils.pydioActionsToItems(actions);
    }

    computeVisiblePosition(position, items){
        let menuHeight  = dims.MENU_VERTICAL_PADDING * 2;
        items.map(function(it){
            if(it.separator) {
                menuHeight += dims.MENU_SEP_HEIGHT;
            } else {
                menuHeight += dims.MENU_ITEM_HEIGHT;
            }
        });
        let menuWidth   = dims.MENU_WIDTH;
        let windowW     = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        let windowH     = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        if(position.x + menuWidth > windowW) {
            position.x = Math.max(position.x - menuWidth, 10) - dims.OFFSET_HORIZONTAL;
        }else{
            position.x += dims.OFFSET_HORIZONTAL;
        }
        if(position.y + menuHeight > windowH) {
            position.y = Math.max(position.y - menuHeight, 10) - dims.OFFSET_VERTICAL;
        }else{
            position.y += dims.OFFSET_VERTICAL;
        }
        return position;
    }

    componentDidMount(){
        this._modelOpen = this.modelOpen.bind(this);
        this._modelClose = () => {
            if(this.menu.current) this.menu.current.hideMenu()
        }
        ContextMenuModel.getInstance().observe("open", this._modelOpen);
        ContextMenuModel.getInstance().observe("close", this._modelClose);
    }

    componentWillUnmount(){
        ContextMenuModel.getInstance().stopObserving("open", this._modelOpen);
        ContextMenuModel.getInstance().stopObserving("close", this._modelClose);
    }

    render(){
        const mobile = this.props.pydio.UI.MOBILE_EXTENSIONS;
        return (
            <PopupMenu
                ref={this.menu}
                menuItems={this._items || []}
                onMenuClosed={this.props.onMenuClosed}
                menuProps={mobile ? {width:600, autoWidth:false} : {}}
                paperStyle={mobile ? {borderBottomLeftRadius:0, borderBottomRightRadius:0} : null}
                zDepth={mobile ? 2 : 1}
            />
        );
    }
}

export {ContextMenu as default}