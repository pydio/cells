/*
 * Copyright 2007-2019 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import {RestDocumentAccessTokenRequest, TokenServiceApi} from 'cells-sdk'
import React, {Component} from 'react'
import {connect} from 'react-redux'

const {EditorActions} = Pydio.requireLib('hoc');


@connect(null, EditorActions)
export default class Editor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {}
    }

    componentWillReceiveProps(nextProps) {
        const {editorModify} = this.props;
        if (nextProps.isActive) {
            editorModify({fixedToolbar: true})
        }
    }

    componentDidMount() {
        const {editorModify} = this.props;
        if (this.props.isActive) {
            editorModify({fixedToolbar: true})
        }
        const pydio = Pydio.getInstance();
        const configs = pydio.getPluginConfigs("editor.libreoffice")

        pydio.notify('longtask_starting');
        const iframeUrl = configs.get("LIBREOFFICE_CODE_VERSION") === "v21" ? "/browser/dist/cool.html" : "/loleaflet/dist/loleaflet.html";
        const frontUrl = pydio.getFrontendUrl();
        const protocol = frontUrl.protocol === 'https:' ? 'wss:' : 'ws:';

        const webSocketUrl = `${protocol}//${frontUrl.host}`; //host.replace(/^http/gi, 'ws');
        // Check current action state for permission
        const {node} = this.props;
        const readonly = node.hasMetadataInBranch("node_readonly", "true") || (node.getMetadata().get("content_lock") && node.getMetadata().get("content_lock") !== pydio.user.id);
        const permission = readonly ? "readonly" : "edit"
        const uri = "/wopi/files/" + node.getMetadata().get("uuid");
        const fileSrcUrl = encodeURIComponent(`${frontUrl.protocol}//${frontUrl.host}${uri}`);

        const api = new TokenServiceApi(PydioApi.getRestClient())
        const req = new RestDocumentAccessTokenRequest();
        req.Path = PydioApi.getClient().getSlugForNode(node) + node.getPath();
        let langParam = '';
        if(pydio.user.getPreference('lang') !== '') {
            const lang = pydio.user.getPreference('lang').split('-')[0]
            langParam = `&lang=${lang}`
        }
        api.generateDocumentAccessToken(req).then(response => {
            this.setState({url: `${iframeUrl}?host=${webSocketUrl}&WOPISrc=${fileSrcUrl}&access_token=${response.AccessToken}&permission=${permission}${langParam}`});
        })
    }

    componentWillUnmount() {
        Pydio.getInstance().notify('longtask_finished');
    }

    render() {
        const {url} = this.state
        return (
            <iframe src={url} style={{backgroundColor: "white", width: "100%", height: "100%", border: 0, flex: 1}}></iframe>
        );
    }
}
