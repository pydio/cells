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

"use strict";

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactRouterLibBrowserHistory = require('react-router/lib/browserHistory');

var _reactRouterLibBrowserHistory2 = _interopRequireDefault(_reactRouterLibBrowserHistory);

var MainRouterWrapper = function MainRouterWrapper(pydio) {
    var MainRouter = (function (_React$PureComponent) {
        _inherits(MainRouter, _React$PureComponent);

        function MainRouter(props) {
            var _this = this;

            _classCallCheck(this, MainRouter);

            _React$PureComponent.call(this, props);

            this.state = this.getState();

            this._ctxObs = function (e) {
                _this.setState(_this.getState());
            };
        }

        MainRouter.prototype.getState = function getState() {
            var list = pydio.user ? pydio.user.getRepositoriesList() : new Map();
            var active = pydio.user ? pydio.user.getActiveRepository() : "";
            var path = pydio.user ? pydio.getContextNode().getPath() : "";
            var uri = this.getURI({ list: list, active: active, path: path });

            return {
                uri: uri
            };
        };

        MainRouter.prototype.getURI = function getURI(_ref) {
            var list = _ref.list;
            var active = _ref.active;
            var path = _ref.path;

            var repo = list.get(active);
            var slug = repo ? repo.getSlug() : "";
            var reserved = ['homepage', 'settings'];
            var prefix = repo && reserved.indexOf(repo.getAccessType()) === -1 ? "ws-" : "";

            return "/" + prefix + slug + path;
        };

        MainRouter.prototype.componentDidMount = function componentDidMount() {
            pydio.getContextHolder().observe("context_changed", this._ctxObs);
            pydio.getContextHolder().observe("repository_list_refreshed", this._ctxObs);
        };

        MainRouter.prototype.componentWillUnmount = function componentWillUnmount() {
            pydio.getContextHolder().stopObserving("context_changed", this._ctxObs);
            pydio.getContextHolder().stopObserving("repository_list_refreshed", this._ctxObs);
        };

        MainRouter.prototype.render = function render() {
            var uri = this.state.uri;

            if (pydio.user && uri !== this.props.location.pathname) {
                _reactRouterLibBrowserHistory2["default"].replace(uri);
            }

            return React.createElement(
                "div",
                null,
                this.props.children
            );
        };

        return MainRouter;
    })(React.PureComponent);

    ;

    return MainRouter;
};

exports["default"] = MainRouterWrapper;
module.exports = exports["default"];
