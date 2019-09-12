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

var LoginRouterWrapper = function LoginRouterWrapper(pydio) {
    var LoginRouter = (function (_React$PureComponent) {
        _inherits(LoginRouter, _React$PureComponent);

        function LoginRouter(props) {
            _classCallCheck(this, LoginRouter);

            _React$PureComponent.call(this, props);

            this.state = {
                user: pydio.user
            };
        }

        LoginRouter.prototype.componentDidMount = function componentDidMount() {
            var _this = this;

            pydio.observe('user_logged', function (user) {
                return _this.setState(user);
            });
        };

        LoginRouter.prototype.render = function render() {
            var user = this.state.user;

            if (user) {
                _reactRouterLibBrowserHistory2['default'].push('/');
            }

            return React.createElement(
                'div',
                null,
                this.props.children
            );
        };

        return LoginRouter;
    })(React.PureComponent);

    return LoginRouter;
};

exports['default'] = LoginRouterWrapper;
module.exports = exports['default'];
