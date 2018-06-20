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

var _soundmanager2 = require('soundmanager2');

var _sm360PlayerScript360player = require('../../../sm/360-player/script/360player');

_soundmanager2.soundManager.setup({
    // path to directory containing SM2 SWF
    url: 'plugins/editor.soundmanager/sm/swf/',
    debugMode: true
});

var Player = (function (_React$Component) {
    _inherits(Player, _React$Component);

    function Player(props) {
        _classCallCheck(this, Player);

        _get(Object.getPrototypeOf(Player.prototype), 'constructor', this).call(this, props);

        _sm360PlayerScript360player.threeSixtyPlayer.config.autoPlay = props.autoPlay;

        _sm360PlayerScript360player.threeSixtyPlayer.config.scaleFont = navigator.userAgent.match(/msie/i) ? false : true;
        _sm360PlayerScript360player.threeSixtyPlayer.config.showHMSTime = true;

        // enable some spectrum stuffs
        _sm360PlayerScript360player.threeSixtyPlayer.config.useWaveformData = true;
        _sm360PlayerScript360player.threeSixtyPlayer.config.useEQData = true;

        // enable this in SM2 as well, as needed
        if (_sm360PlayerScript360player.threeSixtyPlayer.config.useWaveformData) {
            _soundmanager2.soundManager.flash9Options.useWaveformData = true;
        }
        if (_sm360PlayerScript360player.threeSixtyPlayer.config.useEQData) {
            _soundmanager2.soundManager.flash9Options.useEQData = true;
        }
        if (_sm360PlayerScript360player.threeSixtyPlayer.config.usePeakData) {
            _soundmanager2.soundManager.flash9Options.usePeakData = true;
        }

        if (_sm360PlayerScript360player.threeSixtyPlayer.config.useWaveformData || _sm360PlayerScript360player.threeSixtyPlayer.flash9Options.useEQData || _sm360PlayerScript360player.threeSixtyPlayer.flash9Options.usePeakData) {
            // even if HTML5 supports MP3, prefer flash so the visualization features can be used.
            _soundmanager2.soundManager.preferFlash = true;
        }

        // favicon is expensive CPU-wise, but can be used.
        if (window.location.href.match(/hifi/i)) {
            _sm360PlayerScript360player.threeSixtyPlayer.config.useFavIcon = true;
        }

        if (window.location.href.match(/html5/i)) {
            // for testing IE 9, etc.
            _soundmanager2.soundManager.useHTML5Audio = true;
        }
    }

    _createClass(Player, [{
        key: 'componentWillMount',
        value: function componentWillMount() {

            //soundManager.createSound()
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            //soundManager.onready(() => React.Children.map(this.props.children, (child) => soundManager.createSound({url: child.href})))
            _soundmanager2.soundManager.onready(_sm360PlayerScript360player.threeSixtyPlayer.init);

            // soundManager.onready(nextProps.onReady)
            // soundManager.beginDelayedInit()
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            //soundManager.onready(() => React.Children.map(nextProps.children, (child) => soundManager.createSound({url: child.href})))
            _soundmanager2.soundManager.onready(_sm360PlayerScript360player.threeSixtyPlayer.init);
        }

        /*componentWillUnmount() {
            soundManager.reboot()
        }*/

    }, {
        key: 'render',
        value: function render() {
            var className = "ui360";
            if (this.props.rich) {
                className += " ui360-vis";
            }

            return _react2['default'].createElement(
                'div',
                { className: className, style: this.props.style },
                this.props.children
            );
        }
    }]);

    return Player;
})(_react2['default'].Component);

Player.propTypes = {
    threeSixtyPlayer: _react2['default'].PropTypes.object,
    autoPlay: _react2['default'].PropTypes.bool,
    rich: _react2['default'].PropTypes.bool.isRequired,
    onReady: _react2['default'].PropTypes.func
};

Player.defaultProps = {
    autoPlay: false,
    rich: true
};

exports['default'] = Player;
module.exports = exports['default'];
