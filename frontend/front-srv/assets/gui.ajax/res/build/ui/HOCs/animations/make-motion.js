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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactLibShallowCompare = require('react/lib/shallowCompare');

var _reactLibShallowCompare2 = _interopRequireDefault(_reactLibShallowCompare);

var _reactMotion = require('react-motion');

var _reactMotionLibStripStyle = require('react-motion/lib/stripStyle');

var _reactMotionLibStripStyle2 = _interopRequireDefault(_reactMotionLibStripStyle);

var _utils = require('./utils');

var counter = 0;

var DEFAULT_ANIMATION = { stiffness: 120, damping: 22, precision: 0.01 };

var makeMotion = function makeMotion(originStyle, targetStyle) {
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
    var _options$check = options.check;
    var check = _options$check === undefined ? function () {
        return true;
    } : _options$check;
    var _options$style = options.style;
    var transformStyle = _options$style === undefined ? function () {} : _options$style;

    return function (Target) {
        return (function (_React$PureComponent) {
            _inherits(_class, _React$PureComponent);

            function _class(props) {
                _classCallCheck(this, _class);

                _React$PureComponent.call(this, props);

                this.state = {
                    ended: false
                };
            }

            _class.prototype.render = function render() {

                // Making sure we fliter out properties

                var props = _objectWithoutProperties(this.props, []);

                var ended = this.state.ended;

                if (!check(props)) {
                    return _react2['default'].createElement(Target, props);
                }

                return _react2['default'].createElement(
                    _reactMotion.Motion,
                    {
                        defaultStyle: originStyle,
                        style: _utils.springify(targetStyle, DEFAULT_ANIMATION)
                    },
                    function (style) {
                        var transform = _utils.buildTransform(style, {
                            length: 'px', angle: 'deg'
                        });

                        console.log(_extends({}, props.style, { transform: transform }, transformStyle(props)));

                        return _react2['default'].createElement(Target, _extends({}, props, { style: _extends({}, props.style, { transform: transform }, transformStyle(props)), motionEnded: ended }));
                    }
                );
            };

            return _class;
        })(_react2['default'].PureComponent);
    };
};

exports['default'] = makeMotion;
module.exports = exports['default'];
