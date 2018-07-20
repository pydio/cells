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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _materialUi = require('material-ui');

var _pydioHttpUsersApi = require('pydio/http/users-api');

var _Pydio$requireLib = _pydio2['default'].requireLib('form');

var Manager = _Pydio$requireLib.Manager;
var FormPanel = _Pydio$requireLib.FormPanel;

var UserCreationForm = (function (_React$Component) {
    _inherits(UserCreationForm, _React$Component);

    UserCreationForm.prototype.getCreateUserParameters = function getCreateUserParameters() {
        var editMode = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        var basicParameters = [];
        var pydio = this.props.pydio;
        var MessageHash = pydio.MessageHash;

        var prefix = pydio.getPluginConfigs('action.share').get('SHARED_USERS_TMP_PREFIX');
        basicParameters.push({
            IdmUserField: 'Login',
            description: MessageHash['533'],
            readonly: editMode,
            expose: "true",
            label: MessageHash['522'],
            name: editMode ? "existing_user_id" : "new_user_id",
            scope: "user",
            type: "string",
            mandatory: true,
            "default": prefix ? prefix : ''
        }, {
            IdmUserField: 'Password',
            description: MessageHash['534'],
            editable: "true",
            expose: "true",
            label: MessageHash['523'],
            name: "new_password",
            scope: "user",
            type: "valid-password",
            mandatory: true
        });

        var params = global.pydio.getPluginConfigs('auth').get('NEWUSERS_EDIT_PARAMETERS').split(',');
        for (var i = 0; i < params.length; i++) {
            params[i] = "user/preferences/pref[@exposed]|//param[@name='" + params[i] + "']";
        }
        var xPath = params.join('|');
        Manager.parseParameters(this.props.pydio.getXmlRegistry(), xPath).map(function (el) {
            basicParameters.push(el);
        });
        if (!editMode) {
            basicParameters.push({
                description: MessageHash['536'],
                editable: "true",
                expose: "true",
                label: MessageHash['535'],
                name: "send_email",
                scope: "user",
                type: "boolean",
                mandatory: true
            });
        }
        return basicParameters;
    };

    UserCreationForm.prototype.getDefaultProps = function getDefaultProps() {
        return { editMode: false };
    };

    UserCreationForm.prototype.getParameters = function getParameters() {
        if (!this._parsedParameters) {
            this._parsedParameters = this.getCreateUserParameters(this.props.editMode);
        }
        return this._parsedParameters;
    };

    UserCreationForm.prototype.getValuesForPost = function getValuesForPost(prefix) {
        return Manager.getValuesForPOST(this.getParameters(), this.state.values, prefix);
    };

    function UserCreationForm(props, context) {
        var _this = this;

        _classCallCheck(this, UserCreationForm);

        _React$Component.call(this, props, context);

        var _props = this.props;
        var pydio = _props.pydio;
        var newUserName = _props.newUserName;
        var editMode = _props.editMode;
        var userData = _props.userData;

        var userPrefix = pydio.getPluginConfigs('action.share').get('SHARED_USERS_TMP_PREFIX');
        if (!userPrefix || newUserName.startsWith(userPrefix)) userPrefix = '';
        var values = {
            new_password: '',
            send_email: true
        };
        if (editMode && userData && userData.IdmUser) {
            (function () {
                var IdmUser = userData.IdmUser;

                _this.getParameters().forEach(function (param) {
                    var name = param.name;
                    var IdmUserField = param.IdmUserField;
                    var scope = param.scope;
                    var pluginId = param.pluginId;

                    var value = undefined;
                    if (IdmUserField) {
                        value = IdmUser[IdmUserField];
                    } else if (scope === 'user' && IdmUser.Attributes) {
                        value = IdmUser.Attributes[name];
                    } else if (pluginId && IdmUser.Attributes["parameter:" + pluginId + ":" + name]) {
                        value = JSON.parse(IdmUser.Attributes["parameter:" + pluginId + ":" + name]);
                    }
                    if (value !== undefined) {
                        values[name] = value;
                    }
                });
            })();
        } else {
            values['new_user_id'] = userPrefix + newUserName;
            values['lang'] = pydio.currentLanguage;
        }
        this.state = { values: values };
    }

    UserCreationForm.prototype.onValuesChange = function onValuesChange(newValues) {
        this.setState({ values: newValues });
    };

    UserCreationForm.prototype.changeValidStatus = function changeValidStatus(status) {
        this.setState({ valid: status });
    };

    UserCreationForm.prototype.submitCreationForm = function submitCreationForm() {
        var _this2 = this;

        var existingUser = undefined;
        var _props2 = this.props;
        var editMode = _props2.editMode;
        var userData = _props2.userData;

        if (editMode) {
            existingUser = userData.IdmUser;
        }
        _pydioHttpApi2['default'].getRestClient().getIdmApi().putExternalUser(this.state.values, this.getParameters(), existingUser).then(function (idmUser) {
            _this2.props.onUserCreated(_pydioHttpUsersApi.User.fromIdmUser(idmUser));
        });
    };

    UserCreationForm.prototype.cancelCreationForm = function cancelCreationForm() {
        this.props.onCancel();
    };

    UserCreationForm.prototype.render = function render() {
        var _props3 = this.props;
        var pydio = _props3.pydio;
        var editMode = _props3.editMode;
        var newUserName = _props3.newUserName;

        var status = this.state.valid;
        if (!status && editMode && !this.state.values['new_password']) {
            status = true;
        }

        return _react2['default'].createElement(
            _materialUi.Paper,
            { zDepth: this.props.zDepth !== undefined ? this.props.zDepth : 2, style: _extends({ minHeight: 250, display: 'flex', flexDirection: 'column' }, this.props.style) },
            _react2['default'].createElement(FormPanel, {
                className: 'reset-pydio-forms',
                depth: -1,
                parameters: this.getParameters(),
                values: this.state.values,
                onChange: this.onValuesChange.bind(this),
                onValidStatusChange: this.changeValidStatus.bind(this),
                style: { overflowY: 'auto', flex: 1 }
            }),
            _react2['default'].createElement(_materialUi.Divider, { style: { flexShrink: 0 } }),
            _react2['default'].createElement(
                'div',
                { style: { padding: 8, textAlign: 'right' } },
                _react2['default'].createElement(_materialUi.FlatButton, { label: pydio.MessageHash[49], onTouchTap: this.cancelCreationForm.bind(this) }),
                _react2['default'].createElement(_materialUi.FlatButton, { label: this.props.editMode ? pydio.MessageHash[519] : pydio.MessageHash[484], primary: true, onTouchTap: this.submitCreationForm.bind(this), disabled: !status })
            )
        );
    };

    return UserCreationForm;
})(_react2['default'].Component);

UserCreationForm.propTypes = {
    newUserName: _react2['default'].PropTypes.string,
    onUserCreated: _react2['default'].PropTypes.func.isRequired,
    onCancel: _react2['default'].PropTypes.func.isRequired,
    editMode: _react2['default'].PropTypes.bool,
    userData: _react2['default'].PropTypes.object
};

exports['default'] = UserCreationForm;
module.exports = exports['default'];
