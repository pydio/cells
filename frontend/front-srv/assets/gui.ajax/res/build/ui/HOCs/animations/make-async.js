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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var counter = 0;

var makeAsync = function makeAsync(WrappedComponent) {
    return (function (_React$PureComponent) {
        _inherits(AsyncGroup, _React$PureComponent);

        function AsyncGroup(props) {
            _classCallCheck(this, AsyncGroup);

            _React$PureComponent.call(this, props);

            this.state = _extends({}, this.buildPromises(props));
        }

        AsyncGroup.prototype.componentDidMount = function componentDidMount() {
            this.waitAndSee();
        };

        AsyncGroup.prototype.waitAndSee = function waitAndSee() {
            var _this = this;

            Promise.all(this.state.promises).then(function (values) {
                return _this.setState({ ready: true });
            });
        };

        AsyncGroup.prototype.buildPromises = function buildPromises(props) {
            var onloads = [];
            var promises = _react2["default"].Children.toArray(props.children).filter(function (child) {
                return child;
            }).map(function (child) {
                return new Promise(function (resolve, reject) {
                    if (typeof child.props.onLoad !== "function") return resolve();

                    var timeout = setTimeout(resolve, 3000);

                    onloads.push(function () {
                        window.clearTimeout(timeout);

                        child.props.onLoad();

                        setTimeout(resolve, 1000);
                    });
                });
            });

            return {
                promises: promises,
                onloads: onloads,
                ready: false
            };
        };

        AsyncGroup.prototype.render = function render() {
            var props = _objectWithoutProperties(this.props, []);

            //console.log("Make Async", this.state.ready)
            //, {onLoad: this.state.onloads[i]}))}

            return _react2["default"].createElement(
                WrappedComponent,
                _extends({}, props, { ready: this.state.ready }),
                _react2["default"].Children.toArray(props.children).filter(function (child) {
                    return child;
                }).map(function (Child, i) {
                    return _react2["default"].cloneElement(Child, { onLoad: function onLoad() {} });
                })
            );
        };

        return AsyncGroup;
    })(_react2["default"].PureComponent);
};

exports["default"] = makeAsync;
module.exports = exports["default"];
