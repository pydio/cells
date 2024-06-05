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

import PydioApi from 'pydio/http/api'
import PathUtils from 'pydio/util/path'

export default function (pydio) {

    return function(){
        const downloadNode = pydio.getUserSelection().getUniqueNode();
        const client = PydioApi.getClient()
        const attachmentName = PathUtils.getBasename(downloadNode.getPath()).replace(downloadNode.getAjxpMime(), "pdf")
        const agent = navigator.userAgent || '';
        const agentIsMobile = (agent.indexOf('iPhone')!==-1||agent.indexOf('iPod')!==-1||agent.indexOf('iPad')!==-1||agent.indexOf('iOs')!==-1);
        const hiddenForm = pydio.UI && pydio.UI.hasHiddenDownloadForm();
        client.buildPresignedGetUrl(downloadNode, null, '', {
            Bucket:'io',
            Key:'pydio-thumbstore/'+downloadNode.getMetadata().get('PDFPreview'),
            Expires: 600
        }, attachmentName).then(url => {
            if(agentIsMobile || !hiddenForm){
                document.location.href = url;
            } else {
                pydio.UI.sendDownloadToHiddenForm(pydio.getUserSelection(), {presignedUrl: url});
            }
        });

    }

}