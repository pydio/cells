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

var _materialUi = require('material-ui');

var _FormPanel = require('./FormPanel');

var _FormPanel2 = _interopRequireDefault(_FormPanel);

var UP_ARROW = 'mdi mdi-chevron-up';
var DOWN_ARROW = 'mdi mdi-chevron-down';
var REMOVE = 'mdi mdi-close';
var ADD_VALUE = 'mdi mdi-plus';

var ReplicatedGroup = (function (_Component) {
    _inherits(ReplicatedGroup, _Component);

    function ReplicatedGroup(props, context) {
        _classCallCheck(this, ReplicatedGroup);

        _Component.call(this, props, context);
        var subValues = props.subValues;
        var parameters = props.parameters;

        var firstParam = parameters[0];
        var instanceValue = subValues[firstParam['name']] || '';
        this.state = { toggled: !instanceValue };
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
        var onAddValue = _props.onAddValue;
        var toggled = this.state.toggled;

        var unique = parameters.length === 1;
        var firstParam = parameters[0];
        var instanceValue = subValues[firstParam['name']] || React.createElement(
            'span',
            { style: { color: 'rgba(0,0,0,0.33)' } },
            'Empty Value'
        );
        var ibStyles = { width: 36, height: 36, padding: 6 };

        if (unique) {
            var disStyle = { opacity: .3 };
            var remStyle = !!!onRemove || disabled ? disStyle : {};
            var upStyle = !!!onSwapUp || disabled ? disStyle : {};
            var downStyle = !!!onSwapDown || disabled ? disStyle : {};
            return React.createElement(
                'div',
                { style: { display: 'flex', width: '100%' } },
                React.createElement(
                    'div',
                    { style: { flex: 1 } },
                    React.createElement(_FormPanel2['default'], _extends({}, this.props, {
                        tabs: null,
                        values: subValues,
                        onChange: null,
                        className: 'replicable-unique',
                        depth: -1,
                        style: { paddingBottom: 0 }
                    }))
                ),
                React.createElement(
                    'div',
                    { style: { display: 'flex', fontSize: 24, paddingLeft: 4, paddingTop: 2 } },
                    onAddValue && React.createElement(
                        'div',
                        null,
                        React.createElement('div', { className: ADD_VALUE, style: { padding: '8px 4px', cursor: 'pointer' }, onClick: onAddValue })
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement('div', { className: REMOVE, style: _extends({ padding: '8px 4px', cursor: 'pointer' }, remStyle), onClick: onRemove })
                    ),
                    React.createElement(
                        'div',
                        { style: { display: 'flex', flexDirection: 'column', padding: '0 4px' } },
                        React.createElement('div', { className: UP_ARROW, style: _extends({ height: 16, cursor: 'pointer' }, upStyle), onClick: onSwapUp }),
                        React.createElement('div', { className: DOWN_ARROW, style: _extends({ height: 16, cursor: 'pointer' }, downStyle), onClick: onSwapDown })
                    )
                )
            );
        }

        return React.createElement(
            _materialUi.Paper,
            { zDepth: 0, style: { border: '2px solid whitesmoke', marginBottom: 8 } },
            React.createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center' } },
                React.createElement(
                    'div',
                    null,
                    React.createElement(_materialUi.IconButton, { iconClassName: 'mdi mdi-menu-' + (this.state.toggled ? 'down' : 'right'), iconStyle: { color: 'rgba(0,0,0,.15)' }, onTouchTap: function () {
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
                    onAddValue && React.createElement(_materialUi.IconButton, { style: ibStyles, iconClassName: ADD_VALUE, onTouchTap: onAddValue }),
                    React.createElement(_materialUi.IconButton, { style: ibStyles, iconClassName: REMOVE, onTouchTap: onRemove, disabled: !!!onRemove || disabled }),
                    React.createElement(_materialUi.IconButton, { style: ibStyles, iconClassName: UP_ARROW, onTouchTap: onSwapUp, disabled: !!!onSwapUp || disabled }),
                    React.createElement(_materialUi.IconButton, { style: ibStyles, iconClassName: DOWN_ARROW, onTouchTap: onSwapDown, disabled: !!!onSwapDown || disabled })
                )
            ),
            toggled && React.createElement(_FormPanel2['default'], _extends({}, this.props, {
                tabs: null,
                values: subValues,
                onChange: null,
                className: 'replicable-group',
                depth: depth
            }))
        );
    };

    return ReplicatedGroup;
})(_react.Component);

exports['default'] = ReplicatedGroup;
module.exports = exports['default'];
