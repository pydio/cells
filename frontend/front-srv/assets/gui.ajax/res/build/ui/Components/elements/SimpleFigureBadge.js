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

var _materialUi = require('material-ui');

/**
 * Simple MuiPaper with a figure and a legend
 */

var SimpleFigureBadge = (function (_React$Component) {
    _inherits(SimpleFigureBadge, _React$Component);

    // static propTypes:{
    //     colorIndicator:PropTypes.string,
    //     figure:PropTypes.number.isRequired,
    //     legend:PropTypes.string
    // };

    function SimpleFigureBadge(props) {
        _classCallCheck(this, SimpleFigureBadge);

        _React$Component.call(this, _extends({ colorIndicator: '' }, props));
    }

    SimpleFigureBadge.prototype.render = function render() {
        return _react2['default'].createElement(
            _materialUi.Paper,
            { style: { display: 'inline-block', marginLeft: 16 } },
            _react2['default'].createElement(
                'div',
                { className: 'figure-badge', style: this.props.colorIndicator ? { borderLeftColor: this.props.colorIndicator } : {} },
                _react2['default'].createElement(
                    'div',
                    { className: 'figure' },
                    this.props.figure
                ),
                _react2['default'].createElement(
                    'div',
                    { className: 'legend' },
                    this.props.legend
                )
            )
        );
    };

    return SimpleFigureBadge;
})(_react2['default'].Component);

exports['default'] = SimpleFigureBadge;
module.exports = exports['default'];
