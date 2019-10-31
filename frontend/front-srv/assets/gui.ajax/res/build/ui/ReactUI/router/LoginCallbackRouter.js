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

var _reactRouterLibBrowserHistory = require('react-router/lib/browserHistory');

var _reactRouterLibBrowserHistory2 = _interopRequireDefault(_reactRouterLibBrowserHistory);

var PydioApi = require('pydio/http/api');
var queryString = require('query-string');

var LoginCallbackRouterWrapper = function LoginCallbackRouterWrapper(pydio) {
    var LoginCallbackRouter = function LoginCallbackRouter(props) {
        var params = queryString.parse(props.location.search);

        var redirect = function redirect() {
            var loginOrigin = localStorage.getItem("loginOrigin");

            if (loginOrigin) {
                localStorage.removeItem("loginOrigin");
                _reactRouterLibBrowserHistory2['default'].replace(loginOrigin);
            } else {
                _reactRouterLibBrowserHistory2['default'].replace("/");
            }
        };

        pydio.observeOnce('user_logged', function () {
            return redirect();
        });

        PydioApi.getRestClient().jwtFromAuthorizationCode(params.code).then(function (res) {
            return res.data && res.data.JWT && !pydio.user && pydio.Registry.load();
        })['catch'](function (e) {
            return _reactRouterLibBrowserHistory2['default'].push("/login");
        });

        return React.createElement('div', null);
    };

    return LoginCallbackRouter;
};

exports['default'] = LoginCallbackRouterWrapper;
module.exports = exports['default'];
