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

//Constants

var NUM_CHILDREN = 1;
// How far away from the main button does the child buttons go
var FLY_OUT_RADIUS = 80,
    SEPARATION_ANGLE = 40,
    //degrees
FAN_ANGLE = (NUM_CHILDREN - 1) * SEPARATION_ANGLE,
    //degrees
BASE_ANGLE = (180 - FAN_ANGLE) / 2; // degrees

// Utility functions
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function finalChildDeltaPositions(index) {
    var angle = BASE_ANGLE + index * SEPARATION_ANGLE;
    return {
        deltaX: FLY_OUT_RADIUS * Math.cos(toRadians(angle)),
        deltaY: FLY_OUT_RADIUS * Math.sin(toRadians(angle))
    };
}

var makeMenuAnimate = function makeMenuAnimate(Target) {

    return (function (_React$Component) {
        _inherits(_class, _React$Component);

        function _class(props) {
            _classCallCheck(this, _class);

            _React$Component.call(this, props);
            this.state = { open: false };
        }

        _class.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
            this.setState({
                open: nextProps.open
            });
        };

        _class.prototype.openingStartStyle = function openingStartStyle() {
            return {
                top: 0,
                left: 0,
                rotate: -180
            };
        };

        _class.prototype.openingEndStyle = function openingEndStyle(index) {
            var _finalChildDeltaPositions = finalChildDeltaPositions(index);

            var deltaX = _finalChildDeltaPositions.deltaX;
            var deltaY = _finalChildDeltaPositions.deltaY;

            return {
                top: _reactMotion.spring(0 - deltaY, _reactMotion.presets.gentle),
                left: _reactMotion.spring(0 + deltaX, _reactMotion.presets.gentle),
                rotate: _reactMotion.spring(0, _reactMotion.presets.gentle)
            };
        };

        _class.prototype.closingStartStyle = function closingStartStyle(index) {
            var _finalChildDeltaPositions2 = finalChildDeltaPositions(index);

            var deltaX = _finalChildDeltaPositions2.deltaX;
            var deltaY = _finalChildDeltaPositions2.deltaY;

            return {
                top: 0 - deltaY,
                left: 0 + deltaX,
                rotate: 0
            };
        };

        _class.prototype.closingEndStyle = function closingEndStyle() {
            return {
                top: _reactMotion.spring(0, _reactMotion.presets.gentle),
                left: _reactMotion.spring(0, _reactMotion.presets.gentle),
                rotate: _reactMotion.spring(-180, _reactMotion.presets.gentle)
            };
        };

        _class.prototype.render = function render() {
            var _this = this;

            var open = this.state.open;

            var defaultStyles = React.Children.map(this.props.children, function (child, i) {
                return open ? _this.openingStartStyle() : _this.closingStartStyle(i);
            });

            // StaggeredMotion now takes an Array of object
            defaultStyles = Object.keys(defaultStyles).map(function (key) {
                return defaultStyles[key];
            });

            var targetStyles = React.Children.map(this.props.children, function (child, i) {
                return open ? _this.openingEndStyle(i) : _this.closingEndStyle();
            });

            var styles = function styles(prevFrameStyles) {
                return prevFrameStyles.map(function (_, i) {
                    return targetStyles[i];
                });
            };

            return React.createElement(
                Target,
                { style: this.props.style },
                React.createElement(
                    _reactMotion.StaggeredMotion,
                    { defaultStyles: defaultStyles, styles: styles },
                    function (buttons) {
                        return React.createElement(
                            "div",
                            null,
                            buttons.map(function (_ref, i) {
                                var left = _ref.left;
                                var rotate = _ref.rotate;
                                var top = _ref.top;

                                var style = {
                                    position: i === 0 ? "relative" : "absolute",
                                    left: left,
                                    top: top
                                };

                                return React.createElement(
                                    "div",
                                    { key: i, style: style },
                                    _this.props.children[i]
                                );
                            })
                        );
                    }
                )
            );
        };

        return _class;
    })(React.Component);
};

exports["default"] = makeMenuAnimate;
module.exports = exports["default"];
