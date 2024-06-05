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

import Observable from 'pydio/lang/observable'
import LinkModel from '../links/LinkModel'
import ShareHelper from '../main/ShareHelper'
import CellModel from 'pydio/model/cell'
import {TreeNode, RestShareLinkAccessType} from 'cells-sdk'
import Pydio from 'pydio'
const {moment} = Pydio.requireLib('boot');

class CompositeModel extends Observable {

    cells;
    links;
    edit;
    node;
    saving;

    constructor(edit = false){
        super();
        this.cells = [];
        this.links = [];
        this.edit = edit;
    }

    emptyLink(node){
        const link = new LinkModel();
        const treeNode = new TreeNode();
        const auth = ShareHelper.getAuthorizations();
        treeNode.Uuid = node.getMetadata().get('uuid');
        link.getLink().Label = node.getLabel();
        link.getLink().Description = pydio.MessageHash['share_center.257'].replace('%s', moment(new Date()).format("YYYY/MM/DD"));
        link.getLink().RootNodes.push(treeNode);
        // Template / Permissions from node
        let defaultTemplate;
        let defaultPermissions = [RestShareLinkAccessType.constructFromObject('Download')];
        if(node.isLeaf()){
            defaultTemplate = "pydio_unique_dl";
            const {preview} = ShareHelper.nodeHasEditor(pydio, node);
            if(preview && !auth.max_downloads){
                defaultTemplate = "pydio_unique_strip";
                defaultPermissions.push(RestShareLinkAccessType.constructFromObject('Preview'));
            } else if(auth.max_downloads > 0){
                // If DL only and auth has default max download, set it
                link.getLink().MaxDownloads = auth.max_downloads;
            }
        } else {
            defaultTemplate = "pydio_shared_folder";
            defaultPermissions.push(RestShareLinkAccessType.constructFromObject('Preview'));
        }
        link.getLink().ViewTemplateName = defaultTemplate;
        link.getLink().Permissions = defaultPermissions;
        if(auth.max_expiration){
            link.getLink().AccessEnd = "" + (Math.round(new Date() / 1000) + parseInt(auth.max_expiration) * 60 * 60 * 24);
        }

        link.observe("update", ()=> {this.notify("update")});
        link.observe("save", ()=> {this.updateUnderlyingNode()});
        return link;
    }

    createEmptyCell() {
        const cell = new CellModel(true);
        cell.setLabel(this.node.getLabel());
        cell.addRootNode(this.node);
        cell.observe("update", () => {this.notify("update")});
        cell.dirty = false;
        this.cells.push(cell);
        this.notify("update");
    }

    addToExistingCell(cellId){
        const cell = new CellModel(true);
        cell.observe("update", () => {this.notify("update")});
        cell.load(cellId).then(()=>{
            cell.addRootNode(this.node);
        });
        const empties = this.cells.filter(c => !c.getUuid())
        if(empties.length){
            this.removeNewCell(empties[0])
        }
        this.cells.push(cell);
    }

    updateUnderlyingNode(){
        if(this.skipUpdateUnderlyingNode){
            return;
        }
        Pydio.getInstance().getContextHolder().requireNodeReload(this.node);
    }

    deleteLink(linkModel){
        return linkModel.deleteLink(this.emptyLink(this.node).getLink()).then(res => {
            this.updateUnderlyingNode();
        });
    }

    getNode(){
        return this.node;
    }

    /**
     * @param node {TreeNode}
     * @param observeReplace bool
     */
    load(node, observeReplace = false){
        this.node = node;
        this.cells = [];
        this.links = [];
        if(node.getMetadata().get('pydio_shares')){
            const shareMeta = JSON.parse(node.getMetadata().get('pydio_shares'));
            shareMeta.map(sharedWorkspace => {
                if (sharedWorkspace.Scope === 3) { // Link
                    const linkModel = new LinkModel();
                    linkModel.observe("update", ()=> {this.notify("update")});
                    linkModel.observe("save", ()=> {this.updateUnderlyingNode()});
                    linkModel.load(sharedWorkspace.UUID);
                    this.links.push(linkModel);
                } else if(sharedWorkspace.Scope === 2) {
                    const cell = new CellModel();
                    cell.observe("update", ()=> {this.notify("update")});
                    cell.load(sharedWorkspace.UUID);
                    this.cells.push(cell);
                }
            });
        }
        if(this.edit && !this.links.length){
            this.links.push(this.emptyLink(node));
        }
        if(this.edit && this.canCreateCells() && !this.cells.length){
            this.createEmptyCell();
        }
        if(observeReplace){
            this.node.observe('node_replaced', () => {
                this.load(this.node, false);
            });
        }
    }

    loadUniqueLink(linkUuid, node){
        this.node = node;
        const linkModel = new LinkModel();
        linkModel.observe("update", ()=> {this.notify("update")});
        linkModel.load(linkUuid);
        this.links.push(linkModel);
        return linkModel;
    }

    canCreateCells(){
        if(!this.node){
            return false;
        }
        const auth = ShareHelper.getAuthorizations();
        const nodeLeaf = this.node.isLeaf();
        return (nodeLeaf && auth.file_workspaces) || (!nodeLeaf && auth.folder_workspaces);
    }

    save(){
        this.saving = true;
        this.notify('update');

        const proms = [];
        this.cells.map(r => {
            if(r.isDirty()){
                proms.push(r.save());
            }
        });
        this.links.map(l => {
            if(l.isDirty()){
                proms.push(l.save());
            }
        });
        // Wait that all save are finished
        Promise.all(proms).then(() =>{
            // Remove cells that don't have this node anymore
            const nodeId = this.node.getMetadata().get('uuid');
            this.cells = this.cells.filter(r => r.hasRootNode(nodeId));
            this.updateUnderlyingNode();
            this.saving = false
        }).catch(e => {
            this.updateUnderlyingNode();
            this.saving = false
        })
    }

    deleteAll(){
        const nodeUuid = this.node.getMetadata().get('uuid');
        let p = [];
        this.cells.map(r => {
            r.removeRootNode(nodeUuid);
            p.push(r.save());
        });
        this.links.map(l=> {
            p.push(l.deleteLink())
        });
        return Promise.all(p);
    }

    removeNewCell(cell){
        this.cells = this.cells.filter(r => {
            return r !== cell
        });
        this.notify("update");
    }

    revertChanges(recreateEmpty = false){
        // Remove empty cells
        this.cells = this.cells.filter(r => {
            return r.getUuid();
        });
        this.cells.map(r => {
            if(r.isDirty()){
                r.revertChanges();
            }
        });
        this.links.map(l => {
            if(l.isDirty()){
                l.revertChanges();
            }
        });
        if(!this.cells.length && recreateEmpty && this.canCreateCells()) {
            this.createEmptyCell();
        }
        this.notify('update');
    }

    isDirty(){
        return !this.saving && this.cells.filter(r => r.isDirty()).length || this.links.filter(l => l.isDirty()).length;
    }

    stopObserving(event, callback = null) {
        this.cells.map(cell => {
            cell.stopObserving("update");
        });
        this.links.map(link => {
            link.stopObserving("update");
        });
        super.stopObserving(event, callback);
    }

    getCells(){
        if(this.node){
            const nodeId = this.node.getMetadata().get('uuid');
            return this.cells.filter(r => r.hasRootNode(nodeId));
        } else {
            return this.cells;
        }
    }

    getLinks(){
        return this.links;
    }
}

export {CompositeModel as default}