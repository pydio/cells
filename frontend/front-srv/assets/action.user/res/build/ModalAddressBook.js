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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');
var createReactClass = require('create-react-class');
var Pydio = require('pydio');

var _Pydio$requireLib = Pydio.requireLib('boot');

var ActionDialogMixin = _Pydio$requireLib.ActionDialogMixin;

var _Pydio$requireLib2 = Pydio.requireLib('components');

var ModalAppBar = _Pydio$requireLib2.ModalAppBar;
var AddressBook = _Pydio$requireLib2.AddressBook;

var ModalAddressBook = createReactClass({
    displayName: 'ModalAddressBook',

    mixins: [ActionDialogMixin],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: '',
            dialogSize: 'xl',
            dialogPadding: false,
            dialogIsModal: false,
            dialogScrollBody: true
        };
    },

    submit: function submit() {
        this.dismiss();
    },

    render: function render() {
        var _this = this;

        return React.createElement(
            'div',
            { style: { width: '100%', display: 'flex', flexDirection: 'column' } },
            React.createElement(ModalAppBar, {
                title: this.props.pydio.MessageHash['user_dash.1'],
                showMenuIconButton: false,
                iconClassNameRight: 'mdi mdi-close',
                onRightIconButtonTouchTap: function () {
                    _this.dismiss();
                }
            }),
            React.createElement(AddressBook, _extends({
                mode: 'book'
            }, this.props, {
                style: { width: '100%', flexGrow: 1, height: 'auto' }
            }))
        );
    }
});

exports['default'] = ModalAddressBook;
module.exports = exports['default'];
