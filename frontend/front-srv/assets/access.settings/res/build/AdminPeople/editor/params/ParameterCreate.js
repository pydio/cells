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

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _ParametersPicker = require('./ParametersPicker');

var _ParametersPicker2 = _interopRequireDefault(_ParametersPicker);

var _pydio = require("pydio");

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUiStyles = require('material-ui/styles');

var _Pydio$requireLib = _pydio2["default"].requireLib('boot');

var ActionDialogMixin = _Pydio$requireLib.ActionDialogMixin;
var CancelButtonProviderMixin = _Pydio$requireLib.CancelButtonProviderMixin;

var ParameterCreate = _react2["default"].createClass({
    displayName: "ParameterCreate",

    mixins: [ActionDialogMixin, CancelButtonProviderMixin],

    propTypes: {
        workspaceScope: _react2["default"].PropTypes.string,
        showModal: _react2["default"].PropTypes.func,
        hideModal: _react2["default"].PropTypes.func,
        pluginsFilter: _react2["default"].PropTypes.func,
        roleType: _react2["default"].PropTypes.oneOf(['user', 'group', 'role']),
        createParameter: _react2["default"].PropTypes.func
    },

    getDefaultProps: function getDefaultProps() {
        return {
            dialogPadding: 0,
            dialogTitle: '',
            dialogSize: 'md'
        };
    },

    getInitialState: function getInitialState() {
        return {
            step: 1,
            workspaceScope: this.props.workspaceScope,
            pluginName: null,
            paramName: null,
            actions: {},
            parameters: {}
        };
    },

    setSelection: function setSelection(plugin, type, param, attributes) {
        this.setState({ pluginName: plugin, type: type, paramName: param, attributes: attributes }, this.createParameter);
    },

    createParameter: function createParameter() {
        this.props.createParameter(this.state.type, this.state.pluginName, this.state.paramName, this.state.attributes);
        this.props.onDismiss();
    },

    render: function render() {

        var getMessage = function getMessage(id) {
            var namespace = arguments.length <= 1 || arguments[1] === undefined ? 'pydio_role' : arguments[1];
            return pydio.MessageHash[namespace + (namespace ? '.' : '') + id] || id;
        };
        var _props = this.props;
        var pydio = _props.pydio;
        var actions = _props.actions;
        var parameters = _props.parameters;
        var muiTheme = _props.muiTheme;

        var bgColor = muiTheme.palette.primary1Color;

        return _react2["default"].createElement(
            "div",
            { className: "picker-list" },
            _react2["default"].createElement(
                "div",
                { style: { backgroundColor: bgColor, color: 'white', padding: '0 24px 24px' } },
                _react2["default"].createElement(
                    "h3",
                    { style: { color: 'white' } },
                    getMessage('14')
                ),
                _react2["default"].createElement(
                    "div",
                    { className: "legend" },
                    getMessage('15')
                )
            ),
            _react2["default"].createElement(_ParametersPicker2["default"], {
                pydio: pydio,
                allActions: actions,
                allParameters: parameters,
                onSelection: this.setSelection,
                getMessage: getMessage
            })
        );
    }

});

exports["default"] = ParameterCreate = (0, _materialUiStyles.muiThemeable)()(ParameterCreate);
exports["default"] = ParameterCreate;
module.exports = exports["default"];
