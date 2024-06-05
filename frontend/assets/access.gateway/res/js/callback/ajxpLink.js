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

const FuncUtils = require('pydio/util/func')
const DOMUtils = require('pydio/util/dom')
const LangUtils = require('pydio/util/lang')

export default function (pydio) {

    return function(){
        let link;
        const url = DOMUtils.getUrlFromBase();

        let repoId = pydio.repositoryId || (pydio.user ? pydio.user.activeRepository : null);
        if(pydio.user){
            const slug = pydio.user.repositories.get(repoId).getSlug();
            if(slug) {
                repoId = 'ws-' + slug;
            }
        }

        link = LangUtils.trimRight(url, '/') + '/' + repoId + pydio.getUserSelection().getUniqueNode().getPath();

        pydio.UI.openComponentInModal('PydioReactUI', 'PromptDialog', {
            dialogTitleId:369,
            fieldLabelId:296,
            defaultValue:link,
            submitValue:FuncUtils.Empty
        });


    }

}