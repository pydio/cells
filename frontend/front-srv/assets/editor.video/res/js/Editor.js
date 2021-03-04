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
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Player from './Player';
import PydioApi from 'pydio/http/api';
const {EditorActions, withSelection} = Pydio.requireLib('hoc');

const editors = Pydio.getInstance().Registry.getActiveExtensionByType("editor")
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
});

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
            node: PropTypes.instanceOf(AjxpNode).isRequired,
            pydio: PropTypes.instanceOf(Pydio).isRequired,

            preview: PropTypes.bool.isRequired
        }
    }

    static get defaultProps() {
        return {
            preview: false
        }
    }

    componentDidMount() {
        this.loadNode(this.props)
        const {editorModify} = this.props;
        if (editorModify && this.props.isActive) {
            editorModify({fixedToolbar: false})
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.node !== this.props.node) {
            this.loadNode(nextProps)
        }
        const {editorModify} = this.props;
        if (editorModify && nextProps.isActive) {
            editorModify({fixedToolbar: false})
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

    // Plugin Main Editor rendering
    render() {
        const {url} = this.state || {};
        // Only display the video when we know the URL
        const editor = url ? <Player url={url} /> : null;

        return (
            <div style={Viewer.styles.container}>{editor}</div>
        );
    }
}

export const Panel = Viewer;

@connect(null, EditorActions)
@withSelection(getSelection)
export class Editor extends React.Component{
    render(){
        return <Viewer {...this.props}/>
    }
}