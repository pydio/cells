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

var LoginRouterWrapper = function LoginRouterWrapper(pydio) {
    var LoginRouter = function LoginRouter(props) {
        if (pydio.user) {
            _reactRouterLibBrowserHistory2['default'].replace("/");
            return null;
        }

        pydio.observeOnce('user_logged', function (u) {
            _reactRouterLibBrowserHistory2['default'].replace('/');
        });

        localStorage.removeItem("loginOrigin");

        return React.createElement(
            'div',
            null,
            props.children
        );
    };

    return LoginRouter;
};

exports['default'] = LoginRouterWrapper;
module.exports = exports['default'];
