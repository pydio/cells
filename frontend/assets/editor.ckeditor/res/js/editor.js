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
const { EditorActions } = Pydio.requireLib('hoc')
import React from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const mapStateToProps = (state, props) => {
    const {tabs} = state

    const tab = tabs.filter(({editorData, node}) => (!editorData || editorData.id === props.editorData.id) && node.getPath() === props.node.getPath())[0] || {}

    return {
        id: tab.id,
        tab,
        ...props
    }
}


@connect(null, EditorActions)
class Editor extends React.Component {
    static get propTypes() {
        return {
            showControls: PropTypes.bool.isRequired
        }
    }

    static get defaultProps() {
        return {
            showControls: false
        }
    }

    componentDidMount() {
        const {pydio, node, tab, dispatch} = this.props

        const {id} = tab

        const {editorModify} = this.props
        if (editorModify && this.props.isActive) {
            editorModify({fixedToolbar: true})
        }

        pydio.ApiClient.getPlainContent(node, responseText => {
            dispatch(EditorActions.tabModify({id, editable: true, content: responseText, node}))
        })
    }

    componentWillReceiveProps(nextProps) {
        const {editorModify} = this.props
        if (editorModify && nextProps.isActive) {
            editorModify({fixedToolbar: true})
        }
    }

    render() {
        const {tab, dispatch} = this.props
        const {id, content} = tab

        const modules = {
            toolbar: [
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline','strike', 'blockquote'],
                [{'align':[]}, {'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                ['link', 'blockquote', 'code-block'],
                ['clean']
            ],
        }

            const formats = [
                'header',
                'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
                'list', 'bullet', 'indent',
                'align', 'justify',
                'link', 'image'
            ]

        return <ReactQuill
            theme="snow"
            style={{width: '100%', flex: 1, backgroundColor: 'var(--md-sys-color-surface)'}}
            value={content || ''}
            modules={modules}
            formats={formats}
            onChange={content => dispatch(EditorActions.tabModify({id, content}))}
        />;
    }
}



export default connect(mapStateToProps)(Editor)
