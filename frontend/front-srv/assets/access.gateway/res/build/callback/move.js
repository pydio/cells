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

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _pydioUtilPath = require("pydio/util/path");

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _pydioUtilLang = require("pydio/util/lang");

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _require$requireLib = require('pydio').requireLib('components');

var DNDActionParameter = _require$requireLib.DNDActionParameter;

exports["default"] = function (pydio) {
    var MessageHash = pydio.MessageHash;

    var comparePaths = function comparePaths(source, target) {
        var otherRepo = target.getMetadata().has('repository_id');
        if (target.isLeaf() || target.getPath() === source.getPath() || !otherRepo && _pydioUtilLang2["default"].trimRight(target.getPath(), "/") === _pydioUtilPath2["default"].getDirname(source.getPath())) {
            throw new Error('Cannot drop on leaf or on same path');
        } else if (target.getMetadata().has("virtual_root")) {
            throw new Error('Cannot drop on virtual root');
        } else if (source.getMetadata().has("ws_root")) {
            throw new Error('Cannot move roots around');
        }
    };

    return function (controller) {
        var dndActionParameter = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

        if (dndActionParameter && dndActionParameter instanceof DNDActionParameter) {

            if (dndActionParameter.getStep() === DNDActionParameter.STEP_CAN_DROP) {

                var target = dndActionParameter.getTarget();
                var source = dndActionParameter.getSource();
                comparePaths(source, target);
                return false;
            } else if (dndActionParameter.getStep() === DNDActionParameter.STEP_END_DRAG) {

                try {
                    comparePaths(dndActionParameter.getSource(), dndActionParameter.getTarget());
                } catch (e) {
                    return;
                }

                var _selection = controller.getDataModel();
                var targetPath = dndActionParameter.getTarget().getPath();
                var targetWsId = null;
                // Putting on a different repository_id
                if (dndActionParameter.getTarget().getMetadata().has('repository_id')) {
                    targetWsId = dndActionParameter.getTarget().getMetadata().get('repository_id');
                    var ws = dndActionParameter.getTarget().getMetadata().get('workspaceEntry');
                    if (ws && ws.getRepositoryType() === "cell") {
                        pydio.UI.openComponentInModal('FSActions', 'CrossWsDropDialog', {
                            target: dndActionParameter.getTarget(),
                            source: dndActionParameter.getSource(),
                            dropEffect: dndActionParameter.getDropEffect() || 'move',
                            cellWs: ws
                        });
                        return;
                    }
                }
                var moveFunction = require('./applyCopyOrMove')(pydio);
                var sourceNode = dndActionParameter.getSource();
                var selectedNodes = _selection.getSelectedNodes();
                if (selectedNodes.indexOf(sourceNode) === -1) {
                    // Use source node instead of current datamodel selection
                    var newSel = new PydioDataModel();
                    newSel.setContextNode(_selection.getContextNode());
                    newSel.setSelectedNodes([dndActionParameter.getSource()]);
                    moveFunction(dndActionParameter.getDropEffect() || 'move', newSel, targetPath, targetWsId);
                } else {
                    moveFunction(dndActionParameter.getDropEffect() || 'move', _selection, targetPath, targetWsId);
                }
            }

            return;
        }

        var selection = pydio.getUserSelection();
        var submit = function submit(path) {
            var wsId = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            require('./applyCopyOrMove')(pydio)('move', selection, path, wsId);
        };

        pydio.UI.openComponentInModal('FSActions', 'TreeDialog', {
            isMove: true,
            dialogTitle: MessageHash[160],
            submitValue: submit
        });
    };
};

module.exports = exports["default"];
