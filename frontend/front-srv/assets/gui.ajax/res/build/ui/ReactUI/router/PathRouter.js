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

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var PathRouterWrapper = function PathRouterWrapper(pydio) {
    var PathRouter = (function (_React$PureComponent) {
        _inherits(PathRouter, _React$PureComponent);

        function PathRouter() {
            _classCallCheck(this, PathRouter);

            _React$PureComponent.apply(this, arguments);
        }

        PathRouter.prototype._handle = function _handle(_ref) {
            var params = _ref.params;

            var splat = params.splat || "";
            var path = pydio.getContextNode().getPath();

            if ("/" + splat !== path) {
                pydio.goTo("/" + splat);
            }
        };

        PathRouter.prototype.componentWillMount = function componentWillMount() {
            this._handle(this.props);
        };

        PathRouter.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
            this._handle(nextProps);
        };

        PathRouter.prototype.render = function render() {
            return React.createElement(
                "div",
                null,
                this.props.children
            );
        };

        return PathRouter;
    })(React.PureComponent);

    ;

    return PathRouter;
};

exports["default"] = PathRouterWrapper;
module.exports = exports["default"];
