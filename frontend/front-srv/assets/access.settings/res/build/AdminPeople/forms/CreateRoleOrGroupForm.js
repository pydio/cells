'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

var CreateRoleOrGroupForm = (0, _createReactClass2['default'])({
    displayName: 'CreateRoleOrGroupForm',

    mixins: [AdminComponents.MessagesConsumerMixin, PydioReactUI.CancelButtonProviderMixin, PydioReactUI.SubmitButtonProviderMixin],

    propTypes: {
        type: _propTypes2['default'].oneOf(['group', 'user', 'role']),
        roleNode: _propTypes2['default'].instanceOf(_pydioModelNode2['default']),
        openRoleEditor: _propTypes2['default'].func
    },

    getTitle: function getTitle() {
        if (this.props.type === 'group') {
            return this.context.getMessage('ajxp_admin.user.15');
        } else {
            return this.context.getMessage('ajxp_admin.user.14');
        }
    },

    getPadding: function getPadding() {
        return true;
    },

    getSize: function getSize() {
        return 'sm';
    },

    dismiss: function dismiss() {
        return this.props.onDismiss();
    },

    getInitialState: function getInitialState() {
        return {
            groupId: '',
            groupIdError: this.context.getMessage('ajxp_admin.user.16.empty'),
            groupLabel: '',
            groupLabelError: this.context.getMessage('ajxp_admin.user.17.empty'),
            roleId: '',
            roleLabel: '',
            roleLabelError: this.context.getMessage('ajxp_admin.user.18.empty')
        };
    },

    submit: function submit() {
        var _this = this;

        var _props = this.props;
        var type = _props.type;
        var pydio = _props.pydio;
        var reload = _props.reload;

        var currentNode = undefined;
        var _state = this.state;
        var groupId = _state.groupId;
        var groupIdError = _state.groupIdError;
        var groupLabel = _state.groupLabel;
        var groupLabelError = _state.groupLabelError;
        var roleId = _state.roleId;
        var roleIdError = _state.roleIdError;
        var roleLabel = _state.roleLabel;
        var roleLabelError = _state.roleLabelError;

        if (type === "group") {
            if (groupIdError || groupLabelError) {
                return;
            }
            if (pydio.getContextHolder().getSelectedNodes().length) {
                currentNode = pydio.getContextHolder().getSelectedNodes()[0];
            } else {
                currentNode = pydio.getContextNode();
            }
            var currentPath = currentNode.getPath().replace('/idm/users', '');
            _pydioHttpApi2['default'].getRestClient().getIdmApi().createGroup(currentPath || '/', groupId, groupLabel).then(function () {
                _this.dismiss();
                currentNode.reload();
            });
        } else if (type === "role") {
            if (roleLabelError || roleIdError) {
                return;
            }
            _pydioHttpApi2['default'].getRestClient().getIdmApi().createRole(roleLabel, roleId).then(function () {
                _this.dismiss();
                if (reload) {
                    reload();
                }
            });
        }
    },

    update: function update(state) {
        if (state.groupId !== undefined) {
            var re = new RegExp(/^[0-9A-Z\-_.:\+]+$/i);
            if (!re.test(state.groupId)) {
                state.groupIdError = this.context.getMessage('ajxp_admin.user.16.format');
            } else if (state.groupId === '') {
                state.groupIdError = this.context.getMessage('ajxp_admin.user.16.empty');
            } else {
                state.groupIdError = '';
            }
        } else if (state.groupLabel !== undefined) {
            if (state.groupLabel === '') {
                state.groupLabelError = this.context.getMessage('ajxp_admin.user.17.empty');
            } else {
                state.groupLabelError = '';
                var _state2 = this.state;
                var groupId = _state2.groupId;
                var groupLabel = _state2.groupLabel;

                if (groupId === '' || _pydioUtilLang2['default'].computeStringSlug(groupLabel) === groupId) {
                    state.groupId = _pydioUtilLang2['default'].computeStringSlug(state.groupLabel);
                    state.groupIdError = '';
                }
            }
        } else if (state.roleLabel !== undefined) {
            if (state.roleLabel === '') {
                state.roleLabelError = this.context.getMessage('ajxp_admin.user.18.empty');
            } else {
                state.roleLabelError = '';
            }
        } else if (state.roleId) {
            var _props$roles = this.props.roles;
            var roles = _props$roles === undefined ? [] : _props$roles;

            if (roles.filter(function (r) {
                return r.Uuid === state.roleId;
            }).length > 0) {
                state.roleIdError = this.context.getMessage('role_editor.31.exists');
            } else {
                state.roleIdError = '';
            }
            state.roleId = _pydioUtilLang2['default'].computeStringSlug(state.roleId);
        }
        this.setState(state);
    },

    render: function render() {
        var _this2 = this;

        var _state3 = this.state;
        var groupId = _state3.groupId;
        var groupIdError = _state3.groupIdError;
        var groupLabel = _state3.groupLabel;
        var groupLabelError = _state3.groupLabelError;
        var roleId = _state3.roleId;
        var roleIdError = _state3.roleIdError;
        var roleLabel = _state3.roleLabel;
        var roleLabelError = _state3.roleLabelError;

        if (this.props.type === 'group') {
            return _react2['default'].createElement(
                'div',
                { style: { width: '100%' } },
                _react2['default'].createElement(ModernTextField, {
                    value: groupLabel,
                    errorText: groupLabelError,
                    onChange: function (e, v) {
                        _this2.update({ groupLabel: v });
                    },
                    fullWidth: true,
                    floatingLabelText: this.context.getMessage('ajxp_admin.user.17'),
                    onKeyPress: function (e) {
                        if (e.key === 'Enter') {
                            _this2.submit();
                        }
                    }
                }),
                _react2['default'].createElement(ModernTextField, {
                    value: groupId,
                    errorText: groupIdError,
                    onChange: function (e, v) {
                        _this2.update({ groupId: v });
                    },
                    fullWidth: true,
                    floatingLabelText: this.context.getMessage('ajxp_admin.user.16'),
                    onKeyDown: function (e) {
                        if (e.key === 'Enter') {
                            _this2.submit();
                        }
                    }
                })
            );
        } else {
            return _react2['default'].createElement(
                'div',
                { style: { width: '100%' } },
                _react2['default'].createElement(ModernTextField, {
                    value: roleLabel,
                    errorText: roleLabelError,
                    onChange: function (e, v) {
                        _this2.update({ roleLabel: v });
                    },
                    floatingLabelText: this.context.getMessage('role_editor.32'),
                    onKeyDown: function (e) {
                        if (e.key === 'Enter') {
                            _this2.submit();
                        }
                    }
                }),
                _react2['default'].createElement(ModernTextField, {
                    value: roleId,
                    errorText: roleIdError,
                    floatingLabelText: this.context.getMessage("role_editor.31.hint"),
                    onChange: function (e, v) {
                        _this2.update({ roleId: v });
                    },
                    onKeyDown: function (e) {
                        if (e.key === 'Enter') {
                            _this2.submit();
                        }
                    }
                })
            );
        }
    }
});

exports['default'] = CreateRoleOrGroupForm;
module.exports = exports['default'];
