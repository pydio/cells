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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactMotion = require('react-motion');

// const ANIMATION={stiffness: 200, damping: 22, precision: 1}
var ANIMATION = { stiffness: 150, damping: 15, precision: 1 };
var TRANSLATEY_ORIGIN = 800;
var TRANSLATEY_TARGET = 0;

var makeEditorOpen = function makeEditorOpen(Target) {
    return (function (_React$Component) {
        _inherits(_class, _React$Component);

        function _class() {
            _classCallCheck(this, _class);

            _React$Component.apply(this, arguments);
        }

        _class.prototype.getStyle = function getStyle() {
            return {
                y: _reactMotion.spring(TRANSLATEY_TARGET, ANIMATION)
            };
        };

        _class.prototype.willEnter = function willEnter() {
            return {
                y: TRANSLATEY_ORIGIN
            };
        };

        _class.prototype.willLeave = function willLeave() {
            return {
                y: TRANSLATEY_ORIGIN
            };
        };

        _class.prototype.render = function render() {
            var _this = this;

            return React.createElement(
                _reactMotion.TransitionMotion,
                {
                    styles: this.getStyle(),
                    willLeave: this.willLeave,
                    willEnter: this.willEnter
                },
                function (_ref) {
                    var y = _ref.y;
                    return React.createElement(Target, _extends({}, _this.props, { style: _extends({}, _this.props.style, {
                            transform: transform + ' translateY(' + y + 'px)'
                        }) }));
                }
            );
        };

        return _class;
    })(React.Component);
};

exports['default'] = makeEditorOpen;
module.exports = exports['default'];
