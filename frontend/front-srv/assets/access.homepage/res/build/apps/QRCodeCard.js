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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _boardPalette = require('../board/Palette');

var _boardPalette2 = _interopRequireDefault(_boardPalette);

var _boardColorPaper = require('../board/ColorPaper');

var _boardColorPaper2 = _interopRequireDefault(_boardColorPaper);

var React = require('react');
var ReactQRCode = require('qrcode.react');

var _require$requireLib = require('pydio').requireLib('components');

var asGridItem = _require$requireLib.asGridItem;

var QRCodeCard = React.createClass({
    displayName: 'QRCodeCard',

    render: function render() {

        var jsonData = {
            "server": window.location.href.split('welcome').shift(),
            "user": this.props.pydio.user ? this.props.pydio.user.id : null
        };

        return React.createElement(
            _boardColorPaper2['default'],
            _extends({}, this.props, { style: _extends({}, this.props.style, { display: 'flex' }), paletteIndex: 2, closeButton: this.props.closeButton }),
            React.createElement(
                'div',
                { style: { padding: 16, fontSize: 16, paddingRight: 8, overflow: 'hidden' } },
                this.props.pydio.MessageHash['user_home.74']
            ),
            React.createElement(
                'div',
                { className: 'home-qrCode', style: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: 16 } },
                React.createElement(ReactQRCode, { bgColor: _boardPalette2['default'][2], fgColor: '#ffffff', value: JSON.stringify(jsonData), size: 80 })
            )
        );
    }

});

exports['default'] = QRCodeCard = asGridItem(QRCodeCard, global.pydio.MessageHash['user_home.72'], { gridWidth: 2, gridHeight: 10 }, []);

exports['default'] = QRCodeCard;
module.exports = exports['default'];
