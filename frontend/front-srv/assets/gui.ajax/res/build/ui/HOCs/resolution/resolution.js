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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _utils = require('../utils');

var _ = require('./');

var _utils2 = require('./utils');

var withResolution = function withResolution(sizes, highResolution, lowResolution) {
    return function (Component) {
        var WithResolution = (function (_React$Component) {
            _inherits(WithResolution, _React$Component);

            function WithResolution() {
                _classCallCheck(this, WithResolution);

                _React$Component.apply(this, arguments);
            }

            WithResolution.prototype.componentDidMount = function componentDidMount() {
                var _props = this.props;
                var _props$resolution = _props.resolution;
                var resolution = _props$resolution === undefined ? "lo" : _props$resolution;
                var dispatch = _props.dispatch;

                dispatch(_utils.EditorActions.editorModify({ resolution: resolution }));
            };

            WithResolution.prototype.onHi = function onHi() {
                var tab = this.props.tab;

                return highResolution(tab.node);
            };

            WithResolution.prototype.onLo = function onLo() {
                var tab = this.props.tab;

                var viewportRef = (DOMUtils.getViewportHeight() + DOMUtils.getViewportWidth()) / 2;

                var thumbLimit = sizes.reduce(function (current, size) {
                    return viewportRef > parseInt(size) && parseInt(size) || current;
                }, 0);

                if (thumbLimit > 0) {
                    return lowResolution(tab.node, thumbLimit);
                }

                return highResolution(tab.node);
            };

            WithResolution.prototype.render = function render() {
                var _this = this;

                var _props2 = this.props;
                var _props2$resolution = _props2.resolution;
                var resolution = _props2$resolution === undefined ? "lo" : _props2$resolution;
                var dispatch = _props2.dispatch;

                var remainingProps = _objectWithoutProperties(_props2, ['resolution', 'dispatch']);

                return _react2['default'].createElement(
                    _.ResolutionURLProvider,
                    {
                        urlType: resolution,
                        onHi: function () {
                            return _this.onHi();
                        },
                        onLo: function () {
                            return _this.onLo();
                        }
                    },
                    function (src) {
                        return _react2['default'].createElement(Component, _extends({}, remainingProps, {
                            src: src
                        }));
                    }
                );
            };

            _createClass(WithResolution, null, [{
                key: 'displayName',
                get: function get() {
                    return 'WithResolution(' + _utils.getDisplayName(Component) + ')';
                }
            }, {
                key: 'propTypes',
                get: function get() {
                    return {
                        node: _react2['default'].PropTypes.instanceOf(AjxpNode).isRequired
                    };
                }
            }]);

            return WithResolution;
        })(_react2['default'].Component);

        return _reactRedux.connect(_utils2.mapStateToProps)(WithResolution);
    };
};

exports['default'] = withResolution;
module.exports = exports['default'];
