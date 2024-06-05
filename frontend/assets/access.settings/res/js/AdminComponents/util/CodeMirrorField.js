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

import React, {createRef} from 'react';

class CodeEditorField extends React.Component {

    constructor(props) {
        super(props);
        this.cmField = createRef();
        this.state = {libLoaded: false}
        import('react-codemirror').then(({default: CodeMirror}) => {
            import('codemirror/mode/javascript/javascript').then(() => {
                import('codemirror/addon/hint/show-hint').then(() => {
                    import('codemirror/addon/hint/javascript-hint').then(() => {
                        this.setState({CodeMirror, libLoaded: true})
                    })
                })
            })
        })

    }

    jsAutoComplete(cm){
        const codeMirror = this.cmField.current.getCodeMirrorInstance();

        // hint options for specific plugin & general show-hint
        // 'tables' is sql-hint specific
        // 'disableKeywords' is also sql-hint specific, and undocumented but referenced in sql-hint plugin
        // Other general hint config, like 'completeSingle' and 'completeOnSingleClick'
        // should be specified here and will be honored
        const hintOptions = {
            globalScope: this.props.globalScope,
            disableKeywords: true,
            completeSingle: false,
            completeOnSingleClick: false
        };

        // codeMirror.hint.sql is defined when importing codemirror/addon/hint/sql-hint
        // (this is mentioned in codemirror addon documentation)
        // Reference the hint function imported here when including other hint addons
        // or supply your own
        codeMirror.showHint(cm, codeMirror.hint.javascript, hintOptions);
    }

    handleChange(value){
        this.props.onChange(null, value);
    }

    componentDidMount(){
        setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 0);
    }

    componentDidUpdate(prevProps){
        const prevValue = prevProps.value ? prevProps.value.length : 0;
        const newValue = this.props.value ? this.props.value.length : 0;
        if( Math.abs(newValue-prevValue) > 50 ){
            // We can consider it's a copy, trigger a resize if necessary
            setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 0);
        }
    }

    render() {
        const {value, editorOptions, readOnly, mode, key} = this.props;
        const {libLoaded, CodeMirror} = this.state;
        if(!libLoaded){
            return null
        }

        let options = {
            lineNumbers: true,
            tabSize: 2,
            readOnly: readOnly || false,
        };
        if(mode === 'javascript') {
            options = {
                ...options,
                mode: 'text/javascript',
                extraKeys: {
                    'Ctrl-Space': this.jsAutoComplete.bind(this)
                }
            };
        } else if(mode === 'json') {
            options = {
                ...options,
                mode: 'application/json'
            };
        }
        if(editorOptions){
            options = {...options, ...editorOptions};
        }

        return (
            <CodeMirror
                key={key}
                ref={this.cmField}
                value={value}
                onChange={this.handleChange.bind(this)}
                options={options}
            />
        );
    }
}

export {CodeEditorField as default}