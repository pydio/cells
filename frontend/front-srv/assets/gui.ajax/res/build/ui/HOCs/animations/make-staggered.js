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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactMotion = require('react-motion');

var _utils = require('./utils');

var counter = 0;

var DEFAULT_ANIMATION = { stiffness: 200, damping: 22, precision: 0.1 };

var makeStaggered = function makeStaggered(originStyles, targetStyles, animation) {
    return function (Target) {
        var StaggeredGroup = (function (_React$PureComponent) {
            _inherits(StaggeredGroup, _React$PureComponent);

            function StaggeredGroup(props) {
                _classCallCheck(this, StaggeredGroup);

                _React$PureComponent.call(this, props);

                this.state = {
                    styles: this.buildStyles(props)
                };
            }

            StaggeredGroup.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
                this.setState({
                    styles: this.buildStyles(nextProps)
                });
            };

            StaggeredGroup.prototype.buildStyles = function buildStyles(props) {
                return _react2['default'].Children.toArray(props.children).filter(function (child) {
                    return child;
                }) // Removing null values
                .map(function (child) {
                    return originStyles;
                });
            };

            StaggeredGroup.prototype.getStyles = function getStyles(prevStyles) {
                var _this = this;

                var endValue = _react2['default'].Children.toArray(this.props.children).filter(function (child) {
                    return child;
                }) // Removing null values
                .map(function (_, i) {
                    return !_this.props.ready ? originStyles : i === 0 ? _utils.springify(targetStyles, animation || DEFAULT_ANIMATION) : prevStyles[i - 1] ? _utils.springify(prevStyles[i - 1], animation || DEFAULT_ANIMATION) : originStyles;
                });

                return endValue;
            };

            StaggeredGroup.prototype.render = function render() {
                var _this2 = this;

                // Making sure we fliter out properties
                var _props = this.props;
                var ready = _props.ready;

                var props = _objectWithoutProperties(_props, ['ready']);

                return _react2['default'].createElement(
                    _reactMotion.StaggeredMotion,
                    {
                        defaultStyles: this.state.styles,
                        styles: function (styles) {
                            return _this2.getStyles(styles);
                        }
                    },
                    function (styles) {
                        return _react2['default'].createElement(
                            Target,
                            props,
                            _react2['default'].Children.toArray(props.children).filter(function (child) {
                                return child;
                            }).map(function (Child, i) {
                                var style = styles[i] || {};

                                var itemProps = Child.props;

                                var transform = _utils.buildTransform(style, {
                                    length: 'px', angle: 'deg'
                                });

                                return _react2['default'].cloneElement(Child, { style: _extends({}, itemProps.style, style, {
                                        transform: transform,
                                        transition: "none"
                                    }) });
                            })
                        );
                    }
                );
            };

            return StaggeredGroup;
        })(_react2['default'].PureComponent);

        StaggeredGroup.propTypes = {
            ready: _propTypes2['default'].bool.isRequired
        };

        StaggeredGroup.defaultProps = {
            ready: true
        };

        return StaggeredGroup;
    };
};

exports['default'] = makeStaggered;
module.exports = exports['default'];
