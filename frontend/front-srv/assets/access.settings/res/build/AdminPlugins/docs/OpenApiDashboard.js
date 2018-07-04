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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _reactSwaggerUi = require('react-swagger-ui');

var OpenApiDashboard = (function (_React$Component) {
    _inherits(OpenApiDashboard, _React$Component);

    function OpenApiDashboard(props) {
        _classCallCheck(this, OpenApiDashboard);

        _get(Object.getPrototypeOf(OpenApiDashboard.prototype), 'constructor', this).call(this, props);
        var restEndpoint = props.pydio.Parameters.get("ENDPOINT_REST_API");
        this.state = { specUrl: restEndpoint + '/config/discovery/openapi' };
    }

    _createClass(OpenApiDashboard, [{
        key: 'render',
        value: function render() {

            return _react2['default'].createElement(
                'div',
                { className: "main-layout-nav-to-stack vertical-layout people-dashboard" },
                _react2['default'].createElement(AdminComponents.Header, {
                    title: "Rest APIs Documentation",
                    icon: 'mdi mdi-routes'
                }),
                _react2['default'].createElement(
                    'div',
                    { className: "layout-fill", style: { overflowY: 'scroll' } },
                    _react2['default'].createElement(
                        _materialUi.Paper,
                        { zDepth: 1, style: { margin: 16 } },
                        _react2['default'].createElement(_reactSwaggerUi.SwaggerUI, { url: this.state.specUrl })
                    )
                )
            );
        }
    }]);

    return OpenApiDashboard;
})(_react2['default'].Component);

exports['default'] = OpenApiDashboard;
module.exports = exports['default'];
