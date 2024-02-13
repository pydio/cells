/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import Pydio from 'pydio'
const {AddressBook, UserAvatar, CellActionsRenderer, ListStylesCompact} = Pydio.requireLib('components');
import {List, ListItem, Divider, IconMenu, IconButton, Paper} from 'material-ui'
import IdmObjectHelper from 'pydio/model/idm-object-helper';
import DOMUtils from 'pydio/util/dom'
import InfoPanelCard from '../detailpanes/InfoPanelCard'

class AddressBookPanel extends React.Component{

    constructor(props){
        super(props);
        this.state = {noCell: false, cellModel: null};
        this._observer = () => {this.forceUpdate()};
    }

    componentDidMount(){
        this.loadCell();
    }

    componentWillUnmount(){
        if(this.state.cellModel) {
            this.state.cellModel.stopObserving('update', this._observer);
        }
    }

    loadCell(){
        const {pydio} = this.props;
        pydio.user.getActiveRepositoryAsCell().then(cell => {
            if(cell) {
                cell.observe('update', this._observer);
                this.setState({cellModel: cell, noCell: false, cellId: pydio.user.activeRepository});
            } else {
                this.setState({noCell: true, cellId: pydio.user.activeRepository});
            }
        });
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.pydio.user.activeRepository !== this.state.cellId){
            if(this.state.cellModel) {
                this.state.cellModel.stopObserving('update', this._observer);
            }
            this.loadCell();
        }
    }

    renderListItem(acl){
        const {pydio} = this.props;
        const {cellModel} = this.state;
        const label = IdmObjectHelper.extractLabel(pydio, acl);
        let userAvatar, avatarIcon, userType, userId;
        if(acl.User && acl.User.Attributes && acl.User.Attributes['avatar']){
            userAvatar = acl.User.Attributes['avatar'];
        }
        if(acl.User){
            userType = 'user';
            userId = acl.User.Login;
        } else if(acl.Group){
            userType = 'group';
            userId = acl.Group.Uuid;
        } else {
            userId = acl.Role.Uuid;
            userType = 'team';
        }


        const avatar = (
            <UserAvatar
                pydio={pydio}
                userType={userType}
                userId={userId}
                userLabel={label}
                avatar={userAvatar}
                avatarOnly={true}
                useDefaultAvatar={true}
                {...ListStylesCompact.avatar}
        />);

        let rightMenu;
        const menuItems = new CellActionsRenderer(pydio, cellModel, acl).renderItems();
        if(menuItems.length){
            rightMenu = (
                <IconMenu
                    {...ListStylesCompact.iconMenu}
                    iconButtonElement={<IconButton iconClassName="mdi mdi-dots-vertical" {...ListStylesCompact.iconButton}/>}
                    targetOrigin={{horizontal:'right', vertical:'top'}}
                    anchorOrigin={{horizontal:'right', vertical:'top'}}
                    desktop={true}
                >{menuItems}</IconMenu>
            );
        }

        return <ListItem className={"compact"} primaryText={label} leftAvatar={avatar} rightIconButton={rightMenu} {...ListStylesCompact.listItem}/>

    }

    render(){

        const {pydio, id = 'info_panel', style, zDepth} = this.props;
        const {cellModel, noCell} = this.state;
        let cellInfo;
        if(!noCell && cellModel){
            const acls = cellModel.getAcls();
            let items = [];
            Object.keys(acls).map((roleId) => {
                items.push(this.renderListItem(acls[roleId]));
                items.push(<Divider inset={true} style={ListStylesCompact.divider.style}/>);
            });
            items.pop();
            cellInfo = (
                <InfoPanelCard
                    title={pydio.MessageHash['639']}
                    style={{margin: '10px 10px 0'}}
                >
                    <List>{items}</List>
                </InfoPanelCard>
            )
        }
        const columnStyle = {
            position: 'absolute',
            width: 270,
            top: 100,
            bottom: 0,
            transition: DOMUtils.getBeziersTransition(),
            overflowY: 'auto',
            ...style
        };

        return (
            <Paper id={id} zDepth={zDepth} rounded={false} style={{...columnStyle}}>
                {cellInfo}
                {pydio.Controller.getActionByName("open_address_book") &&
                    <InfoPanelCard>
                        <AddressBook
                            mode="selector"
                            bookColumn={true}
                            pydio={pydio}
                            disableSearch={false}
                            style={{height: null,flex: 1, padding: 0}}
                            actionsForCell={!noCell && cellModel ? cellModel : true}
                            listStyles={ListStylesCompact}
                        />
                    </InfoPanelCard>
                }
            </Paper>
        );

    }

}

export {AddressBookPanel as default}