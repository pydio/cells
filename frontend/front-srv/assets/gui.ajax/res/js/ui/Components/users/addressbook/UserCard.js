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

import PropTypes from 'prop-types';

import React from 'react';
import UserAvatar from '../avatar/UserAvatar'
import UserCreationForm from '../UserCreationForm'
import ActionsPanel from "../avatar/ActionsPanel";

/**
 * Card presentation of a user. Relies on the UserAvatar object,
 * plus the PydioForm.UserCreationForm when in edit mode.
 */
class UserCard extends React.Component{

    constructor(props, context){
        super(props, context);
        this.state = {}
    }

    render(){

        const {pydio, item, model, onDeleteAction, onUpdateAction, edit, setEdit} = this.props;
        const {graphRand} = this.state;

        let editableProps = {avatarStyle: {zIndex: 1}}, editForm;
        const isExt = item._parent && item._parent.id === 'ext'

        const a = (
            <ActionsPanel
                pydio={pydio}
                model={model}
                user={item}
                userId={item.id}
                userEditable={isExt && item.IdmUser.PoliciesContextEditable}
                onDeleteAction={() => {onDeleteAction(item._parent, [item])}}
                onEditAction={() => {setEdit(true)}}
                reloadAction={() => {
                    onUpdateAction(item)
                    this.setState({graphRand:Math.random()})
                }}
                style={{padding: 8, textAlign:'center'}}
            />
        );

        if(edit){
            editForm = (
                <UserCreationForm
                    pydio={pydio}
                    zDepth={0}
                    style={{flex:1, borderRadius: 0, borderTop: '1px solid var(--md-sys-color-outline-variant-50)'}}
                    newUserName={item.id}
                    editMode={true}
                    userData={item}
                    onUserCreated={() => {onUpdateAction(item); setEdit(false) }}
                    onCancel={() => {setEdit(false)}}
                    formShowLegends={true}
                />
            );
        }

        editableProps = {
            ...editableProps,
            avatarSize: 40,
            avatarStyle: {
                left: 20,
                top: 20,
                right: 'inherit'
            },
            cardStyle: {
                textAlign:'left',
                padding:'20px 16px 24px 74px'
            },
            cardTitleStyle: {
                fontSize: 14,
                fontWeight: 500,
                lineHeight: '20px'
            },
            cardSubtitleStyle:{
                fontSize: 13,
                fontWeight: 400,
                lineHeight: '14px'
            }
        }

        return (
            <div style={edit ? {height: '100%', display:'flex', flexDirection:'column'} : {}}>
                <UserAvatar
                    userId={this.props.item.id}
                    richCard={true}
                    pydio={this.props.pydio}
                    cardSize={this.props.style.width}
                    cardStyle={{textAlign:'left', padding:'12px 16px 4px'}}
                    actionsPanel={!edit && a}
                    noActionsPanel={edit}
                    graphRand={graphRand}
                    {...editableProps}
                />
                {editForm}
            </div>
        );
    }

}

UserCard.propTypes = {
    /**
     * Pydio instance
     */
    pydio: PropTypes.instanceOf(Pydio),
    /**
     * Team data object
     */
    item: PropTypes.object,
    /**
     * Applied to root container
     */
    style: PropTypes.object,
    /**
     * Called to dismiss the popover
     */
    onRequestClose: PropTypes.func,
    /**
     * Delete current team
     */
    onDeleteAction: PropTypes.func,
    /**
     * Update current team
     */
    onUpdateAction: PropTypes.func
};


export {UserCard as default}