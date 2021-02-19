'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _ParametersPicker = require('./ParametersPicker');

var _ParametersPicker2 = _interopRequireDefault(_ParametersPicker);

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

var _pydio = require("pydio");

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUiStyles = require('material-ui/styles');

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var ActionDialogMixin = _Pydio$requireLib.ActionDialogMixin;
var CancelButtonProviderMixin = _Pydio$requireLib.CancelButtonProviderMixin;

var ThemedTitle = (function (_React$Component) {
    _inherits(ThemedTitle, _React$Component);

    function ThemedTitle() {
        _classCallCheck(this, ThemedTitle);

        _get(Object.getPrototypeOf(ThemedTitle.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(ThemedTitle, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var getMessage = _props.getMessage;
            var muiTheme = _props.muiTheme;

            var bgColor = muiTheme.palette.primary1Color;
            return _react2['default'].createElement(
                'div',
                { style: { backgroundColor: bgColor, color: 'white', padding: '0 24px 24px' } },
                _react2['default'].createElement(
                    'h3',
                    { style: { color: 'white' } },
                    getMessage('14')
                ),
                _react2['default'].createElement(
                    'div',
                    { className: 'legend' },
                    getMessage('15')
                )
            );
        }
    }]);

    return ThemedTitle;
})(_react2['default'].Component);

ThemedTitle = (0, _materialUiStyles.muiThemeable)()(ThemedTitle);

var ParameterCreate = (0, _createReactClass2['default'])({
    displayName: 'ParameterCreate',

    mixins: [ActionDialogMixin, CancelButtonProviderMixin],

    propTypes: {
        workspaceScope: _propTypes2['default'].string,
        showModal: _propTypes2['default'].func,
        hideModal: _propTypes2['default'].func,
        pluginsFilter: _propTypes2['default'].func,
        roleType: _propTypes2['default'].oneOf(['user', 'group', 'role']),
        createParameter: _propTypes2['default'].func
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
        var _props2 = this.props;
        var pydio = _props2.pydio;
        var actions = _props2.actions;
        var parameters = _props2.parameters;

        return _react2['default'].createElement(
            'div',
            { className: 'picker-list' },
            _react2['default'].createElement(ThemedTitle, { getMessage: getMessage }),
            _react2['default'].createElement(_ParametersPicker2['default'], {
                pydio: pydio,
                allActions: actions,
                allParameters: parameters,
                onSelection: this.setSelection,
                getMessage: getMessage
            })
        );
    }
});

exports['default'] = ParameterCreate;
module.exports = exports['default'];
