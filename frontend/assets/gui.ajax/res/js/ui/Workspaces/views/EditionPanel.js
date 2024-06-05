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

import PropTypes from 'prop-types';

import Pydio from 'pydio';
import OpenNodesModel from '../OpenNodesModel'
import { connect } from 'react-redux';
import { Editor } from '../editor';
import FilePreview from "./FilePreview";

const { EditorActions } = Pydio.requireLib('hoc')

class EditionPanel extends React.Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this._updateObserver = (nodes) => this._handleUpdate(nodes);
        this._nodesModelObserver = (node) => this._handleNodePushed(node);
        this._nodesRemoveObserver = (index) => this._handleNodeRemoved(index);
        this._titlesObserver = () => this.forceUpdate()

        OpenNodesModel.getInstance().observe("update", this._updateObserver);
        OpenNodesModel.getInstance().observe("nodePushed", this._nodesModelObserver);
        OpenNodesModel.getInstance().observe("nodeRemovedAtIndex", this._nodesRemoveObserver);
        OpenNodesModel.getInstance().observe("titlesUpdated", this._titlesObserver);
    }

    componentWillUnmount() {
        // When unmounting, making sure all tabs are deleted
        const {tabDeleteAll} = this.props

        tabDeleteAll();

        OpenNodesModel.getInstance().stopObserving("update", this._updateObserver);
        OpenNodesModel.getInstance().stopObserving("nodePushed", this._nodesModelObserver);
        OpenNodesModel.getInstance().stopObserving("nodeRemovedAtIndex", this._nodesRemoveObserver);
        OpenNodesModel.getInstance().stopObserving("titlesUpdated", this._titlesObserver);
    }

    _handleUpdate(nodes) {
        const {tabDeleteAll} = this.props

        if (nodes.length === 0) {
            tabDeleteAll();
        }
    }

    _handleNodePushed(object) {
        const {pydio, tabCreate, editorModify, editorSetActiveTab} = this.props;

        const {node = {}, editorData} = object;

        pydio.Registry.loadEditorResources(
            editorData.resourcesManager,
            () => {
                let tabId = tabCreate({
                    id: node.getLabel(),
                    title: node.getLabel(),
                    url: node.getPath(),
                    metadata: node.getMetadata(),
                    readonly: node.getMetadata().get("node_readonly") === "true",
                    node,
                    editorData,
                    icon: FilePreview
                }).id;

                editorSetActiveTab(tabId);

                editorModify({
                    isMinimised: false,
                })
            }
        )
    }

    _handleNodeRemoved(index) {
    }

    render() {
        return (
            <Editor />
        )
    }
}

EditionPanel.PropTypes = {
    pydio: PropTypes.instanceOf(Pydio)
}

export default connect(null, EditorActions)(EditionPanel)