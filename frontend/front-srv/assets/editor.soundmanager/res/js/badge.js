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
import Player from './Player';
import PydioApi from 'pydio/http/api'
// The threeSixytPlayer is the same for all badges
var threeSixtyPlayer = new ThreeSixtyPlayer();

export default class Badge extends Component {

    componentDidMount() {
        this.loadNode(this.props)

        threeSixtyPlayer.init()
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.node !== this.props.node) {
            this.loadNode(nextProps)
        }
    }

    loadNode(props) {
        const {node} = props;

        PydioApi.getClient().buildPresignedGetUrl(node, (url) => {
            this.setState({
                url: url,
                mimeType: "audio/" + node.getAjxpMime()
            })

        }, "audio/" + node.getAjxpMime());

    }

    render() {
        const {mimeType, url} = this.state || {}

        if (!url) return null

        return (
            <Player rich={false} style={{width: 40, height: 40, margin: "auto"}} onReady={() => {}}>
                <a type={mimeType} href={url} />
            </Player>
        );
    }
}

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}
