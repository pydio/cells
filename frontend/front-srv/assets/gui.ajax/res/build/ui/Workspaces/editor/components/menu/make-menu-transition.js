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

"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactMotion = require('react-motion');

var OPACITY_ORIGIN = 0;
var OPACITY_TARGET = 1;
var TRANSLATEY_ORIGIN = 0;
var TRANSLATEY_TARGET = 70;
var ANIMATION = { stifness: 500, damping: 20 };

var makeMenuTransition = function makeMenuTransition(Target) {
    return (function (_React$Component) {
        _inherits(_class, _React$Component);

        function _class() {
            _classCallCheck(this, _class);

            _React$Component.apply(this, arguments);
        }

        _class.prototype.getStyles = function getStyles() {
            if (!this.props.children) return [];

            var counter = 0;
            return React.Children.map(this.props.children, function (child) {
                return {
                    key: "t" + counter++,
                    data: { element: child },
                    style: {
                        opacity: _reactMotion.spring(OPACITY_TARGET, ANIMATION),
                        y: _reactMotion.spring(TRANSLATEY_TARGET * counter, ANIMATION)
                    }
                };
            });
        };

        _class.prototype.willEnter = function willEnter() {
            return {
                opacity: OPACITY_ORIGIN,
                y: TRANSLATEY_ORIGIN
            };
        };

        _class.prototype.willLeave = function willLeave() {
            return {
                opacity: _reactMotion.spring(OPACITY_ORIGIN, ANIMATION),
                y: _reactMotion.spring(TRANSLATEY_ORIGIN, ANIMATION)
            };
        };

        _class.prototype.render = function render() {
            var _this = this;

            return React.createElement(
                _reactMotion.TransitionMotion,
                {
                    styles: this.getStyles(),
                    willLeave: this.willLeave,
                    willEnter: this.willEnter },
                function (styles) {
                    return React.createElement(
                        Target,
                        _this.props,
                        styles.map(function (_ref) {
                            var key = _ref.key;
                            var style = _ref.style;
                            var data = _ref.data;

                            var loaded = style.opacity === 1 || style.opacity === 0;

                            var childStyle = {
                                position: "absolute",
                                opacity: style.opacity,
                                transition: "none",
                                transform: "translate3d(-50%, -50%, 0) translateY(-" + style.y + "px)"
                            };

                            var child = React.cloneElement(data.element, { key: key, loaded: loaded, style: childStyle });

                            return child;
                        })
                    );
                }
            );
        };

        return _class;
    })(React.Component);
};

exports["default"] = makeMenuTransition;
module.exports = exports["default"];
