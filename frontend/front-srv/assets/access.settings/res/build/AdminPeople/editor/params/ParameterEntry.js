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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _utilMessagesMixin = require('../util/MessagesMixin');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _pydioUtilXml = require('pydio/util/xml');

var _pydioUtilXml2 = _interopRequireDefault(_pydioUtilXml);

var _modelRole = require('../model/Role');

var _materialUi = require('material-ui');

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var PydioForm = _pydio2['default'].requireLib("form");

exports['default'] = _react2['default'].createClass({
    displayName: 'ParameterEntry',

    mixins: [_utilMessagesMixin.RoleMessagesConsumerMixin],

    propTypes: {
        acl: _react2['default'].PropTypes.instanceOf(_pydioHttpRestApi.IdmACL),
        role: _react2['default'].PropTypes.instanceOf(_modelRole.Role),

        actions: _react2['default'].PropTypes.object,
        parameters: _react2['default'].PropTypes.object,

        inherited: _react2['default'].PropTypes.bool
    },

    getInitialState: function getInitialState() {
        return { editMode: false };
    },

    onChangeParameter: function onChangeParameter(newValue, oldValue) {
        var additionalFormData = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

        if (newValue === oldValue) return;
        var _props = this.props;
        var role = _props.role;
        var acl = _props.acl;

        var aclKey = acl.Action.Name;
        role.setParameter(aclKey, newValue, acl.WorkspaceID);
    },

    deleteParameter: function deleteParameter() {
        var _props2 = this.props;
        var role = _props2.role;
        var acl = _props2.acl;

        role.deleteParameter(acl);
    },

    overrideParameter: function overrideParameter() {
        var _props3 = this.props;
        var role = _props3.role;
        var acl = _props3.acl;

        var aclKey = acl.Action.Name;

        var _aclKey$split = aclKey.split(":");

        var _aclKey$split2 = _slicedToArray(_aclKey$split, 3);

        var type = _aclKey$split2[0];
        var pluginId = _aclKey$split2[1];
        var name = _aclKey$split2[2];

        var value = "";
        if (type === "action") {
            value = false;
        }
        role.setParameter(aclKey, value, acl.WorkspaceID);
    },

    onInputEditMode: function onInputEditMode(editMode) {
        this.setState({ editMode: editMode });
    },

    toggleEditMode: function toggleEditMode() {
        if (this.refs.formElement) {
            this.refs.formElement.toggleEditMode();
        }
    },

    toggleActionStatus: function toggleActionStatus(event, status) {
        var _props4 = this.props;
        var role = _props4.role;
        var acl = _props4.acl;

        role.setParameter(acl.Action.Name, status, acl.WorkspaceID);
    },

    render: function render() {
        var _props5 = this.props;
        var acl = _props5.acl;
        var actions = _props5.actions;
        var parameters = _props5.parameters;
        var pydio = _props5.pydio;

        var _acl$Action$Name$split = acl.Action.Name.split(":");

        var _acl$Action$Name$split2 = _slicedToArray(_acl$Action$Name$split, 3);

        var type = _acl$Action$Name$split2[0];
        var pluginId = _acl$Action$Name$split2[1];
        var name = _acl$Action$Name$split2[2];

        var value = undefined;
        if (name === 'DEFAULT_START_REPOSITORY') {
            value = acl.Action.Value;
        } else {
            value = JSON.parse(acl.Action.Value);
        }
        var inherited = acl.INHERITED;
        var label = name;
        var paramData = undefined;
        if (type === 'parameter' && parameters[pluginId]) {
            var filters = parameters[pluginId].filter(function (p) {
                return p.parameter === name;
            });
            if (filters.length) {
                paramData = filters[0];
            }
        } else if (type === 'action' && actions[pluginId]) {
            var filters = actions[pluginId].filter(function (p) {
                return p.action === name;
            });
            if (filters.length) {
                paramData = filters[0];
            }
        }
        var element = undefined;
        if (type === 'parameter') {
            var attributes = { type: 'string', label: label, name: name };
            if (paramData) {
                attributes = PydioForm.Manager.parameterNodeToHash(paramData.xmlNode);
            }
            if (attributes['scope'] === 'user') {
                return null;
            }
            label = attributes.label;
            element = PydioForm.createFormElement({
                ref: "formElement",
                attributes: attributes,
                name: name,
                value: value,
                onChange: this.onChangeParameter,
                disabled: inherited,
                onChangeEditMode: this.onInputEditMode,
                displayContext: 'grid'
            });
        } else {
            if (paramData) {
                label = _pydioUtilXml2['default'].XPathGetSingleNodeText(paramData.xmlNode, "gui/@text") || label;
                if (pydio.MessageHash[label]) {
                    label = pydio.MessageHash[label];
                }
            }
            element = _react2['default'].createElement(
                'div',
                { className: 'role-action-toggle' },
                _react2['default'].createElement(_materialUi.Toggle, {
                    name: this.props.name,
                    onToggle: this.toggleActionStatus.bind(this),
                    toggled: !!value,
                    label: this.context.getMessage(value ? '2' : '3'),
                    labelPosition: "right"
                })
            );
        }

        var actionButtons = undefined;
        var buttonStyle = { style: { opacity: 0.2 }, hoveredStyle: { opacity: 1 } };
        if (type === 'parameter') {
            if (this.state.editMode) {
                actionButtons = _react2['default'].createElement(_materialUi.IconButton, _extends({
                    iconClassName: 'mdi mdi-content-save',
                    tooltip: this.context.getMessage('6'),
                    onClick: this.toggleEditMode
                }, buttonStyle));
            } else {
                actionButtons = _react2['default'].createElement(_materialUi.IconButton, _extends({
                    iconClassName: 'mdi mdi-close',
                    tooltip: this.context.getMessage('4'),
                    onClick: this.deleteParameter
                }, buttonStyle));
                if (inherited) {
                    actionButtons = _react2['default'].createElement(_materialUi.IconButton, _extends({
                        iconClassName: 'mdi mdi-content-copy',
                        tooltip: this.context.getMessage('5'),
                        onClick: this.overrideParameter
                    }, buttonStyle));
                }
            }
        } else if (!inherited) {
            actionButtons = _react2['default'].createElement(_materialUi.IconButton, _extends({
                iconClassName: 'mdi mdi-close',
                tooltip: this.context.getMessage('4'),
                onClick: this.deleteParameter
            }, buttonStyle));
        } else {
            actionButtons = _react2['default'].createElement('div', { style: { width: 48, height: 48 } });
        }
        return _react2['default'].createElement(
            'tr',
            { className: (inherited ? 'inherited' : '') + (this.state.editMode ? ' edit-mode' : ''), style: _extends({}, this.props.style) },
            _react2['default'].createElement(
                'td',
                { style: { width: '40%', fontWeight: 500 } },
                inherited ? '[' + this.context.getPydioRoleMessage('38') + ']' : '',
                ' ',
                label
            ),
            _react2['default'].createElement(
                'td',
                { style: { wordBreak: 'break-all' } },
                element
            ),
            _react2['default'].createElement(
                'td',
                { style: { width: 50 } },
                actionButtons
            )
        );
    }
});
module.exports = exports['default'];
