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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _utils = require('./utils');

var URLProvider = function URLProvider() {
    var urls = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    return (function (_React$Component) {
        _inherits(_class, _React$Component);

        _createClass(_class, null, [{
            key: 'displayName',
            get: function get() {
                return 'URLProvider';
            }
        }, {
            key: 'propTypes',
            get: function get() {
                return urls.reduce(function (current, type) {
                    var _extends2;

                    return _extends({}, current, (_extends2 = {}, _extends2['on' + _utils.toTitleCase(type)] = _propTypes2['default'].func.isRequired, _extends2));
                }, {
                    urlType: _propTypes2['default'].oneOf(urls).isRequired
                });
            }
        }]);

        function _class(props) {
            var _this = this;

            _classCallCheck(this, _class);

            _React$Component.call(this, props);
            var u = this.getUrl(props);
            if (u.then) {
                this.state = { url: '' };
                u.then(function (res) {
                    _this.setState({ url: res });
                });
            } else {
                this.setState({ url: u });
            }
        }

        _class.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
            var _this2 = this;

            var u = this.getUrl(nextProps);
            if (u.then) {
                u.then(function (res) {
                    _this2.setState({ url: res });
                });
            } else {
                this.setState({ url: u });
            }
        };

        _class.prototype.getUrl = function getUrl(props) {
            var fn = props['on' + _utils.toTitleCase(props.urlType)];
            return fn();
        };

        _class.prototype.render = function render() {
            return this.props.children(this.state.url);
        };

        return _class;
    })(_react2['default'].Component);
};
exports.URLProvider = URLProvider;
