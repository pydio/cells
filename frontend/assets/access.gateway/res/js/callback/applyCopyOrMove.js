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

const PydioApi = require('pydio/http/api');

export default function (pydio) {
    /**
     * @param type string
     * @param selection {PydioDataModel}
     * @param path string
     * @param wsId string
     */
    return function(type, selection, path, wsId){

        const slug = pydio.user.getActiveRepositoryObject().getSlug();
        let targetSlug = slug;
        if(wsId) {
            const target = pydio.user.getRepositoriesList().get(wsId);
            if(target){
                targetSlug = target.getSlug();
            }
        }
        const nodes = selection.getSelectedNodes();
        const paths = nodes.map(n => slug + n.getPath());
        const jobParams =  {
            nodes: paths,
            target: targetSlug + path,
            targetParent: true
        };
        PydioApi.getRestClient().userJob(type, jobParams).then(r => {
            if (type === 'move') {
                nodes.forEach(n => {
                    const m = pydio.MessageHash['background.move.' + (n.isLeaf() ? 'file' : 'folder')];
                    n.getMetadata().set('pending_operation', m);
                    n.getMetadata().set('pending_operation_uuid', r.JobUuid);
                    n.notify('meta_replaced', n);
                })
            } else {
                pydio.UI.displayMessage('SUCCESS', pydio.MessageHash['background.copy.selection']);
            }
            pydio.getContextHolder().setSelectedNodes([]);
        }).catch((err) => {
            const msg = err.Detail || err.message || err;
            pydio.UI.displayMessage('ERROR', msg);
        });
    }

}