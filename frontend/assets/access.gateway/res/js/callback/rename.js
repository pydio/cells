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
import PydioApi from 'pydio/http/api'
import PathUtils from 'pydio/util/path'

const callback = (node, newValue) => {
    const pydio = Pydio.getInstance()
    if(!node) {
        node = pydio.getUserSelection().getUniqueNode();
    }
    if(newValue.indexOf('/') !== -1) {
        throw new Error(pydio.MessageHash['filename.forbidden.slash']);
    }
    const slug = pydio.user.getActiveRepositoryObject().getSlug();
    const path = slug + node.getPath();
    const target = PathUtils.getDirname(path) + '/' + newValue;
    const jobParams =  {
        nodes: [path],
        target: target,
        targetParent: false
    };
    PydioApi.getRestClient().userJob('move', jobParams).then(r => {
        const m = pydio.MessageHash['rename.processing'].replace('%1', node.getLabel()).replace('%2', newValue);
        pydio.UI.displayMessage('SUCCESS', m);
        node.getMetadata().set('pending_operation', m);
        node.getMetadata().set('pending_operation_uuid', r.JobUuid);
        node.notify('meta_replaced', node);
        pydio.getContextHolder().setSelectedNodes([]);
    }).catch((err) => {
        const msg = err.Detail || err.message || err;
        pydio.UI.displayMessage('ERROR', msg);
    });
};

const renameFunction = ()  => {
    const pydio = Pydio.getInstance();
    const n = pydio.getUserSelection().getSelectedNodes()[0];
    if(n){
        let res = n.notify("node_action", {type:"prompt-rename", callback:(value)=>{callback(n, value);}});
        if(!res || res[0] !== true) {
            pydio.UI.openComponentInModal('PydioReactUI', 'PromptDialog', {
                dialogTitleId: 6,
                legendId: 158,
                fieldLabelId: n.isLeaf()?174:173,
                dialogSize: 'sm',
                submitValue: (value) => callback(n, value),
                warnSpace: true,
            });
        }
    }
}

export {callback, renameFunction}

export default function (pydio) {

    return function(){
        const callback = (node, newValue) => {
            if(!node) {
                node = pydio.getUserSelection().getUniqueNode();
            }
            if(newValue.indexOf('/') !== -1) {
                throw new Error(pydio.MessageHash['filename.forbidden.slash']);
            }
            const slug = pydio.user.getActiveRepositoryObject().getSlug();
            const path = slug + node.getPath();
            const target = PathUtils.getDirname(path) + '/' + newValue;
            const jobParams =  {
                nodes: [path],
                target: target,
                targetParent: false
            };
            PydioApi.getRestClient().userJob('move', jobParams).then(r => {
                const m = pydio.MessageHash['rename.processing'].replace('%1', node.getLabel()).replace('%2', newValue);
                pydio.UI.displayMessage('SUCCESS', m);
                n.getMetadata().set('pending_operation', m);
                n.getMetadata().set('pending_operation_uuid', r.JobUuid);
                n.notify('meta_replaced', n);
                pydio.getContextHolder().setSelectedNodes([]);
            }).catch((err) => {
                const msg = err.Detail || err.message || err;
                pydio.UI.displayMessage('ERROR', msg);
            });
        };
        const n = pydio.getUserSelection().getSelectedNodes()[0];
        if(n){
            let res = n.notify("node_action", {type:"prompt-rename", callback:(value)=>{callback(n, value);}});
            if((!res || res[0] !== true) && n.getParent()){
                n.getParent().notify("child_node_action", {type:"prompt-rename", child:n, callback:(value)=>{callback(n, value);}});
            }
        }
    }

}