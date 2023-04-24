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
import React, {Component} from 'react'
import { connect } from 'react-redux'
import { muiThemeable } from 'material-ui/styles'

const {EditorActions} = Pydio.requireLib('hoc')

const mapStateToProps = (state, props) => {
    const {tabs} = state

    const tab = tabs.filter(({editorData, node}) => (!editorData || editorData.id === props.editorData.id) && node.getPath() === props.node.getPath())[0] || {}

    return {
        id: tab.id,
        tab,
        ...props
    }
}


@connect(mapStateToProps)
@connect(null, EditorActions)
class Editor extends Component {

    static get styles() {
        return {
            textarea: {
                width: '100%',
                height: '100%',
                backgroundColor: '#fff',
                fontSize: 13,
            }
        }
    }

    componentDidMount() {
        this.loadNode(this.props)
        const {editorModify} = this.props;
        if (this.props.isActive) {
            editorModify({fixedToolbar: true})
        }
    }

    compomentWillReceiveProps(nextProps) {
        const {editorModify} = this.props;
        if (nextProps.isActive) {
            editorModify({fixedToolbar: true})
        }
        if (this.props.node !== nextProps.node) {
            this.loadNode(nextProps)
        }
    }

    loadNode(props) {
        const {pydio, node, tab, dispatch} = this.props
        const {id} = tab

        pydio.ApiClient.getPlainContent(node, (content) => {
            dispatch(EditorActions.tabModify({id, content: content, node}))
        });

    }

    render() {
        const {tab, dispatch, muiTheme} = this.props
        const {id, content} = tab
        const style = Editor.styles.textarea
        if(muiTheme.darkMode) {
            style.backgroundColor = 'var(--md-sys-color-surface)'
        }

        return (
            <textarea
                style={style}
                onChange={({target}) => dispatch(EditorActions.tabModify({id, content: target.value}))}
                value={content}
            />
        );
    }
}

Editor = muiThemeable()(Editor)
export default Editor
/*
export default compose(
    connect(mapStateToProps)
)(Editor)
*/
