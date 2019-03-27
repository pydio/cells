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

var _FormPanel = require('./FormPanel');

var _FormPanel2 = _interopRequireDefault(_FormPanel);

var _require = require('react');

var Component = _require.Component;

var _require2 = require('material-ui');

var IconButton = _require2.IconButton;
var FlatButton = _require2.FlatButton;
var Paper = _require2.Paper;

var UP_ARROW = 'mdi mdi-menu-up';
var DOWN_ARROW = 'mdi mdi-menu-down';
var REMOVE = 'mdi mdi-delete-circle';

var ReplicatedGroup = (function (_Component) {
    _inherits(ReplicatedGroup, _Component);

    function ReplicatedGroup(props, context) {
        _classCallCheck(this, ReplicatedGroup);

        _Component.call(this, props, context);
        var subValues = props.subValues;
        var parameters = props.parameters;

        var firstParam = parameters[0];
        var instanceValue = subValues[firstParam['name']] || '';
        this.state = { toggled: instanceValue ? false : true };
    }

    ReplicatedGroup.prototype.render = function render() {
        var _this = this;

        var _props = this.props;
        var depth = _props.depth;
        var onSwapUp = _props.onSwapUp;
        var onSwapDown = _props.onSwapDown;
        var onRemove = _props.onRemove;
        var parameters = _props.parameters;
        var subValues = _props.subValues;
        var disabled = _props.disabled;
        var toggled = this.state.toggled;

        var firstParam = parameters[0];
        var instanceValue = subValues[firstParam['name']] || React.createElement(
            'span',
            { style: { color: 'rgba(0,0,0,0.33)' } },
            'Empty Value'
        );

        return React.createElement(
            Paper,
            { style: { marginLeft: 2, marginRight: 2, marginBottom: 10 } },
            React.createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center' } },
                React.createElement(
                    'div',
                    null,
                    React.createElement(IconButton, { iconClassName: 'mdi mdi-chevron-' + (this.state.toggled ? 'up' : 'down'), onTouchTap: function () {
                            _this.setState({ toggled: !_this.state.toggled });
                        } })
                ),
                React.createElement(
                    'div',
                    { style: { flex: 1, fontSize: 16 } },
                    instanceValue
                ),
                React.createElement(
                    'div',
                    null,
                    React.createElement(IconButton, { iconClassName: UP_ARROW, onTouchTap: onSwapUp, disabled: !!!onSwapUp || disabled }),
                    React.createElement(IconButton, { iconClassName: DOWN_ARROW, onTouchTap: onSwapDown, disabled: !!!onSwapDown || disabled })
                )
            ),
            toggled && React.createElement(_FormPanel2['default'], _extends({}, this.props, {
                tabs: null,
                values: subValues,
                onChange: null,
                className: 'replicable-group',
                depth: depth
            })),
            toggled && React.createElement(
                'div',
                { style: { padding: 4, textAlign: 'right' } },
                React.createElement(FlatButton, { label: 'Remove', primary: true, onTouchTap: onRemove, disabled: !!!onRemove || disabled })
            )
        );
    };

    return ReplicatedGroup;
})(Component);

exports['default'] = ReplicatedGroup;
module.exports = exports['default'];
