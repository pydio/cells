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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _require$requireLib = require('pydio').requireLib('components');

var DNDActionParameter = _require$requireLib.DNDActionParameter;

exports['default'] = function (pydio) {
    var MessageHash = pydio.MessageHash;

    return function (controller) {
        var dndActionParameter = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

        if (dndActionParameter && dndActionParameter instanceof DNDActionParameter) {

            if (dndActionParameter.getStep() === DNDActionParameter.STEP_CAN_DROP) {

                if (dndActionParameter.getTarget().isLeaf() || dndActionParameter.getTarget().getPath() === dndActionParameter.getSource().getPath()) {
                    throw new Error('Cannot drop');
                } else {
                    return false;
                }
            } else if (dndActionParameter.getStep() === DNDActionParameter.STEP_END_DRAG) {
                var _selection = controller.getDataModel();
                var targetPath = dndActionParameter.getTarget().getPath();
                var moveFunction = require('./applyCopyOrMove')(pydio);
                var sourceNode = dndActionParameter.getSource();
                var selectedNodes = _selection.getSelectedNodes();
                if (selectedNodes.indexOf(sourceNode) === -1) {
                    // Use source node instead of current datamodel selection
                    var newSel = new PydioDataModel();
                    newSel.setContextNode(_selection.getContextNode());
                    newSel.setSelectedNodes([dndActionParameter.getSource()]);
                    _selection = newSel;
                    moveFunction('move', newSel, targetPath);
                } else {
                    moveFunction('move', _selection, targetPath);
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

module.exports = exports['default'];
