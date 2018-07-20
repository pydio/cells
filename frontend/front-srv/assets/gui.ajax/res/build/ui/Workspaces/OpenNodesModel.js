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

var OpenNodesModel = (function (_Observable) {
    _inherits(OpenNodesModel, _Observable);

    function OpenNodesModel() {
        _classCallCheck(this, OpenNodesModel);

        _Observable.call(this);
        this._openNodes = [];
        this._updatedTitles = new Map();
        pydio.UI.registerEditorOpener(this);
        pydio.observe("repository_list_refreshed", (function () {
            this._openNodes = [];
        }).bind(this));
    }

    OpenNodesModel.getInstance = function getInstance() {
        if (!OpenNodesModel.__INSTANCE) {
            OpenNodesModel.__INSTANCE = new OpenNodesModel();
        }
        return OpenNodesModel.__INSTANCE;
    };

    OpenNodesModel.prototype.openEditorForNode = function openEditorForNode(selectedNode, editorData) {
        this.pushNode(selectedNode, editorData);
    };

    OpenNodesModel.prototype.updateNodeTitle = function updateNodeTitle(object, newTitle) {
        this._updatedTitles.set(object, newTitle);
        this.notify('titlesUpdated');
    };

    OpenNodesModel.prototype.getObjectLabel = function getObjectLabel(object) {
        if (this._updatedTitles.has(object)) {
            return this._updatedTitles.get(object);
        } else {
            return object.node.getLabel();
        }
    };

    OpenNodesModel.prototype.pushNode = function pushNode(node, editorData) {
        var found = false;
        var editorClass = editorData ? editorData.editorClass : null;
        var object = { node: node, editorData: editorData };
        this.notify('willPushNode', object);
        this._openNodes.map(function (o) {
            if (o.node === node && o.editorData && o.editorData.editorClass == editorClass || !o.editorData && !editorClass) {
                found = true;
                object = o;
            }
        });
        if (!found) {
            this._openNodes.push(object);
        }
        this.notify('nodePushed', object);
        this.notify('update', this._openNodes);
    };

    OpenNodesModel.prototype.removeNode = function removeNode(object) {
        this.notify('willRemoveNode', object);
        var index = this._openNodes.indexOf(object);
        if (this._updatedTitles.has(object)) {
            this._updatedTitles['delete'](object);
        }
        this._openNodes = LangUtils.arrayWithout(this._openNodes, index);
        this.notify('nodeRemovedAtIndex', index);
        this.notify('update', this._openNodes);
    };

    OpenNodesModel.prototype.getNodes = function getNodes() {
        return this._openNodes;
    };

    return OpenNodesModel;
})(Observable);

exports['default'] = OpenNodesModel;
module.exports = exports['default'];
