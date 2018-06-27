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
var PydioApi = require('pydio/http/api');
var PathUtils = require('pydio/util/path');

exports['default'] = function (pydio) {

    return function () {
        var userSelection = pydio.getUserSelection();
        if (!pydio.Parameters.get('multipleFilesDownloadEnabled')) {
            return;
        }

        var zipName = undefined;
        if (userSelection.isUnique()) {
            zipName = PathUtils.getBasename(userSelection.getUniqueFileName());
            if (!userSelection.hasDir()) zipName = zipName.substr(0, zipName.lastIndexOf("\."));
        } else {
            zipName = PathUtils.getBasename(userSelection.getContextNode().getPath());
            if (zipName == "") zipName = "Archive";
        }
        var index = 1,
            buff = zipName;
        while (userSelection.fileNameExists(zipName + ".zip")) {
            zipName = buff + "-" + index;index++;
        }

        pydio.UI.openComponentInModal('PydioReactUI', 'PromptDialog', {
            dialogTitleId: 313,
            legendId: 314,
            fieldLabelId: 315,
            defaultValue: zipName + '.zip',
            defaultInputSelection: zipName,
            submitValue: function submitValue(value) {
                PydioApi.getClient().postSelectionWithAction('compress', null, null, { archive_name: value });
            }
        });
    };
};

module.exports = exports['default'];
