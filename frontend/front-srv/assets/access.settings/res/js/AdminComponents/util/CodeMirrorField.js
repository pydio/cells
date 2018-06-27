import React, { PureComponent } from 'react';
import CodeMirror from 'react-codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/javascript-hint';

class CodeEditorField extends React.Component {

    jsAutoComplete(cm){
        const codeMirror = this.refs['CodeMirror'].getCodeMirrorInstance();

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

    render() {
        const {value} = this.props;

        let options = {
            lineNumbers: true,
            tabSize: 2,
            readOnly: this.props.readOnly || false,
        };
        if(this.props.mode === 'javascript') {
            options = {
                ...options,
                mode: 'text/javascript',
                extraKeys: {
                    'Ctrl-Space': this.jsAutoComplete.bind(this)
                }
            };
        } else if(this.props.mode === 'json') {
            options = {
                ...options,
                mode: 'application/json'
            };
        }

        return (
            <CodeMirror
                key={this.props.key}
                ref="CodeMirror"
                value={value}
                onChange={this.handleChange.bind(this)}
                options={options}
            />
        );
    }
}

export {CodeEditorField as default}