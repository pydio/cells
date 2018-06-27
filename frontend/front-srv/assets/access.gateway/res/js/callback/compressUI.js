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

const PydioApi = require('pydio/http/api')
const PathUtils = require('pydio/util/path')

export default function (pydio) {

    return function(){
        const userSelection = pydio.getUserSelection();
        if(!pydio.Parameters.get('multipleFilesDownloadEnabled')){
            return;
        }

        let zipName;
        if(userSelection.isUnique()){
            zipName = PathUtils.getBasename(userSelection.getUniqueFileName());
            if(!userSelection.hasDir()) zipName = zipName.substr(0, zipName.lastIndexOf("\."));
        }else{
            zipName = PathUtils.getBasename(userSelection.getContextNode().getPath());
            if(zipName == "") zipName = "Archive";
        }
        let index=1, buff = zipName;
        while(userSelection.fileNameExists(zipName + ".zip")){
            zipName = buff + "-" + index; index ++ ;
        }

        pydio.UI.openComponentInModal('PydioReactUI', 'PromptDialog', {
            dialogTitleId:313,
            legendId:314,
            fieldLabelId:315,
            defaultValue:zipName + '.zip',
            defaultInputSelection: zipName,
            submitValue:function(value){
                PydioApi.getClient().postSelectionWithAction('compress', null, null, {archive_name:value});
            }
        });

    }

}