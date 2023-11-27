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


import PydioApi from "pydio/http/api";
import LangUtils from 'pydio/util/lang';
const {PromptValidators} = Pydio.requireLib('boot')
import {TreeServiceApi, RestCreateNodesRequest, TreeNode, TreeNodeType} from 'cells-sdk';

export default function(pydio){

    return function(){

        const validators = [
            PromptValidators.Empty,
            PromptValidators.NoSlash,
            PromptValidators.MustDifferSiblings(),
        ]

        let submit = value => {

            if(value.indexOf('/') !== -1) {
                const m = pydio.MessageHash['filename.forbidden.slash'];
                pydio.UI.displayMessage('ERROR', m);
                throw new Error(m);
            }

            const api = new TreeServiceApi(PydioApi.getRestClient());
            const request = new RestCreateNodesRequest();
            const slug = pydio.user.getActiveRepositoryObject().getSlug();
            const path = slug + LangUtils.trimRight(pydio.getContextNode().getPath(), '/') + '/' + value;
            const node = new TreeNode();
            node.Path = path;
            node.Type = TreeNodeType.constructFromObject('COLLECTION');
            request.Nodes = [node];
            api.createNodes(request).then(collection => {
                if(console) console.debug('Created nodes', collection.Children);
            });
        };
        pydio.UI.openComponentInModal('PydioReactUI', 'PromptDialog', {
            dialogTitleId:154,
            legendId:155,
            fieldLabelId:173,
            dialogSize:'sm',
            submitValue:submit,
            warnSpace: true,
            validate:(value) => {
                validators.forEach(v => v(value))
            }
        });
    }

}