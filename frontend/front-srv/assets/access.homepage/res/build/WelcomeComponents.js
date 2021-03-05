(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.WelcomeComponents = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
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

var DlAppsCard = (function (_React$Component2) {
    _inherits(DlAppsCard, _React$Component2);

    function DlAppsCard() {
        _classCallCheck(this, DlAppsCard);

        _get(Object.getPrototypeOf(DlAppsCard.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(DlAppsCard, [{
        key: 'render',
        value: function render() {
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
    }]);

    return DlAppsCard;
})(React.Component);

exports['default'] = DlAppsCard = asGridItem(DlAppsCard, global.pydio.MessageHash['user_home.92'], { gridWidth: 2, gridHeight: 10 }, []);
exports['default'] = DlAppsCard;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../board/ColorPaper":4,"./DownloadApp":2,"pydio":"pydio","react":"react"}],2:[function(require,module,exports){
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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var DownloadApp = (function (_React$Component) {
    _inherits(DownloadApp, _React$Component);

    function DownloadApp() {
        _classCallCheck(this, DownloadApp);

        _get(Object.getPrototypeOf(DownloadApp.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(DownloadApp, [{
        key: 'render',
        value: function render() {

            var styles = {
                smallIcon: {
                    fontSize: 40,
                    width: 40,
                    height: 40
                },
                small: {
                    width: 80,
                    height: 80,
                    padding: 20
                }
            };

            var _props = this.props;
            var pydio = _props.pydio;
            var iconClassName = _props.iconClassName;
            var tooltipId = _props.tooltipId;
            var configs = _props.configs;
            var configHref = _props.configHref;

            return _react2['default'].createElement(MaterialUI.IconButton, {
                iconClassName: iconClassName,
                tooltip: pydio.MessageHash[tooltipId],
                tooltipStyles: { marginTop: 40 },
                style: styles.small,
                iconStyle: _extends({}, styles.smallIcon, { color: this.props.iconColor }),
                onClick: function () {
                    window.open(configs.get(configHref));
                }
            });
        }
    }]);

    return DownloadApp;
})(_react2['default'].Component);

DownloadApp.propTypes = {
    pydio: _propTypes2['default'].instanceOf(Pydio),
    id: _propTypes2['default'].string,
    configs: _propTypes2['default'].object,
    configHref: _propTypes2['default'].string,
    iconClassName: _propTypes2['default'].string,
    iconColor: _propTypes2['default'].string,
    messageId: _propTypes2['default'].string,
    tooltipId: _propTypes2['default'].string
};

exports['default'] = DownloadApp;
module.exports = exports['default'];

},{"prop-types":"prop-types","react":"react"}],3:[function(require,module,exports){
(function (global){
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

var _boardPalette = require('../board/Palette');

var _boardPalette2 = _interopRequireDefault(_boardPalette);

var _boardColorPaper = require('../board/ColorPaper');

var _boardColorPaper2 = _interopRequireDefault(_boardColorPaper);

var React = require('react');
var ReactQRCode = require('qrcode.react');

var _require$requireLib = require('pydio').requireLib('components');

var asGridItem = _require$requireLib.asGridItem;

var QRCodeCard = (function (_React$Component) {
    _inherits(QRCodeCard, _React$Component);

    function QRCodeCard() {
        _classCallCheck(this, QRCodeCard);

        _get(Object.getPrototypeOf(QRCodeCard.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(QRCodeCard, [{
        key: 'render',
        value: function render() {

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
    }]);

    return QRCodeCard;
})(React.Component);

exports['default'] = QRCodeCard = asGridItem(QRCodeCard, global.pydio.MessageHash['user_home.72'], { gridWidth: 2, gridHeight: 10 }, []);

exports['default'] = QRCodeCard;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../board/ColorPaper":4,"../board/Palette":9,"pydio":"pydio","qrcode.react":"qrcode.react","react":"react"}],4:[function(require,module,exports){
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

var _Palette = require('./Palette');

var _Palette2 = _interopRequireDefault(_Palette);

/**
 * Generic paper with a background color picked from palette
 */
var PropTypes = require('prop-types');
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

var React = require('react');

var _require = require('material-ui');

var Paper = _require.Paper;

var ColorPaper = (function (_React$Component) {
  _inherits(ColorPaper, _React$Component);

  function ColorPaper() {
    _classCallCheck(this, ColorPaper);

    _get(Object.getPrototypeOf(ColorPaper.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ColorPaper, [{
    key: 'render',
    value: function render() {

      var tint = _Palette2['default'][this.props.paletteIndex];

      var style = _extends({}, this.props.style, {
        backgroundColor: tint,
        color: 'white'
      });

      return React.createElement(
        Paper,
        _extends({ zDepth: 1 }, this.props, { transitionEnabled: false, style: style, className: this.props.className }),
        this.props.getCloseButton ? this.props.getCloseButton() : this.props.closeButton,
        this.props.children
      );
    }
  }]);

  return ColorPaper;
})(React.Component);

ColorPaper.propTypes = {
  /**
   * Pass the proper style for grid layout
   */
  style: PropTypes.object.isRequired,
  /**
   * Legacy way of passing the close button, use closeButton prop instead
   */
  getCloseButton: PropTypes.func,
  /**
   * Passed by parent, through the asGridItem HOC
   */
  closeButton: PropTypes.object,
  /**
   * An integer to choose which color to pick
   */
  paletteIndex: PropTypes.number.isRequired
};

exports['default'] = ColorPaper;
module.exports = exports['default'];

},{"./Palette":9,"material-ui":"material-ui","prop-types":"prop-types","react":"react"}],5:[function(require,module,exports){
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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');

var ConfigLogo = (function (_React$Component) {
    _inherits(ConfigLogo, _React$Component);

    function ConfigLogo() {
        _classCallCheck(this, ConfigLogo);

        _get(Object.getPrototypeOf(ConfigLogo.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(ConfigLogo, [{
        key: 'render',
        value: function render() {
            var logo = this.props.pydio.Registry.getPluginConfigs(this.props.pluginName).get(this.props.pluginParameter);
            var url = undefined;
            if (!logo) {
                logo = this.props.pydio.Registry.getDefaultImageFromParameters(this.props.pluginName, this.props.pluginParameter);
            }
            if (logo) {
                if (logo.indexOf('plug/') === 0) {
                    url = logo;
                } else {
                    url = this.props.pydio.Parameters.get('ENDPOINT_REST_API') + "/frontend/binaries/GLOBAL/" + logo;
                }
            }
            return React.createElement('img', { src: url, style: this.props.style, className: this.props.className });
        }
    }]);

    return ConfigLogo;
})(React.Component);

exports['default'] = ConfigLogo;
module.exports = exports['default'];

},{"react":"react"}],6:[function(require,module,exports){
/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var Facet = (function (_React$Component) {
    _inherits(Facet, _React$Component);

    function Facet() {
        _classCallCheck(this, Facet);

        _get(Object.getPrototypeOf(Facet.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Facet, [{
        key: 'select',
        value: function select() {
            var _props = this.props;
            var onSelect = _props.onSelect;
            var facet = _props.facet;

            onSelect(facet, true);
        }
    }, {
        key: 'clear',
        value: function clear() {
            var _props2 = this.props;
            var onSelect = _props2.onSelect;
            var facet = _props2.facet;

            onSelect(facet, false);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props3 = this.props;
            var facet = _props3.facet;
            var selected = _props3.selected;
            var m = _props3.m;

            var requestSelect = undefined,
                requestDelete = undefined;
            var mFacet = function mFacet(id) {
                var key = 'facet.label.' + id;
                return m(key) === key ? id : m(key);
            };
            if (selected) {
                requestDelete = function () {
                    return _this.clear();
                };
            } else {
                requestSelect = function () {
                    return _this.select();
                };
            }
            var cc = {
                chip: {
                    backgroundColor: selected ? '#03a9f4' : null,
                    labelColor: selected ? 'white' : null
                },
                avatar: {
                    backgroundColor: selected ? '#0288D1' : null,
                    color: selected ? 'white' : null
                }
            };
            return _react2['default'].createElement(
                _materialUi.Chip,
                _extends({
                    style: { margin: 4 },
                    onRequestDelete: requestDelete,
                    onClick: requestSelect
                }, cc.chip),
                _react2['default'].createElement(
                    _materialUi.Avatar,
                    cc.avatar,
                    facet.Count
                ),
                ' ',
                mFacet(facet.Label)
            );
        }
    }]);

    return Facet;
})(_react2['default'].Component);

var Facets = (function (_React$Component2) {
    _inherits(Facets, _React$Component2);

    function Facets() {
        _classCallCheck(this, Facets);

        _get(Object.getPrototypeOf(Facets.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Facets, [{
        key: 'isSelected',
        value: function isSelected(selected, facet) {
            return selected.filter(function (s) {
                return s.FieldName === facet.FieldName && s.Label === facet.Label;
            }).length > 0;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props4 = this.props;
            var pydio = _props4.pydio;
            var facets = _props4.facets;
            var onSelectFacet = _props4.onSelectFacet;
            var _props4$selected = _props4.selected;
            var selected = _props4$selected === undefined ? [] : _props4$selected;

            var m = function m(id) {
                return pydio.MessageHash['user_home.' + id] || id;
            };
            var groups = {};
            var groupKeys = {
                'NodeType': 'type',
                'Extension': 'extension',
                'Size': 'size',
                'ModifTime': 'modified',
                'Basename': 'found',
                'Meta': 'metadata'
            };
            var hasContentSelected = selected.filter(function (f) {
                return f.FieldName === 'TextContent';
            }).length > 0;
            facets.forEach(function (f) {
                var fName = f.FieldName;
                if (fName.indexOf('Meta.') === 0) {
                    fName = 'Meta';
                }
                if (fName === 'Basename' && hasContentSelected) {
                    return; // Exclude Basename when TextContent is selected
                }
                if (fName === 'TextContent') {
                    // Group basename / TextContent
                    fName = 'Basename';
                }
                if (!groups[fName]) {
                    groups[fName] = [];
                }
                groups[fName].push(f);
            });
            if (!Object.keys(groupKeys).filter(function (k) {
                return groups[k];
            }).filter(function (k) {
                var hasSelected = groups[k].filter(function (f) {
                    return _this2.isSelected(selected, f);
                }).length > 0;
                return hasSelected || groups[k].length > 1;
            }).length) {
                return null;
            }
            var styles = {
                container: {
                    position: 'absolute',
                    top: 90,
                    right: 'calc(50% + 350px)',
                    maxHeight: 'calc(100% - 100px)',
                    overflowY: 'auto',
                    width: 200,
                    borderRadius: 6,
                    paddingBottom: 10
                },
                header: {
                    fontWeight: 500,
                    color: '#5c7784',
                    padding: 10,
                    fontSize: 15
                },
                subHeader: {
                    fontWeight: 500,
                    padding: '5px 10px',
                    color: 'rgba(92, 119, 132, 0.7)'
                }
            };

            return _react2['default'].createElement(
                _materialUi.Paper,
                { style: styles.container },
                _react2['default'].createElement(
                    'div',
                    { style: styles.header },
                    m('search.facets.title')
                ),
                Object.keys(groupKeys).filter(function (k) {
                    return groups[k];
                }).filter(function (k) {
                    var hasSelected = groups[k].filter(function (f) {
                        return _this2.isSelected(selected, f);
                    }).length > 0;
                    return hasSelected || groups[k].length > 1;
                }).map(function (k) {
                    return _react2['default'].createElement(
                        'div',
                        { style: { marginBottom: 10 } },
                        _react2['default'].createElement(
                            'div',
                            { style: styles.subHeader },
                            m('search.facet.' + groupKeys[k])
                        ),
                        _react2['default'].createElement(
                            'div',
                            { style: { zoom: .8, marginLeft: 10 } },
                            groups[k].sort(function (a, b) {
                                return a.Label.localeCompare(b.Label);
                            }).map(function (f) {
                                return _react2['default'].createElement(Facet, { m: m, facet: f, selected: _this2.isSelected(selected, f), onSelect: onSelectFacet });
                            })
                        )
                    );
                })
            );
        }
    }]);

    return Facets;
})(_react2['default'].Component);

exports['default'] = Facets;
module.exports = exports['default'];

},{"material-ui":"material-ui","react":"react"}],7:[function(require,module,exports){
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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _ConfigLogo = require('./ConfigLogo');

var _ConfigLogo2 = _interopRequireDefault(_ConfigLogo);

var _WelcomeTour = require('./WelcomeTour');

var _WelcomeTour2 = _interopRequireDefault(_WelcomeTour);

var _HomeSearchForm = require('./HomeSearchForm');

var _HomeSearchForm2 = _interopRequireDefault(_HomeSearchForm);

var _recentSmartRecents = require('../recent/SmartRecents');

var _recentSmartRecents2 = _interopRequireDefault(_recentSmartRecents);

var _Pydio$requireLib = _pydio2['default'].requireLib('workspaces');

var MasterLayout = _Pydio$requireLib.MasterLayout;

var AltDashboard = (function (_React$Component) {
    _inherits(AltDashboard, _React$Component);

    function AltDashboard(props) {
        var _this = this;

        _classCallCheck(this, AltDashboard);

        _get(Object.getPrototypeOf(AltDashboard.prototype), 'constructor', this).call(this, props);
        this.state = { unreadStatus: 0, drawerOpen: true };
        if (!this.showTutorial()) {
            this.closeTimeout = setTimeout(function () {
                _this.setState({ drawerOpen: false });
            }, 2500);
        }
    }

    _createClass(AltDashboard, [{
        key: 'showTutorial',
        value: function showTutorial() {
            var pydio = this.props.pydio;

            var guiPrefs = pydio.user ? pydio.user.getPreference('gui_preferences', true) : [];
            var wTourEnabled = pydio.getPluginConfigs('gui.ajax').get('ENABLE_WELCOME_TOUR');
            return wTourEnabled && !guiPrefs['WelcomeComponent.Pydio8.TourGuide.Welcome'];
        }
    }, {
        key: 'openDrawer',
        value: function openDrawer(event) {
            event.stopPropagation();
            this.clearCloseTimeout();
            this.setState({ drawerOpen: true });
        }
    }, {
        key: 'clearCloseTimeout',
        value: function clearCloseTimeout() {
            if (this.closeTimeout) {
                clearTimeout(this.closeTimeout);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props;
            var pydio = _props.pydio;
            var muiTheme = _props.muiTheme;
            var _state = this.state;
            var drawerOpen = _state.drawerOpen;
            var fullScreen = _state.fullScreen;

            var appBarColor = new _materialUi.Color(muiTheme.appBar.color);
            var colorHue = (0, _materialUi.Color)(muiTheme.palette.primary1Color).hsl().array()[0];
            var lightBg = new _materialUi.Color({ h: colorHue, s: 35, l: 98 });
            var fontColor = (0, _materialUi.Color)(muiTheme.palette.primary1Color).darken(0.1).alpha(0.87);

            var styles = {
                appBarStyle: {
                    backgroundColor: 'rgba(255, 255, 255, 0.50)',
                    height: fullScreen ? 0 : 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                },
                buttonsStyle: {
                    color: muiTheme.appBar.textColor
                },
                iconButtonsStyle: {
                    color: appBarColor.darken(0.4).toString()
                },
                wsListsContainerStyle: {
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    position: 'relative'
                },
                wsListStyle: {
                    backgroundColor: lightBg.toString(),
                    color: fontColor.toString()
                }
            };

            var mainClasses = ['vertical_layout', 'vertical_fit', 'react-fs-template', 'user-dashboard-template'];

            var tutorialComponent = undefined;
            if (this.showTutorial()) {
                tutorialComponent = _react2['default'].createElement(_WelcomeTour2['default'], { ref: 'welcome', pydio: pydio, onFinish: function () {
                        _this2.closeTimeout = setTimeout(function () {
                            _this2.setState({ drawerOpen: false });
                        }, 1500);
                    } });
            }

            // Not used - to be used for toggling left menu
            var drawerIcon = _react2['default'].createElement(
                'span',
                { className: 'drawer-button', style: { position: 'absolute', top: 0, left: 0 } },
                _react2['default'].createElement(_materialUi.IconButton, {
                    iconStyle: { color: null },
                    iconClassName: 'mdi mdi-menu',
                    onClick: this.openDrawer.bind(this) })
            );
            var headerHeight = 72;
            var leftPanelProps = {
                style: { backgroundColor: 'transparent' },
                headerHeight: headerHeight,
                onMouseOver: function onMouseOver() {
                    _this2.clearCloseTimeout();
                },
                userWidgetProps: {
                    color: fontColor.toString(),
                    mergeButtonInAvatar: true,
                    popoverDirection: 'left',
                    actionBarStyle: {
                        marginTop: 0
                    },
                    style: {
                        height: headerHeight,
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: lightBg.toString(),
                        boxShadow: 'none'
                    }
                },
                workspacesListProps: {
                    style: styles.wsListStyle
                }
            };

            return _react2['default'].createElement(
                MasterLayout,
                {
                    pydio: pydio,
                    classes: mainClasses,
                    tutorialComponent: tutorialComponent,
                    leftPanelProps: leftPanelProps,
                    drawerOpen: drawerOpen,
                    onCloseDrawerRequested: function () {
                        if (tutorialComponent !== undefined) {
                            return;
                        }
                        _this2.setState({ drawerOpen: false });
                    }
                },
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 0, style: _extends({}, styles.appBarStyle), rounded: false },
                    drawerIcon,
                    _react2['default'].createElement(
                        'div',
                        { style: { width: 250 } },
                        _react2['default'].createElement(_ConfigLogo2['default'], {
                            className: 'home-top-logo',
                            pydio: this.props.pydio,
                            pluginName: 'gui.ajax',
                            pluginParameter: 'CUSTOM_DASH_LOGO'
                        })
                    )
                ),
                _react2['default'].createElement(
                    _HomeSearchForm2['default'],
                    _extends({ zDepth: 0 }, this.props, { style: styles.wsListsContainerStyle, fullScreen: fullScreen, onSearchStateChange: function (empty) {
                            _this2.setState({ fullScreen: !empty });
                        } }),
                    _react2['default'].createElement(_recentSmartRecents2['default'], _extends({}, this.props, { style: { maxWidth: 610, width: '100%' }, emptyStateProps: { style: { backgroundColor: 'white' } } }))
                )
            );
        }
    }]);

    return AltDashboard;
})(_react2['default'].Component);

exports['default'] = AltDashboard = (0, _materialUiStyles.muiThemeable)()(AltDashboard);

exports['default'] = AltDashboard;
module.exports = exports['default'];

},{"../recent/SmartRecents":14,"./ConfigLogo":5,"./HomeSearchForm":8,"./WelcomeTour":10,"material-ui":"material-ui","material-ui/styles":"material-ui/styles","pydio":"pydio","react":"react"}],8:[function(require,module,exports){
/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _pydioHttpSearchApi = require('pydio/http/search-api');

var _pydioHttpSearchApi2 = _interopRequireDefault(_pydioHttpSearchApi);

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _pydioModelEmptyNodeProvider = require('pydio/model/empty-node-provider');

var _pydioModelEmptyNodeProvider2 = _interopRequireDefault(_pydioModelEmptyNodeProvider);

var _lodashDebounce = require('lodash.debounce');

var _lodashDebounce2 = _interopRequireDefault(_lodashDebounce);

var _Facets = require("./Facets");

var _Facets2 = _interopRequireDefault(_Facets);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var SimpleList = _Pydio$requireLib.SimpleList;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib2.PydioContextConsumer;
var moment = _Pydio$requireLib2.moment;

var _Pydio$requireLib3 = _pydio2['default'].requireLib('workspaces');

var FilePreview = _Pydio$requireLib3.FilePreview;

var HomeSearchForm = (function (_Component) {
    _inherits(HomeSearchForm, _Component);

    function HomeSearchForm(props) {
        var _this = this;

        _classCallCheck(this, HomeSearchForm);

        _get(Object.getPrototypeOf(HomeSearchForm.prototype), 'constructor', this).call(this, props);

        // Create Fake DM
        this.basicDataModel = new _pydioModelDataModel2['default'](true);
        var rNodeProvider = new _pydioModelEmptyNodeProvider2['default']();
        this.basicDataModel.setAjxpNodeProvider(rNodeProvider);
        var rootNode = new AjxpNode("/", false, '', '', rNodeProvider);
        this.basicDataModel.setRootNode(rootNode);

        this.state = {
            queryString: '',
            dataModel: this.basicDataModel,
            empty: true,
            loading: false,
            facets: [],
            facetFilter: {},
            history: []
        };
        this.loadHistory().then(function (hh) {
            return _this.setState({ history: hh });
        });
        this.submitD = (0, _lodashDebounce2['default'])(this.submit, 500);
    }

    _createClass(HomeSearchForm, [{
        key: 'update',
        value: function update(queryString) {
            var _this2 = this;

            this.setState({ queryString: queryString }, function () {
                _this2.submitD(true);
            });
        }
    }, {
        key: 'filterByFacet',
        value: function filterByFacet(facet, toggle) {
            var _this3 = this;

            var _state$selectedFacets = this.state.selectedFacets;
            var selectedFacets = _state$selectedFacets === undefined ? [] : _state$selectedFacets;

            var newFacets = [];
            if (toggle) {
                newFacets = [].concat(_toConsumableArray(selectedFacets), [facet]);
            } else {
                newFacets = selectedFacets.filter(function (s) {
                    return !(s.FieldName === facet.FieldName && s.Label === facet.Label);
                });
            }
            this.setState({ selectedFacets: newFacets }, function () {
                _this3.submit();
            });
        }
    }, {
        key: 'computeFacets',
        value: function computeFacets(queryString) {
            var data = {};
            var _state$selectedFacets2 = this.state.selectedFacets;
            var selectedFacets = _state$selectedFacets2 === undefined ? [] : _state$selectedFacets2;

            selectedFacets.forEach(function (facet) {
                switch (facet.FieldName) {
                    case "Size":
                        data['ajxp_bytesize'] = { from: facet.Min, to: facet.Max };
                        break;
                    case "ModifTime":
                        data['ajxp_modiftime'] = { from: facet.Start * 1000, to: facet.End * 1000 };
                        break;
                    case "Extension":
                        data['ajxp_mime'] = facet.Label;
                        break;
                    case "NodeType":
                        data['ajxp_mime'] = 'ajxp_' + facet.Label;
                        break;
                    case "TextContent":
                        data['basenameOrContent'] = '';
                        data['Content'] = queryString;
                        break;
                    case "Basename":
                        data['basenameOrContent'] = '';
                        data['basename'] = queryString;
                        break;
                    default:
                        if (facet.FieldName.indexOf('Meta.') === 0) {
                            data['ajxp_meta_' + facet.FieldName.replace('Meta.', '')] = facet.Label;
                        }
                        break;
                }
            });
            return data;
        }
    }, {
        key: 'submit',
        value: function submit() {
            var _this4 = this;

            var refreshFacets = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
            var queryString = this.state.queryString;

            if (refreshFacets) {
                this.setState({ selectedFacets: [] });
            }
            if (!queryString) {
                this.toggleEmpty(true);
                this.setState({ loading: false, facets: [], selectedFacets: [] });
                return;
            }
            var dataModel = this.state.dataModel;

            var rootNode = dataModel.getRootNode();
            rootNode.setChildren([]);
            rootNode.setLoaded(true);
            this.toggleEmpty(false);
            this.setState({ loading: true });

            var api = new _pydioHttpSearchApi2['default'](this.props.pydio);
            var facetFilter = this.computeFacets(queryString);
            api.search(_extends({ basenameOrContent: queryString }, facetFilter), 'all', this.props.limit || 10).then(function (response) {
                rootNode.setChildren(response.Results);
                rootNode.setLoaded(true);
                _this4.pushHistory(queryString);
                _this4.setState({
                    loading: false,
                    facets: response.Facets || []
                });
            })['catch'](function (e) {
                _this4.setState({ loading: false });
            });
        }
    }, {
        key: 'getUserHistoryKey',
        value: function getUserHistoryKey() {
            return _pydio2['default'].getInstance().user.getIdmUser().then(function (u) {
                return "cells.search-engine.history." + u.Uuid;
            });
        }
    }, {
        key: 'loadHistory',
        value: function loadHistory() {
            return this.getUserHistoryKey().then(function (key) {
                var i = localStorage.getItem(key);
                if (!i) {
                    return [];
                }
                try {
                    var data = JSON.parse(i);
                    if (data.map) {
                        return data;
                    }
                    return [];
                } catch (e) {
                    return [];
                }
            });
        }
    }, {
        key: 'pushHistory',
        value: function pushHistory(term) {
            var _this5 = this;

            if (!term) {
                return;
            }
            var _state$history = this.state.history;
            var history = _state$history === undefined ? [] : _state$history;

            var newHistory = history.filter(function (f) {
                return f !== term;
            }).slice(0, 19); // store only 20 terms
            newHistory.unshift(term);
            this.getUserHistoryKey().then(function (key) {
                _this5.setState({ history: newHistory }, function () {
                    localStorage.setItem(key, JSON.stringify(newHistory));
                });
            });
        }
    }, {
        key: 'toggleEmpty',
        value: function toggleEmpty(e) {
            this.setState({ empty: e });
            if (e) {
                this.input.blur();
            }
            var onSearchStateChange = this.props.onSearchStateChange;

            if (onSearchStateChange) {
                onSearchStateChange(e);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this6 = this;

            var _state = this.state;
            var loading = _state.loading;
            var dataModel = _state.dataModel;
            var empty = _state.empty;
            var queryString = _state.queryString;
            var searchFocus = _state.searchFocus;
            var facets = _state.facets;
            var _state$selectedFacets3 = _state.selectedFacets;
            var selectedFacets = _state$selectedFacets3 === undefined ? [] : _state$selectedFacets3;
            var history = _state.history;
            var _props = this.props;
            var style = _props.style;
            var zDepth = _props.zDepth;
            var pydio = _props.pydio;
            var fullScreen = _props.fullScreen;

            var hintText = pydio.MessageHash[607];
            var whiteTransp = 'rgba(0,0,0,.53)';

            var styles = {
                textFieldContainer: {
                    display: 'flex',
                    backgroundColor: '#eceff1',
                    height: 50,
                    width: '96%',
                    maxWidth: 700,
                    padding: '2px 4px 4px 4px',
                    borderRadius: 50,
                    position: 'absolute',
                    top: fullScreen ? 25 : -25
                },
                textField: { flex: 1 },
                textInput: { color: 'inherit' },
                textHint: { color: whiteTransp, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' },
                magnifier: { color: whiteTransp, fontSize: 20, padding: '14px 8px' },
                close: { position: 'absolute', right: 0 }
            };

            var renderIcon = function renderIcon(node) {
                var entryProps = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

                return React.createElement(FilePreview, { loadThumbnail: !entryProps['parentIsScrolling'], node: node });
            };
            var renderSecondLine = function renderSecondLine(node) {
                var path = node.getPath();
                var metaData = node.getMetadata();
                var date = new Date();
                date.setTime(parseInt(metaData.get('ajxp_modiftime')) * 1000);
                var mDate = moment(date).fromNow();
                var bSize = _pydioUtilPath2['default'].roundFileSize(parseInt(node.getMetadata().get('bytesize')));
                var dir = _pydioUtilPath2['default'].getDirname(path);
                var location = undefined;
                if (dir) {
                    location = pydio.MessageHash['user_home.search.result.location'] + ': ' + _pydioUtilPath2['default'].getDirname(path) || '/';
                }
                return React.createElement(
                    'div',
                    null,
                    mDate,
                    ' • ',
                    bSize,
                    ' ',
                    location ? React.createElement(
                        'span',
                        null,
                        '•'
                    ) : null,
                    ' ',
                    location
                );
            };
            var renderGroupHeader = function renderGroupHeader(repoId, repoLabel) {
                return React.createElement(
                    'div',
                    { style: { fontSize: 13, color: '#93a8b2', fontWeight: 500, cursor: 'pointer' }, onClick: function () {
                            return pydio.triggerRepositoryChange(repoId);
                        } },
                    repoLabel
                );
            };

            return React.createElement(
                _materialUi.Paper,
                { style: style, zDepth: zDepth, className: 'vertical-layout home-center-paper', rounded: false },
                React.createElement(
                    _materialUi.Paper,
                    { zDepth: searchFocus || queryString ? 1 : 0, style: styles.textFieldContainer, ref: "container", className: 'home-search-form' },
                    React.createElement(_materialUi.FontIcon, { className: 'mdi mdi-magnify', style: styles.magnifier }),
                    React.createElement(_materialUi.AutoComplete, {
                        ref: function (r) {
                            _this6.input = r;
                        },
                        dataSource: history.map(function (k) {
                            return { text: k, value: k };
                        }),
                        filter: function (searchText, key) {
                            return (searchText === '' || key.indexOf(searchText) === 0) && searchText !== key;
                        },
                        openOnFocus: !queryString,
                        open: searchFocus,
                        menuProps: { desktop: true },
                        style: styles.textField,
                        inputStyle: styles.textInput,
                        hintStyle: styles.textHint,
                        fullWidth: true,
                        underlineShow: false,
                        hintText: hintText,
                        searchText: queryString,
                        menuStyle: { maxHeight: 300 },
                        onUpdateInput: function (v) {
                            return _this6.update(v);
                        },
                        onKeyPress: function (e) {
                            return e.key === 'Enter' ? _this6.update(e.target.value) : null;
                        },
                        onFocus: function () {
                            _this6.setState({ searchFocus: true });
                        },
                        onBlur: function () {
                            _this6.setState({ searchFocus: false });
                        }
                    }),
                    !loading && React.createElement('div', { style: { width: 36 } }),
                    loading && React.createElement(
                        'div',
                        { style: { marginTop: 14, marginRight: 8 } },
                        React.createElement(_materialUi.CircularProgress, { size: 20, thickness: 2 })
                    )
                ),
                fullScreen && React.createElement(_materialUi.IconButton, {
                    iconClassName: 'mdi mdi-close',
                    style: styles.close,
                    onClick: function () {
                        return _this6.update('');
                    },
                    tooltipPosition: "bottom-left",
                    tooltip: pydio.MessageHash['86']
                }),
                !empty && facets && React.createElement(_Facets2['default'], { facets: facets, selected: selectedFacets, pydio: pydio, onSelectFacet: this.filterByFacet.bind(this) }),
                !empty && React.createElement(PydioComponents.NodeListCustomProvider, {
                    ref: 'results',
                    containerStyle: { width: '86%', maxWidth: 650, marginTop: fullScreen ? 75 : 20 },
                    className: 'files-list vertical_fit',
                    elementHeight: SimpleList.HEIGHT_TWO_LINES,
                    entryRenderIcon: renderIcon,
                    entryRenderActions: function () {
                        return null;
                    },
                    entryRenderSecondLine: renderSecondLine,
                    entryRenderGroupHeader: renderGroupHeader,
                    presetDataModel: dataModel,
                    openCollection: function (node) {
                        pydio.goTo(node);
                    },
                    nodeClicked: function (node) {
                        pydio.goTo(node);
                    },
                    defaultGroupBy: 'repository_id',
                    groupByLabel: 'repository_display',
                    emptyStateProps: {
                        iconClassName: "",
                        primaryTextId: loading ? 'searchengine.searching' : 478,
                        style: { backgroundColor: 'transparent' }
                    }
                }),
                this.props.children && React.createElement(
                    'div',
                    { style: { display: empty ? 'block' : 'none', flex: 1, overflowY: 'auto', marginTop: 40 }, id: 'history-block' },
                    this.props.children
                )
            );
        }
    }]);

    return HomeSearchForm;
})(_react.Component);

exports['default'] = HomeSearchForm = PydioContextConsumer(HomeSearchForm);
exports['default'] = HomeSearchForm = (0, _materialUiStyles.muiThemeable)()(HomeSearchForm);
exports['default'] = HomeSearchForm;
module.exports = exports['default'];

},{"./Facets":6,"lodash.debounce":"lodash.debounce","material-ui":"material-ui","material-ui/styles":"material-ui/styles","pydio":"pydio","pydio/http/search-api":"pydio/http/search-api","pydio/model/data-model":"pydio/model/data-model","pydio/model/empty-node-provider":"pydio/model/empty-node-provider","pydio/util/path":"pydio/util/path","react":"react"}],9:[function(require,module,exports){
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
var retroPalette = ['#AA1735', '#C2523E', '#DF6E41', '#F57E5E', '#FA8535'];
var materialPalette = ['#E53935', '#D81B60', '#7b1fa2', '#3f51b5', '#2196f3'];

exports['default'] = materialPalette;
module.exports = exports['default'];

},{}],10:[function(require,module,exports){
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

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var AsyncComponent = _Pydio$requireLib.AsyncComponent;
var PydioContextConsumer = _Pydio$requireLib.PydioContextConsumer;

var Scheme = (function (_Component) {
    _inherits(Scheme, _Component);

    function Scheme() {
        _classCallCheck(this, Scheme);

        _get(Object.getPrototypeOf(Scheme.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Scheme, [{
        key: 'render',
        value: function render() {
            var style = {
                position: 'relative',
                fontSize: 24,
                width: this.props.dimension || 100,
                height: this.props.dimension || 100,
                backgroundColor: '#ECEFF1',
                color: '#607d8b',
                borderRadius: '50%',
                margin: '0 auto'
            };
            return React.createElement(
                'div',
                { style: _extends({}, style, this.props.style) },
                this.props.children
            );
        }
    }]);

    return Scheme;
})(_react.Component);

var WorkspacesCard = function WorkspacesCard(props) {

    var renderRay = function renderRay(angle) {
        return React.createElement(
            'div',
            { style: { position: 'absolute', top: 52, left: 20, width: 80, display: 'flex', transformOrigin: 'left', transform: 'rotate(' + -angle + 'deg)' } },
            React.createElement('span', { style: { flex: 1 } }),
            React.createElement('span', { className: 'mdi mdi-dots-horizontal', style: { opacity: .5, marginRight: 5 } }),
            React.createElement('span', { style: { display: 'inline-block', transform: 'rotate(' + angle + 'deg)' }, className: 'mdi mdi-account' })
        );
    };

    return React.createElement(
        'div',
        null,
        React.createElement(
            'p',
            null,
            props.message('workspaces.1')
        ),
        React.createElement(
            Scheme,
            { dimension: 130 },
            React.createElement('span', { style: { position: 'absolute', top: 52, left: 20 }, className: 'mdi mdi-network' }),
            renderRay(30),
            renderRay(0),
            renderRay(-30)
        ),
        React.createElement(
            'p',
            null,
            props.message('workspaces.2')
        ),
        React.createElement(
            Scheme,
            { dimension: 130 },
            React.createElement('span', { className: 'mdi mdi-account', style: { position: 'absolute', left: 54, top: 32 } }),
            React.createElement(
                'div',
                { style: { position: 'absolute', top: 60, left: 30 } },
                React.createElement('span', { className: 'mdi mdi-folder' }),
                React.createElement('span', { className: 'mdi mdi-arrow-right' }),
                React.createElement('span', { className: 'mdi mdi-network' })
            )
        )
    );
};

var SearchCard = function SearchCard(props) {

    return React.createElement(
        'div',
        null,
        React.createElement(
            'p',
            null,
            props.message('globsearch.1')
        ),
        React.createElement(
            Scheme,
            { style: { fontSize: 10, padding: 25 }, dimension: 130 },
            React.createElement(
                'div',
                { style: { boxShadow: '2px 2px 0px #CFD8DC' } },
                React.createElement(
                    'div',
                    { style: { backgroundColor: '#03a9f4', color: 'white', borderRadius: '3px 3px 0 0' } },
                    React.createElement('span', { className: 'mdi mdi-magnify' }),
                    props.message('infopanel.search'),
                    '...'
                ),
                React.createElement(
                    'div',
                    { style: { backgroundColor: 'white' } },
                    React.createElement(
                        'div',
                        null,
                        React.createElement('span', { className: 'mdi mdi-folder' }),
                        ' ',
                        props.message('infopanel.folder'),
                        ' 1 '
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement('span', { className: 'mdi mdi-folder' }),
                        '  ',
                        props.message('infopanel.file'),
                        ' 2'
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement('span', { className: 'mdi mdi-file' }),
                        ' ',
                        props.message('infopanel.file'),
                        ' 3'
                    )
                )
            )
        ),
        React.createElement(
            'p',
            null,
            props.message('globsearch.2')
        )
    );
};

var WidgetsCard = function WidgetsCard(props) {

    return React.createElement(
        'div',
        null,
        React.createElement(
            'p',
            null,
            props.message('widget-cards')
        ),
        React.createElement(
            Scheme,
            null,
            React.createElement('img', { src: 'plug/access.homepage/res/images/movecards.gif', style: { height: 70, margin: '15px 30px' } })
        )
    );
};

var WelcomeTour = (function (_Component2) {
    _inherits(WelcomeTour, _Component2);

    function WelcomeTour(props, context) {
        _classCallCheck(this, WelcomeTour);

        _get(Object.getPrototypeOf(WelcomeTour.prototype), 'constructor', this).call(this, props, context);
        this.state = { started: !(props.pydio.user && !props.pydio.user.getPreference('gui_preferences', true)['UserAccount.WelcomeModal.Shown']) };
    }

    _createClass(WelcomeTour, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this = this;

            if (!this.state.started) {
                pydio.UI.openComponentInModal('UserAccount', 'WelcomeModal', {
                    onRequestStart: function onRequestStart(skip) {
                        if (skip) {
                            _this.discard(true);
                        } else {
                            _this.discard(false);
                            _this.setState({ started: true });
                        }
                    }
                });
            }
        }
    }, {
        key: 'discard',
        value: function discard() {
            var finished = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
            var _props = this.props;
            var pydio = _props.pydio;
            var onFinish = _props.onFinish;
            var user = pydio.user;

            var guiPrefs = user.getPreference('gui_preferences', true);
            guiPrefs['UserAccount.WelcomeModal.Shown'] = true;
            if (finished) {
                guiPrefs['WelcomeComponent.Pydio8.TourGuide.Welcome'] = true;
                if (onFinish) {
                    onFinish();
                }
            }
            user.setPreference('gui_preferences', guiPrefs, true);
            user.savePreference('gui_preferences');
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            if (!this.state.started) {
                return null;
            }
            var getMessage = this.props.getMessage;

            var message = function message(id) {
                return getMessage('ajax_gui.tour.' + id);
            };

            var tourguideSteps = [{
                title: message('workspaces.title'),
                text: React.createElement(WorkspacesCard, { message: message }),
                selector: '.user-workspaces-list',
                position: 'right'
            }, {
                title: message('globsearch.title'),
                text: React.createElement(SearchCard, { message: message }),
                selector: '.home-search-form',
                position: 'bottom'
            }];
            if (this.props.pydio.user) {
                var hasAccessRepo = false;
                this.props.pydio.user.getRepositoriesList().forEach(function (entry) {
                    if (entry.accessType === "gateway") {
                        hasAccessRepo = true;
                    }
                });
                if (hasAccessRepo) {
                    tourguideSteps.push({
                        title: message('openworkspace.title'),
                        text: message('openworkspace'),
                        selector: '.workspace-entry',
                        position: 'right'
                    });
                }
            }

            var callback = function callback(data) {
                if (data.type === 'step:after' && data.index === tourguideSteps.length - 1) {
                    _this2.discard(true);
                }
            };
            return React.createElement(AsyncComponent, {
                namespace: 'PydioWorkspaces',
                componentName: 'TourGuide',
                ref: 'joyride',
                steps: tourguideSteps,
                run: true, // or some other boolean for when you want to start it
                autoStart: true,
                debug: false,
                callback: callback,
                type: 'continuous'
            });
        }
    }]);

    return WelcomeTour;
})(_react.Component);

exports['default'] = WelcomeTour = PydioContextConsumer(WelcomeTour);

exports['default'] = WelcomeTour;
module.exports = exports['default'];

},{"pydio":"pydio","react":"react"}],11:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _appsDlAppsCard = require('./apps/DlAppsCard');

var _appsDlAppsCard2 = _interopRequireDefault(_appsDlAppsCard);

var _appsQRCodeCard = require('./apps/QRCodeCard');

var _appsQRCodeCard2 = _interopRequireDefault(_appsQRCodeCard);

var _quicksendQuickSendCard = require('./quicksend/QuickSendCard');

var _quicksendQuickSendCard2 = _interopRequireDefault(_quicksendQuickSendCard);

var _quicksendWorkspacePickerDialog = require('./quicksend/WorkspacePickerDialog');

var _quicksendWorkspacePickerDialog2 = _interopRequireDefault(_quicksendWorkspacePickerDialog);

var _videosVideoCard = require('./videos/VideoCard');

var _videosVideoCard2 = _interopRequireDefault(_videosVideoCard);

var _workspacesWorkspacesListCard = require('./workspaces/WorkspacesListCard');

var _workspacesWorkspacesListCard2 = _interopRequireDefault(_workspacesWorkspacesListCard);

var _boardHomeDashboard = require('./board/HomeDashboard');

var _boardHomeDashboard2 = _interopRequireDefault(_boardHomeDashboard);

exports.DlAppsCard = _appsDlAppsCard2['default'];
exports.QRCodeCard = _appsQRCodeCard2['default'];
exports.QuickSendCard = _quicksendQuickSendCard2['default'];
exports.WorkspacePickerDialog = _quicksendWorkspacePickerDialog2['default'];
exports.VideoCard = _videosVideoCard2['default'];
exports.WorkspacesListCard = _workspacesWorkspacesListCard2['default'];
exports.HomeDashboard = _boardHomeDashboard2['default'];

},{"./apps/DlAppsCard":1,"./apps/QRCodeCard":3,"./board/HomeDashboard":7,"./quicksend/QuickSendCard":12,"./quicksend/WorkspacePickerDialog":13,"./videos/VideoCard":15,"./workspaces/WorkspacesListCard":17}],12:[function(require,module,exports){
(function (global){
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

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _boardColorPaper = require('../board/ColorPaper');

var _boardColorPaper2 = _interopRequireDefault(_boardColorPaper);

var React = require('react');

var _require = require('material-ui');

var CardTitle = _require.CardTitle;
var CircularProgress = _require.CircularProgress;

var _require$requireLib = require('pydio').requireLib('components');

var asGridItem = _require$requireLib.asGridItem;

var _require$requireLib2 = require('pydio').requireLib('form');

var FileDropZone = _require$requireLib2.FileDropZone;

var _require$requireLib3 = require('pydio').requireLib('hoc');

var NativeFileDropProvider = _require$requireLib3.NativeFileDropProvider;

var BinaryDropZone = NativeFileDropProvider(FileDropZone, function (items, files, props) {});

var QuickSendCard = (function (_React$Component) {
    _inherits(QuickSendCard, _React$Component);

    function QuickSendCard() {
        var _this = this;

        _classCallCheck(this, QuickSendCard);

        _get(Object.getPrototypeOf(QuickSendCard.prototype), 'constructor', this).apply(this, arguments);

        this.fileDroppedOrPicked = function (event) {
            var monitor = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            var items = undefined,
                files = undefined;
            if (monitor) {
                var dataTransfer = monitor.getItem().dataTransfer;
                if (dataTransfer.items.length && dataTransfer.items[0] && (dataTransfer.items[0].getAsEntry || dataTransfer.items[0].webkitGetAsEntry)) {
                    items = dataTransfer.items;
                }
            } else if (event.dataTransfer) {
                items = event.dataTransfer.items || [];
                files = event.dataTransfer.files;
            } else if (event.target) {
                files = event.target.files;
            }

            var uploadItems = [];
            if (window['UploaderModel'] && global.pydio.getController().getActionByName('upload')) {
                UploaderModel.Store.getInstance().handleDropEventResults(items, files, new AjxpNode('/'), uploadItems);
            }
            return uploadItems;
        };

        this.onDrop = function (files, event, source) {
            var items = _this.fileDroppedOrPicked(event);
            _this.setState({ uploadItems: items });
            _this.props.pydio.UI.openComponentInModal('WelcomeComponents', 'WorkspacePickerDialog', {
                onWorkspaceTouchTap: _this.targetWorkspaceSelected.bind(_this),
                legend: files && files[0] ? React.createElement(
                    'div',
                    { style: { fontSize: 13, padding: 16, backgroundColor: '#FFEBEE' } },
                    _this.props.pydio.MessageHash['user_home.89'],
                    ': ',
                    files[0].name
                ) : undefined
            });
        };

        this.targetWorkspaceSelected = function (wsId) {
            var contextNode = new AjxpNode('/');
            contextNode.getMetadata().set('repository_id', wsId);
            var uploadItems = _this.state.uploadItems;

            if (window['UploaderModel'] && global.pydio.getController().getActionByName('upload')) {
                (function () {
                    var instance = UploaderModel.Store.getInstance();
                    uploadItems.forEach(function (item) {
                        item.updateRepositoryId(wsId);
                        item.observe('status', function () {
                            _this.setState({ working: item.getStatus() === 'loading' });
                        });
                        instance.pushFile(item);
                    });
                    instance.processNext();
                })();
            }
        };
    }

    _createClass(QuickSendCard, [{
        key: 'render',
        value: function render() {
            var title = React.createElement(CardTitle, { title: 'Quick Upload' });
            var working = this.state && this.state.working;

            return React.createElement(
                _boardColorPaper2['default'],
                _extends({ zDepth: 1 }, this.props, { paletteIndex: 0, closeButton: this.props.closeButton }),
                React.createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', height: '100%' } },
                    React.createElement(
                        'div',
                        { style: { padding: 16, fontSize: 16, width: 100 } },
                        this.props.pydio.MessageHash['user_home.88']
                    ),
                    React.createElement(
                        'div',
                        { style: { textAlign: 'center', padding: 18, flex: 1 } },
                        working && React.createElement(CircularProgress, { size: 80, thickness: 4, color: 'white' }),
                        !working && React.createElement(
                            BinaryDropZone,
                            {
                                ref: 'dropzone',
                                multiple: true,
                                enableFolders: false,
                                supportClick: true,
                                onDrop: this.onDrop,
                                style: { width: '100%', borderWidth: 0, height: 'auto', borderRadius: '50%', border: '4px solid white', fontSize: 56, padding: 20 },
                                dragActiveStyle: { border: '4px dashed white' }
                            },
                            React.createElement('span', { className: 'mdi mdi-cloud-upload' })
                        )
                    )
                )
            );
        }
    }]);

    return QuickSendCard;
})(React.Component);

exports['default'] = QuickSendCard = asGridItem(QuickSendCard, global.pydio.MessageHash['user_home.93'], { gridWidth: 2, gridHeight: 10 }, []);
exports['default'] = QuickSendCard;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../board/ColorPaper":4,"material-ui":"material-ui","pydio":"pydio","react":"react"}],13:[function(require,module,exports){
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
var React = require('react');
var createReactClass = require('create-react-class');

var _require$requireLib = require('pydio').requireLib('boot');

var ActionDialogMixin = _require$requireLib.ActionDialogMixin;
var CancelButtonProviderMixin = _require$requireLib.CancelButtonProviderMixin;

var _require$requireLib2 = require('pydio').requireLib('workspaces');

var WorkspacesListMaterial = _require$requireLib2.WorkspacesListMaterial;

var WorkspacePickerDialog = createReactClass({
    displayName: 'WorkspacePickerDialog',

    mixins: [ActionDialogMixin, CancelButtonProviderMixin],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitleId: 'user_home.90',
            dialogSize: 'sm',
            dialogPadding: false,
            dialogIsModal: true,
            dialogScrollBody: true
        };
    },

    submit: function submit() {
        this.dismiss();
    },

    workspaceTouchTap: function workspaceTouchTap(wsId) {
        this.dismiss();
        this.props.onWorkspaceTouchTap(wsId);
    },

    render: function render() {
        var pydio = this.props.pydio;

        return React.createElement(
            'div',
            { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column' } },
            this.props.legend,
            React.createElement(WorkspacesListMaterial, {
                pydio: pydio,
                workspaces: pydio.user ? pydio.user.getRepositoriesList() : [],
                showTreeForWorkspace: false,
                onWorkspaceTouchTap: this.workspaceTouchTap,
                filterByType: 'entries',
                sectionTitleStyle: { display: 'none' },
                style: { flex: 1, overflowY: 'auto', maxHeight: 400 }
            })
        );
    }
});

exports['default'] = WorkspacePickerDialog;
module.exports = exports['default'];

},{"create-react-class":"create-react-class","pydio":"pydio","react":"react"}],14:[function(require,module,exports){
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

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _pydioModelMetaNodeProvider = require('pydio/model/meta-node-provider');

var _pydioModelMetaNodeProvider2 = _interopRequireDefault(_pydioModelMetaNodeProvider);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _cellsSdk = require('cells-sdk');

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib.PydioContextConsumer;
var moment = _Pydio$requireLib.moment;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('workspaces');

var FilePreview = _Pydio$requireLib2.FilePreview;

var _Pydio$requireLib3 = _pydio2['default'].requireLib('PydioActivityStreams');

var ASClient = _Pydio$requireLib3.ASClient;

var _Pydio$requireLib4 = _pydio2['default'].requireLib('hoc');

var PlaceHolder = _Pydio$requireLib4.PlaceHolder;
var PhTextRow = _Pydio$requireLib4.PhTextRow;
var PhRoundShape = _Pydio$requireLib4.PhRoundShape;

var Loader = (function () {
    function Loader(pydio, stater) {
        _classCallCheck(this, Loader);

        this.pydio = pydio;
        this.stater = stater;
        this.metaProvider = new _pydioModelMetaNodeProvider2['default']();
    }

    _createClass(Loader, [{
        key: 'load',
        value: function load() {
            var _this = this;

            var allLoaders = [this.loadActivities(), this.loadBookmarks(), this.workspacesAsNodes()];
            return Promise.all(allLoaders).then(function (results) {
                var allResolvers = [];
                var allNodes = [];
                var allKeys = {};
                results.map(function (resolvers) {
                    allResolvers = [].concat(_toConsumableArray(allResolvers), _toConsumableArray(resolvers));
                });
                return _this.resolveNext(allResolvers, allNodes, allKeys, 8);
            });
        }
    }, {
        key: 'resolveNext',
        value: function resolveNext(allResolvers, allNodes, allKeys) {
            var _this2 = this;

            var max = arguments.length <= 3 || arguments[3] === undefined ? 8 : arguments[3];

            if (allNodes.length > max || !allResolvers.length) {
                return Promise.resolve(allNodes);
            }
            var next = allResolvers.shift();
            return new Promise(next).then(function (node) {
                if (node && !allKeys[node.getMetadata().get("uuid")]) {
                    allNodes.push(node);
                    allKeys[node.getMetadata().get("uuid")] = node.getMetadata().get("uuid");
                    _this2.stater.setState({ nodes: [].concat(_toConsumableArray(allNodes)), loading: false });
                }
                return _this2.resolveNext(allResolvers, allNodes, allKeys, max);
            });
        }
    }, {
        key: 'loadBookmarks',
        value: function loadBookmarks() {
            var _this3 = this;

            var api = new _cellsSdk.UserMetaServiceApi(_pydioHttpApi2['default'].getRestClient());
            return new Promise(function (resolve) {
                api.userBookmarks(new _cellsSdk.RestUserBookmarksRequest()).then(function (collection) {
                    var nodes = [];
                    if (!collection.Nodes) {
                        resolve([]);
                        return;
                    }
                    collection.Nodes.slice(0, 4).forEach(function (n) {
                        if (!n.AppearsIn) {
                            return;
                        }
                        var path = n.AppearsIn[0].Path;
                        if (!path) {
                            path = '/';
                        }
                        var fakeNode = new _pydioModelNode2['default'](path, n.Type === 'LEAF');
                        fakeNode.getMetadata().set('repository_id', n.AppearsIn[0].WsUuid);
                        nodes.push(function (resolve1) {
                            _this3.metaProvider.refreshNodeAndReplace(fakeNode, function (freshNode) {
                                freshNode.getMetadata().set('card_legend', 'Bookmarked');
                                freshNode.getMetadata().set('repository_id', n.AppearsIn[0].WsUuid);
                                resolve1(freshNode);
                            }, function () {
                                resolve1(null);
                            });
                        });
                    });
                    resolve(nodes);
                });
            });
        }
    }, {
        key: 'loadActivities',
        value: function loadActivities() {
            var _this4 = this;

            return new Promise(function (resolve) {
                ASClient.loadActivityStreams('USER_ID', _this4.pydio.user.id, 'outbox', 'ACTOR', 0, 20).then(function (json) {
                    if (!json.items) {
                        resolve([]);
                        return;
                    }
                    var nodes = [];
                    json.items.filter(function (a) {
                        return !!a.object;
                    }).forEach(function (activity) {
                        var mom = moment(activity.updated);
                        var n = _this4.nodeFromActivityObject(activity.object);
                        if (n) {
                            nodes.push(function (resolve1) {
                                var wsId = n.getMetadata().get('repository_id');
                                var wsLabel = n.getMetadata().get('repository_label');
                                _this4.metaProvider.refreshNodeAndReplace(n, function (freshNode) {
                                    freshNode.getMetadata().set('repository_id', wsId);
                                    if (freshNode.getPath() === '' || freshNode.getPath() === '/') {
                                        freshNode.setLabel(wsLabel);
                                    }
                                    freshNode.getMetadata().set('card_legend', mom.fromNow());
                                    resolve1(freshNode);
                                }, function () {
                                    resolve1(null);
                                });
                            });
                        }
                    });
                    resolve(nodes);
                })['catch'](function (msg) {
                    resolve([]);
                });
            });
        }
    }, {
        key: 'workspacesAsNodes',
        value: function workspacesAsNodes() {
            var _this5 = this;

            var ws = [];
            var repos = [];
            this.pydio.user.getRepositoriesList().forEach(function (repo) {
                repos.push(repo);
            });
            repos.slice(0, 10).forEach(function (repoObject) {
                if (repoObject.getId() === 'homepage' || repoObject.getId() === 'settings') {
                    return;
                }
                var node = new _pydioModelNode2['default']('/', false, repoObject.getLabel());
                var fontIcon = 'folder';
                var legend = 'Workspace';
                if (repoObject.getRepositoryType() === "workspace-personal") {
                    fontIcon = 'folder-account';
                } else if (repoObject.getRepositoryType() === "cell") {
                    fontIcon = 'icomoon-cells';
                    legend = 'Cell';
                }
                ws.push(function (resolve) {
                    node.getMetadata().set("repository_id", repoObject.getId());
                    _this5.metaProvider.refreshNodeAndReplace(node, function (freshNode) {
                        freshNode.setLabel(repoObject.getLabel());
                        freshNode.getMetadata().set("repository_id", repoObject.getId());
                        freshNode.getMetadata().set("card_legend", legend);
                        freshNode.getMetadata().set("fonticon", fontIcon);
                        resolve(freshNode);
                    }, function () {
                        resolve(null);
                    });
                });
            });
            return Promise.resolve(ws);
        }
    }, {
        key: 'nodeFromActivityObject',
        value: function nodeFromActivityObject(object) {
            if (!object.partOf || !object.partOf.items || !object.partOf.items.length) {
                return null;
            }
            for (var i = 0; i < object.partOf.items.length; i++) {
                var ws = object.partOf.items[i];
                // Remove slug part
                var paths = ws.rel.split('/');
                paths.shift();
                var relPath = paths.join('/');
                var root = false;
                var label = _pydioUtilPath2['default'].getBasename(relPath);
                if (!relPath) {
                    root = true;
                    relPath = "/";
                    label = ws.name;
                }
                var node = new _pydioModelNode2['default'](relPath, object.type === 'Document', label);
                if (root) {
                    node.setRoot(true);
                }
                node.getMetadata().set('repository_id', ws.id);
                node.getMetadata().set('repository_label', ws.name);
                return node;
            }
            return null;
        }
    }]);

    return Loader;
})();

var RecentCard = (function (_React$Component) {
    _inherits(RecentCard, _React$Component);

    function RecentCard(props) {
        _classCallCheck(this, RecentCard);

        _get(Object.getPrototypeOf(RecentCard.prototype), 'constructor', this).call(this, props);
        this.state = { opacity: 0 };
    }

    _createClass(RecentCard, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this6 = this;

            setTimeout(function () {
                _this6.setState({ opacity: 1 });
            }, 200);
        }
    }, {
        key: 'render',
        value: function render() {
            var opacity = this.state.opacity;

            var styles = {
                paper: {
                    width: 120, height: 140, margin: 16, display: 'flex', flexDirection: 'column', cursor: 'pointer',
                    alignItems: 'center', textAlign: 'center',
                    opacity: opacity,
                    transition: 'all 1000ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'
                },
                preview: {
                    boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
                    borderRadius: '50%',
                    width: 90,
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    display: 'flex'
                },
                label: { fontSize: 14, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' },
                title: { fontSize: 14, marginTop: 10 },
                legend: { fontSize: 11, fontWeight: 500, color: '#9E9E9E' }
            };

            var _props = this.props;
            var title = _props.title;
            var legend = _props.legend;
            var node = _props.node;
            var pydio = _props.pydio;

            return _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: 0, style: styles.paper, onClick: function () {
                        pydio.goTo(node);
                    } },
                node && _react2['default'].createElement(FilePreview, { node: node, style: styles.preview, mimeFontStyle: { fontSize: 40 }, loadThumbnail: true }),
                _react2['default'].createElement(
                    'div',
                    { style: _extends({}, styles.label, styles.title) },
                    title
                ),
                _react2['default'].createElement(
                    'div',
                    { style: _extends({}, styles.label, styles.legend) },
                    legend
                )
            );
        }
    }]);

    return RecentCard;
})(_react2['default'].Component);

var SmartRecents = (function (_React$Component2) {
    _inherits(SmartRecents, _React$Component2);

    function SmartRecents(props) {
        _classCallCheck(this, SmartRecents);

        _get(Object.getPrototypeOf(SmartRecents.prototype), 'constructor', this).call(this, props);
        this.loader = new Loader(props.pydio, this);
        this.state = { nodes: [], loading: false };
    }

    _createClass(SmartRecents, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this7 = this;

            this.setState({ loading: true });
            this.loader.load().then(function (nodes) {
                _this7.setState({ nodes: nodes, loading: false });
            })['catch'](function () {
                _this7.setState({ loading: false });
            });
        }
    }, {
        key: 'render',
        value: function render() {

            var cardsPH = _react2['default'].createElement(
                'div',
                { style: { display: 'flex', flexWrap: 'wrap' } },
                [0, 1, 2, 3, 4, 5, 6, 7].map(function () {
                    return _react2['default'].createElement(
                        'div',
                        { style: { margin: 16, width: 120, height: 140, display: 'flex', flexDirection: 'column', alignItems: 'center' } },
                        _react2['default'].createElement(PhRoundShape, { style: { width: 90, height: 90 } }),
                        _react2['default'].createElement(PhTextRow, null),
                        _react2['default'].createElement(PhTextRow, null)
                    );
                })
            );

            var _props2 = this.props;
            var pydio = _props2.pydio;
            var style = _props2.style;
            var _state = this.state;
            var nodes = _state.nodes;
            var loading = _state.loading;

            if (!pydio.user || pydio.user.lock) {
                return _react2['default'].createElement('div', null);
            }
            var keys = {};
            var cards = [];
            nodes.forEach(function (node) {
                var k = node.getMetadata().get("uuid");
                if (keys[k] || cards.length >= 8) {
                    return;
                }
                keys[k] = k;
                cards.push(_react2['default'].createElement(RecentCard, {
                    key: k,
                    pydio: pydio,
                    node: node,
                    title: node.getLabel(),
                    legend: node.getMetadata().get('card_legend')
                }));
            });

            return _react2['default'].createElement(
                'div',
                { style: _extends({ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }, style) },
                _react2['default'].createElement(
                    PlaceHolder,
                    { ready: !loading, showLoadingAnimation: true, customPlaceholder: cardsPH },
                    cards
                )
            );
        }
    }]);

    return SmartRecents;
})(_react2['default'].Component);

exports['default'] = SmartRecents = PydioContextConsumer(SmartRecents);
exports['default'] = SmartRecents;
module.exports = exports['default'];

},{"cells-sdk":"cells-sdk","material-ui":"material-ui","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/model/meta-node-provider":"pydio/model/meta-node-provider","pydio/model/node":"pydio/model/node","pydio/util/path":"pydio/util/path","react":"react"}],15:[function(require,module,exports){
(function (global){
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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _VideoPlayer = require('./VideoPlayer');

var _VideoPlayer2 = _interopRequireDefault(_VideoPlayer);

var _boardPalette = require('../board/Palette');

var _boardPalette2 = _interopRequireDefault(_boardPalette);

var _boardColorPaper = require('../board/ColorPaper');

var _boardColorPaper2 = _interopRequireDefault(_boardColorPaper);

var React = require('react');

var ReactDOM = require('react-dom');

var _require$requireLib = require('pydio').requireLib('components');

var asGridItem = _require$requireLib.asGridItem;

var _require = require('material-ui');

var MenuItem = _require.MenuItem;
var IconMenu = _require.IconMenu;

var PALETTE_INDEX = 4;

/**
 * Display a list of tutorial videos as a material card
 */

var VideoCard = (function (_React$Component) {
    _inherits(VideoCard, _React$Component);

    _createClass(VideoCard, null, [{
        key: 'propTypes',
        value: {
            youtubeId: _propTypes2['default'].string,
            contentMessageId: _propTypes2['default'].string
        },
        enumerable: true
    }]);

    function VideoCard(props) {
        var _this = this;

        _classCallCheck(this, VideoCard);

        _get(Object.getPrototypeOf(VideoCard.prototype), 'constructor', this).call(this, props);

        this.launchVideo = function () {
            var url = "//www.youtube.com/embed/" + _this.state.youtubeId + "?list=PLxzQJCqzktEbYm3U_O1EqFru0LsEFBca5&autoplay=1";
            _this._videoDiv = document.createElement('div');
            document.body.appendChild(_this._videoDiv);
            ReactDOM.render(React.createElement(_VideoPlayer2['default'], { videoSrc: url, closePlayer: _this.closePlayer }), _this._videoDiv);
        };

        this.closePlayer = function () {
            ReactDOM.unmountComponentAtNode(_this._videoDiv);
            document.body.removeChild(_this._videoDiv);
        };

        this.getTitle = function (messId) {
            var text = _this.props.pydio.MessageHash[messId];
            return text.split('\n').shift().replace('<h2>', '').replace('</h2>', '');
        };

        this.browse = function (direction, event) {
            if (direction === undefined) direction = 'next';

            var nextIndex = undefined;
            var videoIndex = _this.state.videoIndex;

            if (direction === 'next') {
                nextIndex = videoIndex < _this._videos.length - 1 ? videoIndex + 1 : 0;
            } else {
                nextIndex = videoIndex > 0 ? videoIndex - 1 : _this._videos.length - 1;
            }
            var value = _this._videos[nextIndex];
            _this.setState({
                videoIndex: nextIndex,
                youtubeId: value[0],
                contentMessageId: value[1]
            });
        };

        this._videos = [['qvsSeLXr-T4', 'user_home.63'], ['HViCWPpyZ6k', 'user_home.79'], ['jBRNqwannJM', 'user_home.80'], ['2jl1EsML5v8', 'user_home.81'], ['28-t4dvhE6c', 'user_home.82'], ['fP0MVejnVZE', 'user_home.83'], ['TXFz4w4trlQ', 'user_home.84'], ['OjHtgnL_L7Y', 'user_home.85'], ['ot2Nq-RAnYE', 'user_home.66']];
        var k = Math.floor(Math.random() * this._videos.length);
        var value = this._videos[k];

        this.state = {
            videoIndex: k,
            youtubeId: value[0],
            contentMessageId: value[1]
        };
    }

    _createClass(VideoCard, [{
        key: 'render',
        value: function render() {
            var _this3 = this;

            var MessageHash = this.props.pydio.MessageHash;
            var htmlMessage = function htmlMessage(id) {
                return { __html: MessageHash[id] };
            };
            var menus = this._videos.map((function (item, index) {
                var _this2 = this;

                return React.createElement(MenuItem, { key: 'videoCardMenuItem_' + index, primaryText: this.getTitle(item[1]), onClick: function () {
                        _this2.setState({ youtubeId: item[0], contentMessageId: item[1], videoIndex: index });
                    } });
            }).bind(this));
            var props = _extends({}, this.props);
            var _state = this.state;
            var youtubeId = _state.youtubeId;
            var contentMessageId = _state.contentMessageId;

            props.className += ' video-card';

            var tint = MaterialUI.Color(_boardPalette2['default'][PALETTE_INDEX]).alpha(0.8).toString();
            return React.createElement(
                _boardColorPaper2['default'],
                _extends({}, props, { paletteIndex: PALETTE_INDEX, getCloseButton: function () {
                        return _this3.props.closeButton;
                    } }),
                React.createElement(
                    'div',
                    { className: 'tutorial_legend' },
                    React.createElement(
                        'div',
                        { className: 'tutorial_video_thumb', style: { backgroundImage: 'url("https://img.youtube.com/vi/' + youtubeId + '/0.jpg")' } },
                        React.createElement('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: tint } }),
                        React.createElement('div', { className: 'tutorial_prev mdi mdi-arrow-left', onClick: this.browse.bind(this, 'previous') }),
                        React.createElement('div', { className: 'tutorial_play mdi mdi-play', onClick: this.launchVideo }),
                        React.createElement('div', { className: 'tutorial_next mdi mdi-arrow-right', onClick: this.browse.bind(this, 'next') }),
                        React.createElement(
                            'div',
                            { className: 'tutorial_title' },
                            React.createElement('span', { dangerouslySetInnerHTML: htmlMessage(contentMessageId) }),
                            React.createElement(
                                IconMenu,
                                {
                                    style: { position: 'absolute', bottom: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.43)', padding: 2, borderRadius: '0 0 2px 0' },
                                    iconStyle: { color: 'white' },
                                    iconButtonElement: React.createElement(MaterialUI.IconButton, { iconClassName: 'mdi mdi-dots-vertical' }),
                                    anchorOrigin: { horizontal: 'right', vertical: 'top' },
                                    targetOrigin: { horizontal: 'right', vertical: 'top' }
                                },
                                menus
                            )
                        )
                    )
                )
            );
        }
    }]);

    return VideoCard;
})(React.Component);

exports['default'] = VideoCard = asGridItem(VideoCard, global.pydio.MessageHash['user_home.94'], { gridWidth: 2, gridHeight: 12 }, []);
exports['default'] = VideoCard;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../board/ColorPaper":4,"../board/Palette":9,"./VideoPlayer":16,"material-ui":"material-ui","prop-types":"prop-types","pydio":"pydio","react":"react","react-dom":"react-dom"}],16:[function(require,module,exports){
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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var VideoPlayer = (function (_React$Component) {
    _inherits(VideoPlayer, _React$Component);

    function VideoPlayer() {
        _classCallCheck(this, VideoPlayer);

        _get(Object.getPrototypeOf(VideoPlayer.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(VideoPlayer, [{
        key: 'render',
        value: function render() {
            return _react2['default'].createElement(
                'div',
                { className: 'video-player', style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200000 } },
                _react2['default'].createElement('div', { className: 'overlay', style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'black', opacity: 0.4 }, onClick: this.props.closePlayer }),
                _react2['default'].createElement(
                    'div',
                    { style: { position: 'absolute', top: '10%', left: '10%', width: '80%', height: '80%', minWidth: 420, minHeight: 600, boxShadow: 'rgba(0, 0, 0, 0.156863) 0px 3px 10px, rgba(0, 0, 0, 0.227451) 0px 3px 10px' } },
                    _react2['default'].createElement('iframe', { src: this.props.videoSrc, style: { width: '100%', height: '100%', border: 0 } })
                ),
                _react2['default'].createElement('a', { className: 'mdi mdi-close', style: { position: 'absolute', right: '8%', top: '7%', color: 'white', textDecoration: 'none', fontSize: 24 }, onClick: this.props.closePlayer })
            );
        }
    }]);

    return VideoPlayer;
})(_react2['default'].Component);

VideoPlayer.propTypes = {
    videoSrc: _propTypes2['default'].string,
    closePlayer: _propTypes2['default'].func
};

exports['default'] = VideoPlayer;
module.exports = exports['default'];

},{"prop-types":"prop-types","react":"react"}],17:[function(require,module,exports){
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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');

var _require$requireLib = require('pydio').requireLib('components');

var asGridItem = _require$requireLib.asGridItem;

var ThemeableTitle = (function (_React$Component) {
    _inherits(ThemeableTitle, _React$Component);

    function ThemeableTitle() {
        _classCallCheck(this, ThemeableTitle);

        _get(Object.getPrototypeOf(ThemeableTitle.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(ThemeableTitle, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var pydio = _props.pydio;
            var filterByType = _props.filterByType;
            var muiTheme = _props.muiTheme;

            var messages = pydio.MessageHash;
            var bgColor = filterByType === 'entries' ? muiTheme.palette.primary1Color : MaterialUI.Style.colors.teal500;
            var title = messages[filterByType === 'entries' ? 468 : 469];
            var cardTitleStyle = { backgroundColor: bgColor, color: 'white', padding: 16, fontSize: 24, lineHeight: '36px' };

            return React.createElement(
                MaterialUI.Paper,
                { zDepth: 0, rounded: false, style: cardTitleStyle },
                title
            );
        }
    }]);

    return ThemeableTitle;
})(React.Component);

ThemeableTitle = MaterialUI.Style.muiThemeable()(ThemeableTitle);

var WorkspacesListCard = (function (_React$Component2) {
    _inherits(WorkspacesListCard, _React$Component2);

    function WorkspacesListCard() {
        _classCallCheck(this, WorkspacesListCard);

        _get(Object.getPrototypeOf(WorkspacesListCard.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(WorkspacesListCard, [{
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var pydio = _props2.pydio;
            var filterByType = _props2.filterByType;

            var props = _extends({}, this.props);
            if (props.style) {
                props.style = _extends({}, props.style, { overflowY: 'auto', zIndex: 1 });
            }

            var blackAndWhiteTitle = React.createElement(MaterialUI.CardTitle, { title: pydio.MessageHash[filterByType === 'entries' ? 468 : 469] });
            var themedTitle = React.createElement(ThemeableTitle, this.props);

            return React.createElement(
                MaterialUI.Paper,
                _extends({ zDepth: 1 }, props, { transitionEnabled: false, rounded: false }),
                this.props.closeButton,
                React.createElement(
                    'div',
                    { style: { height: '100%', display: 'flex', flexDirection: 'column' } },
                    React.createElement(PydioWorkspaces.WorkspacesListMaterial, {
                        className: "vertical_fit filter-" + filterByType,
                        pydio: pydio,
                        workspaces: pydio.user ? pydio.user.getRepositoriesList() : [],
                        showTreeForWorkspace: false,
                        filterByType: this.props.filterByType,
                        sectionTitleStyle: { display: 'none' },
                        style: { flex: 1, overflowY: 'auto' }
                    })
                )
            );
        }
    }]);

    return WorkspacesListCard;
})(React.Component);

exports['default'] = WorkspacesListCard;
module.exports = exports['default'];

},{"pydio":"pydio","react":"react"}]},{},[11])(11)
});
