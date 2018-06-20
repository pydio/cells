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
import { connect } from 'react-redux'
import { compose } from 'redux'
import Player from './Player';
const PydioApi = require('pydio/http/api');

class Viewer extends React.Component {

    static get styles() {
        return {
            container: {
                maxWidth: "100%",
                minHeight: 120,
                padding: 0,
                width: "100%",
                flex: 1,
                display: 'flex',
                alignItems: 'stretch'
            }
        }
    }

    static get propTypes() {
        return {
            node: React.PropTypes.instanceOf(AjxpNode).isRequired,
            pydio: React.PropTypes.instanceOf(Pydio).isRequired,

            preview: React.PropTypes.bool.isRequired
        }
    }

    static get defaultProps() {
        return {
            preview: false
        }
    }

    componentDidMount() {
        this.loadNode(this.props)
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
            })
        }, "video/" + node.getAjxpMime());
    }

    // Util functions
    getSessionId() {
        const {pydio} = this.props

        return new Promise((resolve, reject) => {
            pydio.ApiClient.request({
                get_action: 'get_sess_id'
            }, function(transport) {
                resolve(transport.responseText)
            })
        });
    }

    // Plugin Main Editor rendering
    render() {
        const {url} = this.state || {}
        // Only display the video when we know the URL
        const editor = url ? <Player url={url} /> : null;

        return (
            <div style={Viewer.styles.container}>{editor}</div>
        );
    }
}

const {withSelection} = PydioHOCs;

const editors = pydio.Registry.getActiveExtensionByType("editor")
const conf = editors.filter(({id}) => id === 'editor.video')[0]

const getSelectionFilter = (node) => conf.mimes.indexOf(node.getAjxpMime()) > -1

const getSelection = (node) => new Promise((resolve, reject) => {
    let selection = [];

    node.getParent().getChildren().forEach((child) => selection.push(child));
    selection = selection.filter(getSelectionFilter)

    resolve({
        selection,
        currentIndex: selection.reduce((currentIndex, current, index) => current === node && index || currentIndex, 0)
    })
})

export const Panel = Viewer

export const Editor = compose(
    withSelection(getSelection),
    connect()
)(Viewer)
