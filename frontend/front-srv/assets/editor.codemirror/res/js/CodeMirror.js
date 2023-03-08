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
import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types';
import className from 'classnames';
import debounce from 'lodash.debounce';

function normalizeLineEndings (str) {
	if (!str) return str;
	return str.replace(/\r\n|\r/g, '\n');
}

class CodeMirror extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            isFocused: false
        }
    }

    getCodeMirrorInstance () {
		return this.props.codeMirrorInstance || require('codemirror');
	}

	componentWillMount() {
		this.componentWillReceiveProps = debounce(this.componentWillReceiveProps, 0);
	}

	componentDidMount() {
        const textareaNode = ReactDOM.findDOMNode(this.refs.textarea);

        const codeMirrorInstance = this.getCodeMirrorInstance();

        const info = codeMirrorInstance.findModeByExtension(this.props.name.split('.').pop()) || {};
		const {mode = "", spec} = info;

		this.codeMirror = codeMirrorInstance.fromTextArea(textareaNode);

		this.codeMirror.setOption('mode', mode);
		this.codeMirror.setOption('readOnly', this.props.options.readOnly);
		this.codeMirror.setOption('lineNumbers', this.props.options.lineNumbers)
		this.codeMirror.setOption('lineWrapping', this.props.options.lineWrapping)

        codeMirrorInstance.autoLoadMode(this.codeMirror, mode);

		this.codeMirror.on('change', this.codemirrorValueChanged.bind(this));
		this.codeMirror.on('focus', this.focusChanged.bind(this, true));
		this.codeMirror.on('blur', this.focusChanged.bind(this, false));
		this.codeMirror.on('scroll', this.scrollChanged.bind(this));
        this.codeMirror.on('cursorActivity', this.cursorActivity.bind(this));

		this.codeMirror.setValue(this.props.defaultValue || this.props.value || '');

        this.props.onLoad(this.codeMirror)
	}

	componentWillUnmount() {
		// is there a lighter-weight way to remove the cm instance?
		if (this.codeMirror) {
			this.codeMirror.toTextArea();
		}
	}

	componentWillReceiveProps(nextProps) {
		if (this.codeMirror && nextProps.value !== undefined && normalizeLineEndings(this.codeMirror.getValue()) !== normalizeLineEndings(nextProps.value)) {
			if (this.props.preserveScrollPosition) {
				var prevScrollPosition = this.codeMirror.getScrollInfo();
				this.codeMirror.setValue(nextProps.value);
				this.codeMirror.scrollTo(prevScrollPosition.left, prevScrollPosition.top);
			} else {
				this.codeMirror.setValue(nextProps.value);
			}
		}

		if (typeof nextProps.options === 'object') {
			for (let optionName in nextProps.options) {
				if (nextProps.options.hasOwnProperty(optionName)) {
                    let optionVal = nextProps.options[optionName]
                    this.codeMirror.setOption(optionName, optionVal);
				}
            }
		}
	}

	focusChanged(focused) {
		this.setState({
			isFocused: focused,
		});
		this.props.onFocusChange && this.props.onFocusChange(focused);
	}

	scrollChanged(cm) {
		this.props.onScroll && this.props.onScroll(cm.getScrollInfo());
	}

	codemirrorValueChanged(doc, change) {
		if (this.props.onChange && change.origin !== 'setValue') {
			this.props.onChange(doc.getValue(), change);
		}
	}

    cursorActivity(cm) {
        this.props.onCursorChange && this.props.onCursorChange({
            from: cm.getCursor("from"),
            to: cm.getCursor("to")
        })
    }

	render() {
		const editorClassName = className(
			'ReactCodeMirror',
			this.state.isFocused ? 'ReactCodeMirror--focused' : null,
			this.props.className
		);
        const {cmStyle} = this.props;

		return (
			<div className={editorClassName} style={{width: "100%", height:"100%", zIndex: 0, ...cmStyle}}>
				<textarea ref="textarea" defaultValue={this.props.value} autoComplete="off" />
			</div>
		);
	}
}

CodeMirror.propTypes = {
    mode: PropTypes.string,
	lineWrapping: PropTypes.bool,
	lineNumbers: PropTypes.bool,
	readOnly: PropTypes.bool,
    className: PropTypes.any,
    codeMirrorInstance: PropTypes.func,
    defaultValue: PropTypes.string,
    onChange: PropTypes.func,
    onFocusChange: PropTypes.func,
    onScroll: PropTypes.func,
    options: PropTypes.object,
    path: PropTypes.string,
    value: PropTypes.string,
    preserveScrollPosition: PropTypes.bool,
}

CodeMirror.defaultProps = {
	mode: '',
	lineWrapping: false,
	lineNumbers: false,
	readOnly: true,
    preserveScrollPosition: false
}

export default CodeMirror
