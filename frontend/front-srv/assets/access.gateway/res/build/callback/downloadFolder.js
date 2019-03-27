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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

exports['default'] = function (pydio) {

    return function () {
        var userSelection = pydio.getUserSelection();
        var folderNode = userSelection.getUniqueNode();
        var parentPath = folderNode.getParent().getPath();
        var basename = folderNode.getLabel();
        var newNode = new _pydioModelNode2['default'](parentPath + "/" + basename + ".zip", true);
        var newSelection = new _pydioModelDataModel2['default']();
        newSelection.setSelectedNodes([newNode]);
        _pydioHttpApi2['default'].getClient().downloadSelection(newSelection, 'download');
    };
};

module.exports = exports['default'];
