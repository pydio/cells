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



import React, {Component} from 'react'
import {compose} from 'redux'

const configs = pydio.getPluginConfigs("editor.libreoffice");
const {withMenu, withLoader, withErrors, withControls} = PydioHOCs;

const Viewer = compose(
    withMenu,
    withLoader,
    withErrors
)(({url, style}) => <iframe src={url} style={{...style, width: "100%", height: "100%", border: 0, flex: 1}}></iframe>)

class Editor extends React.Component {

    constructor(props) {
        super(props)

        this.state = {}
    }

    componentWillMount() {
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

        let fileName = this.props.node.getPath();
        pydio.ApiClient.request({
            get_action: 'libreoffice_get_file_url',
            file: fileName
        }, ({responseJSON = {}}) => {
            //was (see above): let {host, uri, permission, jwt} = responseJSON;
            let {uri, permission, jwt} = responseJSON;
            let fileSrcUrl = encodeURIComponent(`${host}${uri}`);
            this.setState({url: `${iframeUrl}?host=${webSocketUrl}&WOPISrc=${fileSrcUrl}&access_token=${jwt}&permission=${permission}`});
        });
    }

    render() {
        return (
            <Viewer {...this.props} url={this.state.url} />
        );
    }
}

export default Editor
