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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _DownloadApp = require('./DownloadApp');

var _DownloadApp2 = _interopRequireDefault(_DownloadApp);

var _boardColorPaper = require('../board/ColorPaper');

var _boardColorPaper2 = _interopRequireDefault(_boardColorPaper);

var React = require('react');

var _require$requireLib = require('pydio').requireLib('components');

var asGridItem = _require$requireLib.asGridItem;

var DlAppsPanel = (function (_React$Component) {
    _inherits(DlAppsPanel, _React$Component);

    function DlAppsPanel() {
        _classCallCheck(this, DlAppsPanel);

        _get(Object.getPrototypeOf(DlAppsPanel.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(DlAppsPanel, [{
        key: 'render',
        value: function render() {
            var configs = this.props.pydio.getPluginConfigs('access.homepage');
            var mobileBlocks = [],
                syncBlocks = [];
            if (configs.get('URL_APP_IOSAPPSTORE')) {
                mobileBlocks.push(React.createElement(_DownloadApp2['default'], _extends({}, this.props, {
                    id: 'dl_pydio_ios',
                    key: 'dl_pydio_ios',
                    configs: configs,
                    configHref: 'URL_APP_IOSAPPSTORE',
                    containerClassName: 'icon-tablet',
                    iconClassName: 'icon-apple',
                    messageId: 'user_home.59',
                    tooltipId: 'user_home.70'
                })));
            }
            if (configs.get('URL_APP_ANDROID')) {
                mobileBlocks.push(React.createElement(_DownloadApp2['default'], _extends({}, this.props, {
                    id: 'dl_pydio_android',
                    key: 'dl_pydio_android',
                    configs: configs,
                    configHref: 'URL_APP_ANDROID',
                    containerClassName: 'icon-mobile-phone',
                    iconClassName: 'icon-android',
                    messageId: 'user_home.58',
                    tooltipId: 'user_home.71'
                })));
            }
            if (configs.get('URL_APP_SYNC_WIN')) {
                syncBlocks.push(React.createElement(_DownloadApp2['default'], _extends({}, this.props, {
                    id: 'dl_pydio_win',
                    key: 'dl_pydio_win',
                    configs: configs,
                    configHref: 'URL_APP_SYNC_WIN',
                    containerClassName: 'icon-laptop',
                    iconClassName: 'icon-windows',
                    messageId: 'user_home.61',
                    tooltipId: 'user_home.68'
                })));
            }
            if (configs.get('URL_APP_SYNC_MAC')) {
                syncBlocks.push(React.createElement(_DownloadApp2['default'], _extends({}, this.props, {
                    id: 'dl_pydio_mac',
                    key: 'dl_pydio_mac',
                    configs: configs,
                    configHref: 'URL_APP_SYNC_MAC',
                    containerClassName: 'icon-desktop',
                    iconClassName: 'icon-apple',
                    messageId: 'user_home.60',
                    tooltipId: 'user_home.69'
                })));
            }

            return React.createElement(
                'div',
                { style: { textAlign: 'center', paddingTop: 5 } },
                this.props.type === 'sync' ? syncBlocks : mobileBlocks
            );
        }
    }]);

    return DlAppsPanel;
})(React.Component);

var DlAppsCard = React.createClass({
    displayName: 'DlAppsCard',

    render: function render() {
        var props = _extends({}, this.props);
        return React.createElement(
            _boardColorPaper2['default'],
            _extends({}, this.props, { style: _extends({}, this.props.style, { overflow: 'visible' }), paletteIndex: 1, closeButton: props.closeButton }),
            React.createElement(DlAppsPanel, { pydio: this.props.pydio, type: 'sync', iconColor: '#ffffff' }),
            React.createElement(
                'div',
                { style: { fontSize: 16, padding: 16, paddingTop: 0, textAlign: 'center' } },
                this.props.pydio.MessageHash['user_home.91']
            )
        );
    }
});

exports['default'] = DlAppsCard = asGridItem(DlAppsCard, global.pydio.MessageHash['user_home.92'], { gridWidth: 2, gridHeight: 10 }, []);
exports['default'] = DlAppsCard;
module.exports = exports['default'];
