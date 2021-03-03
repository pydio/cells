/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

exports.TextRow = TextRow;
exports.RoundShape = RoundShape;
exports.RectShape = RectShape;
exports.TextBlock = TextBlock;
exports.MediaBlock = MediaBlock;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactPlaceholder = require('react-placeholder');

var _reactPlaceholder2 = _interopRequireDefault(_reactPlaceholder);

var _reactPlaceholderLibPlaceholders = require('react-placeholder/lib/placeholders');

var phColor = "#f5f5f5";

function TextRow(props) {
    return _react2['default'].createElement(_reactPlaceholderLibPlaceholders.TextRow, _extends({ color: phColor }, props));
}

function RoundShape(props) {
    return _react2['default'].createElement(_reactPlaceholderLibPlaceholders.RoundShape, _extends({ color: phColor }, props));
}

function RectShape(props) {
    return _react2['default'].createElement(_reactPlaceholderLibPlaceholders.RectShape, _extends({ color: phColor }, props));
}

function TextBlock(props) {
    return _react2['default'].createElement(_reactPlaceholderLibPlaceholders.TextBlock, _extends({ color: phColor }, props));
}

function MediaBlock(props) {
    return _react2['default'].createElement(_reactPlaceholderLibPlaceholders.MediaBlock, _extends({ color: phColor }, props));
}

exports['default'] = _reactPlaceholder2['default'];
