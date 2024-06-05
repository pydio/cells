/*
 * Copyright 2023 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React, {Component, createRef} from 'react'
import PathUtils from 'pydio/util/path'
import '../css/style.css'
import '../css/linenumbers.css'
import 'codemirror/lib/codemirror.css'
import '../css/ayu-dark.css'
import {muiThemeable} from 'material-ui/styles'


class ReactCodeMirror extends Component {

    constructor(props) {
        super(props);
        this.cm = createRef()
        this.state = {}
        this.loaded = false
        import('react-codemirror').then(({default: CodeMirror}) => {
            import('codemirror/addon/search/search').then(()=>{
                import('codemirror/mode/meta').then(() => {
                    this.setState({CodeMirror})
                })
            })
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(!this.cm.current) {
            return
        }
        if(!this.loaded){
            const cm = this.cm.current.getCodeMirror();
            const cmi = this.cm.current.getCodeMirrorInstance();
            const mode = cmi.findModeByFileName(PathUtils.getBasename(this.props.url))
            if (mode) {
                this.setMode(mode)
            }
            this.loaded = true
            this.props.onLoad(cm);
        }
        if(prevProps.content === undefined && this.props.content !== undefined) {
            this.cm.current.getCodeMirror().setValue(this.props.content)
        }
    }

    setMode(mode) {
        let prom
        switch (mode.mode){
            case 'javascript':
                prom = import('codemirror/mode/javascript/javascript')
                break
            case 'css':
                prom = import('codemirror/mode/css/css')
                break
            case 'php':
                prom = import('codemirror/mode/php/php')
                break
            case 'dart':
                prom = import('codemirror/mode/dart/dart')
                break
            case 'dockerfile':
                prom = import('codemirror/mode/dockerfile/dockerfile')
                break
            case 'erlang':
                prom = import('codemirror/mode/erlang/erlang')
                break
            case 'diff':
                prom = import('codemirror/mode/diff/diff')
                break
            case 'go':
                prom = import('codemirror/mode/go/go')
                break
            case 'groovy':
                prom = import('codemirror/mode/groovy/groovy')
                break
            case 'htmlmixed':
                prom = import('codemirror/mode/htmlmixed/htmlmixed')
                break
            case 'markdown':
                prom = import('codemirror/mode/markdown/markdown')
                break
            case 'sass':
                prom = import('codemirror/mode/sass/sass')
                break
            case 'perl':
                prom = import('codemirror/mode/perl/perl')
                break
            case 'clike':
                prom = import('codemirror/mode/clike/clike')
                break
            case 'clojure':
                prom = import('codemirror/mode/clojure/clojure')
                break
            case 'nginx':
                prom = import('codemirror/mode/nginx/nginx')
                break
            case 'jsx':
                prom = import('codemirror/mode/jsx/jsx')
                break
            case 'xml':
                prom = import('codemirror/mode/xml/xml')
                break
            case 'yaml':
                prom = import('codemirror/mode/yaml/yaml')
                break
            case 'vbscript':
                prom = import('codemirror/mode/vbscript/vbscript')
                break
            case 'swift':
                prom = import('codemirror/mode/swift/swift')
                break
            case 'rust':
                prom = import('codemirror/mode/rust/rust')
                break
            case 'python':
                prom = import('codemirror/mode/python/python')
                break
            case 'sql':
                prom = import('codemirror/mode/sql/sql')
                break
            case 'sparql':
                prom = import('codemirror/mode/sparql/sparql')
                break
            case 'shell':
                prom = import('codemirror/mode/shell/shell')
                    break
            default:
                prom = Promise.resolve()
        }
        prom.then(()=> {
            this.setState({mode: mode.mode})
        })
    }

    render() {
        const {CodeMirror, mode} = this.state
        if(!CodeMirror) {
            return null
        }
        const {content, options, url, onLoad, onChange, onCursorChange, cmStyle, muiTheme} = this.props
        const themeOptions = {}
        if(muiTheme.darkMode) {
            themeOptions.theme = 'ayu-dark'
        }

        return (
            <CodeMirror
                ref={this.cm}
                name={url}
                value={content}
                options={{...options, ...themeOptions, mode}}
                className={"CMEditor"}
                onLoad={onLoad}
                onChange={onChange}
                onCursorActivity={onCursorChange}
                cmStyle={cmStyle}
            />
        );
    }

}

ReactCodeMirror = muiThemeable()(ReactCodeMirror)
export default ReactCodeMirror