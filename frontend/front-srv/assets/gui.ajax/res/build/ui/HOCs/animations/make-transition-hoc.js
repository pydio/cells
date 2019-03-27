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

var DEFAULT_ANIMATION = { stiffness: 200, damping: 22, precision: 0.1 };

var makeTransition = function makeTransition(originStyles, targetStyles, enter, leave) {
    return function (Target) {
        var TransitionGroup = (function (_React$PureComponent) {
            _inherits(TransitionGroup, _React$PureComponent);

            function TransitionGroup(props) {
                _classCallCheck(this, TransitionGroup);

                _React$PureComponent.call(this, props);
                this.state = {
                    items: []
                };
            }

            TransitionGroup.prototype.componentDidMount = function componentDidMount() {
                this.setState({
                    items: [{ key: 'a', style: _utils.springify(targetStyles, DEFAULT_ANIMATION) }]
                });
            };

            TransitionGroup.prototype.componentWillUnmount = function componentWillUnmount() {
                this.setState({
                    items: []
                });
            };

            TransitionGroup.prototype.willEnter = function willEnter(transitionStyle) {
                return _extends({}, originStyles);
            };

            TransitionGroup.prototype.willLeave = function willLeave(transitionStyle) {
                return _utils.springify(originStyles, DEFAULT_ANIMATION);
            };

            TransitionGroup.prototype.render = function render() {

                // Making sure we fliter out properties
                var _props = this.props;
                var ready = _props.ready;

                var props = _objectWithoutProperties(_props, ['ready']);

                return _react2['default'].createElement(
                    _reactMotion.TransitionMotion,
                    {
                        styles: this.state.items,
                        willLeave: this.willLeave.bind(this),
                        willEnter: this.willEnter.bind(this)
                    },
                    function (styles) {
                        if (styles.length == 0) {
                            return null;
                        }

                        var style = styles[0].style;
                        var finished = Object.keys(style).reduce(function (current, key) {
                            return current && style[key] == targetStyles[key];
                        }, true);

                        var transform = _utils.buildTransform(style, {
                            length: 'px', angle: 'deg'
                        });

                        return _react2['default'].createElement(Target, _extends({}, props, { style: _extends({}, props.style, { transform: transform, transition: 'none' }), transitionEnded: true }));
                    }
                );
            };

            return TransitionGroup;
        })(_react2['default'].PureComponent);

        TransitionGroup.propTypes = {
            ready: _react2['default'].PropTypes.bool.isRequired
        };

        TransitionGroup.defaultProps = {
            ready: true
        };

        return TransitionGroup;
    };
};

exports['default'] = makeTransition;
module.exports = exports['default'];
