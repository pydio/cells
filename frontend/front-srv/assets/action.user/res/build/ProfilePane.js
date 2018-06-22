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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _PasswordPopover = require('./PasswordPopover');

var _PasswordPopover2 = _interopRequireDefault(_PasswordPopover);

var _EmailPanel = require('./EmailPanel');

var _EmailPanel2 = _interopRequireDefault(_EmailPanel);

var React = require('react');
var LangUtils = require('pydio/util/lang');

var _require = require('material-ui');

var FlatButton = _require.FlatButton;
var Divider = _require.Divider;

var Pydio = require('pydio');

var _Pydio$requireLib = Pydio.requireLib('form');

var Manager = _Pydio$requireLib.Manager;
var FormPanel = _Pydio$requireLib.FormPanel;

var FORM_CSS = ' \n.react-mui-context .current-user-edit.pydio-form-panel > .pydio-form-group:first-of-type {\n  margin-top: 220px;\n  overflow-y: hidden;\n}\n.react-mui-context .current-user-edit.pydio-form-panel > .pydio-form-group div.form-entry-image {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  height: 200px;\n  background-color: #eceff1;\n}\n.react-mui-context .current-user-edit.pydio-form-panel > .pydio-form-group div.form-entry-image .image-label,\n.react-mui-context .current-user-edit.pydio-form-panel > .pydio-form-group div.form-entry-image .form-legend {\n  display: none;\n}\n.react-mui-context .current-user-edit.pydio-form-panel > .pydio-form-group div.form-entry-image .file-dropzone {\n  border-radius: 50%;\n  width: 160px !important;\n  height: 160px !important;\n  margin: 20px auto;\n}\n.react-mui-context .current-user-edit.pydio-form-panel > .pydio-form-group div.form-entry-image .binary-remove-button {\n  position: absolute;\n  bottom: 5px;\n  right: 0;\n}\n\n';

var ProfilePane = React.createClass({
    displayName: 'ProfilePane',

    getInitialState: function getInitialState() {
        var objValues = {},
            mailValues = {};
        var pydio = this.props.pydio;
        if (pydio.user) {
            pydio.user.preferences.forEach(function (v, k) {
                if (k === 'gui_preferences') {
                    return;
                }
                objValues[k] = v;
            });
        }
        return {
            definitions: Manager.parseParameters(pydio.getXmlRegistry(), "user/preferences/pref[@exposed='true']|//param[contains(@scope,'user') and @expose='true' and not(contains(@name, 'NOTIFICATIONS_EMAIL'))]"),
            mailDefinitions: Manager.parseParameters(pydio.getXmlRegistry(), "user/preferences/pref[@exposed='true']|//param[contains(@scope,'user') and @expose='true' and contains(@name, 'NOTIFICATIONS_EMAIL')]"),
            values: objValues,
            originalValues: LangUtils.deepCopy(objValues),
            dirty: false
        };
    },

    onFormChange: function onFormChange(newValues, dirty, removeValues) {
        var _this = this;

        this.setState({ dirty: dirty, values: newValues }, function () {
            if (_this._updater) {
                _this._updater(_this.getButtons());
            }
            if (_this.props.saveOnChange) {
                _this.saveForm();
            }
        });
    },

    getButtons: function getButtons() {
        var updater = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        if (updater) this._updater = updater;
        var button = undefined,
            revert = undefined;
        if (this.state.dirty) {
            revert = React.createElement(FlatButton, { label: this.props.pydio.MessageHash[628], onTouchTap: this.revert });
            button = React.createElement(FlatButton, { label: this.props.pydio.MessageHash[53], secondary: true, onTouchTap: this.saveForm });
        } else {
            button = React.createElement(FlatButton, { label: this.props.pydio.MessageHash[86], onTouchTap: this.props.onDismiss });
        }
        if (this.props.pydio.Controller.getActionByName('pass_change')) {
            return [React.createElement(
                'div',
                { style: { display: 'flex', width: '100%' } },
                React.createElement(_PasswordPopover2['default'], this.props),
                React.createElement('span', { style: { flex: 1 } }),
                revert,
                button
            )];
        } else {
            return [button];
        }
    },

    getButton: function getButton(actionName, messageId) {
        var pydio = this.props.pydio;
        if (!pydio.Controller.getActionByName(actionName)) {
            return null;
        }
        var func = function func() {
            pydio.Controller.fireAction(actionName);
        };
        return React.createElement(ReactMUI.RaisedButton, { label: pydio.MessageHash[messageId], onClick: func });
    },

    revert: function revert() {
        var _this2 = this;

        this.setState({
            values: _extends({}, this.state.originalValues),
            dirty: false
        }, function () {
            if (_this2._updater) {
                _this2._updater(_this2.getButtons());
            }
        });
    },

    saveForm: function saveForm() {
        if (!this.state.dirty) {
            this.setState({ dirty: false });
            return;
        }
        var pydio = this.props.pydio;
        var _state = this.state;
        var definitions = _state.definitions;
        var values = _state.values;

        var postValues = Manager.getValuesForPOST(definitions, values, 'PREFERENCES_');
        postValues['get_action'] = 'custom_data_edit';
        PydioApi.getClient().request(postValues, (function (transport) {
            var _this3 = this;

            PydioApi.getClient().parseXmlMessage(transport.responseXML);
            pydio.observeOnce('user_logged', function (userObject) {
                if (values.avatar && userObject.getPreference('avatar') !== values.avatar) {
                    _this3.setState({ values: _extends({}, values, { avatar: userObject.getPreference('avatar') }) });
                }
            });
            pydio.refreshUserData();
            this.setState({ dirty: false }, function () {
                if (_this3._updater) {
                    _this3._updater(_this3.getButtons());
                }
            });
        }).bind(this));
    },

    render: function render() {
        var _props = this.props;
        var pydio = _props.pydio;
        var miniDisplay = _props.miniDisplay;

        if (!pydio.user) return null;
        var _state2 = this.state;
        var definitions = _state2.definitions;
        var values = _state2.values;

        if (miniDisplay) {
            definitions = definitions.filter(function (o) {
                return ['avatar'].indexOf(o.name) !== -1;
            });
        }
        return React.createElement(
            'div',
            null,
            React.createElement(FormPanel, {
                className: 'current-user-edit',
                parameters: definitions,
                values: values,
                depth: -1,
                binary_context: "user_id=" + pydio.user.id,
                onChange: this.onFormChange
            }),
            React.createElement('style', { type: 'text/css', dangerouslySetInnerHTML: { __html: FORM_CSS } })
        );
    }

});

exports['default'] = ProfilePane;
module.exports = exports['default'];
