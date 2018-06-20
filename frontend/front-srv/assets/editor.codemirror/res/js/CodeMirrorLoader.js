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



import SystemJS from 'systemjs';
import {compose} from 'redux';

import CodeMirror from './CodeMirror';

let {define, require} = window

SystemJS.config({
    baseURL: 'plugins/editor.codemirror/res/build',
    packages: {
        'codemirror': {},
        '.': {}
    }
});

class CodeMirrorLoader extends React.Component {

    constructor(props) {
        super(props)

        const {pydio, node, url, onLoad} = props

        let loaded = new Promise((resolve, reject) => {

            window.define = SystemJS.amdDefine;
            window.require = window.requirejs = SystemJS.amdRequire;

            SystemJS.import('codemirror/lib/codemirror').then((m) => {
                let CodeMirror = m
                SystemJS.import('codemirror/addon/search/search')
                SystemJS.import('codemirror/addon/mode/loadmode').then(() => {
                    SystemJS.import('codemirror/mode/meta').then(() => {
                        CodeMirror.modeURL = 'codemirror/mode/%N/%N.js'
                        resolve(CodeMirror)
                    })
                })
            })
        });

        this.state = {
            url: url,
            loaded: loaded
        }

        this.onLoad = (codemirror) => {
            this.props.onLoad(codemirror)

            window.define = define
            window.require = window.requirejs = require
        }
    }

    // Handling loading
    componentDidMount() {
        this.state.loaded.then((CodeMirror) => {
            this.setState({codemirrorInstance: CodeMirror})
        })
    }

    render() {

        // If Code Mirror library is not loaded, do not go further
        if (!this.state.codemirrorInstance) return null

        return (
            <CodeMirror
                name={this.state.url}
                value={this.props.content}
                codeMirrorInstance={this.state.codemirrorInstance}
                options={this.props.options}

                onLoad={this.onLoad}
                onChange={this.props.onChange}
                onCursorChange={this.props.onCursorChange}
            />
        )
    }
}

CodeMirrorLoader.propTypes = {
    url: React.PropTypes.string.isRequired,

    onChange: React.PropTypes.func.isRequired,
    onCursorChange: React.PropTypes.func.isRequired
}

export default CodeMirrorLoader;
