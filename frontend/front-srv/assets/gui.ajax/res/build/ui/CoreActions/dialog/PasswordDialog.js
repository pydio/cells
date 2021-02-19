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

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var React = require('react');
var createReactClass = require('create-react-class');
var BootUI = require('pydio/http/resources-manager').requireLib('boot');
var ActionDialogMixin = BootUI.ActionDialogMixin;
var AsyncComponent = BootUI.AsyncComponent;

var PasswordDialog = createReactClass({
    displayName: 'PasswordDialog',

    mixins: [ActionDialogMixin],

    getInitialState: function getInitialState() {
        return { passValid: false };
    },

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: _pydio2['default'].getMessages()[194],
            dialogIsModal: true,
            dialogSize: 'sm'
        };
    },

    getButtons: function getButtons() {
        var _this = this;

        var updater = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        if (updater) this._updater = updater;
        var buttons = [];
        if (!this.props.locked) {
            buttons.push(React.createElement(_materialUi.FlatButton, { label: this.props.pydio.MessageHash[49], onTouchTap: function () {
                    return _this.dismiss();
                } }));
        }
        buttons.push(React.createElement(_materialUi.FlatButton, { label: this.props.pydio.MessageHash[48], onTouchTap: this.submit.bind(this), disabled: !this.state.passValid }));
        return buttons;
    },

    submit: function submit() {
        if (!this.state.passValid) {
            return false;
        }
        this.refs.passwordForm.instance.post((function (value) {
            if (value) this.dismiss();
        }).bind(this));
    },

    passValidStatusChange: function passValidStatusChange(status) {
        var _this2 = this;

        this.setState({ passValid: status }, function () {
            _this2._updater(_this2.getButtons());
        });
    },

    render: function render() {

        return React.createElement(AsyncComponent, {
            namespace: 'UserAccount',
            componentName: 'PasswordForm',
            pydio: this.props.pydio,
            ref: 'passwordForm',
            onValidStatusChange: this.passValidStatusChange
        });
    }
});

exports['default'] = PasswordDialog;
module.exports = exports['default'];
