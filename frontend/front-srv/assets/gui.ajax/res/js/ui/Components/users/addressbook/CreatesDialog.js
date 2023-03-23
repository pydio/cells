/*
 * Copyright 2007-2023 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import {Dialog} from "material-ui";
import UserCreationForm from "../UserCreationForm";
import TeamCreationForm from "../TeamCreationForm";
import AddressBook from "./AddressBook";
import PydioApi from 'pydio/http/api'

export default class CollectionsPanel extends React.Component {

    constructor(props) {
        super(props);
        const {model} = props;
        model.observe('update', () => this.forceUpdate())
    }

    render() {

        const {pydio, model, onCancel, afterSubmit} = this.props;

        const item = model.createItem()

        let dialogTitle, dialogContent, dialogBodyStyle;

        if(item){
            if(item.actions.type === 'users'){
                dialogBodyStyle = {display:'flex', flexDirection:'column', overflow: 'hidden'};
                dialogTitle = model.m(484, '');
                dialogContent = (
                    <UserCreationForm
                        zDepth={0}
                        style={{display:'flex', flexDirection:'column', flex: 1, marginTop: -20}}
                        newUserName={""}
                        onUserCreated={afterSubmit}
                        onCancel={onCancel}
                        pydio={pydio}
                    />
                );
            }else if(item.actions.type === 'teams'){
                dialogTitle = model.m(569, '');
                dialogContent = (
                    <TeamCreationForm
                        onTeamCreated={afterSubmit}
                        onCancel={onCancel}
                    />
                );
            }else if(item.actions.type === 'team'){
                dialogTitle = null;
                dialogContent = (
                    <AddressBook
                        pydio={pydio}
                        mode="selector"
                        usersOnly={true}
                        disableSearch={true}
                        onItemSelected={(item) => {
                            PydioApi.getRestClient().getIdmApi().addUserToTeam(item.IdmRole.Uuid, item.IdmUser.Login).then(()=>{
                                model.reloadContext();
                            });
                        }}
                    />
                );
            }
        }

        return(
            <Dialog
                contentStyle={{width:420,minWidth:380,maxWidth:'100%', padding:0}}
                bodyStyle={{padding:0, ...dialogBodyStyle}}
                title={<div style={{padding: 20}}>{dialogTitle}</div>}
                actions={null}
                modal={false}
                open={!!item}
                onRequestClose={() => {onCancel()}}
            >
                {dialogContent}
            </Dialog>
        )
    }
}