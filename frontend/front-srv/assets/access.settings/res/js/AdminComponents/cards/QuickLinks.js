/*
 * Copyright 2007-2022 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio Cells.
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

import React, {Component} from 'react';
import {DropDownMenu, MenuItem, FlatButton, Paper, IconButton} from 'material-ui';
import Pydio from 'pydio'
const {asGridItem} = Pydio.requireLib('components');
const {PydioContextConsumer} = Pydio.requireLib('boot');
import NavigationHelper from "../util/NavigationHelper";
import AdminStyles from "../styles/AdminStyles";
import {muiThemeable} from 'material-ui/styles'

class QuickLinks extends Component{

    constructor(props, context){
        super(props, context);

        const {preferencesProvider, getMessage} = props;

        if(preferencesProvider){
            const links = preferencesProvider.getUserPreference('QuickLinks');
            if(links && typeof links === "object"){
                this.state = {links:links, edit:false};
                return;
            }
        }

        this.state = {
            edit:false,
            links:[
                {
                    path:'/idm/users',
                    iconClass:'mdi mdi-account',
                    label:getMessage('2', 'settings'),
                    description:getMessage('139', 'settings')
                },
                {
                    path:'/data/workspaces',
                    iconClass:'mdi mdi-network',
                    label:getMessage('3', 'settings'),
                    description:getMessage('138', 'settings')
                }
            ]
        };
    }

    menuClicked(event, index, node){

        if(node !== -1){
            let newLinks = [...this.state.links];
            if (newLinks.filter(l => l.path === node.getPath()).length) {
                return;
            }
            newLinks.push({
                path        : node.getPath(),
                label       : node.getLabel().replace('---', ''),
                description : node.getMetadata().get('description'),
                iconClass   : node.getMetadata().get('icon_class')
            });
            if(this.props.preferencesProvider){
                this.props.preferencesProvider.saveUserPreference('QuickLinks', newLinks);
            }
            this.setState({links:newLinks});
        }

    }

    removeLink(payload, event){

        const {links} = this.state;
        const newLinks = links.filter(l => l.path !== payload);
        if(this.props.preferencesProvider){
            this.props.preferencesProvider.saveUserPreference('QuickLinks', newLinks);
        }
        this.setState({links:newLinks});

    }

    toggleEdit(){
        if(!this.state.edit){
            this.props.onFocusItem();
        }else{
            this.props.onBlurItem();
        }
        this.setState({edit:!this.state.edit});
    }

    render(){
        const {muiTheme, pydio} = this.props;

        const links = this.state.links.map(function(l){
            let label;
            if(this.state.edit){
                label = <span style={{color:'#9e9e9e'}}><span className={'mdi mdi-delete'}></span> {l.label}</span>
                return(
                    <FlatButton
                        key={l.path}
                        secondary={false}
                        onClick={this.removeLink.bind(this, l.path)}
                        label={label}
                    />
                );
            }else{
                label = <span><span className={l.iconClass + ' button-icon'}></span> {l.label}</span>
                return(
                    <FlatButton
                        key={l.path}
                        primary={true}
                        onClick={function(){pydio.goTo(l.path);}}
                        label={label}
                    />
                );
            }
        }.bind(this));
        let dropDown;
        const adminStyles = AdminStyles(muiTheme.palette);
        const subHeaderStyle = adminStyles.body.block.headerFull;

        if(this.state.edit){
            let menuItems = [<MenuItem primaryText={this.props.getMessage('card.quick-access.add', 'admin_dashboard')} value="-1"/>];
            const rootNode = pydio.getContextHolder().getRootNode();
            menuItems = menuItems.concat(NavigationHelper.buildNavigationItems(pydio, rootNode, muiTheme.palette, true, true));
            dropDown = (
                <div>
                    <DropDownMenu
                        style={{marginTop: 6}}
                        underlineStyle={{display:'none'}}
                        onChange={this.menuClicked.bind(this)}
                        value="-1"
                        menuStyle={{backgroundColor:adminStyles.menu.leftNav.backgroundColor}}
                    >{menuItems}</DropDownMenu>
                </div>
            );
        }else{
            dropDown = <h4 style={{...subHeaderStyle, margin:0, marginRight: 8, padding: '0 20px', borderRight:subHeaderStyle.borderBottom, borderBottom:'none'}}>{this.props.getMessage('card.quick-access', 'admin_dashboard')}</h4>;
        }
        return (
            <Paper
                {...this.props}
                {...adminStyles.body.block.props}
                transitionEnabled={false}
                style={{...adminStyles.body.block.container, margin:0,...this.props.style, display:'flex', alignItems:'center'}}
            >
                {this.props.closeButton}
                {dropDown}
                {links}
                <span style={{flex:1}}/>
                <IconButton
                    onClick={this.toggleEdit.bind(this)}
                    iconClassName={(this.state.edit?'mdi mdi-check':'mdi mdi-pencil')}
                    secondary={this.state.edit}
                    iconStyle={{color:"#9e9e9e"}}
                    style={{marginRight: 10, zoom: .8}}
                />
            </Paper>
        );
    }
}

QuickLinks = PydioContextConsumer(muiThemeable()(QuickLinks));
QuickLinks = asGridItem(QuickLinks, Pydio.getMessages()["admin_dashboard.card.quick-access"], {gridWidth:8, gridHeight:4}, []);
export {QuickLinks as default}