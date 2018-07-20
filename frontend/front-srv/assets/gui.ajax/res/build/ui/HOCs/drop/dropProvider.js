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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _NativeFileDropProvider = require('./NativeFileDropProvider');

var _NativeFileDropProvider2 = _interopRequireDefault(_NativeFileDropProvider);

exports['default'] = function (PydioComponent) {
    var filterFunction = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return _NativeFileDropProvider2['default'](PydioComponent, function (items, files) {
        var pydio = global.pydio;
        var UploaderModel = global.UploaderModel;

        if (!pydio.user || !UploaderModel) {
            pydio.UI.displayMessage('ERROR', 'You are not allowed to upload files here');
            return;
        }
        var ctxNode = pydio.getContextHolder().getContextNode();
        if (ctxNode.getMetadata().get('node_readonly') === 'true' || ctxNode.getMetadata().get('level_readonly') === 'true') {
            pydio.UI.displayMessage('ERROR', 'You are not allowed to upload files here');
            return;
        }
        var storeInstance = UploaderModel.Store.getInstance();

        storeInstance.handleDropEventResults(items, files, ctxNode, null, filterFunction);

        if (!storeInstance.getAutoStart() || pydio.Parameters.get('MINISITE')) {
            pydio.getController().fireAction('upload');
        }
    });
};

module.exports = exports['default'];
