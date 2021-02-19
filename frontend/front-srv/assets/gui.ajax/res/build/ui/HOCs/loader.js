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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var Loadingbar = function Loadingbar(style) {
    return _react2['default'].createElement(PydioReactUI.Loader, { style: _extends({}, style, { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, zIndex: 0 }) });
};

var loader = function loader(Component) {
    var Loader = (function (_React$Component) {
        _inherits(Loader, _React$Component);

        function Loader(props) {
            var _this = this;

            _classCallCheck(this, Loader);

            _React$Component.call(this, props);

            this.state = { loading: true };

            this.onLoad = function () {

                _this.setState({ loading: false });

                if (typeof props.onLoad === 'function') {
                    props.onLoad.apply(props, arguments);
                    _this.cancelAutomaticLoad();
                }
            };
        }

        Loader.prototype.automaticLoad = function automaticLoad() {
            // Making sure the loader disappears after a while
            this.timeout = window.setTimeout(this.onLoad, 100);
        };

        Loader.prototype.cancelAutomaticLoad = function cancelAutomaticLoad() {
            window.clearTimeout(this.timeout);
            this.timeout = null;
        };

        Loader.prototype.componentDidMount = function componentDidMount() {
            this.automaticLoad();
        };

        Loader.prototype.componentWillUnmount = function componentWillUnmount() {
            this.cancelAutomaticLoad();
        };

        Loader.prototype.render = function render() {
            var loading = this.state.loading;
            var _props = this.props;
            var noLoader = _props.noLoader;
            var onLoad = _props.onLoad;
            var loaderStyle = _props.loaderStyle;

            var remainingProps = _objectWithoutProperties(_props, ['noLoader', 'onLoad', 'loaderStyle']);

            if (noLoader) {
                return _react2['default'].createElement(Component, _extends({}, remainingProps, { onLoad: this.onLoad }));
            }

            var style = loading ? { position: "relative", zIndex: "-1", top: "-3000px" } : {};

            if (loading) {
                return _react2['default'].createElement(Loadingbar, { style: _extends({}, style, loaderStyle) });
            }

            return _react2['default'].createElement(Component, _extends({}, remainingProps, { onLoad: this.onLoad }));
        };

        return Loader;
    })(_react2['default'].Component);

    Loader.propTypes = {
        noLoader: _propTypes2['default'].bool,
        onLoad: _propTypes2['default'].func,
        loaderStyle: _propTypes2['default'].object
    };

    return Loader;
};

exports['default'] = loader;
module.exports = exports['default'];
