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
import React, {Component} from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'

const configs = Pydio.getInstance().getPluginConfigs("editor.libreoffice");
const {withMenu, withLoader, withErrors, EditorActions} = Pydio.requireLib('hoc');

// const Viewer = compose(
//     withMenu,
//     withLoader,
//     withErrors
// )(({url, style}) => <iframe src={url} style={{...style, width: "100%", height: "100%", border: 0, flex: 1}}></iframe>)

@connect(null, EditorActions)
export default class Editor extends React.Component {
    constructor(props) {
        super(props)

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

        let iframeUrl = configs.get('LIBREOFFICE_IFRAME_URL'),
            webSocketSecure = configs.get('LIBREOFFICE_WEBSOCKET_SECURE'),
            webSocketHost = configs.get('LIBREOFFICE_WEBSOCKET_HOST'),
            webSocketPort = configs.get('LIBREOFFICE_WEBSOCKET_PORT');

        // FIXME: was retrieved from the response JSON before, we manually add the prefix otherwise collabora cannot get the doc.
        let host = 'http://'+webSocketHost;
        // TODO also manage backend port when we have found a solution for the collabora container
        // to call the backend on a specific port. For the time being, all request that are sent to:
        // mypydiohost.example.com/wopi/... must be proxied to the correct host, f.i. mypydiohost.example.com:5014/wopi
        // via a reverse proxy.

        let webSocketProtocol = webSocketSecure ? 'wss' : 'ws',
        webSocketUrl = encodeURIComponent(`${webSocketProtocol}://${webSocketHost}:${webSocketPort}`);

        // Check current action state for permission
        const readonly = Pydio.getInstance().getController().getActionByName("move").deny;
        const permission = readonly ? "readonly" : "edit"
        const uri = "/wopi/files/" + this.props.node.getMetadata().get("uuid");
        const fileSrcUrl = encodeURIComponent(`${host}${uri}`);

        PydioApi.getRestClient().getOrUpdateJwt().then((jwt) => {
            this.setState({url: `${iframeUrl}?host=${webSocketUrl}&WOPISrc=${fileSrcUrl}&access_token=${jwt}&permission=${permission}`});
        });
    }

    render() {
        const {url} = this.state
        return (
            <iframe src={url} style={{backgroundColor: "white", width: "100%", height: "100%", border: 0, flex: 1}}></iframe>
        );
    }
}
