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


import React, { Component } from 'react'
import PropTypes from 'prop-types'
import DOMPurify from 'dompurify'

class Editor extends Component {
    textareaRef = React.createRef();

    static get styles() {
        return {
            textarea: {
                width: "100%"
            }
        }
    }

    componentDidMount() {
        const { content, config, onChange } = this.props;
        const safeContent = DOMPurify.sanitize(content, { USE_PROFILES: { html: true } });

        if (this.textareaRef.current) {
            this.textareaRef.current.value = safeContent;
        }

        const editor = CKEDITOR.replace(this.textareaRef.current, config);
        editor.on('change', ({ editor }) => {
            const rawData = editor.getData();
            const safeData = this.domPurify(rawData);
            if (onChange) {
                onChange(safeData);
            }
        });
        
    }

    handleChange = (event) => {
        const rawValue = event.target.value;
        const safeValue = this.domPurify(rawValue);
        if (this.props.onChange) {
            this.props.onChange(safeValue);
        }
    };

    domPurify(content) {
        return DOMPurify.sanitize(content, { USE_PROFILES: { html: true } });
    }

    componentWillUnmount() {
        if (window.CKEDITOR && this.textareaRef.current) {
            const id = this.textareaRef.current.id;
            if (CKEDITOR.instances[id]) {
                this.textareaRef.current.value = CKEDITOR.instances[id].getData();
                CKEDITOR.instances[id].destroy();
            }
        }
    }

    render() {
        const { url } = this.props;
        const id = LangUtils.computeStringSlug(url);
        const styles = Editor.styles;
        return (
            <textarea
                ref={this.textareaRef}
                key={id}
                style={styles.textarea}
                onChange={this.handleChange}
            />
        );
    }
}

Editor.propTypes = {
    content: PropTypes.string,
    onChange: PropTypes.func,
    url: PropTypes.string.isRequired
}

export default Editor
