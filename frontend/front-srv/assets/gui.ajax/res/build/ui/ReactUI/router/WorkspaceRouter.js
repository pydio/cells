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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WorkspaceRouterWrapper = function WorkspaceRouterWrapper(pydio) {
    var WorkspaceRouter = (function (_React$PureComponent) {
        _inherits(WorkspaceRouter, _React$PureComponent);

        function WorkspaceRouter() {
            _classCallCheck(this, WorkspaceRouter);

            _React$PureComponent.apply(this, arguments);
        }

        WorkspaceRouter.prototype._handle = function _handle(_ref) {
            var params = _ref.params;
            var location = _ref.location;

            // Making sure we redirect to the right workspace based on initial url
            var slug = params.workspaceId.replace("ws-", "");
            var splat = params.splat || "";
            var repositories = pydio.user ? pydio.user.getRepositoriesList() : new Map();
            var active = pydio.user ? pydio.user.getActiveRepository() : null;

            if (!pydio.user) {
                var origin = location.pathname || "";
                localStorage.setItem("loginOrigin", origin.replace(new RegExp('starting.html$|maintenance.html$'), ''));
            }

            repositories.forEach(function (repository) {
                if (repository.slug === slug && active !== repository.getId()) {
                    pydio._initLoadRep = "/" + splat;
                    pydio.triggerRepositoryChange(repository.getId());
                }
            });
        };

        WorkspaceRouter.prototype.componentWillMount = function componentWillMount() {
            this._handle(this.props);
        };

        WorkspaceRouter.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
            this._handle(nextProps);
        };

        WorkspaceRouter.prototype.render = function render() {
            return React.createElement(
                "div",
                null,
                this.props.children
            );
        };

        return WorkspaceRouter;
    })(React.PureComponent);

    ;

    return WorkspaceRouter;
};

exports["default"] = WorkspaceRouterWrapper;
module.exports = exports["default"];
