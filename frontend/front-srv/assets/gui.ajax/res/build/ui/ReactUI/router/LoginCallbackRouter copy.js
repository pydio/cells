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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactRouterLibBrowserHistory = require('react-router/lib/browserHistory');

var _reactRouterLibBrowserHistory2 = _interopRequireDefault(_reactRouterLibBrowserHistory);

var PydioApi = require('pydio/http/api');
var queryString = require('query-string');

var LoginCallbackRouterWrapper = function LoginCallbackRouterWrapper(pydio) {
    return (function (_React$PureComponent) {
        _inherits(_class, _React$PureComponent);

        function _class() {
            _classCallCheck(this, _class);

            _React$PureComponent.apply(this, arguments);
        }

        // const params = queryString.parse(props.location.search);

        // const redirect = () => {
        //     const loginOrigin = localStorage.getItem("loginOrigin")

        //     if (loginOrigin) {
        //         localStorage.removeItem("loginOrigin")
        //         browserHistory.replace(loginOrigin)
        //     } else {
        //         browserHistory.replace("/")
        //     }
        // }

        // pydio.observeOnce('user_logged', () => redirect())

        _class.prototype.render = function render() {
            PydioApi.getRestClient().sessionLoginCallback().then(function () {
                return _reactRouterLibBrowserHistory2['default'].replace("/");
            });

            return React.createElement('div', null);
        };

        return _class;
    })(React.PureComponent);

    return LoginCallbackRouter;
};

exports['default'] = LoginCallbackRouterWrapper;
module.exports = exports['default'];
