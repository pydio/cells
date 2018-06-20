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
import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import CodeMirrorLoader from './CodeMirrorLoader';

const {EditorActions} = Pydio.requireLib('hoc');

class Editor extends React.Component {

    constructor(props) {
        super(props)

        const {node, tab, dispatch} = this.props
        const {id} = tab

        if (!id) dispatch(EditorActions.tabCreate({id: node.getLabel(), node}))
    }

    componentDidMount() {
        const {pydio, node, tab, dispatch} = this.props

        const {id} = tab

        pydio.ApiClient.request({
            get_action: 'get_content',
            file: node.getPath()
        }, ({responseText}) => dispatch(EditorActions.tabModify({id: id || node.getLabel(), lineNumbers: true, content: responseText})));
    }

    render() {
        const {node, tab, error, dispatch} = this.props

        if (!tab) return null

        const {id, codemirror, content, lineWrapping, lineNumbers} = tab

        return (
            <CodeMirrorLoader
                {...this.props}
                url={node.getPath()}
                content={content}
                options={{lineNumbers: lineNumbers, lineWrapping: lineWrapping}}
                error={error}

                onLoad={codemirror => dispatch(EditorActions.tabModify({id, codemirror}))}
                onChange={content => dispatch(EditorActions.tabModify({id, content}))}
                onCursorChange={cursor => dispatch(EditorActions.tabModify({id, cursor}))}
            />
        )
    }
}

export const mapStateToProps = (state, props) => {
    const {tabs} = state

    const tab = tabs.filter(({editorData, node}) => (!editorData || editorData.id === props.editorData.id) && node.getPath() === props.node.getPath())[0] || {}

    return {
        id: tab.id,
        tab,
        ...props
    }
}

export default connect(mapStateToProps)(Editor)
