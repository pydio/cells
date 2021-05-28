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

/**
 * Card presentation of a user. Relies on the UserAvatar object,
 * plus the PydioForm.UserCreationForm when in edit mode.
 */
class UserCard extends React.Component{

    constructor(props, context){
        super(props, context);
        this.state = {editForm: false};
    }

    componentWillReceiveProps(nextProps){
        if (nextProps.item !== this.props.item){
            this.setState({editForm: false});
        }
    }

    render(){

        const {item} = this.props;
        let editableProps = {avatarStyle: {zIndex: 1}}, editForm;
        if(item._parent && item._parent.id === 'ext'){
            editableProps = {
                ...editableProps,
                userEditable: item.IdmUser.PoliciesContextEditable,
                onDeleteAction: () => {this.props.onDeleteAction(item._parent, [item])},
                onEditAction: () => {this.setState({editForm: true})},
                reloadAction: () => {this.props.onUpdateAction(item)}
            };
        }

        if(this.state.editForm){
            editForm = (
                <UserCreationForm
                    pydio={this.props.pydio}
                    zDepth={0}
                    style={{flex:1}}
                    newUserName={item.id}
                    editMode={true}
                    userData={item}
                    onUserCreated={() => {this.props.onUpdateAction(item); this.setState({editForm:false}) }}
                    onCancel={() => {this.setState({editForm:false})}}
                />
            );
            editableProps = {
                ...editableProps,
                displayLabel: true,
                displayAvatar: true,
                useDefaultAvatar: true,
                style: {textAlign: 'center', borderBottom: '1px solid #e0e0e0', padding: 10, backgroundColor: '#fafafa'},
                avatarStyle:{marginBottom: 16},
            }
        }

        return (
            <div style={editForm ? {height: '100%', display:'flex', flexDirection:'column'} : {}}>
                <UserAvatar
                    userId={this.props.item.id}
                    richCard={!editForm}
                    pydio={this.props.pydio}
                    cardSize={this.props.style.width}
                    cardStyle={{textAlign:'left', padding:'12px 16px 4px', backgroundColor:'#f8fafc'}}
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