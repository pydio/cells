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
import PydioDataModel from 'pydio/model/data-model'
import PydioApi from 'pydio/http/api'
import Node from 'pydio/model/node'

export default function (pydio) {

    return function(){
        const userSelection = pydio.getUserSelection();
        const folderNode = userSelection.getUniqueNode();
        const parentPath = folderNode.getParent().getPath();
        const basename = folderNode.getLabel();
        const newNode = new Node(parentPath + "/" + basename + ".zip", true);
        const newSelection = new PydioDataModel();
        newSelection.setSelectedNodes([newNode]);
        PydioApi.getClient().downloadSelection(newSelection, 'download');
    }

}