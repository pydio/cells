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
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _lodashDebounce = require('lodash.debounce');

var _lodashDebounce2 = _interopRequireDefault(_lodashDebounce);

function normalizeLineEndings(str) {
	if (!str) return str;
	return str.replace(/\r\n|\r/g, '\n');
}

var CodeMirror = (function (_React$Component) {
	_inherits(CodeMirror, _React$Component);

	function CodeMirror(props) {
		_classCallCheck(this, CodeMirror);

		_get(Object.getPrototypeOf(CodeMirror.prototype), 'constructor', this).call(this, props);

		this.state = {
			isFocused: false
		};
	}

	_createClass(CodeMirror, [{
		key: 'getCodeMirrorInstance',
		value: function getCodeMirrorInstance() {
			return this.props.codeMirrorInstance || require('codemirror');
		}
	}, {
		key: 'componentWillMount',
		value: function componentWillMount() {
			this.componentWillReceiveProps = (0, _lodashDebounce2['default'])(this.componentWillReceiveProps, 0);
		}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			var textareaNode = ReactDOM.findDOMNode(this.refs.textarea);

			var codeMirrorInstance = this.getCodeMirrorInstance();

			var info = codeMirrorInstance.findModeByExtension(this.props.name.split('.').pop()) || {};
			var _info$mode = info.mode;
			var mode = _info$mode === undefined ? "" : _info$mode;
			var spec = info.spec;

			this.codeMirror = codeMirrorInstance.fromTextArea(textareaNode);

			this.codeMirror.setOption('mode', mode);
			this.codeMirror.setOption('readOnly', this.props.options.readOnly);
			this.codeMirror.setOption('lineNumbers', this.props.options.lineNumbers);
			this.codeMirror.setOption('lineWrapping', this.props.options.lineWrapping);

			codeMirrorInstance.autoLoadMode(this.codeMirror, mode);

			this.codeMirror.on('change', this.codemirrorValueChanged.bind(this));
			this.codeMirror.on('focus', this.focusChanged.bind(this, true));
			this.codeMirror.on('blur', this.focusChanged.bind(this, false));
			this.codeMirror.on('scroll', this.scrollChanged.bind(this));
			this.codeMirror.on('cursorActivity', this.cursorActivity.bind(this));

			this.codeMirror.setValue(this.props.defaultValue || this.props.value || '');

			this.props.onLoad(this.codeMirror);
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			// is there a lighter-weight way to remove the cm instance?
			if (this.codeMirror) {
				this.codeMirror.toTextArea();
			}
		}
	}, {
		key: 'componentWillReceiveProps',
		value: function componentWillReceiveProps(nextProps) {
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
				for (var optionName in nextProps.options) {
					if (nextProps.options.hasOwnProperty(optionName)) {
						var optionVal = nextProps.options[optionName];
						this.codeMirror.setOption(optionName, optionVal);
					}
				}
			}
		}
	}, {
		key: 'focusChanged',
		value: function focusChanged(focused) {
			this.setState({
				isFocused: focused
			});
			this.props.onFocusChange && this.props.onFocusChange(focused);
		}
	}, {
		key: 'scrollChanged',
		value: function scrollChanged(cm) {
			this.props.onScroll && this.props.onScroll(cm.getScrollInfo());
		}
	}, {
		key: 'codemirrorValueChanged',
		value: function codemirrorValueChanged(doc, change) {
			if (this.props.onChange && change.origin !== 'setValue') {
				this.props.onChange(doc.getValue(), change);
			}
		}
	}, {
		key: 'cursorActivity',
		value: function cursorActivity(cm) {
			this.props.onCursorChange && this.props.onCursorChange({
				from: cm.getCursor("from"),
				to: cm.getCursor("to")
			});
		}
	}, {
		key: 'render',
		value: function render() {
			var editorClassName = (0, _classnames2['default'])('ReactCodeMirror', this.state.isFocused ? 'ReactCodeMirror--focused' : null, this.props.className);
			var cmStyle = this.props.cmStyle;

			return _react2['default'].createElement(
				'div',
				{ className: editorClassName, style: _extends({ width: "100%", height: "100%", zIndex: 0 }, cmStyle) },
				_react2['default'].createElement('textarea', { ref: 'textarea', defaultValue: this.props.value, autoComplete: 'off' })
			);
		}
	}]);

	return CodeMirror;
})(_react2['default'].Component);

CodeMirror.propTypes = {
	mode: _propTypes2['default'].string,
	lineWrapping: _propTypes2['default'].bool,
	lineNumbers: _propTypes2['default'].bool,
	readOnly: _propTypes2['default'].bool,
	className: _propTypes2['default'].any,
	codeMirrorInstance: _propTypes2['default'].func,
	defaultValue: _propTypes2['default'].string,
	onChange: _propTypes2['default'].func,
	onFocusChange: _propTypes2['default'].func,
	onScroll: _propTypes2['default'].func,
	options: _propTypes2['default'].object,
	path: _propTypes2['default'].string,
	value: _propTypes2['default'].string,
	preserveScrollPosition: _propTypes2['default'].bool
};

CodeMirror.defaultProps = {
	mode: '',
	lineWrapping: false,
	lineNumbers: false,
	readOnly: true,
	preserveScrollPosition: false
};

exports['default'] = CodeMirror;
module.exports = exports['default'];
