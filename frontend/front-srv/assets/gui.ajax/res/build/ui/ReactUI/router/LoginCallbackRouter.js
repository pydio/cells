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

        var loginOrigin = localStorage.getItem("loginOrigin");
        var oauthOrigin = localStorage.getItem("oauthOrigin");

        PydioApi.getRestClient().jwtFromAuthorizationCode(params.code).then(function () {
            if (loginOrigin !== "") {
                _reactRouterLibBrowserHistory2['default'].push(loginOrigin);
            } else if (oauthOrigin !== "") {
                window.location.href = oauthOrigin;
            } else {
                _reactRouterLibBrowserHistory2['default'].push("/");
            }
            localStorage.removeItem("loginOrigin");
            localStorage.removeItem("oauthOrigin");
        })['catch'](function (e) {
            return _reactRouterLibBrowserHistory2['default'].push("/login");
        });

        pydio.observe("user_logged", function (user) {
            return user && _reactRouterLibBrowserHistory2['default'].push("/");
        });

        return React.createElement('div', null);
    };

    return LoginCallbackRouter;
};

exports['default'] = LoginCallbackRouterWrapper;
module.exports = exports['default'];
