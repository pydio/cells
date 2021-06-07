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
import PropTypes from 'prop-types'

class Editor extends Component {

    static get styles() {
        return {
            textarea: {
                width: "100%"
            }
        }
    }

    componentDidMount() {
        const {pydio, url, content, config, onChange} = this.props
        const {id} = this.textarea

        this.textarea.value = content

        const editor = CKEDITOR.replace(this.textarea, config);

        editor.on('change', ({editor}) => onChange(editor.getData()))
    }

    componentWillUnmount() {
        const {id} = this.textarea

        if(CKEDITOR.instances[id]){
            this.textarea.value = CKEDITOR.instances[id].getData();
            CKEDITOR.instances[id].destroy();
        }
    }

	render() {
        const {url} = this.props
        const {textarea} = Editor.styles

        const id = LangUtils.computeStringSlug(url);

        return (
            <textarea ref={(textarea) => this.textarea = textarea} key={id} style={textarea} />
        )
	}
}

Editor.propTypes = {
    url: PropTypes.string.isRequired
}

export default Editor
