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

var _langObservable = require('../lang/Observable');

var _langObservable2 = _interopRequireDefault(_langObservable);

var ContextMenuModel = (function (_Observable) {
    _inherits(ContextMenuModel, _Observable);

    function ContextMenuModel() {
        _classCallCheck(this, ContextMenuModel);

        _Observable.apply(this, arguments);
    }

    ContextMenuModel.prototype["super"] = function _super() {
        this._currentNode = null;
        this._position = null;
    };

    ContextMenuModel.getInstance = function getInstance() {
        if (!ContextMenuModel.__INSTANCE) {
            ContextMenuModel.__INSTANCE = new ContextMenuModel();
        }
        return ContextMenuModel.__INSTANCE;
    };

    ContextMenuModel.prototype.openAtPosition = function openAtPosition(clientX, clientY) {
        this._currentNode = null;
        this._position = { x: clientX, y: clientY };
        this.notify("open");
    };

    ContextMenuModel.prototype.openNodeAtPosition = function openNodeAtPosition(node, clientX, clientY) {
        this._currentNode = node;
        this._position = { x: clientX, y: clientY };
        this.notify("open", node);
    };

    ContextMenuModel.prototype.getNode = function getNode() {
        return this._currentNode;
    };

    ContextMenuModel.prototype.getPosition = function getPosition() {
        return this._position;
    };

    ContextMenuModel.prototype.close = function close() {
        this._currentNode = null;
        this.notify("close");
    };

    return ContextMenuModel;
})(_langObservable2["default"]);

exports["default"] = ContextMenuModel;
module.exports = exports["default"];
