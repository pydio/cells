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

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var ModalAppBar = function ModalAppBar(props) {
    var style = props.style;
    var titleStyle = props.titleStyle;
    var iconStyleRight = props.iconStyleRight;
    var iconStyleLeft = props.iconStyleLeft;

    var otherProps = _objectWithoutProperties(props, ['style', 'titleStyle', 'iconStyleRight', 'iconStyleLeft']);

    var styles = {
        style: _extends({
            flexShrink: 0
        }, style),
        titleStyle: _extends({
            lineHeight: '56px',
            height: 56,
            marginLeft: -8
        }, titleStyle),
        iconStyleRight: _extends({
            marginTop: 4
        }, iconStyleRight),
        iconStyleLeft: _extends({
            marginTop: 4
        }, iconStyleLeft)
    };

    return _react2['default'].createElement(_materialUi.AppBar, _extends({}, otherProps, styles));
};

exports['default'] = ModalAppBar;
module.exports = exports['default'];
/*borderRadius: '2px 2px 0 0',*/
