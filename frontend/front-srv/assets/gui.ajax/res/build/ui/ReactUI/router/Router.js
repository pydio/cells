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

var _reactRouterLibRouter = require('react-router/lib/Router');

var _reactRouterLibRouter2 = _interopRequireDefault(_reactRouterLibRouter);

var _reactRouterLibRoute = require('react-router/lib/Route');

var _reactRouterLibRoute2 = _interopRequireDefault(_reactRouterLibRoute);

var _reactRouterLibIndexRoute = require('react-router/lib/IndexRoute');

var _reactRouterLibIndexRoute2 = _interopRequireDefault(_reactRouterLibIndexRoute);

var _reactRouterLibBrowserHistory = require('react-router/lib/browserHistory');

var _reactRouterLibBrowserHistory2 = _interopRequireDefault(_reactRouterLibBrowserHistory);

var _MainRouter = require('./MainRouter');

var _MainRouter2 = _interopRequireDefault(_MainRouter);

var _WorkspaceRouter = require('./WorkspaceRouter');

var _WorkspaceRouter2 = _interopRequireDefault(_WorkspaceRouter);

var _PathRouter = require('./PathRouter');

var _PathRouter2 = _interopRequireDefault(_PathRouter);

var _HomeRouter = require('./HomeRouter');

var _HomeRouter2 = _interopRequireDefault(_HomeRouter);

function getRoutes(pydio) {
    var routes = React.createElement(
        _reactRouterLibRoute2['default'],
        { path: '/', component: _MainRouter2['default'](pydio) },
        React.createElement(_reactRouterLibIndexRoute2['default'], { component: _HomeRouter2['default'] }),
        React.createElement(
            _reactRouterLibRoute2['default'],
            { path: ':workspaceId', component: _WorkspaceRouter2['default'](pydio) },
            React.createElement(_reactRouterLibIndexRoute2['default'], { component: _PathRouter2['default'](pydio) }),
            React.createElement(_reactRouterLibRoute2['default'], { path: '*', component: _PathRouter2['default'](pydio) })
        )
    );
    return routes;
}

var PydioRouter = (function (_React$PureComponent) {
    _inherits(PydioRouter, _React$PureComponent);

    function PydioRouter(props) {
        _classCallCheck(this, PydioRouter);

        _React$PureComponent.call(this, props);
    }

    PydioRouter.prototype.render = function render() {
        return(
            // Routes are defined as a constant to avoid warning about hot reloading
            React.createElement(_reactRouterLibRouter2['default'], { history: _reactRouterLibBrowserHistory2['default'], routes: getRoutes(this.props.pydio) })
        );
    };

    return PydioRouter;
})(React.PureComponent);

exports['default'] = PydioRouter;
module.exports = exports['default'];
