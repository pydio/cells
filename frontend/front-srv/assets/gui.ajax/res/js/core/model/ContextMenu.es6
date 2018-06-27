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

import Observable from '../lang/Observable'

export default class ContextMenuModel extends Observable{

    super(){
        this._currentNode = null;
        this._position    = null;
    }

    static getInstance(){
        if(!ContextMenuModel.__INSTANCE) {
            ContextMenuModel.__INSTANCE = new ContextMenuModel();
        }
        return ContextMenuModel.__INSTANCE;
    }

    openAtPosition(clientX, clientY){
        this._currentNode = null;
        this._position    = {x: clientX, y: clientY};
        this.notify("open");
    }

    openNodeAtPosition(node, clientX, clientY){
        this._currentNode = node;
        this._position    = {x: clientX, y: clientY};
        this.notify("open", node);
    }

    getNode(){
        return this._currentNode;
    }

    getPosition(){
        return this._position;
    }

    close(){
        this._currentNode = null;
        this.notify("close");
    }

}
