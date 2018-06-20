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
import { compose } from 'redux'

const {EditorActions} = Pydio.requireLib('hoc')

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

    componentWillMount() {
        this.loadNode(this.props)
    }

    compomentWillReceiveProps(nextProps) {
        if (this.props.node !== nextProps.node) {
            this.loadNode(nextProps)
        }
    }

    loadNode(props) {
        const {pydio, node, tab, dispatch} = this.props
        const {id, content} = tab

        pydio.ApiClient.request({
            get_action: 'get_content',
            file: node.getPath(),
        }, ({responseText}) => {
            dispatch(EditorActions.tabModify({id, content: responseText}))
        });
    }

    render() {
        const {tab, dispatch} = this.props
        const {id, content} = tab

        return (
            <textarea
                style={Editor.styles.textarea}
                onChange={({target}) => dispatch(EditorActions.tabModify({id, content: target.value}))}
                value={content}
            />
        );
    }
}

const {withMenu, withLoader, withErrors, withControls} = PydioHOCs;
const mapStateToProps = (state, props) => {
    const {tabs} = state

    const tab = tabs.filter(({editorData, node}) => (!editorData || editorData.id === props.editorData.id) && node.getPath() === props.node.getPath())[0] || {}

    return {
        id: tab.id,
        tab,
        ...props
    }
}

export default compose(
    connect(mapStateToProps)
)(Editor)
