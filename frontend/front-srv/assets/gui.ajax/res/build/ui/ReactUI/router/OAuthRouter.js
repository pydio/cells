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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var OAuthRouterWrapper = function OAuthRouterWrapper(pydio) {
    var OAuthRouter = (function (_React$PureComponent) {
        _inherits(OAuthRouter, _React$PureComponent);

        function OAuthRouter(props) {
            _classCallCheck(this, OAuthRouter);

            _React$PureComponent.call(this, props);

            this.state = {
                jwt: "INITIAL"
            };

            this._handleAuthorizeChange = this.handleAuthorizeChange.bind(this);
        }

        OAuthRouter.prototype.componentDidMount = function componentDidMount(props) {
            this.handleAuthorizeChange();

            pydio.observe('user_logged', this._handleAuthorizeChange);
        };

        OAuthRouter.prototype.componentWillUnmount = function componentWillUnmount(props) {
            pydio.stopObserving('user_logged', this._handleAuthorizeChange);
        };

        OAuthRouter.prototype.handleAuthorizeChange = function handleAuthorizeChange() {
            var _this = this;

            PydioApi.getRestClient().getOrUpdateJwt().then(function (jwt) {
                return _this.setState({
                    jwt: jwt
                });
            });
        };

        OAuthRouter.prototype.render = function render() {
            var jwt = this.state.jwt;

            if (jwt === "INITIAL") {} else if (jwt === "") {
                pydio.getController().fireAction('login');
            } else {
                var xhr = new XMLHttpRequest();
                xhr.open("POST", '/oauth2/auth' + window.location.search + '&access_token=' + jwt, true);

                //Send the proper header information along with the request
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

                xhr.onreadystatechange = function () {
                    // Call a function when the state changes.
                    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                        window.location.href = this.responseURL;
                    }
                };

                xhr.send("scopes=openid&scopes=profile&scopes=email&scopes=offline_access");
            }

            return React.createElement(
                'div',
                null,
                this.props.children
            );
        };

        return OAuthRouter;
    })(React.PureComponent);

    return OAuthRouter;
};

exports['default'] = OAuthRouterWrapper;
module.exports = exports['default'];
