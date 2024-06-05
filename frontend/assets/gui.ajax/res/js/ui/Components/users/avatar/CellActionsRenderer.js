/*
 * Copyright 2018-2023 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import {MenuItem, Divider} from 'material-ui'
import IdmObjectHelper from 'pydio/model/idm-object-helper'
import CellModel from 'pydio/model/cell'

class CellActionsRenderer {

    constructor(pydio, cellModel, acl, addressBookItem = null){
        this.props = {pydio, cellModel, acl, addressBookItem};
    }

    createCell(){
        const {addressBookItem, pydio} = this.props;
        const m = pydio.MessageHash;

        let idmObject;
        if(addressBookItem.IdmUser){
            idmObject = addressBookItem.IdmUser;
        } else if(addressBookItem.IdmRole){
            idmObject = addressBookItem.IdmRole;
        }
        if(idmObject){
            pydio.user.getIdmUser().then((loggedUser) => {

                const loggedLabel = IdmObjectHelper.extractLabelFromIdmObject(loggedUser);
                const targetLabel = IdmObjectHelper.extractLabelFromIdmObject(addressBookItem.IdmUser || addressBookItem.IdmRole);

                let model = new CellModel();
                model.setLabel(loggedLabel + ", " + targetLabel);
                model.setDescription("Created by " + loggedLabel);
                model.addUser(idmObject);
                model.save().then(res => {
                    pydio.UI.displayMessage('SUCCESS', m['643'].replace('%s', targetLabel));
                }).catch(reason => {
                    pydio.UI.displayMessage('ERROR', m['644'].replace('%s', reason.message));
                });

            });

        }
    }

    addToCell(){
        let idmObject;
        const {addressBookItem, cellModel} = this.props;
        if(addressBookItem.IdmUser){
            idmObject = addressBookItem.IdmUser;
        } else if(addressBookItem.IdmRole){
            idmObject = addressBookItem.IdmRole;
        }
        if(idmObject){
            cellModel.addUser(idmObject);
            cellModel.save();
        }
    }

    removeFromCell(){
        const {acl, cellModel} = this.props;
        cellModel.removeUser(acl.RoleId);
        cellModel.save();
    }

    renderItems(){
        const {pydio, cellModel, acl, addressBookItem} = this.props;
        const m = pydio.MessageHash;

        // Check if current user it the logged one
        let isLogged;
        if(acl){
            isLogged = (acl.User && acl.User.Login === pydio.user.id)
        } else {
            isLogged = (userType === 'user' && pydio.user.id === userId);
        }
        let items = [];
        if(isLogged){
            return items;
        }
        let userId, userType;
        if(addressBookItem){
            userId = addressBookItem.id ;
            userType = addressBookItem.type;
            if(userType === 'group' && addressBookItem.IdmRole) {
                userId = addressBookItem.IdmRole.Uuid; userType = 'team';
            }
        }
        let label;
        if(acl){
            label = IdmObjectHelper.extractLabel(pydio, acl);
        } else {
            label = addressBookItem.label;
        }
        // Special case cellModel is "TRUE", not a real cell model
        if(cellModel === true){
            if(pydio.getPluginConfigs("auth").get("USER_CREATE_CELLS")){
                return [<MenuItem primaryText={m['640'].replace('%s', label)} onClick={this.createCell.bind(this)}/>];
            } else {
                return [];
            }
        }

        const canWrite = cellModel.isEditable();
        // Check if current acl or userId/userType is in cell
        const acls = cellModel.getAcls();
        // Check if user is already in the current cell
        let isInCurrent;
        Object.keys(acls).map(k => {
            const cellAcl = acls[k];
            let crt;
            if(acl){
                crt = (acl.RoleId === cellAcl.RoleId);
            } else {
                crt = (
                    (userType === 'user' && cellAcl.User && cellAcl.User.Login === userId)
                    ||
                    (userType === 'group' && cellAcl.Group && cellAcl.Group.Uuid === userId)
                    ||
                    (userType === 'team' && cellAcl.Role && cellAcl.Role.Uuid === userId)
                )
            }
            if(crt) {
                isInCurrent = true;
            }
        });

        if(isInCurrent){
            items.push(<MenuItem primaryText={m['641']} disabled={!canWrite} onClick={this.removeFromCell.bind(this)}/>);
        } else {
            items.push(<MenuItem primaryText={m['642']} disabled={!canWrite} onClick={this.addToCell.bind(this)}/>);
        }
        if (pydio.getPluginConfigs("auth").get("USER_CREATE_CELLS")){
            items.push(
                <Divider/>,
                <MenuItem primaryText={m['640'].replace('%s', label)} onClick={this.createCell.bind(this)}/>,
            );
        }

        return items;
    }

}


export default CellActionsRenderer