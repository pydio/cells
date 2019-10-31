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

var HomepageRouterWrapper = function HomepageRouterWrapper(pydio) {
    var HomepageRouter = (function (_React$PureComponent) {
        _inherits(HomepageRouter, _React$PureComponent);

        function HomepageRouter() {
            _classCallCheck(this, HomepageRouter);

            _React$PureComponent.apply(this, arguments);
        }

        HomepageRouter.prototype.componentDidMount = function componentDidMount() {
            if (pydio.user) {
                pydio.triggerRepositoryChange("homepage");
            }
        };

        HomepageRouter.prototype.render = function render() {
            return React.createElement(
                "div",
                null,
                this.props.children
            );
        };

        return HomepageRouter;
    })(React.PureComponent);

    ;

    return HomepageRouter;
};

exports["default"] = HomepageRouterWrapper;
module.exports = exports["default"];
