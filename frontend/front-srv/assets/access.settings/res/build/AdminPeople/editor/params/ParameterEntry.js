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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var ParameterEntry = (function (_React$Component) {
    _inherits(ParameterEntry, _React$Component);

    function ParameterEntry(props) {
        _classCallCheck(this, ParameterEntry);

        _get(Object.getPrototypeOf(ParameterEntry.prototype), 'constructor', this).call(this, props);
        this.state = { editMode: false };
    }

    _createClass(ParameterEntry, [{
        key: 'onChangeParameter',
        value: function onChangeParameter(newValue, oldValue) {
            var additionalFormData = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

            if (newValue === oldValue) {
                return;
            }
            var _props = this.props;
            var role = _props.role;
            var acl = _props.acl;

            var aclKey = acl.Action.Name;
            role.setParameter(aclKey, newValue, acl.WorkspaceID);
        }
    }, {
        key: 'deleteParameter',
        value: function deleteParameter() {
            var _props2 = this.props;
            var role = _props2.role;
            var acl = _props2.acl;

            role.deleteParameter(acl);
        }
    }, {
        key: 'overrideParameter',
        value: function overrideParameter() {
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
        }
    }, {
        key: 'onInputEditMode',
        value: function onInputEditMode(editMode) {
            this.setState({ editMode: editMode });
        }
    }, {
        key: 'toggleEditMode',
        value: function toggleEditMode() {
            if (this.refs.formElement) {
                this.refs.formElement.toggleEditMode();
            }
        }
    }, {
        key: 'toggleActionStatus',
        value: function toggleActionStatus(event, status) {
            var _props4 = this.props;
            var role = _props4.role;
            var acl = _props4.acl;

            role.setParameter(acl.Action.Name, status, acl.WorkspaceID);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props5 = this.props;
            var acl = _props5.acl;
            var actions = _props5.actions;
            var parameters = _props5.parameters;
            var pydio = _props5.pydio;
            var getMessage = _props5.getMessage;
            var getPydioRoleMessage = _props5.getPydioRoleMessage;

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
                    onChange: this.onChangeParameter.bind(this),
                    disabled: inherited,
                    onChangeEditMode: this.onInputEditMode.bind(this),
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
                        label: getMessage(value ? '2' : '3'),
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
                        tooltip: getMessage('6'),
                        onClick: this.toggleEditMode.bind(this)
                    }, buttonStyle));
                } else {
                    actionButtons = _react2['default'].createElement(_materialUi.IconButton, _extends({
                        iconClassName: 'mdi mdi-close',
                        tooltip: getMessage('4'),
                        onClick: this.deleteParameter.bind(this)
                    }, buttonStyle));
                    if (inherited) {
                        actionButtons = _react2['default'].createElement(_materialUi.IconButton, _extends({
                            iconClassName: 'mdi mdi-content-copy',
                            tooltip: getMessage('5'),
                            onClick: this.overrideParameter.bind(this)
                        }, buttonStyle));
                    }
                }
            } else if (!inherited) {
                actionButtons = _react2['default'].createElement(_materialUi.IconButton, _extends({
                    iconClassName: 'mdi mdi-close',
                    tooltip: getMessage('4'),
                    onClick: this.deleteParameter.bind(this)
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
                    inherited ? '[' + getPydioRoleMessage('38') + ']' : '',
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
    }]);

    return ParameterEntry;
})(_react2['default'].Component);

exports['default'] = (0, _utilMessagesMixin.withRoleMessages)(ParameterEntry);
module.exports = exports['default'];
