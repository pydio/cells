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
import OpenNodesModel from '../OpenNodesModel'
import { connect } from 'react-redux';
import { Editor } from '../editor';

const { EditorActions } = Pydio.requireLib('hoc')

class EditionPanel extends React.Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this._nodesModelObserver = (node) => this._handleNodePushed(node);
        this._nodesRemoveObserver = (index) => this._handleNodeRemoved(index);
        this._titlesObserver = () => this.forceUpdate()

        OpenNodesModel.getInstance().observe("nodePushed", this._nodesModelObserver);
        OpenNodesModel.getInstance().observe("nodeRemovedAtIndex", this._nodesRemoveObserver);
        OpenNodesModel.getInstance().observe("titlesUpdated", this._titlesObserver);
    }

    componentWillUnmount() {
        OpenNodesModel.getInstance().stopObserving("nodePushed", this._nodesModelObserver);
        OpenNodesModel.getInstance().stopObserving("nodeRemovedAtIndex", this._nodesRemoveObserver);
        OpenNodesModel.getInstance().stopObserving("titlesUpdated", this._titlesObserver);
    }

    _handleNodePushed(object) {

        const {pydio, tabCreate, editorModify, editorSetActiveTab} = this.props

        const {node = {}, editorData} = object

        pydio.Registry.loadEditorResources(
            editorData.resourcesManager,
            () => {
                let EditorClass = null

                if (!(EditorClass = FuncUtils.getFunctionByName(editorData.editorClass, window))) {
                    this.setState({
                        error: "Cannot find editor component (" + editorData.editorClass + ")!"
                    })
                    return
                }

                let tabId = tabCreate({
                    id: node.getLabel(),
                    title: node.getLabel(),
                    url: node.getPath(),
                    icon: PydioWorkspaces.FilePreview,
                    Editor: EditorClass.Editor,
                    Controls: EditorClass.Controls,
                    pydio,
                    node,
                    editorData,
                    registry: pydio.Registry
                }).id

                editorSetActiveTab(tabId)

                editorModify({
                    open: true,
                    isPanelActive: true
                })
            }
        )
    }

    _handleNodeRemoved(index) {
    }

    /*componentDidMount() {
        const {editorData, registry} = this.props

        registry.loadEditorResources(
            editorData.resourcesManager,
            () => this.setState({ready: true})
        );
    }

    render() {
        const {editorData} = this.props
        const {ready} = this.state

        if (!ready) return null

        let EditorClass = null
        if (!(EditorClass = FuncUtils.getFunctionByName(editorData.editorClass, window))) {
            return <div>{"Cannot find editor component (" + editorData.editorClass + ")!"}</div>
        }

        // Getting HOC of the class
        return <EditorClass.Editor {...this.props} />
    }*/

    render() {
        let style = {
            position: "fixed",
            bottom: "50px",
            right: "100px",
            cursor: "pointer",
            transform: "translate(50%, 50%)",
            zIndex: 1400
        }

        return (
            <div style={{position: "relative", zIndex: 1400}}>
                <Editor />
            </div>
        )
    }
}

EditionPanel.PropTypes = {
    pydio: React.PropTypes.instanceOf(Pydio)
}

export default connect(null, EditorActions)(EditionPanel)
