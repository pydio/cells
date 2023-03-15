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

const React = require('react')
const createReactClass = require('create-react-class');
const Pydio = require('pydio')
const {ActionDialogMixin} = Pydio.requireLib('boot')
const {AddressBook} = Pydio.requireLib('components')
import {IconButton} from 'material-ui'

const ModalAddressBook = createReactClass({
    displayName: 'ModalAddressBook',

    mixins: [
        ActionDialogMixin,
    ],

    getDefaultProps: function(){
        return {
            dialogTitle: '',
            dialogSize: 'xl',
            dialogPadding: false,
            dialogIsModal: false,
            dialogScrollBody: false
        };
    },

    submit: function(){
        this.dismiss();
    },

    render: function(){

        return (
            <div style={{width:'100%', display:'flex', flexDirection:'column'}}>
                <div style={{display:'flex', alignItems:'center'}}>
                    <div style={{flex: 1, padding: 10}}>{this.props.pydio.MessageHash['user_dash.1']}</div>
                    <IconButton iconClassName={"mdi mdi-close"} tooltip={pydio.MessageHash['86']} onClick={()=>this.dismiss()} style={{marginRight: 10}}/>
                </div>
                <AddressBook
                    mode="book"
                    {...this.props}
                    style={{width:'100%', flexGrow: 1, height:'auto'}}
                />
            </div>
        );

    },
});

export {ModalAddressBook as default}