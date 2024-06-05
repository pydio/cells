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
import Pydio from 'pydio'
const React = require('react');
const {Paper, Menu, IconButton} = require('material-ui');
const {muiThemeable} = require('material-ui/styles');

import NavigationHelper from '../util/NavigationHelper'
import MenuItemListener from '../util/MenuItemListener'
import AdminStyles from "../styles/AdminStyles";
const {UserWidget} = Pydio.requireLib('workspaces');
import {LeftToggleListener} from './AdminDashboard'

class AdminMenu extends React.Component{

    componentDidMount(){
        MenuItemListener.getInstance().observe("item_changed", function(){
            this.forceUpdate();
        }.bind(this));
    }

    componentWillUnmount(){
        MenuItemListener.getInstance().stopObserving("item_changed");
    }

    onMenuChange(event, node){
        this.props.dataModel.setSelectedNodes([]);
        this.props.dataModel.setContextNode(node);
        const listener = LeftToggleListener.getInstance();
        if(listener.isActive()){
            listener.toggle();
        }
    }

    render(){

        const {pydio, rootNode, muiTheme, showAdvanced} = this.props;

        // Fix for ref problems on context node
        let {contextNode} = this.props;
        this.props.rootNode.getChildren().forEach((child) => {
            if(child.getPath() === contextNode.getPath()){
                contextNode = child;
            }else{
                child.getChildren().forEach((grandChild) => {
                    if (grandChild.getPath() === contextNode.getPath()) {
                        contextNode = grandChild;
                    }
                });
            }
        });

        const menuItems = NavigationHelper.buildNavigationItems(pydio, rootNode, muiTheme.palette, showAdvanced, false);

        return(
            <Menu
                onChange={this.onMenuChange.bind(this)}
                autoWidth={false}
                width={256}
                desktop={true}
                disableAutoFocus={true}
                listStyle={AdminStyles(muiTheme.palette).menu.listStyle}
                value={contextNode}
            >{menuItems}</Menu>
        );
    }

}

AdminMenu = muiThemeable()(AdminMenu);

class AdminLeftNav extends React.Component {

    render(){
        const {open, pydio, showAdvanced} = this.props;

        const {menu, props} = AdminStyles();
        let pStyle = menu.leftNav;
        if(!open){
            pStyle.transform = 'translateX(-256px)';
        }

        return (
            <Paper {...props.leftNav} className={"admin-main-nav"} style={pStyle}>
                <div style={menu.header.container}>
                    <span style={menu.header.title}>{pydio.MessageHash['settings.topbar.title']}</span>
                    <IconButton
                        iconClassName={"mdi mdi-toggle-switch" + (showAdvanced ? "" : "-off")}
                        style={{padding: 14}}
                        iconStyle={{color: 'white',fontSize: 20}}
                        tooltip={pydio.MessageHash['settings.topbar.button.advanced']}
                        onClick={() => this.props.toggleAdvanced()}
                    />
                    <UserWidget
                        pydio={pydio}
                        style={menu.header.userWidget}
                        avatarStyle={{zoom: 0.8}}
                        popoverDirection={"left"}
                        popoverTargetPosition={"top"}
                        popoverStyle={{marginTop: 4, borderRadius: 20}}
                        popoverHeaderAvatar={true}
                        hideActionBar={true}
                        displayLabel={false}
                        toolbars={["aUser", "user", "zlogin"]}
                        controller={pydio.getController()}
                    />
                </div>
                <AdminMenu {...this.props}/>
            </Paper>
        );
    }
}

export {AdminLeftNav as default}