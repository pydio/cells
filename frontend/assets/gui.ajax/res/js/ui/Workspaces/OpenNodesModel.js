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
import Pydio from 'pydio'

class OpenNodesModel extends Observable{

    constructor(){
        super();
        this._openNodes = [];
        this._updatedTitles = new Map();
        const pydio = Pydio.getInstance()
        pydio.UI.registerEditorOpener(this);
        if(pydio.user) {
            this.activeRepository = pydio.user.activeRepository
        }

        pydio.observe("repository_list_refreshed", () => {
            if(pydio.user) {
                // Do not refresh if activeRepo is the same
                const newActiveRepo = pydio.user.activeRepository
                if(newActiveRepo === this.activeRepository) {
                    return
                }
                this.activeRepository = newActiveRepo;
            }
            this._openNodes = [];
            this.notify('update', this._openNodes);
        });
    }

    static getInstance(){
        if(!OpenNodesModel.__INSTANCE){
            OpenNodesModel.__INSTANCE = new OpenNodesModel();
        }
        return OpenNodesModel.__INSTANCE;
    }

    openEditorForNode(selectedNode, editorData){
        this.pushNode(selectedNode, editorData);
    }

    updateNodeTitle(object, newTitle){
        this._updatedTitles.set(object, newTitle);
        this.notify('titlesUpdated');
    }

    getObjectLabel(object){
        if(this._updatedTitles.has(object)){
            return this._updatedTitles.get(object);
        }else{
            return object.node.getLabel();
        }
    }

    pushNode(node, editorData){
        let found = false;
        let editorClass = editorData ? editorData.editorClass : null;
        let object = {node:node, editorData:editorData};
        this.notify('willPushNode', object);
        this._openNodes.map(function(o){
            if(o.node === node && (o.editorData && o.editorData.editorClass == editorClass) || (!o.editorData && !editorClass)){
                found = true;
                object = o;
            }
        });
        if(!found){
            this._openNodes.push(object);
        }
        this.notify('nodePushed', object);
        this.notify('update', this._openNodes);
    }

    removeNode(object){
        this.notify('willRemoveNode', object);
        let index = this._openNodes.indexOf(object);
        if(this._updatedTitles.has(object)){
            this._updatedTitles.delete(object);
        }
        this._openNodes = LangUtils.arrayWithout(this._openNodes, index);
        this.notify('nodeRemovedAtIndex', index);
        this.notify('update', this._openNodes);
    }

    getNodes(){
        return this._openNodes;
    }

}

export {OpenNodesModel as default}
