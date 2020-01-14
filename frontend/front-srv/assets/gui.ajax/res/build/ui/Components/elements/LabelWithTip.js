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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

exports['default'] = _react2['default'].createClass({
    displayName: 'LabelWithTip',

    propTypes: {
        label: _react2['default'].PropTypes.string,
        labelElement: _react2['default'].PropTypes.object,
        tooltip: _react2['default'].PropTypes.string,
        tooltipClassName: _react2['default'].PropTypes.string,
        className: _react2['default'].PropTypes.string,
        style: _react2['default'].PropTypes.object
    },

    getInitialState: function getInitialState() {
        return { show: false };
    },

    show: function show() {
        this.setState({ show: true });
    },
    hide: function hide() {
        this.setState({ show: false });
    },

    render: function render() {
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
                { onMouseEnter: this.show, onMouseLeave: this.hide, style: style, className: this.props.className },
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
    }

});
module.exports = exports['default'];
