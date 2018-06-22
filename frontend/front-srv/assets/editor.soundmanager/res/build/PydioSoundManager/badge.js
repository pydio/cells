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

var _Player = require('./Player');

var _Player2 = _interopRequireDefault(_Player);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

// The threeSixytPlayer is the same for all badges
var threeSixtyPlayer = new ThreeSixtyPlayer();

var Badge = (function (_Component) {
    _inherits(Badge, _Component);

    function Badge() {
        _classCallCheck(this, Badge);

        _get(Object.getPrototypeOf(Badge.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Badge, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.loadNode(this.props);

            threeSixtyPlayer.init();
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.node !== this.props.node) {
                this.loadNode(nextProps);
            }
        }
    }, {
        key: 'loadNode',
        value: function loadNode(props) {
            var _this = this;

            var node = props.node;

            _pydioHttpApi2['default'].getClient().buildPresignedGetUrl(node, function (url) {
                _this.setState({
                    url: url,
                    mimeType: "audio/" + node.getAjxpMime()
                });
            }, "audio/" + node.getAjxpMime());
        }
    }, {
        key: 'render',
        value: function render() {
            var _ref = this.state || {};

            var mimeType = _ref.mimeType;
            var url = _ref.url;

            if (!url) return null;

            return _react2['default'].createElement(
                _Player2['default'],
                { rich: false, style: { width: 40, height: 40, margin: "auto" }, onReady: function () {} },
                _react2['default'].createElement('a', { type: mimeType, href: url })
            );
        }
    }]);

    return Badge;
})(_react.Component);

exports['default'] = Badge;

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}
module.exports = exports['default'];
