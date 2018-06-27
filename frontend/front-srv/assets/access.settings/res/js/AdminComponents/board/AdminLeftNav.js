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
const React = require('react');
const {Paper, Menu} = require('material-ui');
const {muiThemeable} = require('material-ui/styles');

import NavigationHelper from '../util/NavigationHelper'
import MenuItemListener from '../util/MenuItemListener'
const AjxpNode = require('pydio/model/node');
const PydioDataModel = require('pydio/model/data-model');

let AdminLeftNav = React.createClass({

    propTypes:{
        rootNode        : React.PropTypes.instanceOf(AjxpNode),
        contextNode     : React.PropTypes.instanceOf(AjxpNode),
        dataModel       : React.PropTypes.instanceOf(PydioDataModel)
    },

    componentDidMount: function(){
        MenuItemListener.getInstance().observe("item_changed", function(){
            this.forceUpdate();
        }.bind(this));
    },

    componentWillUnmount: function(){
        MenuItemListener.getInstance().stopObserving("item_changed");
    },

    checkForUpdates: function(){
        const {pydio, rootNode} = this.props;
        if(pydio.Controller.getActionByName("get_upgrade_path")){
            PydioApi.getClient().request({get_action:'get_upgrade_path'}, function(transp){
                const response = transp.responseJSON;
                const fakeNode = new AjxpNode("/admin/action.updater");
                const child = fakeNode.findInArbo(rootNode);
                if(child){
                    let length = 0;
                    if(response && response.packages.length) {
                        length = response.packages.length;
                    }
                    child.getMetadata().set('flag', length);
                    MenuItemListener.getInstance().notify("item_changed");
                }
            }.bind(this));
        }
    },

    onMenuChange: function(event, node){
        this.props.dataModel.setSelectedNodes([]);
        this.props.dataModel.setContextNode(node);
    },

    render: function(){

        const {pydio, rootNode, muiTheme, open} = this.props;

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

        const menuItems = NavigationHelper.buildNavigationItems(pydio, rootNode, muiTheme.palette);

        let pStyle = {
            height: '100%',
            position: 'fixed',
            width:256,
            paddingTop: 64,
            zIndex: 9,
        };
        if(!open){
            pStyle.transform = 'translateX(-256px)';
        }

        return(
            <Paper zDepth={2}
               style={pStyle}
                className="admin-main-nav"
                ref="leftNav"
            >
                <div style={{height:'100%', overflowY: 'auto'}}>
                    <Menu onChange={this.onMenuChange} autoWidth={false} width={256} listStyle={{display:'block', maxWidth:256}} value={contextNode}>{menuItems}</Menu>
                </div>
            </Paper>
        );
    }

});

AdminLeftNav = muiThemeable()(AdminLeftNav);
export {AdminLeftNav as default}