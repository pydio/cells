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
import CKEditor from './CKEditor';
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

    static get base() {
        return {
            resize_enabled:false,
            toolbar : "Ajxp",
            contentsCss: '../../res/ckeditor.css',
            filebrowserBrowseUrl : 'index.php?external_selector_type=ckeditor',
            // IF YOU KNOW THE RELATIVE PATH OF THE IMAGES (BETWEEN REPOSITORY ROOT AND REAL FILE)
            // YOU CAN PASS IT WITH THE relative_path PARAMETER. FOR EXAMPLE :
            //filebrowserBrowseUrl : 'index.php?external_selector_type=ckeditor&relative_path=files',
            filebrowserImageBrowseUrl : 'index.php?external_selector_type=ckeditor',
            filebrowserFlashBrowseUrl : 'index.php?external_selector_type=ckeditor',
            language : pydio.currentLanguage,
            fullPage : true,
        }
    }

    static get config() {
        return {
            basePath: `${DOMUtils.getUrlFromBase()}plug/editor.ckeditor/res/ckeditor/`,
            desktop : {
                ...Editor.base,
    			toolbar_Ajxp : [
    				['Source','Preview','Templates'],
    			    ['Undo','Redo','-', 'Cut','Copy','Paste','PasteText','PasteFromWord','-','Print', 'SpellChecker', 'Scayt'],
    			    ['Find','Replace','-','SelectAll','RemoveFormat'],
    			    ['Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField'],
    			    '/',
    			    ['Bold','Italic','Underline','Strike','-','Subscript','Superscript'],
    			    ['NumberedList','BulletedList','-','Outdent','Indent','Blockquote'],
    			    ['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],
    			    ['Link','Unlink','Anchor'],
    			    ['Image','Flash','Table','HorizontalRule','Smiley','SpecialChar','PageBreak'],
    			    '/',
    			    ['Styles','Format','Font','FontSize'],
    			    ['TextColor','BGColor'],
    			    ['Maximize', 'ShowBlocks','-','About']
    			]
            },
            mobile: {
                ...Editor.base,
				toolbar_Ajxp : [
				    ['Bold','Italic','Underline', '-', 'NumberedList','BulletedList'],
				    ['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock']
				]
            }
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
        const {pydio, node, tab, dispatch} = this.props
        const {desktop, mobile} = Editor.config
        const {id, content} = tab

        if (!content) return null

        return (
            <CKEditor
                url={node.getPath()}
                content={content}
                config={pydio.UI.MOBILE_EXTENSIONS ? mobile : desktop}
                onChange={content => dispatch(EditorActions.tabModify({id, content}))}
            />
        );
    }
}

CKEDITOR.basePath = Editor.config.basePath
CKEDITOR.contentsCss = Editor.config.basePath + '../../res/css/ckeditor.css'


export default connect(mapStateToProps)(Editor)
