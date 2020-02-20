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

var LabelWithTip = (function (_React$Component) {
    _inherits(LabelWithTip, _React$Component);

    function LabelWithTip() {
        _classCallCheck(this, LabelWithTip);

        _React$Component.apply(this, arguments);
    }

    LabelWithTip.prototype.show = function show() {
        this.setState({ show: true });
    };

    LabelWithTip.prototype.hide = function hide() {
        this.setState({ show: false });
    };

    LabelWithTip.prototype.render = function render() {

        if (this.props.tooltip) {
            var tooltipStyle = {};
            if (this.props.label || this.props.labelElement) {
                if (this.state.show) {
                    tooltipStyle = { bottom: -10, top: 'inherit' };
                }
            } else {
                tooltipStyle = { position: 'relative' };
            }
            var label = undefined;
            if (this.props.label) {
                label = _react2['default'].createElement(
                    'span',
                    { className: 'ellipsis-label' },
                    this.props.label
                );
            } else if (this.props.labelElement) {
                label = this.props.labelElement;
            }
            var style = this.props.style || { position: 'relative' };

            return _react2['default'].createElement(
                'span',
                { onMouseEnter: this.show.bind(this), onMouseLeave: this.hide.bind(this), style: style, className: this.props.className },
                label,
                this.props.children,
                _react2['default'].createElement('div', { label: this.props.tooltip, style: _extends({}, tooltipStyle, { display: this.state.show ? 'block' : 'none' }), className: this.props.tooltipClassName })
            );
        } else {
            if (this.props.label) {
                return _react2['default'].createElement(
                    'span',
                    null,
                    this.props.label
                );
            } else if (this.props.labelElement) {
                return this.props.labelElement;
            } else {
                return _react2['default'].createElement(
                    'span',
                    null,
                    this.props.children
                );
            }
        }
    };

    return LabelWithTip;
})(_react2['default'].Component);

exports['default'] = LabelWithTip;
module.exports = exports['default'];
